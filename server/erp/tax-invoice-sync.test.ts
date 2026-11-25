import assert from "node:assert/strict";
import test from "node:test";
import type { Express, RequestHandler } from "express";
import { BoltaApiError, BoltaNetworkError, createBoltaClient, type BoltaClient } from "../bolta-client";
import { createNotionClient, type Bill, type BillUpdate, type Customer, type InvoiceStore } from "./notion-client";
import { BILL, CUSTOMER, STATUS } from "./notion-schema";
import { registerTaxInvoiceRoutes } from "./routes";
import { syncTaxInvoices, SyncConfigurationError } from "./tax-invoice-sync";

const id = "abcd0808-1338-810a-85ea-abcdef123456";
const reference = "erp-abcd08081338810a85eaabcdef123456";
const now = () => new Date("2026-11-24T15:05:00Z");
const firstReference = "erp-abcd08081338-" + now().getTime().toString(36);
const customer: Customer = {
  businessNumber: "123-45-67890", company: "테스트 법인", representative: "김대표",
  address: "서울", businessType: "서비스업", businessItem: "조경", email: "accounts@example.com",
};

function fixture(changes: Partial<Bill> = {}) {
  const bill = {
    id, lastEdited: now().toISOString(), date: null, customers: ["customer"],
    item: "조경 관리", supplyCost: 10005, requested: true, status: null, key: "",
    reference: "", industry: null, ...changes,
  } satisfies Bill;
  const updates: BillUpdate[] = [];
  const notion: InvoiceStore = {
    async listCandidates(limit) { assert.equal(limit, 20); return [{ ...bill }]; },
    async getBill() { return { ...bill }; },
    async getCustomer() { return { ...customer }; },
    async updateBill(_id, update) { updates.push(update); Object.assign(bill, update); },
  };
  const calls: string[] = [];
  const bolta: BoltaClient = {
    environment: "test",
    async issueTaxInvoice(_body, ref) {
      assert.equal(bill.status, STATUS.pending);
      assert.match(ref, /^erp-abcd08081338-[a-z0-9]+$/);
      assert.equal(ref, bill.reference);
      calls.push("issue");
      return { issuanceKey: "invoice-key" };
    },
    async getIssueStatus(ref) {
      assert.equal(ref, bill.reference || reference);
      calls.push("status");
      return { clientReferenceId: ref, issuanceKey: "invoice-key", message: "ok" };
    },
    async getTaxInvoice(key) {
      assert.equal(key, "invoice-key");
      calls.push("detail");
      return { issuanceKey: key, ntsTransactionId: "NTS-123", issuedAt: "2026-11-26T12:00:00+09:00", invoice: {} };
    },
  };
  return { bill, notion, bolta, calls, updates, run: () => syncTaxInvoices({ notion, bolta, now }) };
}

test("청구 정발행 본문·세액 반올림·한국 날짜·멱등키·발행키 저장 순서", async () => {
  const f = fixture();
  const original = f.bolta.issueTaxInvoice;
  f.bolta.issueTaxInvoice = async (body, ref) => {
    assert.deepEqual(body, {
      date: "2026-11-25", purpose: "CLAIM", taxType: "TAXABLE", trustee: null, description: null,
      supplier: {
        identificationNumber: "5748802211", organizationName: "주식회사 에스아이엠지오",
        representativeName: "이주연", taxRegistrationId: null,
        address: "서울특별시 서초구 바우뫼로6길 22, 2층 1호 201호 (우면동, 우현)",
        businessType: "사업시설 관리, 사업지원 및 임대 서비스업", businessItem: "조경관리 및 유지 서비스업",
        manager: { email: "simgokr@gmail.com", name: "이주연", telephone: null },
      },
      supplied: {
        identificationNumber: "1234567890", organizationName: customer.company,
        representativeName: customer.representative, taxRegistrationId: null,
        address: customer.address, businessType: customer.businessType, businessItem: customer.businessItem,
        managers: [{ email: customer.email }],
      },
      items: [{ date: "2026-11-25", name: "조경 관리", supplyCost: 10005, tax: 1001,
        unitPrice: null, quantity: null, description: null }],
    });
    return original(body, ref);
  };
  assert.deepEqual(await f.run(), { issued: 1, completed: 0, failed: 0, skipped: 0, environment: "test" });
  assert.deepEqual(f.updates, [{ status: STATUS.pending, reference: firstReference, date: "2026-11-25", error: "" }, { key: "invoice-key" }]);
});

