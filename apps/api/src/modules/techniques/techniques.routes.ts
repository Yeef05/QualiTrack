import { Router } from 'express';
import { canManage } from '../../auth/auth';
import type { Db } from '../../db';
import { HttpError } from '../../errors';
import { paramId, todayIso } from '../../validation';
import { getProject } from '../projects/projects.repo';
import { planCompliance } from './compliance';
import {
  addPlanItem,
  createExecution,
  createTechnique,
  executionInput,
  listExecutions,
  listPlan,
  listTechniques,
  planInput,
  removePlanItem,
  techniqueInput,
} from './techniques.repo';

/** /api/techniques: catálogo de técnicas de SQA. */
export function techniquesRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await listTechniques(db));
  });

  router.post('/', canManage, async (req, res) => {
    res.status(201).json(await createTechnique(db, techniqueInput.parse(req.body)));
  });

  return router;
}

/** /api/projects/:id/...: plan de SQA del proyecto y sus ejecuciones. */
export function planRouter(db: Db): Router {
  const router = Router({ mergeParams: true });

  router.get('/plan', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const today = todayIso();
    const items = await listPlan(db, projectId, today);
    res.json({ items, compliance: planCompliance(items, today) });
  });

  router.post('/plan', canManage, async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const id = await addPlanItem(db, projectId, planInput.parse(req.body));
    res.status(201).json({ id });
  });

  router.delete('/plan/:planId', canManage, async (req, res) => {
    const projectId = paramId(req);
    await removePlanItem(db, projectId, paramId(req, 'planId'));
    res.status(204).end();
  });

  router.get('/executions', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    res.json(await listExecutions(db, projectId));
  });

  router.post('/plan/:planId/executions', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const input = executionInput.parse(req.body);
    if (input.executedOn > todayIso()) {
      throw new HttpError(400, 'La fecha de ejecución no puede ser futura');
    }
    res.status(201).json(await createExecution(db, projectId, paramId(req, 'planId'), input));
  });

  return router;
}
