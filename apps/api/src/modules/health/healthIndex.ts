import type { Status } from '../metrics/status';

/**
 * Índice de salud (0 a 100) del Entregable 1: combina
 * - métricas en meta (50 %): verde = 100, amarillo = 60, rojo = 0;
 * - cumplimiento del plan de SQA (30 %);
 * - defectos críticos abiertos (20 %): 100 menos 25 puntos por cada defecto.
 * Si falta un componente, su peso se reparte entre los demás.
 */
export const WEIGHTS = { metrics: 0.5, plan: 0.3, defects: 0.2 } as const;
const STATUS_POINTS: Record<Status, number> = { verde: 100, amarillo: 60, rojo: 0 };

export interface HealthInput {
  statuses: Status[];
  planCompliance: number | null;
  criticalOpen: number | null;
}

export interface HealthResult {
  index: number | null;
  level: Status | null;
  metricsScore: number | null;
  planScore: number | null;
  defectsScore: number | null;
}

export function levelFor(index: number): Status {
  if (index >= 80) return 'verde';
  return index >= 60 ? 'amarillo' : 'rojo';
}

export function computeHealth(input: HealthInput): HealthResult {
  const metricsScore = input.statuses.length
    ? input.statuses.reduce((sum, s) => sum + STATUS_POINTS[s], 0) / input.statuses.length
    : null;
  const planScore = input.planCompliance === null ? null : Math.min(100, Math.max(0, input.planCompliance * 100));
  const defectsScore = input.criticalOpen === null ? null : Math.max(0, 100 - 25 * input.criticalOpen);

  const parts: [number | null, number][] = [
    [metricsScore, WEIGHTS.metrics],
    [planScore, WEIGHTS.plan],
    [defectsScore, WEIGHTS.defects],
  ];
  const present = parts.filter((p): p is [number, number] => p[0] !== null);
  if (present.length === 0) {
    return { index: null, level: null, metricsScore, planScore, defectsScore };
  }
  const totalWeight = present.reduce((sum, [, w]) => sum + w, 0);
  const index = Math.round(present.reduce((sum, [score, w]) => sum + score * w, 0) / totalWeight);
  return { index, level: levelFor(index), metricsScore, planScore, defectsScore };
}
