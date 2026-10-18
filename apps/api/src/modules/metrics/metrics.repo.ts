import { z } from 'zod';
import type { Db } from '../../db';
import { notFound } from '../../errors';
import { idSchema, isoDate } from '../../validation';
import { evaluate, type Direction, type Status } from './status';

export interface Metric {
  id: number;
  code: string;
  name: string;
  unit: string;
  target: number;
  direction: Direction;
  description: string;
}

export interface Measurement {
  id: number;
  projectId: number;
  metricId: number;
  value: number;
  measuredOn: string;
  note: string;
  status: Status;
}

export interface MetricStatus {
  metric: Metric;
  latest: { value: number; measuredOn: string } | null;
  status: Status | null;
}

export const metricInput = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{2,40}$/, 'El código solo admite minúsculas, números y guion bajo'),
  name: z.string().trim().min(2).max(100),
  unit: z.string().trim().max(30).default(''),
  target: z.number().finite(),
  direction: z.enum(['mayor', 'menor']),
  description: z.string().trim().max(300).default(''),
});

export const metricUpdateInput = metricInput.omit({ code: true });

export const measurementInput = z.object({
  metricId: idSchema,
  value: z.number().finite(),
  measuredOn: isoDate,
  note: z.string().trim().max(300).default(''),
});

interface MeasurementRow {
  id: number;
  project_id: number;
  metric_id: number;
  value: number;
  measured_on: string;
  note: string;
}

const METRIC_COLUMNS = 'id, code, name, unit, target, direction, description';

export async function listMetrics(db: Db): Promise<Metric[]> {
  const { rows } = await db.query<Metric>(`SELECT ${METRIC_COLUMNS} FROM metrics ORDER BY id`);
  return rows;
}

export async function getMetric(db: Db, id: number): Promise<Metric> {
  const { rows } = await db.query<Metric>(`SELECT ${METRIC_COLUMNS} FROM metrics WHERE id = $1`, [id]);
  if (!rows[0]) {
    throw notFound('Métrica');
  }
  return rows[0];
}

export async function createMetric(db: Db, input: z.infer<typeof metricInput>): Promise<Metric> {
  const { rows } = await db.query<Metric>(
    `INSERT INTO metrics (code, name, unit, target, direction, description)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${METRIC_COLUMNS}`,
    [input.code, input.name, input.unit, input.target, input.direction, input.description],
  );
  return rows[0];
}

export async function updateMetric(db: Db, id: number, input: z.infer<typeof metricUpdateInput>): Promise<Metric> {
  const { rows } = await db.query<Metric>(
    `UPDATE metrics SET name = $2, unit = $3, target = $4, direction = $5, description = $6
     WHERE id = $1 RETURNING ${METRIC_COLUMNS}`,
    [id, input.name, input.unit, input.target, input.direction, input.description],
  );
  if (!rows[0]) {
    throw notFound('Métrica');
  }
  return rows[0];
}

function toMeasurement(r: MeasurementRow, metric: Metric): Measurement {
  return {
    id: r.id,
    projectId: r.project_id,
    metricId: r.metric_id,
    value: r.value,
    measuredOn: r.measured_on,
    note: r.note,
    status: evaluate(r.value, metric.target, metric.direction),
  };
}

export async function listMeasurements(db: Db, projectId: number, metricId?: number): Promise<Measurement[]> {
  const metrics = new Map((await listMetrics(db)).map((m) => [m.id, m]));
  const { rows } = await db.query<MeasurementRow>(
    `SELECT id, project_id, metric_id, value, measured_on::text AS measured_on, note
     FROM measurements
     WHERE project_id = $1 AND ($2::int IS NULL OR metric_id = $2)
     ORDER BY measured_on, id`,
    [projectId, metricId ?? null],
  );
  return rows.map((r) => toMeasurement(r, metrics.get(r.metric_id) as Metric));
}

export async function createMeasurement(
  db: Db,
  projectId: number,
  input: z.infer<typeof measurementInput>,
  userId: number,
): Promise<Measurement> {
  const metric = await getMetric(db, input.metricId);
  const { rows } = await db.query<MeasurementRow>(
    `INSERT INTO measurements (project_id, metric_id, value, measured_on, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, project_id, metric_id, value, measured_on::text AS measured_on, note`,
    [projectId, input.metricId, input.value, input.measuredOn, input.note, userId],
  );
  return toMeasurement(rows[0], metric);
}

/** Última medición de cada métrica del catálogo para un proyecto, con su semáforo. */
export async function metricStatuses(db: Db, projectId: number): Promise<MetricStatus[]> {
  const metrics = await listMetrics(db);
  const { rows } = await db.query<{ metric_id: number; value: number; measured_on: string }>(
    `SELECT DISTINCT ON (metric_id) metric_id, value, measured_on::text AS measured_on
     FROM measurements WHERE project_id = $1
     ORDER BY metric_id, measured_on DESC, id DESC`,
    [projectId],
  );
  const latest = new Map(rows.map((r) => [r.metric_id, r]));
  return metrics.map((metric) => {
    const row = latest.get(metric.id);
    if (!row) {
      return { metric, latest: null, status: null };
    }
    return {
      metric,
      latest: { value: row.value, measuredOn: row.measured_on },
      status: evaluate(row.value, metric.target, metric.direction),
    };
  });
}
