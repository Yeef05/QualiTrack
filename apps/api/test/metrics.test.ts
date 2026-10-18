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

  it('incluye el catálogo de métricas del Entregable 1', async () => {
    const res = await request(ctx.app).get('/api/metrics').set(bearer(ctx.tokens.miembro));
    expect(res.body.map((m: { code: string }) => m.code)).toEqual([
      'funciones_terminadas',
      'defectos_criticos',
      'defectos_abiertos',
      'cobertura',
      'complejidad',
    ]);
  });

  it('el equipo puede agregar y ajustar sus propias métricas', async () => {
    const created = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.qa))
      .send({ code: 'tiempo_respuesta', name: 'Tiempo de respuesta', unit: 'ms', target: 300, direction: 'menor' });
    expect(created.status).toBe(201);
    const updated = await request(ctx.app)
      .put(`/api/metrics/${created.body.id}`)
      .set(bearer(ctx.tokens.qa))
      .send({ name: 'Tiempo de respuesta p95', unit: 'ms', target: 250, direction: 'menor' });
    expect(updated.body).toMatchObject({ target: 250, code: 'tiempo_respuesta' });
    expect((await request(ctx.app).put('/api/metrics/9999').set(bearer(ctx.tokens.qa)).send(updated.body)).status).toBe(404);
  });

  it('valida el código de la métrica y el permiso', async () => {
    const bad = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.qa))
      .send({ code: 'Con Espacios', name: 'X', target: 1, direction: 'mayor' });
    expect(bad.status).toBe(400);
    const forbidden = await request(ctx.app)
      .post('/api/metrics')
      .set(bearer(ctx.tokens.miembro))
      .send({ code: 'otra', name: 'Otra', target: 1, direction: 'mayor' });
    expect(forbidden.status).toBe(403);
  });

  it('registra mediciones y calcula su semáforo', async () => {
    const cobertura = await metricId(ctx, 'cobertura');
    const first = await request(ctx.app)
      .post(`/api/projects/${projectId}/measurements`)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: cobertura, value: 50, measuredOn: isoDaysAgo(7) });
    expect(first.status).toBe(201);
    expect(first.body.status).toBe('rojo');
    const second = await request(ctx.app)
      .post(`/api/projects/${projectId}/measurements`)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: cobertura, value: 72, measuredOn: todayIso(), note: 'Después de agregar pruebas' });
    expect(second.body.status).toBe('verde');

    const history = await request(ctx.app)
      .get(`/api/projects/${projectId}/measurements?metricId=${cobertura}`)
      .set(bearer(ctx.tokens.miembro));
    expect(history.body.map((m: { value: number }) => m.value)).toEqual([50, 72]);
    expect(history.body[0].measuredOn).toBe(isoDaysAgo(7));
  });

  it('el semáforo usa la última medición de cada métrica', async () => {
    const res = await request(ctx.app).get(`/api/projects/${projectId}/metrics-status`).set(bearer(ctx.tokens.miembro));
    const cobertura = res.body.find((s: { metric: { code: string } }) => s.metric.code === 'cobertura');
    expect(cobertura).toMatchObject({ status: 'verde', latest: { value: 72, measuredOn: todayIso() } });
    const sinDatos = res.body.find((s: { metric: { code: string } }) => s.metric.code === 'complejidad');
    expect(sinDatos).toMatchObject({ status: null, latest: null });
  });

  it('rechaza fechas futuras, métricas inexistentes y valores no numéricos', async () => {
    const cobertura = await metricId(ctx, 'cobertura');
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
      .send({ metricId: await metricId(ctx, 'cobertura'), value: 1, measuredOn: todayIso() });
    expect(res.status).toBe(409);
    expect((await request(ctx.app).get('/api/projects/9999/metrics-status').set(bearer(ctx.tokens.qa))).status).toBe(404);
  });
});
