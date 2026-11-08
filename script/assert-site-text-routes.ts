// Run: node --import tsx script/assert-site-text-routes.ts
import assert from "node:assert/strict";
import type { Express, RequestHandler } from "express";
import { registerSiteTextRoutes } from "../server/site-text-routes";
import type { SiteText } from "../shared/schema";

const routes = new Map<string, RequestHandler[]>();
const app = Object.fromEntries(["get", "put", "delete"].map(method => [method, (path: string, ...handlers: RequestHandler[]) => routes.set(`${method} ${path}`, handlers)])) as unknown as Express;
const records = new Map<string, SiteText>();
let unavailable = false;
registerSiteTextRoutes(app, {
  async getSiteTexts() { if (unavailable) throw new Error("offline"); return [...records.values()]; },
  async upsertSiteText(data) { const row = { ...data, updatedAt: new Date() }; records.set(data.key, row); return row; },
  async deleteSiteText(key) { records.delete(key); },
  async applySiteTextChanges(changes) {
    if (unavailable) throw new Error("offline");
    for (const {key,value} of changes) {
      if (value===null) records.delete(key);
      else records.set(key,{key,value,updatedAt:new Date()});
    }
  },
}, (req, res, next) => { if (req.headers["test-admin"] !== "yes") res.status(401).end(); else next(); });

async function call(method: string, key?: string, body?: unknown, admin = false) {
  const handlers = routes.get(`${method} /api/site-texts${key === undefined ? "" : "/:key"}`)!;
  let status = 200, result: unknown, ended = false;
  const res = { status(value: number) { status=value; return this; }, json(value: unknown) { result=value; ended=true; return this; }, end() { ended=true; return this; } };
  for (const handler of handlers) {
    let next = false;
    await handler({ params:{key}, body, headers:{"test-admin":admin?"yes":"no"} } as never, res as never, (()=>{next=true;}) as never);
    if (ended || !next) break;
  }
  return {status,result};
}
assert.deepEqual(await call("get"), {status:200,result:[]});
assert.equal((await call("put","home.hero.title",{value:"변경"})).status,401);
assert.equal((await call("delete","home.hero.title")).status,401);
for (const value of ["", " \n ", "a".repeat(2001), null, 42]) assert.equal((await call("put","home.hero.title",{value},true)).status,400);
assert.equal((await call("put","unknown.key",{value:"변경"},true)).status,400);
assert.equal((await call("delete","unknown.key",undefined,true)).status,400);
assert.equal((await call("put","home.hero.title",{value:"  새 제목\n**강조**  "},true)).status,200);
assert.equal(records.get("home.hero.title")?.value,"새 제목\n**강조**");
assert.equal((await call("get")).status,200);
assert.equal((await call("delete","home.hero.title",undefined,true)).status,204);
assert.deepEqual(await call("get"),{status:200,result:[]});
assert.equal((await call("put",undefined,{changes:[{key:"home.hero.title",value:"새 제목"}]})).status,401);
const changes = [{key:"home.hero.title",value:" 새 제목 "},{key:"home.hero.lead",value:"새 설명"}];
assert.equal((await call("put",undefined,{changes},true)).status,200);
assert.equal(records.get("home.hero.title")?.value,"새 제목");
for (const change of [{key:"unknown",value:"틀림"},{key:"home.hero.lead",value:" "},{key:"home.hero.lead",value:"a".repeat(2001)},{key:"home.hero.lead",value:42}]) {
  assert.equal((await call("put",undefined,{changes:[{key:"home.hero.title",value:"저장되면 안 됨"},change]},true)).status,400);
  assert.equal(records.get("home.hero.title")?.value,"새 제목");
}
assert.equal((await call("put",undefined,{changes:Array(301).fill(changes[0])},true)).status,400);
assert.equal((await call("put",undefined,{changes:[{key:"home.hero.title",value:null},{key:"home.hero.lead",value:"바뀐 설명"}]},true)).status,200);
assert.equal(records.has("home.hero.title"),false);
assert.equal(records.get("home.hero.lead")?.value,"바뀐 설명");
unavailable=true;
assert.equal((await call("put",undefined,{changes:[{key:"home.hero.lead",value:"실패"}]},true)).status,500);
assert.equal(records.get("home.hero.lead")?.value,"바뀐 설명");
console.log("PASS: batch auth, full validation before writes, max 300, mixed changes/resets, failed retry retains records");
unavailable=true;assert.equal((await call("get")).status,500);
console.log("PASS: public GET, authenticated writes/deletes, allowed keys, trim/length validation, restore, storage failure; no DB or network");
