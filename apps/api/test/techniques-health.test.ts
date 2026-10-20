import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isoDaysAgo, todayIso } from '../src/validation';
import { bearer, createProject, createTestContext, metricId, type TestContext } from './helpers';

async function techniqueId(ctx: TestContext, name: string): Promise<number> {
  const { rows } = await ctx.db.query<{ id: number }>('SELECT id FROM techniques WHERE name = $1', [name]);
  return rows[0].id;
}

describe('M3. Técnicas de SQA', () => {
  let ctx: TestContext;
  let projectId: number;
  let planId: number;
  beforeAll(async () => {
    ctx = await createTestContext();
    projectId = (await createProject(ctx)).id;
  });
  afterAll(() => ctx.close());

  it('incluye el catálogo de técnicas y permite agregar nuevas', async () => {
    const list = await request(ctx.app).get('/api/techniques').set(bearer(ctx.tokens.miembro));
    expect(list.body.length).toBeGreaterThanOrEqual(8);
    const created = await request(ctx.app)
      .post('/api/techniques')
      .set(bearer(ctx.tokens.qa))
      .send({ name: 'Pruebas de carga', kind: 'dinamica' });
    expect(created.status).toBe(201);
  });

  it('agrega técnicas al plan del proyecto sin duplicarlas', async () => {
    const body = { techniqueId: await techniqueId(ctx, 'Revisión de código'), frequency: 'por_pr', responsible: 'QA' };
    const res = await request(ctx.app).post(`/api/projects/${projectId}/plan`).set(bearer(ctx.tokens.qa)).send(body);
    expect(res.status).toBe(201);
    planId = res.body.id;
    const dup = await request(ctx.app).post(`/api/projects/${projectId}/plan`).set(bearer(ctx.tokens.qa)).send(body);
    expect(dup.status).toBe(409);
    const unknown = await request(ctx.app)
      .post(`/api/projects/${projectId}/plan`)
      .set(bearer(ctx.tokens.qa))
      .send({ techniqueId: 9999, frequency: 'semanal' });
    expect(unknown.status).toBe(400);
  });

  it('una técnica sin ejecuciones está atrasada', async () => {
    const res = await request(ctx.app).get(`/api/projects/${projectId}/plan`).set(bearer(ctx.tokens.miembro));
    expect(res.body.compliance).toBe(0);
    expect(res.body.items[0]).toMatchObject({ upToDate: false, executions: 0, lastExecutedOn: null });
  });

  it('registra ejecuciones con sus hallazgos y actualiza el cumplimiento', async () => {
    const url = `/api/projects/${projectId}/plan/${planId}/executions`;
    const res = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ executedOn: todayIso(), responsible: 'Integrante', result: 'con_hallazgos', findings: 3 });
    expect(res.status).toBe(201);
    expect(res.body.techniqueName).toBe('Revisión de código');

    const plan = await request(ctx.app).get(`/api/projects/${projectId}/plan`).set(bearer(ctx.tokens.miembro));
    expect(plan.body.compliance).toBe(1);
    expect(plan.body.items[0]).toMatchObject({ upToDate: true, executions: 1, findings: 3 });

    const executions = await request(ctx.app).get(`/api/projects/${projectId}/executions`).set(bearer(ctx.tokens.miembro));
    expect(executions.body).toHaveLength(1);
  });

  it('valida las ejecuciones', async () => {
    const url = `/api/projects/${projectId}/plan/${planId}/executions`;
    const approvedWithFindings = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ executedOn: todayIso(), responsible: 'Integrante', result: 'aprobada', findings: 1 });
    expect(approvedWithFindings.status).toBe(400);
    const future = await request(ctx.app)
      .post(url)
      .set(bearer(ctx.tokens.miembro))
      .send({ executedOn: '2999-01-01', responsible: 'Integrante', result: 'aprobada' });
    expect(future.status).toBe(400);
    const otherProject = await createProject(ctx, { name: 'Otro proyecto' });
    const wrongPlan = await request(ctx.app)
      .post(`/api/projects/${otherProject.id}/plan/${planId}/executions`)
      .set(bearer(ctx.tokens.miembro))
      .send({ executedOn: todayIso(), responsible: 'Integrante', result: 'aprobada' });
    expect(wrongPlan.status).toBe(404);
  });

  it('quita técnicas del plan', async () => {
    const forbidden = await request(ctx.app).delete(`/api/projects/${projectId}/plan/${planId}`).set(bearer(ctx.tokens.miembro));
    expect(forbidden.status).toBe(403);
    const res = await request(ctx.app).delete(`/api/projects/${projectId}/plan/${planId}`).set(bearer(ctx.tokens.qa));
    expect(res.status).toBe(204);
    const again = await request(ctx.app).delete(`/api/projects/${projectId}/plan/${planId}`).set(bearer(ctx.tokens.qa));
    expect(again.status).toBe(404);
  });
});

