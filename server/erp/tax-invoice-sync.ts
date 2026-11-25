import { z } from "zod";
import {
  BoltaApiError, BoltaNetworkError, getBoltaClient, isBoltaPointsShortage,
  isBoltaRejection, redactBoltaSensitiveText, type BoltaClient, type IssueStatus,
} from "../bolta-client";
import { createNotionClient, type Bill, type Customer, type InvoiceStore } from "./notion-client";
import { STATUS } from "./notion-schema";
import { supplierForIndustry } from "./supplier";

export interface SyncDependencies {
  notion: InvoiceStore;
  bolta: BoltaClient;
  now?: () => Date;
}
export class SyncConfigurationError extends Error {}

function configuredDependencies(): SyncDependencies {
  const token = process.env.NOTION_TOKEN;
  const bolta = getBoltaClient();
  if (!token || !bolta) throw new SyncConfigurationError("노션 토큰과 볼타 API 키(test_ 또는 live_) 설정을 확인하세요.");
  return { notion: createNotionClient(token), bolta };
}

const BATCH_LIMIT = 20;
const RECEIPT_GRACE_MS = 30 * 60 * 1000;
const POINTS_MESSAGE = "볼타 포인트가 부족합니다. 충전 후 다시 체크하세요";
const invoiceEmail = z.string().email();
const seoulDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short" });
type Outcome = "issued" | "completed" | "failed" | "skipped";

function newReference(bill: Bill, now: Date): string {
  const prefix = "erp-" + bill.id.replace(/-/g, "").slice(0, 12) + "-";
  const previous = bill.reference.startsWith(prefix) ? parseInt(bill.reference.slice(prefix.length), 36) : NaN;
  // 같은 밀리초에 재시도하거나 시계가 뒤로 가더라도 직전 시도의 번호를 재사용하지 않는다.
  const timestamp = Number.isSafeInteger(previous) ? Math.max(now.getTime(), previous + 1) : now.getTime();
  return prefix + timestamp.toString(36);
}

function prepareInvoice(bill: Bill, customer: Customer | null, date: string) {
  const errors: string[] = [];
  const number = customer?.businessNumber.replace(/[-\s]/g, "");
  if (bill.customers.length !== 1) errors.push("거래처를 정확히 1개 연결하세요.");
  else if (!customer) errors.push("연결된 거래처 페이지와 노션 접근 권한을 확인하세요.");
  if (customer) {
    if (!number || !/^\d{10}$/.test(number)) errors.push("사업자번호 숫자 10자리를 확인하세요.");
    if (!customer.company) errors.push("상호(법인명)를 입력하세요.");
    if (!customer.representative) errors.push("대표자명을 입력하세요.");
    if (!invoiceEmail.safeParse(customer.email).success) errors.push("계산서 이메일 형식을 확인하세요.");
  }
  const supplyCost = bill.supplyCost;
  if (supplyCost === null || !Number.isSafeInteger(supplyCost) || supplyCost <= 0) {
    errors.push("공급가액을 양의 정수로 입력하세요.");
  }
  if (!bill.item) errors.push("품목을 입력하세요.");
  if (errors.length || !customer || !number || supplyCost === null) return { error: errors.join(" ") };
  return {
    request: {
      date, purpose: "CLAIM", taxType: "TAXABLE", supplier: supplierForIndustry(bill.industry), trustee: null, description: null,
      supplied: {
        identificationNumber: number, taxRegistrationId: null,
        organizationName: customer.company, representativeName: customer.representative,
        address: customer.address || null, businessType: customer.businessType || null,
        businessItem: customer.businessItem || null, managers: [{ email: customer.email }],
      },
      items: [{
        date, name: bill.item, unitPrice: null, quantity: null,
        supplyCost, tax: Math.round(supplyCost * 0.1), description: null,
      }],
    },
  };
}

type BillState = Pick<Bill, "id" | "status" | "key" | "reference"> & { lastEdited?: string };

