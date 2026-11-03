// Vercel 함수 진입점. 정적 파일은 Vercel CDN 이 내주고, /api 와 /sitemap.xml 만 여기로 온다
import type { IncomingMessage, ServerResponse } from "node:http";
import { app, setupApp } from "./app";

const ready = setupApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  app(req as any, res as any);
}
