import { setTimeout as delay } from "node:timers/promises";
import { BILL, BILLING_DATA_SOURCE_ID, CUSTOMER, STATUS } from "./notion-schema";

type Property = {
  rich_text?: { plain_text: string }[];
  relation?: { id: string }[];
  date?: { start: string } | null;
  select?: { name: string } | null;
  checkbox?: boolean;
  number?: number | null;
  email?: string | null;
};
type Page = {
  id: string;
  archived: boolean;
  in_trash: boolean;
  last_edited_time: string;
  properties: Record<string, Property>;
};
type PageList = { results: Page[]; has_more: boolean; next_cursor: string | null };

export interface Bill {
  id: string;
  lastEdited: string;
  customers: string[];
  item: string;
  supplyCost: number | null;
  date: string | null;
  requested: boolean;
  status: string | null;
  key: string;
  reference: string;
  industry: string | null;
}
export interface Customer {
  company: string;
  businessNumber: string;
  representative: string;
  address: string;
  businessType: string;
  businessItem: string;
  email: string;
}
export interface BillUpdate {
  status?: typeof STATUS[keyof typeof STATUS];
  date?: string;
  key?: string;
  reference?: string;
  error?: string;
  approval?: string;
  requested?: boolean;
  invoiced?: boolean;
}
export interface InvoiceStore {
  listCandidates(limit: number): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  getCustomer(id: string): Promise<Customer | null>;
  updateBill(id: string, update: BillUpdate): Promise<void>;
}

function readText(property?: Property): string {
  return property?.rich_text?.map(part => part.plain_text).join("").trim() ?? "";
}

function readBill(page: Page): Bill {
  const p = page.properties;
  return {
    id: page.id,
    lastEdited: page.last_edited_time,
    customers: p[BILL.customer]?.relation?.map(row => row.id) ?? [],
    item: readText(p[BILL.item]),
    supplyCost: p[BILL.supplyCost]?.number ?? null,
    date: p[BILL.date]?.date?.start?.slice(0, 10) ?? null,
    requested: p[BILL.requested]?.checkbox === true,
    status: p[BILL.status]?.select?.name ?? null,
    key: readText(p[BILL.key]),
    reference: readText(p[BILL.reference]),
    industry: p[BILL.industry]?.select?.name ?? null,
  };
}

function richText(value: string) {
  return { rich_text: value ? [{ type: "text", text: { content: value } }] : [] };
}

const candidateFilter = {
  or: [
    { property: BILL.status, select: { equals: STATUS.pending } },
    ...[{ is_empty: true }, { equals: STATUS.ready }, { equals: STATUS.failed }].map(select => ({
      and: [
        { property: BILL.requested, checkbox: { equals: true } },
        { property: BILL.status, select },
      ],
    })),
  ],
};

export function createNotionClient(token: string, fetchImpl: typeof fetch = fetch): InvoiceStore {
  async function request(method: string, path: string, body?: unknown): Promise<Response> {
    const init = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    };
    for (let attempt = 0; ; attempt++) {
      const response = await fetchImpl(`https://api.notion.com/v1${path}`, {
        ...init, signal: AbortSignal.timeout(15_000),
      });
      if (response.status !== 429 || attempt === 2) return response;
      const seconds = Number(response.headers.get("Retry-After") ?? 1);
      if (!Number.isFinite(seconds) || seconds > 5) return response;
      await delay(Math.max(1, seconds) * 1000);
    }
  }

  async function getPage(id: string): Promise<Page | null> {
    const response = await request("GET", `/pages/${encodeURIComponent(id)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`노션 페이지 조회 실패 (HTTP ${response.status})`);
    const page: Page = await response.json();
    return page.archived || page.in_trash ? null : page;
  }

  return {
    async listCandidates(limit) {
      const bills = new Map<string, Bill>();
      let cursor: string | null = null;
      do {
        const response = await request("POST", `/data_sources/${BILLING_DATA_SOURCE_ID}/query`, {
          filter: candidateFilter,
          sorts: [{ timestamp: "last_edited_time", direction: "ascending" }],
          page_size: limit - bills.size,
          ...(cursor && { start_cursor: cursor }),
        });
        if (!response.ok) throw new Error(`노션 청구 목록 조회 실패 (HTTP ${response.status})`);
        const page: PageList = await response.json();
        for (const row of page.results) {
          if (!row.archived && !row.in_trash) bills.set(row.id, readBill(row));
          if (bills.size === limit) break;
        }
        if (!page.has_more) break;
        if (!page.next_cursor || page.next_cursor === cursor) throw new Error("노션 조회 커서가 올바르지 않습니다.");
        cursor = page.next_cursor;
      } while (bills.size < limit);
      return Array.from(bills.values());
    },
    async getBill(id) {
      const page = await getPage(id);
      return page && readBill(page);
    },
    async getCustomer(id) {
      const page = await getPage(id);
      if (!page) return null;
      const p = page.properties;
      return {
        company: readText(p[CUSTOMER.company]),
        businessNumber: readText(p[CUSTOMER.businessNumber]),
        representative: readText(p[CUSTOMER.representative]),
        address: readText(p[CUSTOMER.address]),
        businessType: readText(p[CUSTOMER.businessType]),
        businessItem: readText(p[CUSTOMER.businessItem]),
        email: p[CUSTOMER.email]?.email?.trim() ?? "",
      };
    },
    async updateBill(id, update) {
      const properties: Record<string, unknown> = {};
      if (update.status !== undefined) properties[BILL.status] = { select: { name: update.status } };
      if (update.date !== undefined) properties[BILL.date] = { date: { start: update.date } };
      if (update.key !== undefined) properties[BILL.key] = richText(update.key);
      if (update.reference !== undefined) properties[BILL.reference] = richText(update.reference);
      if (update.error !== undefined) properties[BILL.error] = richText(update.error.slice(0, 2000));
      if (update.approval !== undefined) properties[BILL.approval] = richText(update.approval);
      if (update.invoiced !== undefined) properties[BILL.invoiced] = { checkbox: update.invoiced };
      if (update.requested !== undefined) properties[BILL.requested] = { checkbox: update.requested };
      const response = await request("PATCH", `/pages/${encodeURIComponent(id)}`, { properties });
      if (!response.ok) throw new Error(`노션 청구 수정 실패 (HTTP ${response.status})`);
    },
  };
}
