import { Router } from 'express';
import { canManage, currentUser } from '../../auth/auth';
import type { Db } from '../../db';
import { HttpError } from '../../errors';
import { idSchema, paramId, todayIso } from '../../validation';
import { getProject } from '../projects/projects.repo';
import {
  createMeasurement,
  createMetric,
  listMeasurements,
  listMetrics,
  measurementInput,
  metricInput,
  metricStatuses,
  metricUpdateInput,
  updateMetric,
} from './metrics.repo';

/** /api/metrics: catálogo de métricas. */
export function metricsRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await listMetrics(db));
  });

  router.post('/', canManage, async (req, res) => {
    res.status(201).json(await createMetric(db, metricInput.parse(req.body)));
  });

  router.put('/:metricId', canManage, async (req, res) => {
    const id = idSchema.parse(req.params.metricId);
    res.json(await updateMetric(db, id, metricUpdateInput.parse(req.body)));
  });

  return router;
}

/** /api/projects/:id/...: mediciones y semáforo de un proyecto. */
export function measurementsRouter(db: Db): Router {
  const router = Router({ mergeParams: true });

  router.get('/measurements', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const metricId = req.query.metricId === undefined ? undefined : idSchema.parse(req.query.metricId);
    res.json(await listMeasurements(db, projectId, metricId));
  });

  router.post('/measurements', async (req, res) => {
    const projectId = paramId(req);
    const project = await getProject(db, projectId);
    if (project.archived) {
      throw new HttpError(409, 'El proyecto está archivado; no admite nuevas mediciones');
    }
    const input = measurementInput.parse(req.body);
    if (input.measuredOn > todayIso()) {
      throw new HttpError(400, 'La fecha de medición no puede ser futura');
    }
    res.status(201).json(await createMeasurement(db, projectId, input, currentUser(res).id));
  });

  router.get('/metrics-status', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    res.json(await metricStatuses(db, projectId));
  });

  return router;
}
