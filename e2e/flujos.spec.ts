// Los 3 flujos E2E de la hoja 23 ("Humo y E2E") y de RevisionesBeta.md.
import { expect, test } from '@playwright/test';
import { createProject, healthIndex, login, openTab, QA_LEAD } from './helpers';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('F1 · CU-01: el Líder de QA registra un proyecto y aparece en el dashboard con "Sin datos"', async ({ page }) => {
  await createProject(page, 'Proyecto E2E F1');
  await expect(page.getByText(`QA: ${QA_LEAD.name}`)).toBeVisible();

  await page.getByRole('link', { name: '← Proyectos' }).click();
  const row = page.getByRole('row', { name: /Proyecto E2E F1/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText(QA_LEAD.name);
  await expect(row).toContainText('Sin datos');
});

test('F2 · CU-04 y CU-08: una medición por métrica activa da semáforo a todas y el reporte se guarda', async ({
  page,
}) => {
  await createProject(page, 'Proyecto E2E F2');

  const form = page.locator('.card', { has: page.getByRole('heading', { name: 'Registrar medición' }) });
  const metricSelect = form.getByRole('combobox', { name: 'Métrica', exact: true });
  // Las métricas llegan de la API después de abrir el proyecto.
  await expect(metricSelect.locator('option').first()).toBeAttached();
  const metrics = await metricSelect.locator('option').allTextContents();
  expect(metrics.length).toBeGreaterThan(0);
  for (const metric of metrics) {
    await metricSelect.selectOption({ label: metric });
    await form.getByLabel('Valor', { exact: true }).fill('90');
    await form.getByRole('button', { name: '+ Registrar medición' }).click();
    await expect(form.getByText('Medición registrada.')).toBeVisible();
  }

  // Ninguna métrica activa se queda sin semáforo.
  const estado = page.locator('.card', { has: page.getByRole('heading', { name: 'Estado actual' }) });
  await expect(estado.getByRole('row')).toHaveCount(metrics.length + 1);
  await expect(estado.getByText('Sin datos')).toHaveCount(0);

  await openTab(page, 'Reporte');
  const index = await healthIndex(page);
  expect(index).not.toBeNull();

  await page.getByRole('button', { name: 'Guardar en historial' }).click();
  const historial = page.locator('.card', { has: page.getByRole('heading', { name: 'Historial de reportes' }) });
  await expect(historial.getByRole('row')).toHaveCount(2);
  await expect(historial).toContainText(String(index));
});

test('F3 · CU-11: un defecto crítico abierto limita el índice a 79 y al cerrarlo el índice se recupera', async ({
  page,
}) => {
  await createProject(page, 'Proyecto E2E F3');

  await openTab(page, 'Defectos');
  await page.getByLabel('Descripción').fill('E2E: el reporte no abre con un proyecto archivado');
  await page.getByLabel('Gravedad').selectOption({ label: 'Crítica' });
  await page.getByRole('button', { name: '+ Registrar defecto' }).click();
  const defectRow = page.getByRole('row', { name: /E2E: el reporte no abre/ });
  await expect(defectRow).toBeVisible();

  await openTab(page, 'Reporte');
  await expect(page.getByText('No · 1 abierto')).toBeVisible();
  const withCritical = await healthIndex(page);
  expect(withCritical).not.toBeNull();
  expect(withCritical!).toBeLessThanOrEqual(79);

  await openTab(page, 'Defectos');
  await defectRow.getByRole('button', { name: 'Cerrar' }).click();
  await expect(defectRow).toContainText('Cerrado');

  await openTab(page, 'Reporte');
  await expect(page.getByText('Sí · 0 abiertos')).toBeVisible();
  const afterClose = await healthIndex(page);
  expect(afterClose!).toBeGreaterThan(withCritical!);
});