test("사업자번호 거절 후 수정·재체크하면 새 참조번호로 발행하고 그 번호로 완료를 조회한다", async () => {
  const f = fixture();
  const submissions: string[] = [];
  let businessNumber = "1111111111";
  f.notion.getCustomer = async () => ({ ...customer, businessNumber });
  f.bolta.issueTaxInvoice = async (body, ref) => {
    const { supplied } = body as { supplied: { identificationNumber: string } };
    assert.equal(supplied.identificationNumber, businessNumber);
    assert.deepEqual(f.updates.at(-1), {
      status: STATUS.pending, reference: ref, error: "", ...(submissions.length === 0 && { date: "2026-11-25" }),
    });
    if (submissions.includes(ref)) throw new BoltaApiError(409, "DUPLICATE", "이미 사용된 참조번호", null);
    submissions.push(ref);
    if (businessNumber === "1111111111") throw new BoltaApiError(400, "INVALID_BUSINESS", "사업자번호 오류", null);
    return { issuanceKey: "invoice-key" };
  };
  assert.equal((await f.run()).failed, 1);
  assert.equal(f.bill.reference, firstReference);
  assert.equal(f.bill.requested, false);
  businessNumber = "1234567890";
  f.bill.requested = true;
  assert.equal((await f.run()).issued, 1);
  assert.equal(submissions.length, 2);
  assert.notEqual(submissions[1], submissions[0]);
  assert.match(submissions[1], /^erp-abcd08081338-[a-z0-9]+$/);
  assert.equal(f.bill.reference, submissions[1]);
  assert.equal((await f.run()).completed, 1);
  assert.deepEqual(f.calls, ["status", "detail"]);
});

test("한 실행에서 같은 청구가 두 번 반환되어도 발행·조회는 한 번만 한다", async () => {
  for (const status of [STATUS.ready, STATUS.pending]) {
    const f = fixture({ status });
    f.notion.listCandidates = async () => [{ ...f.bill }, { ...f.bill }];
    const result = await f.run();
    assert.equal(result.skipped, 1);
    assert.deepEqual(f.calls, status === STATUS.ready ? ["issue"] : ["status", "detail"]);
  }
});

test("발행 참조번호 저장이 실패하면 볼타로 보내지 않는다", async () => {
  const f = fixture();
  f.notion.updateBill = async (_id, update) => {
    assert.equal(update.reference, firstReference);
    throw new Error("참조번호 저장 실패");
  };
  await assert.rejects(f.run, /참조번호 저장 실패/);
  assert.deepEqual(f.calls, []);
});

test("참조번호가 바뀌면 이전 시도의 발행 호출과 완료 기록을 건너뛴다", async () => {
  const issuing = fixture();
  const write = issuing.notion.updateBill;
  issuing.notion.updateBill = async (id, update) => {
    await write(id, update);
    issuing.bill.reference = "other-attempt";
  };
  assert.equal((await issuing.run()).skipped, 1);
  assert.deepEqual(issuing.calls, []);

  const pending = fixture({ status: STATUS.pending, reference: firstReference, key: "invoice-key" });
  const detail = pending.bolta.getTaxInvoice;
  pending.bolta.getTaxInvoice = async key => {
    pending.bill.reference = "other-attempt";
    return detail(key);
  };
  assert.equal((await pending.run()).skipped, 1);
  assert.deepEqual(pending.updates, []);
});

