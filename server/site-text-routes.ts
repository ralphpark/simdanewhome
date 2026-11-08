import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { insertSiteTextSchema } from "@shared/schema";
import { siteTextKeys } from "../client/src/content/siteTexts";
import type { IStorage } from "./storage";

const keySchema = z.enum(siteTextKeys);

export function registerSiteTextRoutes(app: Express, storage: Pick<IStorage, "getSiteTexts" | "upsertSiteText" | "deleteSiteText" | "applySiteTextChanges">, isAuthenticated: RequestHandler) {
  app.get("/api/site-texts", async (_req, res) => {
    try { res.json(await storage.getSiteTexts()); }
    catch { res.status(500).json({ error: "사이트 문구를 불러오지 못했습니다" }); }
  });

  app.put("/api/site-texts", isAuthenticated, async (req, res) => {
    const body = z.object({
      changes: z.array(z.object({ key: keySchema, value: insertSiteTextSchema.shape.value.nullable() })).max(300),
    }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "문구를 확인해주세요. 한 번에 300개까지, 문구마다 1자부터 2,000자까지 저장할 수 있습니다" });
    try {
      await storage.applySiteTextChanges(body.data.changes);
      res.json({ success: true });
    } catch { res.status(500).json({ error: "사이트 문구를 저장하지 못했습니다" }); }
  });

  app.put("/api/site-texts/:key", isAuthenticated, async (req, res) => {
    const key = keySchema.safeParse(req.params.key);
    const body = insertSiteTextSchema.omit({ key: true }).safeParse(req.body);
    if (!key.success || !body.success) return res.status(400).json({ error: "문구를 확인해주세요. 1자부터 2,000자까지 저장할 수 있습니다" });
    try { res.json(await storage.upsertSiteText({ ...body.data, key: key.data })); }
    catch { res.status(500).json({ error: "사이트 문구를 저장하지 못했습니다" }); }
  });

  app.delete("/api/site-texts/:key", isAuthenticated, async (req, res) => {
    const key = keySchema.safeParse(req.params.key);
    if (!key.success) return res.status(400).json({ error: "등록되지 않은 문구입니다" });
    try { await storage.deleteSiteText(key.data); res.status(204).end(); }
    catch { res.status(500).json({ error: "기본 문구로 되돌리지 못했습니다" }); }
  });
}