async function isCurrentAttempt(notion: InvoiceStore, bill: Pick<Bill, "id" | "reference">) {
  const latest = await notion.getBill(bill.id);
  return latest?.status === STATUS.pending && latest.reference === bill.reference;
}

async function fail(notion: InvoiceStore, bill: BillState, message: string, date?: string): Promise<Outcome> {
  // 다른 실행이 접수·완료를 기록한 뒤 오래된 실패가 그 상태를 덮지 않게 한다.
  const latest = await notion.getBill(bill.id);
  if (!latest || latest.status !== bill.status || latest.key !== bill.key || latest.reference !== bill.reference) return "skipped";
  if (bill.lastEdited && latest.lastEdited !== bill.lastEdited) return "skipped";
  if (bill.status !== STATUS.pending && !latest.requested) return "skipped";
  await notion.updateBill(bill.id, {
    status: STATUS.failed, requested: false, error: redactBoltaSensitiveText(message),
    ...(date && { date }),
  });
  return "failed";
}

function notReceived(error: unknown) {
  return error instanceof BoltaApiError && (error.status === 404 ||
    (error.status === 400 && ["NOT_FOUND", "INVALID_REQUEST", "HTTP_400"].includes(error.code)));
}

function uncertain(error: unknown) {
  return error instanceof BoltaNetworkError || (error instanceof BoltaApiError &&
    (error.status >= 500 || error.status === 429 || error.status === 408));
}

const terminalFailure = /^(?:(?:TAX_INVOICE_)?ISSUANCE_)?(?:FAILED|FAILURE|REJECTED)$/i;

function lookupFailure(error: unknown) {
  if (isBoltaPointsShortage(error)) return POINTS_MESSAGE;
  if (error instanceof BoltaApiError && terminalFailure.test(error.code)) return error.message || error.code;
}

function failureMessage(status: IssueStatus) {
  const failed = status.status
    ? terminalFailure.test(status.status)
    : /^(FAILED\b|FAILURE\b|REJECTED\b|(?:(?:세금계산서\s*)?발행(?:\s*요청)?[에이]?\s*)?(?:실패|거절))/i.test(status.message ?? "");
  if (status.failure || failed) {
    return status.failure?.message || status.message || "볼타가 세금계산서 발행에 실패했습니다.";
  }
}

async function reconcile(bill: Bill, deps: SyncDependencies, now: Date): Promise<Outcome> {
  const { notion, bolta } = deps;
  const reference = bill.reference || "erp-" + bill.id.replace(/-/g, "");
  let key = bill.key;
  try {
    const status = await bolta.getIssueStatus(reference);
    if (status.clientReferenceId && status.clientReferenceId !== reference) return "skipped";
    const failure = failureMessage(status);
    if (failure) return fail(notion, bill, failure);
    key = status.issuanceKey || key;
  } catch (error) {
    if (uncertain(error)) return "skipped";
    const failure = lookupFailure(error);
    if (failure) return fail(notion, bill, failure);
    if (!notReceived(error)) throw error;
    // 마지막 노션 수정 이후에도 30분간 접수 기록과 키가 모두 없을 때만 재시도를 연다.
    if (!key && now.getTime() - Date.parse(bill.lastEdited) >= RECEIPT_GRACE_MS) {
      return fail(notion, bill, "볼타에 접수된 발행 요청이 없습니다. 다시 체크하세요.");
    }
  }
  if (!key) return "skipped";
  if (key !== bill.key) {
    if (!await isCurrentAttempt(notion, bill)) return "skipped";
    await notion.updateBill(bill.id, { key });
  }

  let detail;
  try {
    detail = await bolta.getTaxInvoice(key);
  } catch (error) {
    // 상세 API는 발행 완료 전에도 400/404를 돌려준다.
    const failure = lookupFailure(error);
    if (failure) return fail(notion, { id: bill.id, status: STATUS.pending, key, reference: bill.reference }, failure);
    if (uncertain(error) || notReceived(error) || (error instanceof BoltaApiError && error.status === 400)) return "skipped";
    throw error;
  }
  if (detail.issuanceKey !== key || !detail.ntsTransactionId?.trim() || !Number.isFinite(Date.parse(detail.issuedAt))) {
    return "skipped";
  }
  if (!await isCurrentAttempt(notion, bill)) return "skipped";
  await notion.updateBill(bill.id, {
    status: STATUS.complete, approval: detail.ntsTransactionId, invoiced: true, error: "",
  });
  return "completed";
}

