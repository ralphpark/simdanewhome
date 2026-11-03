import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// 풀러가 놀고 있는 연결을 끊으면 pool 이 error 를 내는데, 듣는 쪽이 없으면 프로세스가 죽는다
pool.on("error", (err) => console.error("[db] idle client error:", err.message));
export const db = drizzle(pool, { schema });
