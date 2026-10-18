import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Las páginas completas se cubren con pruebas E2E (Playwright) en la versión Beta.
      include: ['src/lib/**', 'src/api/**', 'src/components/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
    },
  },
});
