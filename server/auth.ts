import session from "express-session";
import connectPg from "connect-pg-simple";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Express, RequestHandler } from "express";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// 해시로 길이를 맞춰야 timingSafeEqual 이 비밀번호 길이를 흘리지 않는다
const digest = (s: string) => createHash("sha256").update(s).digest();

export function setupAuth(app: Express) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    throw new Error("ADMIN_PASSWORD and SESSION_SECRET must be set");
  }

  const PgStore = connectPg(session);
  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: new PgStore({ pool, tableName: "sessions", createTableIfMissing: false }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: "auto",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  // ponytail: 로그인 시도 횟수 제한 없음. 비밀번호를 길게 유지하고, 필요해지면 Vercel Firewall 에 /api/login 속도 제한을 건다
  app.post("/api/login", (req, res) => {
    const password = req.body?.password;
    const ok =
      typeof password === "string" &&
      timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD!));
    if (!ok) {
      return res.status(401).json({ message: "비밀번호가 올바르지 않습니다" });
    }
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: "로그인에 실패했습니다" });
      req.session.isAdmin = true;
      res.json({ id: "admin" });
    });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session.isAdmin) return next();
  res.status(401).json({ message: "Unauthorized" });
};
