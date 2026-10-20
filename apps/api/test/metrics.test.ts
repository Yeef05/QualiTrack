import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isoDaysAgo, todayIso } from '../src/validation';
import { bearer, createProject, createTestContext, metricId, type TestContext } from './helpers';

describe('M2. Métricas de calidad', () => {
  let ctx: TestContext;
  let projectId: number;
  beforeAll(async () => {
    ctx = await createTestContext();
    projectId = (await createProject(ctx)).id;
  });
  afterAll(() => ctx.close());

  it('incluye el modelo de métricas para proyectos chicos (ADR-004)', async () => {
    const res = await request(ctx.app).get('/api/metrics').set(bearer(ctx.tokens.miembro));
    const byState = (active: boolean) =>
      res.body.filter((m: { active: boolean }) => m.active === active).map((m: { code: string }) => m.code);
    expect(byState(true)).toEqual([
      'funciones_terminadas',
      'criterios_aceptacion',
      'densidad_defectos',
      'defectos_criticos',
      'eficiencia_qa',
      'tiempo_correccion',
    ]);
    expect(byState(false)).toEqual(['cobertura', 'funcionalidades_con_prueba', 'tareas_sin_ayuda']);
    // Cada métrica dice de qué criterio de ISO/IEC 25010 sale y por qué tiene esos valores peor y mejor.
    for (const m of res.body) {
      expect(m.criterion).not.toBe('');
      expect(m.source).not.toBe('');
    }
    expect(res.body[0]).toMatchObject({ worst: 70, best: 100, direction: 'mayor' });
  });

  it('el equipo puede agregar y ajustar sus propias métricas', async () => {
    const created = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.qa))
      .send({ code: 'tiempo_respuesta', name: 'Tiempo de respuesta', unit: 'ms', worst: 500, best: 300, direction: 'menor' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ active: true, criterion: '' });
    const updated = await request(ctx.app)
      .put(`/api/metrics/${created.body.id}`)
      .set(bearer(ctx.tokens.qa))
      .send({ name: 'Tiempo de respuesta p95', unit: 'ms', worst: 400, best: 250, direction: 'menor', active: false });
    expect(updated.body).toMatchObject({ worst: 400, best: 250, active: false, code: 'tiempo_respuesta' });
    expect((await request(ctx.app).put('/api/metrics/9999').set(bearer(ctx.tokens.qa)).send(updated.body)).status).toBe(404);
  });

  it('valida el código de la métrica y el permiso', async () => {
    const bad = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.qa))
      .send({ code: 'Con Espacios', name: 'X', worst: 1, best: 1, direction: 'mayor' });
    expect(bad.status).toBe(400);
    const backwards = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.qa))
      .send({ code: 'al_reves', name: 'Al revés', worst: 90, best: 70, direction: 'mayor' });
    expect(backwards.status).toBe(400);
    expect(JSON.stringify(backwards.body)).toContain('peor');
    const forbidden = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.miembro))
      .send({ code: 'otra', name: 'Otra', worst: 1, best: 1, direction: 'mayor' });
    expect(forbidden.status).toBe(403);
  });

  it('registra mediciones y calcula su semáforo con peor y mejor', async () => {
    const capacidad = await metricId(ctx, 'funciones_terminadas');
    const add = (value: number, measuredOn: string) =>
      request(ctx.app)
        .post(`/api/projects/${projectId}/measurements`)
        .set(bearer(ctx.tokens.miembro))
        .send({ metricId: capacidad, value, measuredOn, note: 'Revisión del sprint' });
    const first = await add(50, isoDaysAgo(14));
    expect(first.status).toBe(201);
    expect(first.body.status).toBe('rojo');
    expect((await add(80, isoDaysAgo(7))).body.status).toBe('amarillo');
    expect((await add(100, todayIso())).body.status).toBe('verde');

    const history = await request(ctx.app)
      .get(`/api/projects/${projectId}/measurements?metricId=${capacidad}`)
      .set(bearer(ctx.tokens.miembro));
    expect(history.body.map((m: { value: number }) => m.value)).toEqual([50, 80, 100]);
    expect(history.body[0].measuredOn).toBe(isoDaysAgo(14));
  });

  it('no registra mediciones de métricas inactivas', async () => {
    const res = await request(ctx.app)
      .post(`/api/projects/${projectId}/measurements`)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: await metricId(ctx, 'cobertura'), value: 80, measuredOn: todayIso() });
    expect(res.status).toBe(409);
  });

  it('el semáforo usa la última medición de cada métrica', async () => {
    const res = await request(ctx.app).get(`/api/projects/${projectId}/metrics-status`).set(bearer(ctx.tokens.miembro));
    const capacidad = res.body.find((s: { metric: { code: string } }) => s.metric.code === 'funciones_terminadas');
    expect(capacidad).toMatchObject({ status: 'verde', latest: { value: 100, measuredOn: todayIso() } });
    const sinDatos = res.body.find((s: { metric: { code: string } }) => s.metric.code === 'tiempo_correccion');
    expect(sinDatos).toMatchObject({ status: null, latest: null });
    // Las inactivas no aparecen en el semáforo.
    expect(res.body.some((s: { metric: { code: string } }) => s.metric.code === 'cobertura')).toBe(false);
  });

  it('rechaza fechas futuras, métricas inexistentes y valores no numéricos', async () => {
    const cobertura = await metricId(ctx, 'criterios_aceptacion');
    const url = `/api/projects/${projectId}/measurements`;
    const future = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: cobertura, value: 1, measuredOn: '2999-01-01' });
    expect(future.status).toBe(400);
    const unknown = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: 9999, value: 1, measuredOn: todayIso() });
    expect(unknown.status).toBe(404);
    const text = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: cobertura, value: 'diez', measuredOn: '2026-13-45' });
    expect(text.status).toBe(400);
  });

  it('no admite mediciones en proyectos archivados ni inexistentes', async () => {
    const archived = await createProject(ctx, { name: 'Archivado' });
    await request(ctx.app).post(`/api/projects/${archived.id}/archive`).set(bearer(ctx.tokens.qa)).send({ archived: true });
    const res = await request(ctx.app)
      .post(`/api/projects/${archived.id}/measurements`)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: await metricId(ctx, 'funciones_terminadas'), value: 1, measuredOn: todayIso() });
    expect(res.status).toBe(409);
    expect((await request(ctx.app).get('/api/projects/9999/metrics-status').set(bearer(ctx.tokens.qa))).status).toBe(404);
  });
});
