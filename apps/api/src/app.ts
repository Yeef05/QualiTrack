import path from 'node:path';
import express, { type Express } from 'express';
import { authRouter, usersRouter } from './auth/auth.routes';
import { requireAuth } from './auth/auth';
import type { Db } from './db';
import { errorHandler } from './errors';
import { metricsRouter } from './modules/metrics/metrics.routes';
import { projectsRouter } from './modules/projects/projects.routes';
import { techniquesRouter } from './modules/techniques/techniques.routes';

export interface AppDeps {
  db: Db;
  jwtSecret: string;
  /** Carpeta con el build del frontend; si se indica, la API también sirve la SPA. */
  webDist?: string;
}

export function createApp({ db, jwtSecret, webDist }: AppDeps): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/auth', authRouter(db, jwtSecret));

  const auth = requireAuth(jwtSecret);
  app.use('/api/projects', auth, projectsRouter(db));
  app.use('/api/metrics', auth, metricsRouter(db));
  app.use('/api/techniques', auth, techniquesRouter(db));
  app.use('/api/users', auth, usersRouter(db));
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  if (webDist) {
    app.use(express.static(webDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
