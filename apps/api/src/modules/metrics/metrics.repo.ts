import { z } from 'zod';
import type { Db } from '../../db';
import { HttpError, notFound } from '../../errors';
import { idSchema, isoDate, todayIso } from '../../validation';
import { derivedValues } from '../defects/defectMetrics';
import { projectDefectMetrics } from '../defects/defects.repo';
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

/** Métrica con los valores que usa un proyecto: los del catálogo o los que ajustó el Líder de QA (CU-03). */
export interface ProjectMetric extends Metric {
  /** true si el proyecto sobrescribe el catálogo (activa, peor o mejor). */
  customized: boolean;
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
  /** fromDefects: el valor lo calculó el registro de defectos (CU-11), no una medición capturada. */
  latest: { value: number; measuredOn: string; fromDefects: boolean } | null;
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

export const projectMetricInput = z.object({
  worst: z.number().finite(),
  best: z.number().finite(),
  active: z.boolean(),
});

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

/** Modelo de calidad del proyecto (RF-14): el catálogo con los ajustes de ese proyecto. */
export async function projectModel(db: Db, projectId: number, options: { activeOnly?: boolean } = {}): Promise<ProjectMetric[]> {
  const { rows } = await db.query<ProjectMetric>(
    `SELECT m.id, m.code, m.name, m.unit, COALESCE(pm.worst, m.worst) AS worst, COALESCE(pm.best, m.best) AS best,
       m.direction, m.description, m.criterion, m.source, COALESCE(pm.active, m.active) AS active,
       pm.project_id IS NOT NULL AS customized
     FROM metrics m LEFT JOIN project_metrics pm ON pm.metric_id = m.id AND pm.project_id = $1
     ORDER BY m.id`,
    [projectId],
  );
  return options.activeOnly ? rows.filter((m) => m.active) : rows;
}

/** Guarda, solo para el proyecto, si la métrica está activa y sus valores peor y mejor (RF-10, RF-11, RF-12). */
export async function setProjectMetric(
  db: Db,
  projectId: number,
  metricId: number,
  input: z.infer<typeof projectMetricInput>,
): Promise<ProjectMetric> {
  const metric = await getMetric(db, metricId);
  if (!coherent({ ...input, direction: metric.direction })) {
    throw new HttpError(400, WORST_BEST_MESSAGE);
  }
  await db.query(
    `INSERT INTO project_metrics (project_id, metric_id, worst, best, active) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_id, metric_id) DO UPDATE SET worst = $3, best = $4, active = $5`,
    [projectId, metricId, input.worst, input.best, input.active],
  );
  return { ...metric, ...input, customized: true };
}

/** Quita los ajustes del proyecto: la métrica vuelve a los valores del catálogo. */
export async function resetProjectMetric(db: Db, projectId: number, metricId: number): Promise<void> {
  await getMetric(db, metricId);
  await db.query('DELETE FROM project_metrics WHERE project_id = $1 AND metric_id = $2', [projectId, metricId]);
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
  const metrics = new Map((await projectModel(db, projectId)).map((m) => [m.id, m]));
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
  const metric = (await projectModel(db, projectId)).find((m) => m.id === input.metricId);
  if (!metric) {
    throw notFound('Métrica');
  }
  if (!metric.active) {
    throw new HttpError(409, 'La métrica no está activa en el modelo del proyecto; actívala antes de registrar mediciones');
  }
  const { rows } = await db.query<MeasurementRow>(
    `INSERT INTO measurements (project_id, metric_id, value, measured_on, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, project_id, metric_id, value, measured_on::text AS measured_on, note`,
    [projectId, input.metricId, input.value, input.measuredOn, input.note, userId],
  );
  return toMeasurement(rows[0], metric);
}

interface LatestRow {
  metric_id: number;
  value: number;
  measured_on: string;
}

/** Valores que salen del registro de defectos; vacío si el proyecto no registra defectos (sigue a mano). */
async function derivedFromDefects(db: Db, projectId: number): Promise<Record<string, number | null>> {
  const defects = await projectDefectMetrics(db, projectId);
  return defects ? derivedValues(defects) : {};
}

function statusFor(metric: Metric, row: LatestRow | undefined, derived: number | null): MetricStatus {
  if (derived !== null) {
    return { metric, latest: { value: derived, measuredOn: todayIso(), fromDefects: true }, status: evaluate(derived, metric) };
  }
  if (!row) {
    return { metric, latest: null, status: null };
  }
  return {
    metric,
    latest: { value: row.value, measuredOn: row.measured_on, fromDefects: false },
    status: evaluate(row.value, metric),
  };
}

/**
 * Valor actual de cada métrica activa en el modelo del proyecto, con su semáforo. Es la última medición,
 * salvo en las 4 métricas que calcula el registro de defectos cuando el proyecto ya lo usa (RF-37).
 */
export async function metricStatuses(db: Db, projectId: number): Promise<MetricStatus[]> {
  const metrics = await projectModel(db, projectId, { activeOnly: true });
  const { rows } = await db.query<LatestRow>(
    `SELECT DISTINCT ON (metric_id) metric_id, value, measured_on::text AS measured_on
     FROM measurements WHERE project_id = $1
     ORDER BY metric_id, measured_on DESC, id DESC`,
    [projectId],
  );
  const latest = new Map(rows.map((r) => [r.metric_id, r]));
  const derived = await derivedFromDefects(db, projectId);
  return metrics.map((metric) => statusFor(metric, latest.get(metric.id), derived[metric.code] ?? null));
}
