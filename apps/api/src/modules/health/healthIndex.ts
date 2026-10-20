import { evaluate, type Status, type Thresholds } from '../metrics/status';

/**
 * Índice de salud (0 a 100), ADR-004. Es la regla de la hoja del Entregable 1:
 * cada indicador vale verde = 100, amarillo = 50, rojo = 0, y el índice es el promedio.
 * Indicadores: las métricas activas con medición y el cumplimiento del plan de técnicas.
 * Un defecto crítico abierto bloquea la entrega (Plan SQA §8): mientras haya uno, el índice no pasa de 79.
 */
export const POINTS: Record<Status, number> = { verde: 100, amarillo: 50, rojo: 0 };

/** Cumplimiento del plan de técnicas, en %: verde ≥ 90 (Entregable 1), rojo < 70 ("Suficiente" de la rúbrica). */
export const PLAN_THRESHOLDS: Thresholds = { worst: 70, best: 90, direction: 'mayor' };

/** Índice máximo mientras haya defectos críticos abiertos (justo debajo del verde). */
export const CRITICAL_CAP = 79;

export interface HealthInput {
  statuses: Status[];
  /** Fracción de 0 a 1, o null si el proyecto no tiene plan de técnicas. */
  planCompliance: number | null;
  criticalOpen: number | null;
}

export interface HealthResult {
  index: number | null;
  level: Status | null;
  /** Cuántos indicadores hay en cada color (métricas + plan). */
  indicators: Record<Status, number>;
  planStatus: Status | null;
  cappedByCritical: boolean;
}

export function levelFor(index: number): Status {
  if (index >= 80) return 'verde';
  return index >= 50 ? 'amarillo' : 'rojo';
}

export function computeHealth(input: HealthInput): HealthResult {
  const planStatus = input.planCompliance === null ? null : evaluate(input.planCompliance * 100, PLAN_THRESHOLDS);
  const all = planStatus ? [...input.statuses, planStatus] : input.statuses;
  const indicators: Record<Status, number> = { verde: 0, amarillo: 0, rojo: 0 };
  for (const s of all) {
    indicators[s] += 1;
  }
  if (all.length === 0) {
    return { index: null, level: null, indicators, planStatus, cappedByCritical: false };
  }
  const average = Math.round(all.reduce((sum, s) => sum + POINTS[s], 0) / all.length);
  const cappedByCritical = (input.criticalOpen ?? 0) > 0 && average > CRITICAL_CAP;
  const index = cappedByCritical ? CRITICAL_CAP : average;
  return { index, level: levelFor(index), indicators, planStatus, cappedByCritical };
}
