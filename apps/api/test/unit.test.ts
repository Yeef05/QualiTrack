import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { createPgliteDb } from '../src/db';
import { migrate } from '../src/db/migrate';
import { computeHealth, CRITICAL_CAP, levelFor } from '../src/modules/health/healthIndex';
import { coherent, evaluate } from '../src/modules/metrics/status';
import { isUpToDate, planCompliance } from '../src/modules/techniques/compliance';
import { daysBetween, isoDaysAgo, todayIso } from '../src/validation';

describe('semáforo de métricas con peor y mejor (evaluate)', () => {
  const capacidad = { worst: 70, best: 100, direction: 'mayor' as const };
  const densidad = { worst: 1, best: 0.5, direction: 'menor' as const };

  it('mayor es mejor: verde al llegar al mejor, amarillo entre peor y mejor, rojo bajo el peor', () => {
    expect(evaluate(100, capacidad)).toBe('verde');
    expect(evaluate(85, capacidad)).toBe('amarillo');
    expect(evaluate(70, capacidad)).toBe('amarillo');
    expect(evaluate(69.9, capacidad)).toBe('rojo');
  });

  it('menor es mejor: verde, amarillo y rojo', () => {
    expect(evaluate(0.3, densidad)).toBe('verde');
    expect(evaluate(0.5, densidad)).toBe('verde');
    expect(evaluate(0.8, densidad)).toBe('amarillo');
    expect(evaluate(1.2, densidad)).toBe('rojo');
  });

  it('si peor y mejor son iguales no hay amarillo (defectos críticos = 0)', () => {
    const criticos = { worst: 0, best: 0, direction: 'menor' as const };
    expect(evaluate(0, criticos)).toBe('verde');
    expect(evaluate(1, criticos)).toBe('rojo');
  });

  it('el valor peor no puede ser mejor que el mejor', () => {
    expect(coherent(capacidad)).toBe(true);
    expect(coherent({ worst: 100, best: 70, direction: 'mayor' })).toBe(false);
    expect(coherent(densidad)).toBe(true);
    expect(coherent({ worst: 0.5, best: 1, direction: 'menor' })).toBe(false);
  });
});

