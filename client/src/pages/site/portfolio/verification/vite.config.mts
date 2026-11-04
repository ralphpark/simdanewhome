import { defineConfig } from "vite";
import base from "../../../../../../vite.config";
import path from "node:path";
// Verification must never load the workspace's environment files.
export default defineConfig({ ...base, envDir: path.resolve(import.meta.dirname, "empty-env"), build: { ...base.build, outDir: "/tmp/team-b-dist", emptyOutDir: true } });
