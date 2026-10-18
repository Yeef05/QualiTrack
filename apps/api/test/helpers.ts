import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { createPgliteDb, type Db } from '../src/db';
import { migrate } from '../src/db/migrate';
import { seed } from '../src/db/seed';

export const PASSWORD = 'password-de-prueba';
export const SECRET = 'secreto-de-pruebas';

export interface TestContext {
  db: Db;
  app: Express;
  tokens: { admin: string; qa: string; miembro: string };
  close: () => Promise<void>;
}

/** Base de datos PGlite en memoria, migrada y con catálogos; un token por rol. */
export async function createTestContext(options: { demo?: boolean; webDist?: string } = {}): Promise<TestContext> {
  const db = await createPgliteDb();
  await migrate(db);
  await seed(db, { demo: options.demo ?? false, adminPassword: PASSWORD });
  const app = createApp({ db, jwtSecret: SECRET, webDist: options.webDist });
  const login = async (email: string) => {
    const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
    return res.body.token as string;
  };
  return {
    db,
    app,
    tokens: {
      admin: await login('admin@qualitrack.local'),
      qa: await login('qa@qualitrack.local'),
      miembro: await login('miembro@qualitrack.local'),
    },
    close: () => db.close(),
  };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const sampleProject = {
  name: 'Proyecto de prueba',
  description: 'Creado por las pruebas',
  period: '2026-2',
  repositoryUrl: 'https://github.com/equipo/proyecto',
  team: 'Equipo A',
  qaLead: 'QA A',
};

export async function createProject(ctx: TestContext, overrides: Partial<typeof sampleProject> = {}) {
  const res = await request(ctx.app)
    .post('/api/projects')
    .set(bearer(ctx.tokens.qa))
    .send({ ...sampleProject, ...overrides });
  return res.body as { id: number; name: string; period: string };
}

export async function metricId(ctx: TestContext, code: string): Promise<number> {
  const { rows } = await ctx.db.query<{ id: number }>('SELECT id FROM metrics WHERE code = $1', [code]);
  return rows[0].id;
}
