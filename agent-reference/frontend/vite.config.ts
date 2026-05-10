/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
  server: {
    port: 3770,
    // E2E proxy: forwards /api requests to the mock server so the browser
    // and API share the same origin, avoiding cross-origin cookie issues.
    // Only active during `vite dev`; has no effect on production builds.
    // Used by E2E tests via `--mode e2e` (see .env.e2e and playwright.config.ts).
    proxy: {
      '/api': {
        target: 'http://localhost:8770',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3770,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-tests.ts',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      include: ['src/**'],
    },
  },
  optimizeDeps: { exclude: ['fsevents'] },
  build: {
    rollupOptions: {
      external: ['fs/promises'],
      output: {
        experimentalMinChunkSize: 3500,
      },
    },
  },
});
