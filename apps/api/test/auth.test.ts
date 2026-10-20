import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PASSWORD, bearer, createTestContext, type TestContext } from './helpers';

describe('M5. Usuarios y acceso', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());

  it('inicia sesión con credenciales válidas', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@qualitrack.local', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({ role: 'admin', email: 'admin@qualitrack.local' });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rechaza contraseña incorrecta y correo inexistente con el mismo mensaje', async () => {
    const wrong = await request(ctx.app).post('/api/auth/login').send({ email: 'admin@qualitrack.local', password: 'x' });
    const missing = await request(ctx.app).post('/api/auth/login').send({ email: 'nadie@qualitrack.local', password: 'x' });
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(wrong.body.error).toBe(missing.body.error);
  });

  it('valida el formato del correo', async () => {
    const res = await request(ctx.app).post('/api/auth/login').send({ email: 'no-es-correo', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toBe('email');
  });

  it('exige token en las rutas protegidas', async () => {
    expect((await request(ctx.app).get('/api/projects')).status).toBe(401);
    expect((await request(ctx.app).get('/api/projects').set(bearer('token-falso'))).status).toBe(401);
  });

  it('devuelve el usuario de la sesión', async () => {
    const res = await request(ctx.app).get('/api/auth/me').set(bearer(ctx.tokens.qa));
    expect(res.body.user.role).toBe('lider_qa');
  });

  it('DEF-004: los usuarios de ejemplo tienen nombre de persona, no de rol', async () => {
    const list = await request(ctx.app).get('/api/users').set(bearer(ctx.tokens.admin));
    const names = list.body.map((u: { name: string }) => u.name);
    expect(names).toEqual(expect.arrayContaining(['David Becerra', 'Flavio Huizar', 'Jorge López']));
    for (const roleName of ['Administrador', 'Líder QA', 'Integrante', 'Miembro']) {
      expect(names).not.toContain(roleName);
    }
  });

  it('solo el administrador gestiona usuarios', async () => {
    expect((await request(ctx.app).get('/api/users').set(bearer(ctx.tokens.miembro))).status).toBe(403);
    const list = await request(ctx.app).get('/api/users').set(bearer(ctx.tokens.admin));
    expect(list.body).toHaveLength(3);
    const created = await request(ctx.app)
      .post('/api/users')
      .set(bearer(ctx.tokens.admin))
      .send({ name: 'Nueva persona', email: 'nueva@qualitrack.local', password: '12345678', role: 'miembro' });
    expect(created.status).toBe(201);
    const duplicated = await request(ctx.app)
      .post('/api/users')
      .set(bearer(ctx.tokens.admin))
      .send({ name: 'Otra', email: 'nueva@qualitrack.local', password: '12345678', role: 'miembro' });
    expect(duplicated.status).toBe(409);
    const shortPassword = await request(ctx.app)
      .post('/api/users')
      .set(bearer(ctx.tokens.admin))
      .send({ name: 'Otra', email: 'otra@qualitrack.local', password: '123', role: 'miembro' });
    expect(shortPassword.status).toBe(400);
  });

  it('responde 404 en rutas de API inexistentes y expone /api/health', async () => {
    expect((await request(ctx.app).get('/api/no-existe')).status).toBe(404);
    expect((await request(ctx.app).get('/api/health')).body).toEqual({ status: 'ok' });
  });
});

describe('servidor de la SPA', () => {
  it('sirve index.html para rutas del frontend', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'qualitrack-web-'));
    await writeFile(path.join(dir, 'index.html'), '<html>QualiTrack</html>');
    const ctx = await createTestContext({ webDist: dir });
    const res = await request(ctx.app).get('/proyectos/1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('QualiTrack');
    await ctx.close();
  });
});
