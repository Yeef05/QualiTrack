import type { ExecutionResult, Frequency, Metric, Role, Status, TechniqueKind } from '../api/types';

export const STATUS_LABEL: Record<Status, string> = {
  verde: 'En meta',
  amarillo: 'En riesgo',
  rojo: 'Fuera de meta',
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  por_pr: 'Por PR',
  semanal: 'Semanal',
  por_checkin: 'Por check-in',
  mensual: 'Mensual',
};

export const RESULT_LABEL: Record<ExecutionResult, string> = {
  aprobada: 'Aprobada',
  con_hallazgos: 'Con hallazgos',
  rechazada: 'Rechazada',
};

export const KIND_LABEL: Record<TechniqueKind, string> = {
  estatica: 'Estática',
  dinamica: 'Dinámica',
  proceso: 'Proceso',
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  lider_qa: 'Líder QA',
  miembro: 'Miembro',
};

export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function formatValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${formatNumber(value)} %`;
  }
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

export function formatTarget(metric: Pick<Metric, 'direction' | 'target' | 'unit'>): string {
  const sign = metric.direction === 'mayor' ? '≥' : '≤';
  return `${sign} ${formatValue(metric.target, metric.unit)}`;
}

/**
 * Fecha a dd/mm/aaaa. Una fecha AAAA-MM-DD se muestra tal cual; un instante con hora (por ejemplo,
 * cuándo se guardó un reporte) se pasa al día local, porque cortar el texto UTC adelanta un día
 * después de las 18:00 en México (DEF-003).
 */
export function formatDate(iso: string | null, timeZone?: string): string {
  if (!iso) {
    return '—';
  }
  const day = iso.length > 10 ? localDay(new Date(iso), timeZone) : iso;
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}`;
}

function localDay(date: Date, timeZone?: string): string {
  // en-CA formatea como AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function formatPercent(fraction: number | null): string {
  return fraction === null ? 'Sin datos' : `${Math.round(fraction * 100)} %`;
}

export function average(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  if (present.length === 0) {
    return null;
  }
  return Math.round(present.reduce((a, b) => a + b, 0) / present.length);
}

export function sum(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

export function todayIso(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Ruta de la lista de proyectos del dashboard. */
export function projectsQuery(period: string | null, includeArchived: boolean): string {
  const params = new URLSearchParams({ archived: String(includeArchived) });
  if (period) {
    params.set('period', period);
  }
  return `/projects?${params.toString()}`;
}

export const canManage =(role: Role | undefined) => role === 'admin' || role === 'lider_qa';