test("청구별 공급자 업태·종목과 빈 값·미등록 업종의 기본값", async () => {
  const cases: [string | null, string, string][] = [
    ["정기 식물관리", "사업시설 관리, 사업지원 및 임대 서비스업", "조경관리 및 유지 서비스업"],
    ["식물·화분 납품", "도매 및 소매업", "조경 및 화훼류 관련 도소매업"],
    ["정원·조경 설계", "전문, 과학 및 기술서비스업", "조경 설계 서비스업"],
    ["공간 컨설팅", "전문, 과학 및 기술서비스업", "공간디자인 컨설팅업"],
    ["디자인", "전문, 과학 및 기술서비스업", "시각 디자인업"],
    ["교육·클래스", "교육서비스업", "교육서비스업"],
    ["온라인 판매", "도매 및 소매업", "전자상거래업"],
    ["소프트웨어", "정보통신업", "응용 소프트웨어 개발 및 공급업"],
    [null, "사업시설 관리, 사업지원 및 임대 서비스업", "조경관리 및 유지 서비스업"],
    ["미등록", "사업시설 관리, 사업지원 및 임대 서비스업", "조경관리 및 유지 서비스업"],
  ];
  for (const [industry, businessType, businessItem] of cases) {
    const f = fixture({ industry });
    f.bolta.issueTaxInvoice = async body => {
      const { supplier } = body as { supplier: { businessType: string; businessItem: string } };
      assert.equal(supplier.businessType, businessType);
      assert.equal(supplier.businessItem, businessItem);
      return { issuanceKey: "invoice-key" };
    };
    assert.equal((await f.run()).issued, 1);
  }
});

test("검증에 실패하면 필요한 필드를 한국어로 기록하고 볼타 호출 없이 체크를 해제한다", async () => {
  const f = fixture({ supplyCost: -0.5, item: "" });
  f.notion.getCustomer = async () => ({ ...customer, businessNumber: "x1234567890", company: "", representative: "", email: "bad" });
  assert.equal((await f.run()).failed, 1);
  const update = f.updates[0];
  assert.equal(update.status, STATUS.failed);
  assert.equal(update.requested, false);
  for (const field of ["사업자번호", "상호", "대표자명", "계산서 이메일", "공급가액", "품목"]) assert.ok(update.error?.includes(field));
  assert.deepEqual(f.calls, []);
  for (const customers of [[], ["a", "b"]]) {
    const invalid = fixture({ customers });
    invalid.notion.getCustomer = async () => assert.fail("거래처 1개일 때만 조회");
    assert.equal((await invalid.run()).failed, 1);
    assert.match(invalid.updates[0].error!, /거래처.*1개/);
    assert.deepEqual(invalid.calls, []);
  }
});

test("발행 중은 체크 해제 후에도 상태·상세를 조회하고 완료는 한 번만 기록한다", async () => {
  const f = fixture({ status: STATUS.pending, requested: false, date: "2026-10-31" });
  assert.equal((await f.run()).completed, 1);
  assert.deepEqual(f.calls, ["status", "detail"]);
  assert.deepEqual(f.updates, [{ key: "invoice-key" }, { status: STATUS.complete, approval: "NTS-123", invoiced: true, error: "" }]);
  assert.equal(f.bill.date, "2026-10-31");
  assert.equal((await f.run()).skipped, 1);
  assert.deepEqual(f.calls, ["status", "detail"]);
});

test("포인트 부족은 지정 문구로 실패하고, 다시 체크하면 같은 작성일자로 재요청한다", async () => {
  const f = fixture({ status: STATUS.ready, date: "2026-10-31" });
  const original = f.bolta.issueTaxInvoice;
  f.bolta.issueTaxInvoice = async () => { throw new BoltaApiError(402, "PAYMENT_REQUIRED", "points", null); };
  assert.equal((await f.run()).failed, 1);
  assert.equal(f.updates.at(-1)?.error, "볼타 포인트가 부족합니다. 충전 후 다시 체크하세요");
  assert.equal((await f.run()).skipped, 1);
  f.bill.requested = true;
  f.bolta.issueTaxInvoice = async (body, ref) => {
    assert.equal((body as { date: string }).date, "2026-10-31");
    return original(body, ref);
  };
  assert.equal((await f.run()).issued, 1);
});

