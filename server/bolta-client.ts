/** 볼타 세금계산서 정발행 및 조회 클라이언트. */
export type TaxInvoiceEnvironment = "test" | "live";

export function environmentFromApiKey(key: string | undefined | null): TaxInvoiceEnvironment | null {
  if (key?.startsWith("test_")) return "test";
  if (key?.startsWith("live_")) return "live";
  return null;
}

export const BOLTA_BASE_URL = "https://xapi.bolta.io";

export const DEFAULT_TIMEOUT_MS = 15000;

/** 볼타 오류가 요청의 식별번호나 수신 이메일을 되돌려 주어도 노션에 남기지 않는다. */
export function redactBoltaSensitiveText(value: string): string {
  return value
    .replace(/\d{6}[-\s]?\d{7}/g, "[개인식별번호 제거]")
    .replace(/\b\d{3}-?\d{2}-?\d{5}\b/g, "[사업자번호 제거]")
    .replace(/[\w.!#$%&'*+\/=?^_`{|}~-]+@[\w.-]+\.[a-z]{2,}/gi, "[이메일 제거]");
}

/** 볼타가 2xx가 아닌 응답을 준 경우. `code`는 응답 본문의 code, 파싱 실패 시 `HTTP_${status}`. */
export class BoltaApiError extends Error {
  status: number;
  code: string;
  traceId: string | null;

  constructor(status: number, code: string, message: string, traceId: string | null) {
    super(redactBoltaSensitiveText(message));
    this.name = "BoltaApiError";
    this.status = status;
    this.code = redactBoltaSensitiveText(code);
    this.traceId = traceId == null ? null : redactBoltaSensitiveText(traceId);
  }
}

/** 응답을 아예 받지 못한 경우(타임아웃·DNS·연결 실패 등). */
export class BoltaNetworkError extends Error {
  constructor(message = "볼타 응답을 받지 못했어요") {
    super(message);
    this.name = "BoltaNetworkError";
  }
}

export type BoltaClientOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  /** 기본 15000ms */
  timeoutMs?: number;
};

export type IssueResponse = { issuanceKey: string };

export type TaxInvoiceDetail = {
  issuanceKey: string;
  ntsTransactionId: string;
  issuedAt: string;
  invoice: unknown;
};

export type IssueStatus = {
  issuanceKey: string;
  clientReferenceId: string;
  message: string;
  status?: string;
  failure?: { code?: string; message?: string } | null;
};

export type BoltaClient = {
  environment: TaxInvoiceEnvironment;
  issueTaxInvoice(body: unknown, clientReferenceId: string): Promise<IssueResponse>;
  getTaxInvoice(issuanceKey: string): Promise<TaxInvoiceDetail>;
  getIssueStatus(clientReferenceId: string): Promise<IssueStatus>;
};

type RequestOptions = {
  body?: unknown;
  clientReferenceId?: string;
  query?: Record<string, string>;
};

/**
 * 볼타 API 클라이언트를 만든다. 실제 fetch 대신 `fetchImpl`을 주입해 테스트할 수 있다.
 */
export function createBoltaClient(options: BoltaClientOptions): BoltaClient {
  const { apiKey } = options;
  const baseUrl = options.baseUrl ?? BOLTA_BASE_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const environment = environmentFromApiKey(apiKey);
  if (!environment) throw new Error("볼타 API 키의 환경 접두사를 확인하세요.");

  async function request<T>(
    method: string,
    path: string,
    { body, clientReferenceId, query }: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      Accept: "application/json",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (clientReferenceId) {
      headers["Bolta-Client-Reference-Id"] = clientReferenceId;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    let raw: string;
    try {
      res = await fetchImpl(url.toString(), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      raw = await res.text();
    } catch {
      console.error(`[bolta] ${method} [생략] network-error`);
      throw new BoltaNetworkError();
    } finally {
      clearTimeout(timer);
    }

    console.log(`[bolta] ${method} [생략] ${res.status}`);

    if (!res.ok) {
      let parsed: { code?: string; message?: string; traceId?: string } | null = null;
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
      }
      if (parsed && typeof parsed === "object" && parsed.code) {
        throw new BoltaApiError(
          res.status,
          parsed.code,
          parsed.message ?? res.statusText,
          parsed.traceId ?? null,
        );
      }
      throw new BoltaApiError(res.status, `HTTP_${res.status}`, res.statusText, null);
    }

    if (res.status === 204) {
      return {} as T;
    }
    if (!raw) {
      return {} as T;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new BoltaNetworkError("볼타 응답을 확인할 수 없습니다.");
    }
  }

  return {
    environment,

    issueTaxInvoice(body, clientReferenceId) {
      return request<IssueResponse>("POST", "/v1/taxInvoices/issue", {
        body,
        clientReferenceId,
      });
    },

    getTaxInvoice(issuanceKey) {
      return request<TaxInvoiceDetail>(
        "GET",
        `/v1/taxInvoices/${encodeURIComponent(issuanceKey)}`,
      );
    },

    getIssueStatus(clientReferenceId) {
      return request<IssueStatus>("GET", "/v1/taxInvoices/issue/status", {
        query: { clientReferenceId },
      });
    },
  };
}

/** env에서 볼타 클라이언트를 만든다. 설정되지 않았으면 null(캐시하지 않고 호출마다 새로 만든다). */
export function getBoltaClient(): BoltaClient | null {
  const apiKey = process.env.BOLTA_API_KEY;
  if (environmentFromApiKey(apiKey) === null || !apiKey) {
    return null;
  }
  return createBoltaClient({ apiKey });
}

/**
 * 볼타 선충전 포인트 부족(402 PAYMENT_REQUIRED, 또는 포인트 부족 409). 충전 후 재시도할 수 있다.
 * 409의 포인트 부족 코드명은 문서에서 확인하지 못해 code에 POINT·BALANCE·INSUFFICIENT가 들어가면 부족으로 본다.
 */
export function isBoltaPointsShortage(error: unknown): boolean {
  if (!(error instanceof BoltaApiError)) return false;
  if (error.status === 402) return true;
  return error.status === 409 && /POINT|BALANCE|INSUFFICIENT/i.test(error.code);
}

/**
 * 볼타가 요청을 받고 거절했다고 확정할 수 있는 오류(4xx, 포인트 부족 제외). 5xx·응답 없음은 접수 여부를 모르므로
 * 실패로 확정하지 말고 참조번호·상태 조회로 확인한다.
 */
export function isBoltaRejection(error: unknown): boolean {
  return error instanceof BoltaApiError && error.status >= 400 && error.status < 500 && !isBoltaPointsShortage(error);
}
