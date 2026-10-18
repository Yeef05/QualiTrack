import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bearer, createProject, createTestContext, sampleProject, type TestContext } from './helpers';

describe('M1. Proyectos y periodos', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());

  it('el líder de QA registra un proyecto en un periodo', async () => {
    const res = await request(ctx.app).post('/api/projects').set(bearer(ctx.tokens.qa)).send(sampleProject);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: sampleProject.name, period: '2026-2', archived: false });
  });

  it('no permite registrar el mismo proyecto dos veces en un periodo', async () => {
    const res = await request(ctx.app).post('/api/projects').set(bearer(ctx.tokens.qa)).send(sampleProject);
    expect(res.status).toBe(409);
  });

  it('sí permite el mismo proyecto en otro periodo', async () => {
    const res = await request(ctx.app)
      .post('/api/projects')
      .set(bearer(ctx.tokens.admin))
      .send({ ...sampleProject, period: '2027-1' });
    expect(res.status).toBe(201);
  });

  it('valida nombre, periodo y URL del repositorio', async () => {
    const res = await request(ctx.app)
      .post('/api/projects')
      .set(bearer(ctx.tokens.qa))
      .send({ name: 'ab', period: '2026-3', repositoryUrl: 'no-es-url' });
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { path: string }) => d.path);
    expect(fields).toEqual(expect.arrayContaining(['name', 'period', 'repositoryUrl']));
  });

  it('un miembro no puede registrar proyectos', async () => {
    const res = await request(ctx.app)
      .post('/api/projects')
      .set(bearer(ctx.tokens.miembro))
      .send({ ...sampleProject, name: 'Otro' });
    expect(res.status).toBe(403);
  });

  it('lista por periodo con índice de salud y lista los periodos', async () => {
    const list = await request(ctx.app).get('/api/projects?period=2026-2').set(bearer(ctx.tokens.miembro));
    expect(list.status).toBe(200);
    expect(list.body.every((p: { period: string }) => p.period === '2026-2')).toBe(true);
    expect(list.body[0].health).toEqual({ index: null, level: null });
    const periods = await request(ctx.app).get('/api/projects/periods').set(bearer(ctx.tokens.miembro));
    expect(periods.body).toEqual(['2027-1', '2026-2']);
  });

  it('consulta, edita y archiva un proyecto', async () => {
    const project = await createProject(ctx, { name: 'Para editar' });
    const get = await request(ctx.app).get(`/api/projects/${project.id}`).set(bearer(ctx.tokens.miembro));
    expect(get.body.name).toBe('Para editar');

    const put = await request(ctx.app)
      .put(`/api/projects/${project.id}`)
      .set(bearer(ctx.tokens.qa))
      .send({ ...sampleProject, name: 'Editado', repositoryUrl: '' });
    expect(put.status).toBe(200);
    expect(put.body.name).toBe('Editado');

    const archived = await request(ctx.app)
      .post(`/api/projects/${project.id}/archive`)
      .set(bearer(ctx.tokens.qa))
      .send({ archived: true });
    expect(archived.body.archived).toBe(true);

    const visible = await request(ctx.app).get('/api/projects').set(bearer(ctx.tokens.qa));
    expect(visible.body.some((p: { id: number }) => p.id === project.id)).toBe(false);
    const all = await request(ctx.app).get('/api/projects?archived=true').set(bearer(ctx.tokens.qa));
    expect(all.body.some((p: { id: number }) => p.id === project.id)).toBe(true);
  });

  it('responde 404 para proyectos inexistentes y 400 para ids inválidos', async () => {
    expect((await request(ctx.app).get('/api/projects/9999').set(bearer(ctx.tokens.qa))).status).toBe(404);
    expect((await request(ctx.app).get('/api/projects/abc').set(bearer(ctx.tokens.qa))).status).toBe(400);
    const put = await request(ctx.app).put('/api/projects/9999').set(bearer(ctx.tokens.qa)).send(sampleProject);
    expect(put.status).toBe(404);
    const archive = await request(ctx.app)
      .post('/api/projects/9999/archive')
      .set(bearer(ctx.tokens.qa))
      .send({ archived: true });
    expect(archive.status).toBe(404);
  });
});
