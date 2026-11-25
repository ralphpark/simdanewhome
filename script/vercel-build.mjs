// Vercel Build Output API(v3) 형식으로 내보낸다: 정적 파일 + Express 전체를 묶은 함수 하나
import { build } from "esbuild";
import { execSync } from "node:child_process";
import fs from "node:fs";

const out = ".vercel/output";
const fn = `${out}/functions/api.func`;
fs.rmSync(out, { recursive: true, force: true });

execSync("npx vite build", { stdio: "inherit" });
fs.cpSync("public", `${out}/static`, { recursive: true });
fs.cpSync("dist/public", `${out}/static`, { recursive: true });

await build({
  entryPoints: ["server/vercel.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  outfile: `${fn}/index.mjs`,
  external: ["pg-native"],
  // 묶인 CommonJS 패키지가 require 를 쓸 수 있게
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
});
fs.writeFileSync(
  `${fn}/.vc-config.json`,
  JSON.stringify({ runtime: "nodejs24.x", handler: "index.mjs", launcherType: "Nodejs", regions: ["icn1"] }),
);
fs.writeFileSync(
  `${out}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [
      { src: "^/(api/.*|sitemap\\.xml)$", dest: "/api" },
      { handle: "filesystem" },
      { src: "/.*", dest: "/index.html" },
    ],
  }),
);
