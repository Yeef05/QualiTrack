import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { todayIso } from '../src/validation';
import { bearer, createProject, createTestContext, metricId, type TestContext } from './helpers';

interface ModelRow {
  code: string;
  worst: number;
  best: number;
  active: boolean;
  customized: boolean;
}

describe('CU-03. Modelo de calidad por proyecto (RF-10 a RF-14)', () => {
  let ctx: TestContext;
  let a: number;
  let b: number;
  let funciones: number;
  let cobertura: number;
  const model = async (projectId: number) =>
    (await request(ctx.app).get(`/api/projects/${projectId}/model`).set(bearer(ctx.tokens.miembro))).body as ModelRow[];
  const byCode = (rows: ModelRow[], code: string) => rows.find((m) => m.code === code);
  const setModel = (projectId: number, id: number, body: Record<string, unknown>, token = ctx.tokens.qa) =>
    request(ctx.app).put(`/api/projects/${projectId}/model/${id}`).set(bearer(token)).send(body);

  beforeAll(async () => {
    ctx = await createTestContext();
    a = (await createProject(ctx, { name: 'Modelo A' })).id;
    b = (await createProject(ctx, { name: 'Modelo B' })).id;
    funciones = await metricId(ctx, 'funciones_terminadas');
    cobertura = await metricId(ctx, 'cobertura');
  });
  afterAll(() => ctx.close());

  it('sin ajustes, el proyecto usa el catálogo completo, incluidas las opcionales inactivas', async () => {
    const rows = await model(a);
    expect(rows).toHaveLength(9);
    expect(byCode(rows, 'funciones_terminadas')).toMatchObject({ worst: 70, best: 100, active: true, customized: false });
    expect(byCode(rows, 'cobertura')).toMatchObject({ active: false, customized: false });
  });

  it('el Líder de QA ajusta peor y mejor y activa una opcional solo para su proyecto', async () => {
    expect((await setModel(a, funciones, { worst: 80, best: 95, active: true })).status).toBe(200);
    expect((await setModel(a, cobertura, { worst: 60, best: 80, active: true })).body).toMatchObject({
      code: 'cobertura',
      active: true,
      customized: true,
    });
    expect(byCode(await model(a), 'funciones_terminadas')).toMatchObject({ worst: 80, best: 95, customized: true });
    // El otro proyecto conserva el catálogo.
    expect(byCode(await model(b), 'funciones_terminadas')).toMatchObject({ worst: 70, best: 100, customized: false });
    expect(byCode(await model(b), 'cobertura')).toMatchObject({ active: false });

    // El semáforo usa el modelo del proyecto: 96 % es verde en A (mejor 95) y amarillo en B (mejor 100).
    for (const projectId of [a, b]) {
      await request(ctx.app)
        .post(`/api/projects/${projectId}/measurements`)
        .set(bearer(ctx.tokens.miembro))
        .send({ metricId: funciones, value: 96, measuredOn: todayIso() });
    }
    const statusOf = async (projectId: number) => {
      const res = await request(ctx.app).get(`/api/projects/${projectId}/metrics-status`).set(bearer(ctx.tokens.miembro));
      return res.body.find((s: { metric: { code: string } }) => s.metric.code === 'funciones_terminadas').status;
    };
    expect(await statusOf(a)).toBe('verde');
    expect(await statusOf(b)).toBe('amarillo');
  });

  it('A3.2: una métrica desactivada en el proyecto conserva sus mediciones, pero deja de pedirse y contarse', async () => {
    await setModel(a, funciones, { worst: 80, best: 95, active: false });
    const status = await request(ctx.app).get(`/api/projects/${a}/metrics-status`).set(bearer(ctx.tokens.miembro));
    expect(status.body.map((s: { metric: { code: string } }) => s.metric.code)).not.toContain('funciones_terminadas');
    const blocked = await request(ctx.app)
      .post(`/api/projects/${a}/measurements`)
      .set(bearer(ctx.tokens.miembro))
      .send({ metricId: funciones, value: 90, measuredOn: todayIso() });
    expect(blocked.status).toBe(409);
    const history = await request(ctx.app)
      .get(`/api/projects/${a}/measurements?metricId=${funciones}`)
      .set(bearer(ctx.tokens.miembro));
    expect(history.body).toHaveLength(1);
  });

  it('A4.1 y permisos: rechaza peor y mejor al revés, y solo Administrador o Líder de QA cambian el modelo', async () => {
    const backwards = await setModel(a, funciones, { worst: 100, best: 70, active: true });
    expect(backwards.status).toBe(400);
    expect(backwards.body.error).toBe('El valor peor no puede ser mejor que el valor mejor');
    expect((await setModel(a, funciones, { worst: 70, best: 100, active: true }, ctx.tokens.miembro)).status).toBe(403);
    expect((await setModel(a, 9999, { worst: 1, best: 1, active: true })).status).toBe(404);
    expect((await setModel(9999, funciones, { worst: 1, best: 1, active: true })).status).toBe(404);
  });

  it('restaurar una métrica la regresa a los valores del catálogo', async () => {
    const res = await request(ctx.app).delete(`/api/projects/${a}/model/${funciones}`).set(bearer(ctx.tokens.qa));
    expect(res.status).toBe(204);
    expect(byCode(await model(a), 'funciones_terminadas')).toMatchObject({ worst: 70, best: 100, active: true, customized: false });
  });
});
