import { defineConfig, mergeConfig } from "vite";
import base from "../../../../../vite.config";
import { resolve } from "node:path";

// A frontend-only build. Never uses the project's environment files or API server.
export default defineConfig(mergeConfig(base, {
  envDir: new URL("./empty-env", import.meta.url).pathname,
  build: {
    outDir: resolve("docs/redesign/verification/subpages-v2/dist"),
    emptyOutDir: true,
    rollupOptions: { input: { main: resolve("client/index.html"), common: resolve("client/src/pages/site/verification/common-preview.html") } },
  },
}));
