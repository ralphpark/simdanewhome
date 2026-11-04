import { defineConfig, mergeConfig } from 'vite';
import base from '../../../../../vite.config';
// Verification never loads local secrets. This directory intentionally stays empty.
export default mergeConfig(base, defineConfig({ envDir: new URL('./empty-env', import.meta.url).pathname }));
