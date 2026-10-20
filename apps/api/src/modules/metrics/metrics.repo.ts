import { z } from 'zod';
import type { Db } from '../../db';
import { HttpError, notFound } from '../../errors';
import { idSchema, isoDate } from '../../validation';
import { coherent, evaluate, type Direction, type Status } from './status';

export interface Metric {
  id: number;
  code: string;
  name: string;
  unit: string;
  /** Valor peor aceptable (modelo definido). */
  worst: number;
  /** Valor mejor esperado (modelo definido). */
  best: number;
  direction: Direction;
  /** Fórmula de la métrica. */
  description: string;
  /** Factor y criterio de ISO/IEC 25010 al que responde. */
  criterion: string;
  /** De dónde salen los valores peor y mejor. */
  source: string;
  /** Las inactivas conservan su historial, pero no cuentan en el semáforo ni en el índice. */
  active: boolean;
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

const metricFields = z.object({
  name: z.string().trim().min(2).max(100),
  unit: z.string().trim().max(30).default(''),
  worst: z.number().finite(),
  best: z.number().finite(),
  direction: z.enum(['mayor', 'menor']),
  description: z.string().trim().max(300).default(''),
  criterion: z.string().trim().max(120).default(''),
  source: z.string().trim().max(300).default(''),
  active: z.boolean().default(true),
});

const WORST_BEST_MESSAGE = 'El valor peor no puede ser mejor que el valor mejor';

export const metricUpdateInput = metricFields.refine(coherent, { message: WORST_BEST_MESSAGE, path: ['worst'] });

export const metricInput = metricFields
  .extend({
    code: z
      .string()
      .trim()
      .regex(/^[a-z0-9_]{2,40}$/, 'El código solo admite minúsculas, números y guion bajo'),
  })
  .refine(coherent, { message: WORST_BEST_MESSAGE, path: ['worst'] });

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

const METRIC_COLUMNS = 'id, code, name, unit, worst, best, direction, description, criterion, source, active';

export async function listMetrics(db: Db, options: { activeOnly?: boolean } = {}): Promise<Metric[]> {
  const where = options.activeOnly ? 'WHERE active' : '';
  const { rows } = await db.query<Metric>(`SELECT ${METRIC_COLUMNS} FROM metrics ${where} ORDER BY id`);
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
    `INSERT INTO metrics (code, name, unit, worst, best, direction, description, criterion, source, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING ${METRIC_COLUMNS}`,
    [
      input.code,
      input.name,
      input.unit,
      input.worst,
      input.best,
      input.direction,
      input.description,
      input.criterion,
      input.source,
      input.active,
    ],
  );
  return rows[0];
}

export async function updateMetric(db: Db, id: number, input: z.infer<typeof metricUpdateInput>): Promise<Metric> {
  const { rows } = await db.query<Metric>(
    `UPDATE metrics SET name = $2, unit = $3, worst = $4, best = $5, direction = $6, description = $7,
       criterion = $8, source = $9, active = $10
     WHERE id = $1 RETURNING ${METRIC_COLUMNS}`,
    [
      id,
      input.name,
      input.unit,
      input.worst,
      input.best,
      input.direction,
      input.description,
      input.criterion,
      input.source,
      input.active,
    ],
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
    status: evaluate(r.value, metric),
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
  if (!metric.active) {
    throw new HttpError(409, 'La métrica no está activa en el catálogo; actívala antes de registrar mediciones');
  }
  const { rows } = await db.query<MeasurementRow>(
    `INSERT INTO measurements (project_id, metric_id, value, measured_on, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, project_id, metric_id, value, measured_on::text AS measured_on, note`,
    [projectId, input.metricId, input.value, input.measuredOn, input.note, userId],
  );
  return toMeasurement(rows[0], metric);
}

/** Última medición de cada métrica activa del catálogo para un proyecto, con su semáforo. */
export async function metricStatuses(db: Db, projectId: number): Promise<MetricStatus[]> {
  const metrics = await listMetrics(db, { activeOnly: true });
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
      status: evaluate(row.value, metric),
    };
  });
}
