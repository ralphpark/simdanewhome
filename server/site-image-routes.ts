import type { Express, RequestHandler } from "express";
import { handleUpload } from "@vercel/blob/client";
import { z } from "zod";
import { insertSiteImageSchema } from "@shared/schema";
import { siteImageContentTypes, siteImageMaxBytes } from "@shared/site-image-upload";
import { siteImageKeys } from "../client/src/content/images";
import type { IStorage } from "./storage";

const keySchema = z.enum(siteImageKeys);
const tokenBodySchema = z.object({
  type: z.literal("blob.generate-client-token"),
  payload: z.object({
    pathname: z.string().min(1).max(250),
    multipart: z.boolean(),
    clientPayload: keySchema,
  }),
});

/** Inject auth/storage so the upload boundary can be checked without a live DB. */
export function registerSiteImageRoutes(app: Express, storage: Pick<IStorage, "getSiteImages" | "upsertSiteImage" | "deleteSiteImage">, isAuthenticated: RequestHandler) {
  app.get("/api/site-images", async (_req, res) => {
    try { res.json(await storage.getSiteImages()); }
    catch { res.status(500).json({ error: "사이트 이미지를 불러오지 못했습니다" }); }
  });

  app.put("/api/site-images/:key", isAuthenticated, async (req, res) => {
    const key = keySchema.safeParse(req.params.key);
    const body = insertSiteImageSchema.omit({ key: true }).safeParse(req.body);
    if (!key.success || !body.success) return res.status(400).json({ error: "이미지 키 또는 HTTPS 주소가 올바르지 않습니다" });
    try { res.json(await storage.upsertSiteImage({ ...body.data, key: key.data })); }
    catch { res.status(500).json({ error: "사이트 이미지를 저장하지 못했습니다" }); }
  });

  app.delete("/api/site-images/:key", isAuthenticated, async (req, res) => {
    const key = keySchema.safeParse(req.params.key);
    if (!key.success) return res.status(400).json({ error: "등록되지 않은 이미지 키입니다" });
    try { await storage.deleteSiteImage(key.data); res.status(204).end(); }
    catch { res.status(500).json({ error: "사이트 이미지를 초기화하지 못했습니다" }); }
  });

  app.post("/api/blob-upload", isAuthenticated, async (req, res) => {
    const body = tokenBodySchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "업로드 요청이 올바르지 않습니다" });
    const { pathname, clientPayload: key } = body.data.payload;
    if (!pathname.startsWith(`site-images/${key}/`) || !/^site-images\/[a-z.]+\/[a-zA-Z0-9_-]+\.(jpe?g|png|webp|gif|avif)$/i.test(pathname)) {
      return res.status(400).json({ error: "이미지 업로드 경로가 올바르지 않습니다" });
    }
    try {
      const result = await handleUpload({
        request: req,
        body: body.data,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: siteImageContentTypes,
          maximumSizeInBytes: siteImageMaxBytes,
          addRandomSuffix: true,
        }),
      });
      res.json(result);
    } catch { res.status(500).json({ error: "업로드를 시작하지 못했습니다. Blob 연결 설정을 확인해주세요" }); }
  });
}