test("발행 요청 응답 유실·서버 장애·중복 응답은 재전송 없이 다음 실행에서 복구한다", async () => {
  for (const error of [
    new BoltaNetworkError(), new BoltaApiError(503, "HTTP_503", "", null),
    new BoltaApiError(409, "IDEMPOTENCY_CONFLICT", "중복 참조", null),
    new BoltaApiError(400, "INVALID_REQUEST", "잘못된 요청", null),
  ]) {
    const f = fixture();
    let submissions = 0;
    f.bolta.issueTaxInvoice = async () => { submissions++; throw error; };
    assert.equal((await f.run()).skipped, 1);
    assert.equal(f.bill.status, STATUS.pending);
    assert.equal((await f.run()).completed, 1);
    assert.equal(submissions, 1);
  }
});

test("볼타 접수 후 노션 발행키 저장이 실패해도 참조번호로 복구한다", async () => {
  const f = fixture();
  const write = f.notion.updateBill;
  f.notion.updateBill = async (id, update) => {
    if (update.key) throw new Error("노션 응답 유실");
    await write(id, update);
  };
  await assert.rejects(f.run, /노션/);
  assert.equal(f.bill.status, STATUS.pending);
  f.notion.updateBill = write;
  assert.equal((await f.run()).completed, 1);
  assert.deepEqual(f.calls, ["issue", "status", "detail"]);
});

test("명시적 발행 거절·비동기 실패 메시지에서 민감정보를 지운다", async () => {
  const message = "발행 실패 (900101-1234567, 123-45-67890, foo@example.com)";
  for (const pending of [false, true]) {
    const f = fixture({ status: pending ? STATUS.pending : null });
    f.bolta.issueTaxInvoice = async () => { throw new BoltaApiError(400, "INVALID_SUPPLIER_BUSINESS", message, null); };
    f.bolta.getIssueStatus = async () => ({ message, issuanceKey: "", clientReferenceId: reference });
    assert.equal((await f.run()).failed, 1);
    assert.equal(f.updates.at(-1)?.error, "발행 실패 ([개인식별번호 제거], [사업자번호 제거], [이메일 제거])");
    assert.deepEqual(f.calls, []);
  }
});

test("접수 직후의 조회 404, 상세 400, 승인번호·발행시각 누락은 완료 처리하지 않는다", async () => {
  for (const stage of ["status", "detail", "approval", "issuedAt"]) {
    const f = fixture({ status: STATUS.pending });
    if (stage === "status") f.bolta.getIssueStatus = async () => { throw new BoltaApiError(404, "NOT_FOUND", "", null); };
    else f.bolta.getTaxInvoice = async key => {
      if (stage === "detail") throw new BoltaApiError(400, "INVALID_REQUEST", "", null);
      return { issuanceKey: key, issuedAt: stage === "issuedAt" ? "" : now().toISOString(),
        ntsTransactionId: stage === "approval" ? "" : "NTS", invoice: {} };
    };
    assert.equal((await f.run()).skipped, 1);
    assert.equal(f.bill.status, STATUS.pending);
  }
  const stale = fixture({ status: STATUS.pending, lastEdited: "2026-11-22T00:00:00Z" });
  stale.bolta.getIssueStatus = async () => { throw new BoltaApiError(404, "NOT_FOUND", "", null); };
  assert.equal((await stale.run()).failed, 1);
  assert.match(stale.updates.at(-1)?.error!, /접수된 발행 요청이 없습니다/);
});

