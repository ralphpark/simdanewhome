import { createHash, timingSafeEqual } from "node:crypto";
import type { Express, RequestHandler } from "express";
import { syncTaxInvoices, SyncConfigurationError } from "./tax-invoice-sync";

function matches(actual?: string, expected?: string) {
  if (!expected || !actual) return false;
  const digest = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}

export function registerTaxInvoiceRoutes(app: Express, sync = syncTaxInvoices, env = process.env) {
  let running: ReturnType<typeof sync> | undefined;
  const path = "/api/erp/tax-invoices/sync";
  const handle: RequestHandler = async (req, res) => {
    res.set("Cache-Control", "no-store");
    // Express는 HEAD도 GET으로 라우팅한다. 단순 상태 점검으로 발행하지 않는다.
    if (req.method === "HEAD") return res.set("Allow", "GET, POST").status(405).end();
    const secret = req.get("x-erp-secret");
    const bearer = req.get("Authorization")?.match(/^Bearer (.+)$/i)?.[1];
    if ((secret || bearer) && !env.ERP_SYNC_SECRET && !env.CRON_SECRET) {
      return res.status(503).json({ message: "ERP 동기화 인증 환경변수를 설정하세요." });
    }
    if (!matches(secret, env.ERP_SYNC_SECRET) && !matches(bearer, env.CRON_SECRET)) {
      return res.status(401).json({ message: "ERP 동기화 인증이 필요합니다." });
    }
    try {
      running ??= sync().finally(() => { running = undefined; });
      return res.json(await running);
    } catch (error) {
      if (error instanceof SyncConfigurationError) return res.status(503).json({ message: error.message });
      return res.status(502).json({ message: "노션 또는 볼타와 동기화하지 못했습니다. 다시 시도하세요." });
    }
  };
  app.get(path, handle);
  app.post(path, handle);
}
