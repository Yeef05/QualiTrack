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
  projectMetricInput,
  projectModel,
  resetProjectMetric,
  setProjectMetric,
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

/** /api/projects/:id/...: modelo de calidad del proyecto (CU-03), mediciones y semáforo. */
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

  router.get('/model', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    res.json(await projectModel(db, projectId));
  });

  router.put('/model/:metricId', canManage, async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const input = projectMetricInput.parse(req.body);
    res.json(await setProjectMetric(db, projectId, paramId(req, 'metricId'), input));
  });

  router.delete('/model/:metricId', canManage, async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    await resetProjectMetric(db, projectId, paramId(req, 'metricId'));
    res.status(204).end();
  });

  router.get('/metrics-status', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    res.json(await metricStatuses(db, projectId));
  });

  return router;
}