test("실행당 최대 20건, 조회 뒤 요청 해제된 청구 제외", async () => {
  const f = fixture();
  f.notion.listCandidates = async () => Array.from({ length: 25 }, (_, i) => ({ ...f.bill, id: String(i) }));
  f.notion.getCustomer = async () => { f.bill.requested = false; return customer; };
  assert.equal((await f.run()).skipped, 20);
  assert.deepEqual(f.calls, []);
  assert.deepEqual(f.updates, []);
});

test("목록 조회 후 수정된 공급가액과 품목은 호출 직전 페이지에서 가져온다", async () => {
  const f = fixture();
  f.notion.getCustomer = async () => {
    Object.assign(f.bill, { supplyCost: 5050, item: "변경 품목" });
    return customer;
  };
  f.bolta.issueTaxInvoice = async body => {
    const { items } = body as { items: { supplyCost: number; tax: number; name: string }[] };
    assert.equal(items[0].supplyCost, 5050);
    assert.equal(items[0].tax, 505);
    assert.equal(items[0].name, "변경 품목");
    return { issuanceKey: "invoice-key" };
  };
  assert.equal((await f.run()).issued, 1);
});

test("늦게 도착한 오류가 다른 실행의 완료 상태를 덮지 않는다", async () => {
  const f = fixture({ status: STATUS.pending });
  f.bolta.getIssueStatus = async () => {
    f.bill.status = STATUS.complete;
    throw new BoltaApiError(400, "ISSUANCE_FAILED", "발행 실패", null);
  };
  assert.equal((await f.run()).skipped, 1);
  assert.deepEqual(f.updates, []);
});

test("Notion REST 헤더·후보 필터·커서·속성 매핑", async () => {
  const paths: string[] = [];
  const store = createNotionClient("notion-fixture", async (url, options) => {
    const path = new URL(String(url)).pathname;
    paths.push(path);
    const headers = new Headers(options?.headers);
    assert.equal(headers.get("Authorization"), "Bearer notion-fixture");
    assert.equal(headers.get("Notion-Version"), "2025-09-03");
    const body = options?.body ? JSON.parse(String(options.body)) : null;
    if (options?.method === "POST") {
      assert.equal(path, "/v1/data_sources/4220808e-1338-810a-85ea-000b1f4d7d4b/query");
      assert.deepEqual(body.filter.or[0], { property: BILL.status, select: { equals: STATUS.pending } });
      assert.deepEqual(body.filter.or.slice(1), [{ is_empty: true }, { equals: STATUS.ready }, { equals: STATUS.failed }].map(select => ({
        and: [{ property: BILL.requested, checkbox: { equals: true } }, { property: BILL.status, select }],
      })));
      if (!body.start_cursor) {
        assert.equal(body.page_size, 20);
        return Response.json({ results: [{ id, properties: {} }], has_more: true, next_cursor: "cursor" });
      }
      assert.equal(body.start_cursor, "cursor");
      assert.equal(body.page_size, 19);
      return Response.json({ results: [{ id: "next", properties: {} }], has_more: false, next_cursor: null });
    }
    if (options?.method === "GET") return Response.json({ id, properties: {
      "발행 참조번호": { rich_text: [{ plain_text: firstReference }] },
      "계산서 업종": { select: { name: "온라인 판매" } },
      [BILL.item]: { rich_text: [{ plain_text: "조경 " }, { plain_text: "관리" }] },
      [CUSTOMER.company]: { rich_text: [{ plain_text: customer.company }] },
      [CUSTOMER.email]: { email: customer.email },
    } });
    assert.equal(options?.method, "PATCH");
    assert.deepEqual(body.properties, {
      "발행 참조번호": { rich_text: [{ type: "text", text: { content: firstReference } }] },
      [BILL.key]: { rich_text: [{ type: "text", text: { content: "ik" } }] },
      [BILL.error]: { rich_text: [] }, [BILL.status]: { select: { name: STATUS.complete } },
      [BILL.approval]: { rich_text: [{ type: "text", text: { content: "nts" } }] },
      [BILL.invoiced]: { checkbox: true },
    });
    return Response.json({});
  });
  assert.deepEqual((await store.listCandidates(20)).map(bill => bill.id), [id, "next"]);
  const bill = await store.getBill(id);
  assert.equal(bill?.reference, firstReference);
  assert.equal(bill?.industry, "온라인 판매");
  assert.equal(bill?.item, "조경 관리");
  assert.equal((await store.getCustomer("customer"))?.company, customer.company);
  await store.updateBill(id, { reference: firstReference, key: "ik", status: STATUS.complete, error: "", approval: "nts", invoiced: true });
  assert.deepEqual(paths.slice(-3), [`/v1/pages/${id}`, "/v1/pages/customer", `/v1/pages/${id}`]);
});

