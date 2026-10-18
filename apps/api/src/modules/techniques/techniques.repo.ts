import { z } from 'zod';
import type { Db } from '../../db';
import { HttpError, notFound } from '../../errors';
import { idSchema, isoDate } from '../../validation';
import { FREQUENCIES, isUpToDate, type Frequency } from './compliance';

export const KINDS = ['estatica', 'dinamica', 'proceso'] as const;
export const RESULTS = ['aprobada', 'con_hallazgos', 'rechazada'] as const;

export interface Technique {
  id: number;
  name: string;
  kind: (typeof KINDS)[number];
  description: string;
}

export interface PlanItem {
  id: number;
  techniqueId: number;
  techniqueName: string;
  kind: Technique['kind'];
  frequency: Frequency;
  responsible: string;
  lastExecutedOn: string | null;
  executions: number;
  findings: number;
  upToDate: boolean;
}

export interface Execution {
  id: number;
  planId: number;
  techniqueName: string;
  executedOn: string;
  responsible: string;
  result: (typeof RESULTS)[number];
  findings: number;
  notes: string;
}

export const techniqueInput = z.object({
  name: z.string().trim().min(3).max(100),
  kind: z.enum(KINDS),
  description: z.string().trim().max(300).default(''),
});

export const planInput = z.object({
  techniqueId: idSchema,
  frequency: z.enum(FREQUENCIES),
  responsible: z.string().trim().max(100).default(''),
});

export const executionInput = z.object({
  executedOn: isoDate,
  responsible: z.string().trim().min(2).max(100),
  result: z.enum(RESULTS),
  findings: z.number().int().min(0).default(0),
  notes: z.string().trim().max(500).default(''),
});

export async function listTechniques(db: Db): Promise<Technique[]> {
  const { rows } = await db.query<Technique>('SELECT id, name, kind, description FROM techniques ORDER BY kind, name');
  return rows;
}

export async function createTechnique(db: Db, input: z.infer<typeof techniqueInput>): Promise<Technique> {
  const { rows } = await db.query<Technique>(
    'INSERT INTO techniques (name, kind, description) VALUES ($1, $2, $3) RETURNING id, name, kind, description',
    [input.name, input.kind, input.description],
  );
  return rows[0];
}

interface PlanRow {
  id: number;
  technique_id: number;
  technique_name: string;
  kind: Technique['kind'];
  frequency: Frequency;
  responsible: string;
  last_executed_on: string | null;
  executions: number;
  findings: number;
}

export async function listPlan(db: Db, projectId: number, today: string): Promise<PlanItem[]> {
  const { rows } = await db.query<PlanRow>(
    `SELECT p.id, p.technique_id, t.name AS technique_name, t.kind, p.frequency, p.responsible,
            MAX(e.executed_on)::text AS last_executed_on,
            COUNT(e.id)::int AS executions,
            COALESCE(SUM(e.findings), 0)::int AS findings
     FROM technique_plans p
     JOIN techniques t ON t.id = p.technique_id
     LEFT JOIN technique_executions e ON e.plan_id = p.id
     WHERE p.project_id = $1
     GROUP BY p.id, t.name, t.kind
     ORDER BY t.name`,
    [projectId],
  );
  return rows.map((r) => ({
    id: r.id,
    techniqueId: r.technique_id,
    techniqueName: r.technique_name,
    kind: r.kind,
    frequency: r.frequency,
    responsible: r.responsible,
    lastExecutedOn: r.last_executed_on,
    executions: r.executions,
    findings: r.findings,
    upToDate: isUpToDate(r.last_executed_on, r.frequency, today),
  }));
}

export async function addPlanItem(db: Db, projectId: number, input: z.infer<typeof planInput>): Promise<number> {
  const { rows } = await db.query<{ id: number }>(
    'INSERT INTO technique_plans (project_id, technique_id, frequency, responsible) VALUES ($1, $2, $3, $4) RETURNING id',
    [projectId, input.techniqueId, input.frequency, input.responsible],
  );
  return rows[0].id;
}

export async function removePlanItem(db: Db, projectId: number, planId: number): Promise<void> {
  const { rows } = await db.query('DELETE FROM technique_plans WHERE id = $1 AND project_id = $2 RETURNING id', [
    planId,
    projectId,
  ]);
  if (!rows[0]) {
    throw notFound('Técnica del plan');
  }
}

interface ExecutionRow {
  id: number;
  plan_id: number;
  technique_name: string;
  executed_on: string;
  responsible: string;
  result: Execution['result'];
  findings: number;
  notes: string;
}

const toExecution = (r: ExecutionRow): Execution => ({
  id: r.id,
  planId: r.plan_id,
  techniqueName: r.technique_name,
  executedOn: r.executed_on,
  responsible: r.responsible,
  result: r.result,
  findings: r.findings,
  notes: r.notes,
});

export async function listExecutions(db: Db, projectId: number): Promise<Execution[]> {
  const { rows } = await db.query<ExecutionRow>(
    `SELECT e.id, e.plan_id, t.name AS technique_name, e.executed_on::text AS executed_on,
            e.responsible, e.result, e.findings, e.notes
     FROM technique_executions e
     JOIN technique_plans p ON p.id = e.plan_id
     JOIN techniques t ON t.id = p.technique_id
     WHERE p.project_id = $1
     ORDER BY e.executed_on DESC, e.id DESC`,
    [projectId],
  );
  return rows.map(toExecution);
}

export async function createExecution(
  db: Db,
  projectId: number,
  planId: number,
  input: z.infer<typeof executionInput>,
): Promise<Execution> {
  const plan = await db.query<{ technique_name: string }>(
    `SELECT t.name AS technique_name FROM technique_plans p JOIN techniques t ON t.id = p.technique_id
     WHERE p.id = $1 AND p.project_id = $2`,
    [planId, projectId],
  );
  if (!plan.rows[0]) {
    throw notFound('Técnica del plan');
  }
  if (input.result === 'aprobada' && input.findings > 0) {
    throw new HttpError(400, 'Una ejecución aprobada no puede tener hallazgos; usa "con hallazgos"');
  }
  const { rows } = await db.query<ExecutionRow>(
    `INSERT INTO technique_executions (plan_id, executed_on, responsible, result, findings, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, plan_id, executed_on::text AS executed_on, responsible, result, findings, notes`,
    [planId, input.executedOn, input.responsible, input.result, input.findings, input.notes],
  );
  return toExecution({ ...rows[0], technique_name: plan.rows[0].technique_name });
}
