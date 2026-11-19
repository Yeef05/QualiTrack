// Capturas del manual de usuario (docs/06-manual). No es una prueba: CAPTURAS=1 npx playwright test capturas
import { expect, test, type Page } from '@playwright/test';
import { login, openTab } from './helpers';

const DIR = 'docs/06-manual/img';
test.use({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });

const shot = (page: Page, name: string, fullPage = false) => page.screenshot({ path: `${DIR}/${name}.png`, fullPage });

async function openDemoProject(page: Page) {
  // El logo del encabezado también es un enlace "QualiTrack": se toma el de la tabla.
  await page.getByRole('table').getByRole('link', { name: 'QualiTrack', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('QualiTrack ·');
}

test('capturas del Líder de QA', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  await shot(page, '01-inicio-sesion');

  await login(page);
  await expect(page.getByRole('row').nth(1)).toBeVisible();
  await shot(page, '02-dashboard');

  await page.getByRole('button', { name: '+ Nuevo proyecto' }).click();
  await shot(page, '03-nuevo-proyecto');
  await page.getByRole('button', { name: 'Cancelar' }).click();

  await openDemoProject(page);
  await expect(page.getByRole('heading', { name: 'Estado actual' })).toBeVisible();
  await page.waitForTimeout(800); // la gráfica de tendencia termina su animación
  await shot(page, '04-metricas');
  await page.getByRole('heading', { name: 'Registrar medición' }).scrollIntoViewIfNeeded();
  await shot(page, '05-registrar-medicion');
  await page.getByRole('heading', { name: /Modelo de calidad/ }).scrollIntoViewIfNeeded();
  await shot(page, '06-modelo-calidad');

  await openTab(page, 'Técnicas');
  await page.waitForTimeout(300);
  await shot(page, '07-tecnicas', true);

  await openTab(page, 'Defectos');
  await expect(page.getByRole('heading', { name: 'Registro de defectos' })).toBeVisible();
  await shot(page, '08-defectos');

  await openTab(page, 'Reporte');
  await expect(page.getByRole('img', { name: /Índice de salud/ })).toBeVisible();
  await shot(page, '09-reporte');

  await page.getByRole('button', { name: /Cambiar a modo oscuro/ }).click();
  await shot(page, '10-modo-oscuro');
  await page.getByRole('button', { name: /Cambiar a modo claro/ }).click();
});

test('captura de Usuarios (Administrador)', async ({ page }) => {
  await login(page, 'admin@qualitrack.local');
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
  await shot(page, '11-usuarios', true);
});

test('capturas del Miembro', async ({ page }) => {
  await login(page, 'miembro@qualitrack.local');
  await expect(page.getByRole('row').nth(1)).toBeVisible();
  await shot(page, '13-miembro-dashboard');
  await openDemoProject(page);
  await openTab(page, 'Técnicas');
  await expect(page.getByRole('heading', { name: 'Registrar ejecución' })).toBeVisible();
  await shot(page, '14-miembro-tecnicas', true);
});

test('capturas de edición y ejecución (Líder de QA)', async ({ page }) => {
  await login(page);
  await openDemoProject(page);
  await page.getByRole('button', { name: 'Editar' }).click();
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeVisible();
  await shot(page, '15-editar-proyecto');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await openTab(page, 'Técnicas');
  const card = page.locator('.card', { has: page.getByRole('heading', { name: 'Registrar ejecución' }) });
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `${DIR}/16-registrar-ejecucion.png` });
  await openTab(page, 'Defectos');
  const form = page.locator('.card', { has: page.getByRole('heading', { name: 'Registrar defecto' }) });
  await form.scrollIntoViewIfNeeded();
  await form.screenshot({ path: `${DIR}/17-registrar-defecto.png` });
});

test('captura en celular', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
  const page = await context.newPage();
  await login(page);
  await openDemoProject(page);
  await page.waitForTimeout(800);
  await shot(page, '12-celular');
  await context.close();
});
