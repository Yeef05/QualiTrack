import { daysBetween } from '../../validation';

export type Severity = 'critica' | 'mayor' | 'menor' | 'cosmetica';
/** A = equipo, B = cliente en una revisión, C = usuario después de entregar (lámina 47). */
export type FoundBy = 'equipo' | 'cliente' | 'usuario';

export interface DefectFacts {
  severity: Severity;
  foundBy: FoundBy;
  foundOn: string;
  closedOn: string | null;
}

/** Las 4 métricas del modelo (ADR-004) que salen del registro de defectos (RF-37). */
export interface DefectMetrics {
  total: number;
  open: number;
  criticalOpen: number;
  /** Defectos conocidos ÷ historias entregadas (RF-38); null si el proyecto no tiene historias entregadas. */
  density: number | null;
  /** A ÷ (A + B + C) × 100; null si no hay defectos. */
  qaEfficiency: number | null;
  /** Días promedio de registro a cierre; null si ninguno está cerrado. */
  meanFixDays: number | null;
  byFinder: Record<FoundBy, number>;
}

const round = (n: number, decimals: number) => Math.round(n * 10 ** decimals) / 10 ** decimals;

function meanFixDays(defects: DefectFacts[]): number | null {
  const days = defects.flatMap((d) => (d.closedOn ? [daysBetween(d.foundOn, d.closedOn)] : []));
  return days.length ? round(days.reduce((a, b) => a + b, 0) / days.length, 1) : null;
}

export function defectMetrics(defects: DefectFacts[], deliveredStories: number): DefectMetrics {
  const byFinder: Record<FoundBy, number> = { equipo: 0, cliente: 0, usuario: 0 };
  for (const d of defects) {
    byFinder[d.foundBy] += 1;
  }
  const open = defects.filter((d) => d.closedOn === null);
  const total = defects.length;
  return {
    total,
    open: open.length,
    criticalOpen: open.filter((d) => d.severity === 'critica').length,
    density: deliveredStories > 0 ? round(total / deliveredStories, 2) : null,
    qaEfficiency: total > 0 ? round((byFinder.equipo / total) * 100, 1) : null,
    meanFixDays: meanFixDays(defects),
    byFinder,
  };
}

/** Código de la métrica del catálogo → valor calculado del registro. */
export function derivedValues(m: DefectMetrics): Record<string, number | null> {
  return {
    densidad_defectos: m.density,
    defectos_criticos: m.criticalOpen,
    eficiencia_qa: m.qaEfficiency,
    tiempo_correccion: m.meanFixDays,
  };
}
