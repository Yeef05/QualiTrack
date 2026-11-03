import { z } from 'zod';
import type { Db } from '../../db';
import { HttpError, notFound } from '../../errors';
import { isoDate } from '../../validation';
import { defectMetrics, type DefectMetrics, type FoundBy, type Severity } from './defectMetrics';

export const TSP_TYPES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export interface Defect {
  id: number;
  projectId: number;
  description: string;
  severity: Severity;
  tspType: number;
  foundBy: FoundBy;
  foundOn: string;
  closedOn: string | null;
  fixNote: string;
}

interface DefectRow {
  id: number;
  project_id: number;
  description: string;
  severity: Severity;
  tsp_type: number;
  found_by: FoundBy;
  found_on: string;
  closed_on: string | null;
  fix_note: string;
}

export const defectInput = z.object({
  description: z.string().trim().min(5, 'Describe el defecto con al menos 5 caracteres').max(500),
  severity: z.enum(['critica', 'mayor', 'menor', 'cosmetica']),
  tspType: z
    .number()
    .int()
    .refine((t) => (TSP_TYPES as readonly number[]).includes(t), 'Tipo TSP inválido (10, 20, … 100)'),
  foundBy: z.enum(['equipo', 'cliente', 'usuario']),
  foundOn: isoDate,
});

export const closeInput = z.object({
  closedOn: isoDate,
  fixNote: z.string().trim().max(300).default(''),
});

const COLUMNS =
  'id, project_id, description, severity, tsp_type, found_by, found_on::text AS found_on, closed_on::text AS closed_on, fix_note';

const toDefect = (r: DefectRow): Defect => ({
  id: r.id,
  projectId: r.project_id,
  description: r.description,
  severity: r.severity,
  tspType: r.tsp_type,
  foundBy: r.found_by,
  foundOn: r.found_on,
  closedOn: r.closed_on,
  fixNote: r.fix_note,
});

export async function listDefects(db: Db, projectId: number): Promise<Defect[]> {
  const { rows } = await db.query<DefectRow>(
    `SELECT ${COLUMNS} FROM defects WHERE project_id = $1 ORDER BY found_on, id`,
    [projectId],
  );
  return rows.map(toDefect);
}

export async function createDefect(
  db: Db,
  projectId: number,
  input: z.infer<typeof defectInput>,
  userId: number,
): Promise<Defect> {
  const { rows } = await db.query<DefectRow>(
    `INSERT INTO defects (project_id, description, severity, tsp_type, found_by, found_on, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNS}`,
    [projectId, input.description, input.severity, input.tspType, input.foundBy, input.foundOn, userId],
  );
  return toDefect(rows[0]);
}

async function getDefect(db: Db, projectId: number, defectId: number): Promise<Defect> {
  const { rows } = await db.query<DefectRow>(`SELECT ${COLUMNS} FROM defects WHERE id = $1 AND project_id = $2`, [
    defectId,
    projectId,
  ]);
  if (!rows[0]) {
    throw notFound('Defecto');
  }
  return toDefect(rows[0]);
}

export async function closeDefect(
  db: Db,
  projectId: number,
  defectId: number,
  input: z.infer<typeof closeInput>,
): Promise<Defect> {
  const defect = await getDefect(db, projectId, defectId);
  if (defect.closedOn) {
    throw new HttpError(409, 'El defecto ya está cerrado');
  }
  if (input.closedOn < defect.foundOn) {
    throw new HttpError(400, 'La fecha de cierre no puede ser anterior a la de registro');
  }
  const { rows } = await db.query<DefectRow>(
    `UPDATE defects SET closed_on = $2, fix_note = $3 WHERE id = $1 RETURNING ${COLUMNS}`,
    [defectId, input.closedOn, input.fixNote],
  );
  return toDefect(rows[0]);
}

/** Métricas del registro de defectos; null si el proyecto todavía no registra defectos. */
export async function projectDefectMetrics(db: Db, projectId: number): Promise<DefectMetrics | null> {
  const defects = await listDefects(db, projectId);
  if (defects.length === 0) {
    return null;
  }
  const { rows } = await db.query<{ delivered_stories: number }>(
    'SELECT delivered_stories FROM projects WHERE id = $1',
    [projectId],
  );
  return defectMetrics(defects, rows[0]?.delivered_stories ?? 0);
}
