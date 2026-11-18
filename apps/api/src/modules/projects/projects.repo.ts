import { z } from 'zod';
import type { Db } from '../../db';
import { memberName } from '../../auth/team';
import { notFound } from '../../errors';
import { PERIOD_RE } from '../../validation';

export interface Project {
  id: number;
  name: string;
  description: string;
  period: string;
  repositoryUrl: string;
  team: string;
  /** Usuario responsable de QA (DEF-007); null si no se ha elegido. */
  qaLeadId: number | null;
  /** Nombre del responsable de QA, para mostrarlo. */
  qaLead: string;
  /** Historias entregadas: tamaño del proyecto para la densidad de defectos (RF-38). */
  deliveredStories: number;
  archived: boolean;
  createdAt: string;
}

interface ProjectRow {
  id: number;
  name: string;
  description: string;
  period: string;
  repository_url: string;
  team: string;
  qa_lead: string;
  qa_lead_id: number | null;
  delivered_stories: number;
  archived: boolean;
  created_at: string | Date;
}

export const projectInput = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().trim().max(500).default(''),
  period: z.string().trim().regex(PERIOD_RE, 'El periodo debe tener el formato AAAA-1 o AAAA-2'),
  repositoryUrl: z.union([z.literal(''), z.string().trim().url('URL de repositorio inválida')]).default(''),
  team: z.string().trim().max(300).default(''),
  // DEF-007: antes era texto libre; ahora se elige de la lista de usuarios.
  qaLeadId: z.number().int().positive().nullable().default(null),
  deliveredStories: z.number().int().min(0).max(10_000).default(0),
});

export type ProjectInput = z.infer<typeof projectInput>;

function toProject(r: ProjectRow): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    period: r.period,
    repositoryUrl: r.repository_url,
    team: r.team,
    qaLeadId: r.qa_lead_id,
    qaLead: r.qa_lead,
    deliveredStories: r.delivered_stories,
    archived: r.archived,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function listProjects(db: Db, filter: { period?: string; includeArchived?: boolean }): Promise<Project[]> {
  const { rows } = await db.query<ProjectRow>(
    `SELECT * FROM projects
     WHERE ($1::text IS NULL OR period = $1) AND ($2::boolean OR NOT archived)
     ORDER BY period DESC, name`,
    [filter.period ?? null, filter.includeArchived ?? false],
  );
  return rows.map(toProject);
}

export async function listPeriods(db: Db): Promise<string[]> {
  const { rows } = await db.query<{ period: string }>('SELECT DISTINCT period FROM projects ORDER BY period DESC');
  return rows.map((r) => r.period);
}

export async function getProject(db: Db, id: number): Promise<Project> {
  const { rows } = await db.query<ProjectRow>('SELECT * FROM projects WHERE id = $1', [id]);
  if (!rows[0]) {
    throw notFound('Proyecto');
  }
  return toProject(rows[0]);
}

const qaLeadName = (db: Db, input: ProjectInput) =>
  input.qaLeadId === null ? Promise.resolve('') : memberName(db, input.qaLeadId, 'qaLeadId');

export async function createProject(db: Db, input: ProjectInput): Promise<Project> {
  const qaLead = await qaLeadName(db, input);
  const { rows } = await db.query<ProjectRow>(
    `INSERT INTO projects (name, description, period, repository_url, team, qa_lead, qa_lead_id, delivered_stories)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [input.name, input.description, input.period, input.repositoryUrl, input.team, qaLead, input.qaLeadId, input.deliveredStories],
  );
  return toProject(rows[0]);
}

export async function updateProject(db: Db, id: number, input: ProjectInput): Promise<Project> {
  const qaLead = await qaLeadName(db, input);
  const { rows } = await db.query<ProjectRow>(
    `UPDATE projects SET name = $2, description = $3, period = $4, repository_url = $5, team = $6, qa_lead = $7,
       qa_lead_id = $8, delivered_stories = $9
     WHERE id = $1 RETURNING *`,
    [id, input.name, input.description, input.period, input.repositoryUrl, input.team, qaLead, input.qaLeadId, input.deliveredStories],
  );
  if (!rows[0]) {
    throw notFound('Proyecto');
  }
  return toProject(rows[0]);
}

export async function setArchived(db: Db, id: number, archived: boolean): Promise<Project> {
  const { rows } = await db.query<ProjectRow>('UPDATE projects SET archived = $2 WHERE id = $1 RETURNING *', [
    id,
    archived,
  ]);
  if (!rows[0]) {
    throw notFound('Proyecto');
  }
  return toProject(rows[0]);
}
