import { expect, type Page } from '@playwright/test';

// Usuarios de ejemplo que crea la base local (README, "Cómo correrlo"). Solo existen en desarrollo y en estas pruebas.
export const PASSWORD = 'qualitrack2026';
export const QA_LEAD = { email: 'qa@qualitrack.local', name: 'Flavio Huizar' };

export async function login(page: Page, email = QA_LEAD.email) {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
}

/** CU-01 desde el dashboard. Deja la página en el detalle del proyecto nuevo. */
export async function createProject(page: Page, name: string, deliveredStories = 4) {
  await page.getByRole('button', { name: '+ Nuevo proyecto' }).click();
  await page.getByLabel('Nombre del proyecto').fill(name);
  await page.getByLabel('Equipo').fill('Equipo E2E');
  await page.getByLabel('Responsable de QA').selectOption({ label: QA_LEAD.name });
  await page.getByLabel('Historias entregadas').fill(String(deliveredStories));
  await page.getByRole('button', { name: 'Registrar proyecto' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
}

export async function openTab(page: Page, name: 'Métricas' | 'Técnicas' | 'Defectos' | 'Reporte') {
  await page.getByRole('tab', { name }).click();
}

/** Índice de salud que muestra la dona del reporte (null si dice "sin datos"). */
export async function healthIndex(page: Page): Promise<number | null> {
  const donut = page.getByRole('img', { name: /Índice de salud/ });
  await expect(donut).toBeVisible();
  const label = (await donut.getAttribute('aria-label')) ?? '';
  const match = label.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}