describe('índice de salud (computeHealth)', () => {
  it('promedia los indicadores: verde 100, amarillo 50, rojo 0, con el plan como un indicador más', () => {
    // métricas verde y rojo, plan al 100 % (verde) -> (100 + 0 + 100) / 3 = 67
    const h = computeHealth({ statuses: ['verde', 'rojo'], planCompliance: 1, criticalOpen: 0 });
    expect(h.index).toBe(67);
    expect(h.level).toBe('amarillo');
    expect(h.indicators).toEqual({ verde: 2, amarillo: 0, rojo: 1 });
    expect(h.planStatus).toBe('verde');
  });

  it('el plan es verde desde 90 %, amarillo desde 70 % y rojo abajo', () => {
    expect(computeHealth({ statuses: [], planCompliance: 0.9, criticalOpen: null }).planStatus).toBe('verde');
    expect(computeHealth({ statuses: [], planCompliance: 0.75, criticalOpen: null }).planStatus).toBe('amarillo');
    expect(computeHealth({ statuses: [], planCompliance: 0.5, criticalOpen: null }).planStatus).toBe('rojo');
  });

  it('QualiTrack al check-in 2: 6 métricas en verde y el plan al 75 % dan 93', () => {
    const h = computeHealth({ statuses: Array(6).fill('verde'), planCompliance: 0.75, criticalOpen: 0 });
    expect(h.index).toBe(93);
    expect(h.level).toBe('verde');
  });

  it('con defectos críticos abiertos el índice no pasa de 79', () => {
    const h = computeHealth({ statuses: [...Array(5).fill('verde'), 'rojo'], planCompliance: 1, criticalOpen: 1 });
    // (6 × 100 + 0) / 7 = 86, limitado a 79
    expect(h).toMatchObject({ index: CRITICAL_CAP, level: 'amarillo', cappedByCritical: true });
    expect(computeHealth({ statuses: ['rojo'], planCompliance: null, criticalOpen: 2 }).cappedByCritical).toBe(false);
  });

  it('sin datos devuelve índice nulo', () => {
    expect(computeHealth({ statuses: [], planCompliance: null, criticalOpen: null })).toMatchObject({
      index: null,
      level: null,
    });
  });

  it('clasifica el nivel por umbrales 80 y 50', () => {
    expect(levelFor(80)).toBe('verde');
    expect(levelFor(79)).toBe('amarillo');
    expect(levelFor(50)).toBe('amarillo');
    expect(levelFor(49)).toBe('rojo');
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

  it('DEF-003: "hoy" es el día de Zacatecas, no el de UTC', () => {
    // 19 oct a las 18:40 en México = 20 oct 00:40 UTC.
    const evening = new Date('2026-10-20T00:40:00Z');
    expect(todayIso(evening)).toBe('2026-10-19');
    expect(isoDaysAgo(1, evening)).toBe('2026-10-18');
    expect(todayIso(evening, 'UTC')).toBe('2026-10-20');
  });

  it('DEF-002: crea la carpeta de datos de PGlite si no existe y aplica migraciones una sola vez', async () => {
    const dir = path.join(await mkdtemp(path.join(tmpdir(), 'qualitrack-db-')), 'anidada', 'datos');
    const db = await createPgliteDb(dir);
    expect(await migrate(db)).toEqual(['001_init.sql', '002_modelo_definido.sql']);
    expect(await migrate(db)).toEqual([]);
    await db.close();
  });

  it('ADR-004: una base del check-in 1 se actualiza al modelo peor/mejor sin perder mediciones', async () => {
    const db = await createPgliteDb();
    // Base como quedó antes de este cambio: solo 001 aplicada y el catálogo anterior con una medición.
    const init = await readFile(new URL('../src/db/migrations/001_init.sql', import.meta.url), 'utf8');
    await db.exec(init);
    await db.exec(
      `CREATE TABLE schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
       INSERT INTO schema_migrations (name) VALUES ('001_init.sql');
       INSERT INTO metrics (code, name, unit, target, direction) VALUES
         ('funciones_terminadas', '% de funciones terminadas', '%', 100, 'mayor'),
         ('cobertura', 'Cobertura de pruebas', '%', 70, 'mayor'),
         ('complejidad', 'Complejidad ciclomática máxima', 'por función', 10, 'menor'),
         ('mi_metrica', 'Métrica de un equipo', 'ms', 300, 'menor');
       INSERT INTO projects (name, period) VALUES ('Viejo', '2026-2');
       INSERT INTO measurements (project_id, metric_id, value, measured_on) VALUES (1, 3, 12, '2026-10-01');`,
    );
    expect(await migrate(db)).toEqual(['002_modelo_definido.sql']);
    const { rows } = await db.query<{ code: string; worst: number; best: number; active: boolean }>(
      'SELECT code, worst, best, active FROM metrics ORDER BY id',
    );
    expect(rows).toEqual([
      { code: 'funciones_terminadas', worst: 70, best: 100, active: true },
      { code: 'cobertura', worst: 50, best: 70, active: false },
      { code: 'complejidad', worst: 10, best: 10, active: false },
      { code: 'mi_metrica', worst: 300, best: 300, active: true },
    ]);
    const kept = await db.query<{ n: number }>('SELECT COUNT(*)::int AS n FROM measurements');
    expect(kept.rows[0].n).toBe(1);
    await db.close();
  });

  it('configuración por defecto y validación en producción', () => {
    expect(loadConfig({}).port).toBe(3001);
    expect(loadConfig({ SEED_DEMO: 'false', PORT: '8080' })).toMatchObject({ seedDemo: false, port: 8080 });
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
    expect(loadConfig({ NODE_ENV: 'production', JWT_SECRET: 'x' }).jwtSecret).toBe('x');
  });
});
