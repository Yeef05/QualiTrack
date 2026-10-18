import { Router } from 'express';
import type { Db } from '../../db';
import { paramId } from '../../validation';
import { getProject } from '../projects/projects.repo';
import { projectHealth, summarize } from './health.service';

interface ReportRow {
  id: number;
  generated_at: string | Date;
  health_index: number;
  summary: string;
}

const toReport = (r: ReportRow) => ({
  id: r.id,
  generatedAt: new Date(r.generated_at).toISOString(),
  healthIndex: r.health_index,
  summary: r.summary,
});

/** /api/projects/:id/...: índice de salud y reportes (M4). */
export function healthRouter(db: Db): Router {
  const router = Router({ mergeParams: true });

  router.get('/health', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    res.json(await projectHealth(db, projectId));
  });

  router.get('/reports', async (req, res) => {
    const projectId = paramId(req);
    await getProject(db, projectId);
    const { rows } = await db.query<ReportRow>(
      'SELECT id, generated_at, health_index, summary FROM health_reports WHERE project_id = $1 ORDER BY generated_at DESC, id DESC',
      [projectId],
    );
    res.json(rows.map(toReport));
  });

  router.post('/reports', async (req, res) => {
    const projectId = paramId(req);
    const project = await getProject(db, projectId);
    const health = await projectHealth(db, projectId);
    const { rows } = await db.query<ReportRow>(
      `INSERT INTO health_reports (project_id, health_index, summary) VALUES ($1, $2, $3)
       RETURNING id, generated_at, health_index, summary`,
      [projectId, health.index ?? 0, summarize(project.name, health)],
    );
    res.status(201).json({ report: toReport(rows[0]), health });
  });

  return router;
}
