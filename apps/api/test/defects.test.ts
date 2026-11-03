import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defectMetrics } from '../src/modules/defects/defectMetrics';
import { isoDaysAgo, todayIso } from '../src/validation';
import { bearer, createProject, createTestContext, type TestContext } from './helpers';

const defect = (overrides: Record<string, unknown> = {}) => ({
  description: 'El reporte no muestra el semáforo',
  severity: 'mayor',
  tspType: 80,
  foundBy: 'equipo',
  foundOn: isoDaysAgo(4),
  ...overrides,
});

describe('CU-11. Métricas del registro de defectos (RF-37, RF-38)', () => {
  it('calcula densidad, críticos abiertos, eficiencia de QA y tiempo medio de corrección', () => {
    const m = defectMetrics(
      [
        { severity: 'critica', foundBy: 'equipo', foundOn: '2026-10-01', closedOn: '2026-10-03' },
        { severity: 'critica', foundBy: 'cliente', foundOn: '2026-10-05', closedOn: null },
        { severity: 'menor', foundBy: 'equipo', foundOn: '2026-10-06', closedOn: '2026-10-07' },
        { severity: 'mayor', foundBy: 'usuario', foundOn: '2026-10-08', closedOn: null },
      ],
      8,
    );
    expect(m).toEqual({
      total: 4,
      open: 2,
      criticalOpen: 1,
      density: 0.5,
      qaEfficiency: 50,
      meanFixDays: 1.5,
      byFinder: { equipo: 2, cliente: 1, usuario: 1 },
    });
  });

  it('deja sin dato lo que no se puede calcular', () => {
    expect(defectMetrics([], 0)).toMatchObject({ density: null, qaEfficiency: null, meanFixDays: null, criticalOpen: 0 });
    const open = defectMetrics([{ severity: 'menor', foundBy: 'equipo', foundOn: '2026-10-01', closedOn: null }], 0);
    expect(open).toMatchObject({ density: null, qaEfficiency: 100, meanFixDays: null });
  });
});

describe('CU-11. Registrar un defecto del proyecto', () => {
  let ctx: TestContext;
  let projectId: number;
  beforeAll(async () => {
    ctx = await createTestContext();
    projectId = (await createProject(ctx, { name: 'Con defectos' })).id;
    await request(ctx.app)
      .put(`/api/projects/${projectId}`)
      .set(bearer(ctx.tokens.qa))
      .send({ name: 'Con defectos', period: '2026-2', deliveredStories: 4 });
  });
  afterAll(() => ctx.close());

  it('un integrante registra un defecto abierto y lo cierra al corregirlo', async () => {
    const created = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects`)
      .set(bearer(ctx.tokens.miembro))
      .send(defect());
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ severity: 'mayor', tspType: 80, closedOn: null });

    const closed = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects/${created.body.id}/close`)
      .set(bearer(ctx.tokens.miembro))
      .send({ closedOn: isoDaysAgo(1), fixNote: 'Se corrigió el componente' });
    expect(closed.status).toBe(200);
    expect(closed.body).toMatchObject({ closedOn: isoDaysAgo(1), fixNote: 'Se corrigió el componente' });

    const again = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects/${created.body.id}/close`)
      .set(bearer(ctx.tokens.miembro))
      .send({ closedOn: todayIso() });
    expect(again.status).toBe(409);
  });

  it('A4.1: rechaza un cierre anterior al registro, fechas futuras y datos inválidos', async () => {
    const { body } = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects`)
      .set(bearer(ctx.tokens.miembro))
      .send(defect({ severity: 'critica', foundOn: isoDaysAgo(2) }));
    const before = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects/${body.id}/close`)
      .set(bearer(ctx.tokens.miembro))
      .send({ closedOn: isoDaysAgo(3) });
    expect(before.status).toBe(400);
    expect(before.body.error).toBe('La fecha de cierre no puede ser anterior a la de registro');

    const future = '2999-01-01';
    const send = (data: Record<string, unknown>) =>
      request(ctx.app).post(`/api/projects/${projectId}/defects`).set(bearer(ctx.tokens.miembro)).send(defect(data));
    expect((await send({ foundOn: future })).status).toBe(400);
    expect((await send({ tspType: 15 })).status).toBe(400);
    expect((await send({ severity: 'grave' })).status).toBe(400);
    const closeFuture = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects/${body.id}/close`)
      .set(bearer(ctx.tokens.miembro))
      .send({ closedOn: future });
    expect(closeFuture.status).toBe(400);
    const missing = await request(ctx.app)
      .post(`/api/projects/${projectId}/defects/9999/close`)
      .set(bearer(ctx.tokens.miembro))
      .send({ closedOn: todayIso() });
    expect(missing.status).toBe(404);
  });

  it('el semáforo y el índice usan los valores del registro en lugar de capturarlos a mano', async () => {
    const list = await request(ctx.app).get(`/api/projects/${projectId}/defects`).set(bearer(ctx.tokens.miembro));
    expect(list.body.items).toHaveLength(2);
    // 2 defectos ÷ 4 historias; 1 crítico abierto; ambos los encontró el equipo; uno se cerró en 3 días.
    expect(list.body.summary).toMatchObject({ total: 2, criticalOpen: 1, density: 0.5, qaEfficiency: 100, meanFixDays: 3 });

    const status = await request(ctx.app).get(`/api/projects/${projectId}/metrics-status`).set(bearer(ctx.tokens.miembro));
    const byCode = (code: string) => status.body.find((s: { metric: { code: string } }) => s.metric.code === code);
    expect(byCode('defectos_criticos')).toMatchObject({ latest: { value: 1, fromDefects: true }, status: 'rojo' });
    expect(byCode('densidad_defectos')).toMatchObject({ latest: { value: 0.5 }, status: 'verde' });
    expect(byCode('tiempo_correccion')).toMatchObject({ latest: { value: 3 }, status: 'amarillo' });
    expect(byCode('funciones_terminadas').latest).toBeNull();

    const health = await request(ctx.app).get(`/api/projects/${projectId}/health`).set(bearer(ctx.tokens.miembro));
    expect(health.body).toMatchObject({ criticalOpen: 1 });
  });

  it('no admite defectos en un proyecto archivado', async () => {
    const { id } = await createProject(ctx, { name: 'Archivado con defectos' });
    await request(ctx.app).post(`/api/projects/${id}/archive`).set(bearer(ctx.tokens.qa)).send({ archived: true });
    const res = await request(ctx.app).post(`/api/projects/${id}/defects`).set(bearer(ctx.tokens.miembro)).send(defect());
    expect(res.status).toBe(409);
    expect((await request(ctx.app).get('/api/projects/9999/defects').set(bearer(ctx.tokens.miembro))).status).toBe(404);
  });
});