test("볼타 키 접두사와 세 HTTP 요청 계약", async () => {
  const paths: string[] = [];
  const client = createBoltaClient({ apiKey: "live_fixture", fetchImpl: async (url, init) => {
    const { pathname, searchParams } = new URL(String(url));
    paths.push(pathname);
    if (init?.method === "POST") assert.equal(new Headers(init.headers).get("Bolta-Client-Reference-Id"), reference);
    if (pathname.endsWith("/status")) assert.equal(searchParams.get("clientReferenceId"), reference);
    return Response.json({ issuanceKey: "ik" });
  } });
  assert.equal(client.environment, "live");
  await client.issueTaxInvoice({}, reference);
  await client.getIssueStatus(reference);
  await client.getTaxInvoice("ik");
  assert.deepEqual(paths, ["/v1/taxInvoices/issue", "/v1/taxInvoices/issue/status", "/v1/taxInvoices/ik"]);
});

test("GET·POST 인증, HEAD 차단, 설정 누락 503, 동시 웹훅·크론 한 번 실행", async () => {
  const env: NodeJS.ProcessEnv = { ERP_SYNC_SECRET: "hook-fixture", CRON_SECRET: "cron-fixture" };
  const handlers = new Map<string, RequestHandler>();
  function register(method: string) {
    return (path: string, handler: RequestHandler) => {
      assert.equal(path, "/api/erp/tax-invoices/sync");
      handlers.set(method, handler);
    };
  }
  const app = { get: register("GET"), post: register("POST") } as unknown as Express;
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  let configured = true;
  registerTaxInvoiceRoutes(app, async () => {
    calls++;
    if (!configured) throw new SyncConfigurationError("볼타 API 키 설정을 확인하세요.");
    await blocked;
    return { issued: 0, completed: 0, failed: 0, skipped: 0, environment: "test" };
  }, env);
  async function call(method: string, headers: Record<string, string> = {}) {
    let status = 200;
    const response = {
      status(value: number) { status = value; return this; },
      set() { return this; }, json() {}, end() {},
    };
    const req = { method, get: (name: string) => headers[name] };
    await handlers.get(method === "HEAD" ? "GET" : method)!(req as never, response as never, () => {});
    return status;
  }
  assert.equal(await call("GET"), 401);
  assert.equal(await call("POST", { "x-erp-secret": "wrong" }), 401);
  assert.equal(await call("GET", { Authorization: "Bearer hook-fixture" }), 401);
  assert.equal(await call("HEAD", { Authorization: "Bearer cron-fixture" }), 405);
  assert.equal(calls, 0);
  const cron = call("GET", { Authorization: "Bearer cron-fixture" });
  const webhook = call("POST", { "x-erp-secret": "hook-fixture" });
  assert.equal(calls, 1);
  release();
  assert.deepEqual(await Promise.all([cron, webhook]), [200, 200]);
  configured = false;
  assert.equal(await call("POST", { "x-erp-secret": "hook-fixture" }), 503);
  delete env.ERP_SYNC_SECRET;
  delete env.CRON_SECRET;
  assert.equal(await call("GET", { Authorization: "Bearer cron-fixture" }), 503);
  assert.equal(await call("GET"), 401);
});