describe('M4. Reportes de salud', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());

  it('calcula el índice como promedio de indicadores, con el plan y el tope por defectos críticos', async () => {
    const { id } = await createProject(ctx, { name: 'Con datos' });
    const add = (code: string, value: number) =>
      metricId(ctx, code).then((metric) =>
        request(ctx.app)
          .post(`/api/projects/${id}/measurements`)
          .set(bearer(ctx.tokens.qa))
          .send({ metricId: metric, value, measuredOn: todayIso() }),
      );
    await add('funciones_terminadas', 100); // verde
    await add('criterios_aceptacion', 100); // verde
    await add('eficiencia_qa', 100); // verde
    await add('defectos_criticos', 1); // rojo (peor = mejor = 0)
    const technique = await techniqueId(ctx, 'Pruebas unitarias');
    const plan = await request(ctx.app)
      .post(`/api/projects/${id}/plan`)
      .set(bearer(ctx.tokens.qa))
      .send({ techniqueId: technique, frequency: 'semanal' });
    await request(ctx.app)
      .post(`/api/projects/${id}/plan/${plan.body.id}/executions`)
      .set(bearer(ctx.tokens.qa))
      .send({ executedOn: isoDaysAgo(2), responsible: 'QA', result: 'aprobada' });

    const health = await request(ctx.app).get(`/api/projects/${id}/health`).set(bearer(ctx.tokens.miembro));
    // 3 métricas verdes + 1 roja + plan verde = (4 × 100 + 0) / 5 = 80, limitado a 79 por el defecto crítico
    expect(health.body).toMatchObject({
      index: 79,
      level: 'amarillo',
      criticalOpen: 1,
      planCompliance: 1,
      planStatus: 'verde',
      cappedByCritical: true,
      indicators: { verde: 4, amarillo: 0, rojo: 1 },
    });
    expect(health.body.metricsInTarget).toEqual({ met: 3, total: 4 });
    const report = await request(ctx.app).post(`/api/projects/${id}/reports`).set(bearer(ctx.tokens.qa));
    expect(report.body.report.summary).toContain('se limita a 79');
  });

  it('genera reportes y guarda su historial', async () => {
    const { id } = await createProject(ctx, { name: 'Reportes' });
    const created = await request(ctx.app).post(`/api/projects/${id}/reports`).set(bearer(ctx.tokens.miembro));
    expect(created.status).toBe(201);
    expect(created.body.report.summary).toContain('sin datos suficientes');
    const list = await request(ctx.app).get(`/api/projects/${id}/reports`).set(bearer(ctx.tokens.miembro));
    expect(list.body).toHaveLength(1);
    expect((await request(ctx.app).get('/api/projects/9999/health').set(bearer(ctx.tokens.qa))).status).toBe(404);
  });

  it('los datos de demostración producen proyectos sano, en riesgo y crítico', async () => {
    const demo = await createTestContext({ demo: true });
    const res = await request(demo.app).get('/api/projects?period=2026-2').set(bearer(demo.tokens.qa));
    const levels = Object.fromEntries(res.body.map((p: { name: string; health: { level: string } }) => [p.name, p.health.level]));
    expect(levels).toEqual({
      'Odín · App educativa': 'amarillo',
      'Portal de Servicio Social': 'rojo',
      QualiTrack: 'verde',
    });
    const byName = (name: string) => res.body.find((p: { name: string }) => p.name === name);
    expect(byName('QualiTrack')).toMatchObject({ health: { index: 93 }, criticalOpen: 0 });
    const report = await request(demo.app)
      .post(`/api/projects/${byName('Portal de Servicio Social').id}/reports`)
      .set(bearer(demo.tokens.qa));
    expect(report.body.report.summary).toContain('fuera de meta');
    await demo.close();
  });
});
