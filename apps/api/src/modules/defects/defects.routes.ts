import { Router } from 'express';
import { currentUser } from '../../auth/auth';
import type { Db } from '../../db';
import { HttpError } from '../../errors';
import { paramId, todayIso } from '../../validation';
import { getProject } from '../projects/projects.repo';
import { defectMetrics } from './defectMetrics';
import { closeDefect, closeInput, createDefect, defectInput, listDefects } from './defects.repo';

function notFuture(date: string, what: string) {
  if (date > todayIso()) {
    throw new HttpError(400, `La fecha de ${what} no puede ser futura`);
  }
}

/** /api/projects/:id/defects: registro de defectos del proyecto (CU-11). Cualquier integrante registra y cierra. */
export function defectsRouter(db: Db): Router {
  const router = Router({ mergeParams: true });

  router.get('/defects', async (req, res) => {
    const project = await getProject(db, paramId(req));
    const items = await listDefects(db, project.id);
    res.json({ items, summary: defectMetrics(items, project.deliveredStories) });
  });

  router.post('/defects', async (req, res) => {
    const project = await getProject(db, paramId(req));
    if (project.archived) {
      throw new HttpError(409, 'El proyecto está archivado; no admite nuevos defectos');
    }
    const input = defectInput.parse(req.body);
    notFuture(input.foundOn, 'registro');
    res.status(201).json(await createDefect(db, project.id, input, currentUser(res).id));
  });

  router.post('/defects/:defectId/close', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const input = closeInput.parse(req.body);
    notFuture(input.closedOn, 'cierre');
    res.json(await closeDefect(db, projectId, paramId(req, 'defectId'), input));
  });

  return router;
}
