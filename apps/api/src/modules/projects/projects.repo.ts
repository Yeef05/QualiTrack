import { z } from 'zod';
import type { Db } from '../../db';
import { notFound } from '../../errors';
import { PERIOD_RE } from '../../validation';

export interface Project {
  id: number;
  name: string;
  description: string;
  period: string;
  repositoryUrl: string;
  team: string;
  qaLead: string;
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
  archived: boolean;
  created_at: string | Date;
}

export const projectInput = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().trim().max(500).default(''),
  period: z.string().trim().regex(PERIOD_RE, 'El periodo debe tener el formato AAAA-1 o AAAA-2'),
  repositoryUrl: z.union([z.literal(''), z.string().trim().url('URL de repositorio inválida')]).default(''),
  team: z.string().trim().max(300).default(''),
  qaLead: z.string().trim().max(100).default(''),
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
    qaLead: r.qa_lead,
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

export async function createProject(db: Db, input: ProjectInput): Promise<Project> {
  const { rows } = await db.query<ProjectRow>(
    `INSERT INTO projects (name, description, period, repository_url, team, qa_lead)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [input.name, input.description, input.period, input.repositoryUrl, input.team, input.qaLead],
  );
  return toProject(rows[0]);
}

export async function updateProject(db: Db, id: number, input: ProjectInput): Promise<Project> {
  const { rows } = await db.query<ProjectRow>(
    `UPDATE projects SET name = $2, description = $3, period = $4, repository_url = $5, team = $6, qa_lead = $7
     WHERE id = $1 RETURNING *`,
    [id, input.name, input.description, input.period, input.repositoryUrl, input.team, input.qaLead],
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
