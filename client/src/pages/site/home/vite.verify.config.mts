import { defineConfig, mergeConfig } from "vite";
import base from "../../../../../vite.config";

// Frontend-only: this directory is empty and never loads the repository environment.
export default defineConfig(mergeConfig(base, {
  envDir: new URL("./verification-empty", import.meta.url).pathname,
  build: { outDir: "/tmp/simda-home-v2-dist", emptyOutDir: true },
}));
