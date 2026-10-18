import { Router } from 'express';
import { z } from 'zod';
import { canManage } from '../../auth/auth';
import type { Db } from '../../db';
import { idSchema, PERIOD_RE } from '../../validation';
import { healthRouter } from '../health/health.routes';
import { projectHealth } from '../health/health.service';
import { measurementsRouter } from '../metrics/metrics.routes';
import { planRouter } from '../techniques/techniques.routes';
import {
  createProject,
  getProject,
  listPeriods,
  listProjects,
  projectInput,
  setArchived,
  updateProject,
} from './projects.repo';

const listQuery = z.object({
  period: z.string().regex(PERIOD_RE).optional(),
  archived: z.enum(['true', 'false']).optional(),
});

/** /api/projects: registro de proyectos por periodo (M1) y rutas anidadas de M2, M3 y M4. */
export function projectsRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const query = listQuery.parse(req.query);
    const projects = await listProjects(db, { period: query.period, includeArchived: query.archived === 'true' });
    const withHealth = await Promise.all(
      projects.map(async (p) => {
        const h = await projectHealth(db, p.id);
        return { ...p, health: { index: h.index, level: h.level }, openDefects: h.openDefects };
      }),
    );
    res.json(withHealth);
  });

  router.get('/periods', async (_req, res) => {
    res.json(await listPeriods(db));
  });

  router.post('/', canManage, async (req, res) => {
    res.status(201).json(await createProject(db, projectInput.parse(req.body)));
  });

  router.get('/:id', async (req, res) => {
    res.json(await getProject(db, idSchema.parse(req.params.id)));
  });

  router.put('/:id', canManage, async (req, res) => {
    res.json(await updateProject(db, idSchema.parse(req.params.id), projectInput.parse(req.body)));
  });

  router.post('/:id/archive', canManage, async (req, res) => {
    const { archived } = z.object({ archived: z.boolean() }).parse(req.body);
    res.json(await setArchived(db, idSchema.parse(req.params.id), archived));
  });

  router.use('/:id', measurementsRouter(db));
  router.use('/:id', planRouter(db));
  router.use('/:id', healthRouter(db));

  return router;
}
