import type { Db } from '../../db';
import { todayIso } from '../../validation';
import { metricStatuses, type MetricStatus } from '../metrics/metrics.repo';
import { planCompliance } from '../techniques/compliance';
import { listPlan } from '../techniques/techniques.repo';
import { computeHealth, type HealthResult } from './healthIndex';

export const CRITICAL_DEFECTS_CODE = 'defectos_criticos';

export interface ProjectHealth extends HealthResult {
  metrics: MetricStatus[];
  planCompliance: number | null;
  criticalOpen: number | null;
  metricsInTarget: { met: number; total: number };
}

const latestOf = (metrics: MetricStatus[], code: string) =>
  metrics.find((m) => m.metric.code === code)?.latest?.value ?? null;

export async function projectHealth(db: Db, projectId: number, today: string = todayIso()): Promise<ProjectHealth> {
  const metrics = await metricStatuses(db, projectId);
  const compliance = planCompliance(await listPlan(db, projectId, today), today);
  const criticalOpen = latestOf(metrics, CRITICAL_DEFECTS_CODE);
  const statuses = metrics.flatMap((m) => (m.status ? [m.status] : []));
  return {
    ...computeHealth({ statuses, planCompliance: compliance, criticalOpen }),
    metrics,
    planCompliance: compliance,
    criticalOpen,
    metricsInTarget: { met: statuses.filter((s) => s === 'verde').length, total: statuses.length },
  };
}

const pct = (n: number | null) => (n === null ? 'sin datos' : `${Math.round(n)} %`);

/** Resumen en texto que se guarda junto con cada reporte de salud. */
export function summarize(projectName: string, h: ProjectHealth): string {
  const index = h.index === null ? 'sin datos suficientes' : `${h.index}/100 (${h.level})`;
  const red = h.metrics.filter((m) => m.status === 'rojo').map((m) => m.metric.name);
  const lines = [
    `Proyecto ${projectName}: índice de salud ${index}.`,
    `Indicadores: ${h.indicators.verde} en verde, ${h.indicators.amarillo} en amarillo y ${h.indicators.rojo} en rojo.`,
    `Cumplimiento del plan de SQA: ${pct(h.planCompliance === null ? null : h.planCompliance * 100)}.`,
    `Defectos críticos abiertos: ${h.criticalOpen ?? 'sin datos'}.`,
  ];
  if (h.cappedByCritical) {
    lines.push('El índice se limita a 79 mientras haya defectos críticos abiertos.');
  }
  if (red.length) {
    lines.push(`Atención: ${red.join(', ')} fuera de meta.`);
  }
  return lines.join(' ');
}