async function issue(bill: Bill, deps: SyncDependencies): Promise<Outcome> {
  const { notion, bolta } = deps;
  const customer = bill.customers.length === 1 ? await notion.getCustomer(bill.customers[0]) : null;
  // 목록 조회 뒤 수정된 금액·작성일은 호출 직전 페이지 값으로 읽는다.
  const current = await notion.getBill(bill.id);
  if (!current?.requested || current.status !== bill.status || current.reference !== bill.reference ||
      current.customers.length !== bill.customers.length || current.customers[0] !== bill.customers[0]) return "skipped";
  const now = deps.now?.() ?? new Date(Date.now());
  const date = current.date ?? seoulDate.format(now);
  const prepared = prepareInvoice(current, customer, date);
  if (!prepared.request) return fail(notion, current, prepared.error, current.date ? undefined : date);

  const reference = newReference(current, now);
  const pending = { id: bill.id, status: STATUS.pending, key: "", reference };
  await notion.updateBill(bill.id, {
    status: STATUS.pending, reference, error: "", ...(!current.date && { date }), ...(current.key && { key: "" }),
  });
  if (!await isCurrentAttempt(notion, pending)) return "skipped";
  let key: string;
  try {
    ({ issuanceKey: key } = await bolta.issueTaxInvoice(prepared.request, reference));
  } catch (error) {
    if (uncertain(error)) return "skipped";
    if (isBoltaPointsShortage(error)) return fail(notion, pending, POINTS_MESSAGE);
    if (!(error instanceof BoltaApiError) || !isBoltaRejection(error)) throw error;
    // 다른 인스턴스가 같은 참조번호로 먼저 접수했을 수 있다.
    if (/IDEMPOTENCY|DUPLICATE|ALREADY_USED/i.test(error.code) ||
        /이미.{0,30}(사용|접수|발행)|already.{0,20}(used|exists)/i.test(error.message)) return "skipped";
    if (error.code === "INVALID_REQUEST") {
      try {
        const status = await bolta.getIssueStatus(reference);
        if (status.issuanceKey) return "skipped";
      } catch (lookupError) {
        if (uncertain(lookupError)) return "skipped";
        if (!notReceived(lookupError)) throw lookupError;
      }
    }
    return fail(notion, pending, error.message || error.code);
  }
  if (!key || !await isCurrentAttempt(notion, pending)) return "skipped";
  await notion.updateBill(bill.id, { key });
  return "issued";
}

export async function syncTaxInvoices(deps: SyncDependencies = configuredDependencies()) {
  const summary = { issued: 0, completed: 0, failed: 0, skipped: 0, environment: deps.bolta.environment };
  const bills = await deps.notion.listCandidates(BATCH_LIMIT);
  const seen = new Set<string>();
  for (const bill of bills.slice(0, BATCH_LIMIT)) {
    const id = bill.id.replace(/-/g, "").toLowerCase();
    if (seen.has(id)) {
      summary.skipped++;
      continue;
    }
    seen.add(id);
    let outcome: Outcome = "skipped";
    if (bill.status === STATUS.pending) {
      outcome = await reconcile(bill, deps, deps.now?.() ?? new Date());
    } else if (bill.requested && (bill.status === null || bill.status === STATUS.ready || bill.status === STATUS.failed)) {
      outcome = await issue(bill, deps);
    }
    summary[outcome]++;
  }
  return summary;
}
