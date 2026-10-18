import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { createPgliteDb } from '../src/db';
import { migrate } from '../src/db/migrate';
import { computeHealth, levelFor } from '../src/modules/health/healthIndex';
import { evaluate } from '../src/modules/metrics/status';
import { isUpToDate, planCompliance } from '../src/modules/techniques/compliance';
import { daysBetween, isoDaysAgo, todayIso } from '../src/validation';

describe('semáforo de métricas (evaluate)', () => {
  it('mayor es mejor: verde si alcanza la meta', () => {
    expect(evaluate(70, 70, 'mayor')).toBe('verde');
    expect(evaluate(85, 70, 'mayor')).toBe('verde');
  });

  it('mayor es mejor: amarillo dentro del 10 % de tolerancia, rojo fuera', () => {
    expect(evaluate(63, 70, 'mayor')).toBe('amarillo');
    expect(evaluate(62.9, 70, 'mayor')).toBe('rojo');
  });

  it('menor es mejor: verde, amarillo y rojo', () => {
    expect(evaluate(10, 10, 'menor')).toBe('verde');
    expect(evaluate(11, 10, 'menor')).toBe('amarillo');
    expect(evaluate(12, 10, 'menor')).toBe('rojo');
  });

  it('meta en 0 usa tolerancia mínima de 1', () => {
    expect(evaluate(0, 0, 'menor')).toBe('verde');
    expect(evaluate(1, 0, 'menor')).toBe('amarillo');
    expect(evaluate(2, 0, 'menor')).toBe('rojo');
  });
});

describe('índice de salud (computeHealth)', () => {
  it('pondera métricas 50 %, plan 30 % y defectos 20 %', () => {
    const h = computeHealth({ statuses: ['verde', 'rojo'], planCompliance: 1, criticalOpen: 0 });
    // métricas 50, plan 100, defectos 100 -> 25 + 30 + 20 = 75
    expect(h.index).toBe(75);
    expect(h.level).toBe('amarillo');
    expect(h.metricsScore).toBe(50);
  });

  it('reparte el peso cuando falta un componente', () => {
    const h = computeHealth({ statuses: ['verde'], planCompliance: null, criticalOpen: null });
    expect(h.index).toBe(100);
    expect(h.planScore).toBeNull();
  });

  it('resta 25 puntos por defecto crítico sin bajar de 0', () => {
    expect(computeHealth({ statuses: [], planCompliance: null, criticalOpen: 2 }).index).toBe(50);
    expect(computeHealth({ statuses: [], planCompliance: null, criticalOpen: 9 }).index).toBe(0);
  });

  it('sin datos devuelve índice nulo', () => {
    expect(computeHealth({ statuses: [], planCompliance: null, criticalOpen: null })).toMatchObject({
      index: null,
      level: null,
    });
  });

  it('clasifica el nivel por umbrales 80 y 60', () => {
    expect(levelFor(80)).toBe('verde');
    expect(levelFor(79)).toBe('amarillo');
    expect(levelFor(60)).toBe('amarillo');
    expect(levelFor(59)).toBe('rojo');
  });
});

describe('cumplimiento del plan de SQA', () => {
  const today = '2026-10-18';

  it('una técnica está al día si se ejecutó dentro de su ventana', () => {
    expect(isUpToDate('2026-10-11', 'semanal', today)).toBe(true);
    expect(isUpToDate('2026-10-10', 'semanal', today)).toBe(false);
    expect(isUpToDate('2026-10-04', 'por_checkin', today)).toBe(true);
    expect(isUpToDate('2026-09-18', 'mensual', today)).toBe(true);
    expect(isUpToDate(null, 'por_pr', today)).toBe(false);
  });

  it('calcula la fracción de técnicas al día', () => {
    const items = [
      { frequency: 'semanal' as const, lastExecutedOn: '2026-10-17' },
      { frequency: 'semanal' as const, lastExecutedOn: null },
    ];
    expect(planCompliance(items, today)).toBe(0.5);
    expect(planCompliance([], today)).toBeNull();
  });
});

describe('utilidades', () => {
  it('fechas en formato AAAA-MM-DD', () => {
    const now = new Date('2026-10-18T12:00:00Z');
    expect(todayIso(now)).toBe('2026-10-18');
    expect(isoDaysAgo(7, now)).toBe('2026-10-11');
    expect(daysBetween('2026-10-11', '2026-10-18')).toBe(7);
  });

  it('DEF-002: crea la carpeta de datos de PGlite si no existe y aplica migraciones una sola vez', async () => {
    const dir = path.join(await mkdtemp(path.join(tmpdir(), 'qualitrack-db-')), 'anidada', 'datos');
    const db = await createPgliteDb(dir);
    expect(await migrate(db)).toEqual(['001_init.sql']);
    expect(await migrate(db)).toEqual([]);
    await db.close();
  });

  it('configuración por defecto y validación en producción', () => {
    expect(loadConfig({}).port).toBe(3001);
    expect(loadConfig({ SEED_DEMO: 'false', PORT: '8080' })).toMatchObject({ seedDemo: false, port: 8080 });
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
    expect(loadConfig({ NODE_ENV: 'production', JWT_SECRET: 'x' }).jwtSecret).toBe('x');
  });
});
