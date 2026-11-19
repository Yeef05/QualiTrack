// Pruebas E2E de QualiTrack (tarea 7 del plan del ciclo 4): 3 flujos completos en un navegador real.
// Corren contra el servidor de producción local (API + frontend compilado) con una base PGlite nueva.
import { rmSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const PORT = 4310;
const DATA_DIR = '.data/e2e';

// Solo el proceso principal borra la base; los workers también cargan este archivo.
if (!process.env.TEST_WORKER_INDEX) {
  rmSync(`apps/api/${DATA_DIR}`, { recursive: true, force: true });
}

export default defineConfig({
  testDir: 'e2e',
  // Las capturas del manual solo se toman a propósito: CAPTURAS=1 npx playwright test capturas
  testIgnore: process.env.CAPTURAS ? [] : ['**/capturas.spec.ts'],
  // Los flujos comparten la base: uno a la vez, en orden.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/reporte' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Usa el Chrome instalado (también existe en los runners de GitHub): no hay que descargar navegadores.
    channel: 'chrome',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm start',
    url: `http://localhost:${PORT}/api/health`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      NODE_ENV: 'production',
      PORT: String(PORT),
      JWT_SECRET: 'e2e-solo-local',
      DATA_DIR,
    },
  },
});
