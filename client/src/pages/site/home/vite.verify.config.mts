import { defineConfig, mergeConfig } from "vite";
import base from "../../../../../vite.config";

// Verification does not load environment files or run the API server.
export default defineConfig(mergeConfig(base, { envDir: new URL("./verification-empty", import.meta.url).pathname, build: { outDir: "/tmp/team-a-dist", emptyOutDir: true } }));
