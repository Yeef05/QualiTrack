import type { Status } from '../api/types';
import { STATUS_LABEL } from '../lib/format';

export function StatusDot({ status, label }: { status: Status | null; label?: string }) {
  const text = label ?? (status ? STATUS_LABEL[status] : 'Sin datos');
  return (
    <span className="status">
      <span className={`dot ${status ?? ''}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

export function HealthBadge({ index, level }: { index: number | null; level: Status | null }) {
  return <StatusDot status={level} label={index === null ? 'Sin datos' : `${index}/100`} />;
}

export function ProgressBar({ value, label }: { value: number | null; label: string }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

const DONUT_COLORS: Record<Status, string> = { verde: '#16a34a', amarillo: '#f59e0b', rojo: '#dc2626' };

/** Dona del índice de salud, en SVG para que se imprima bien en el PDF. */
export function HealthDonut({ index, level }: { index: number | null; level: Status | null }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = ((index ?? 0) / 100) * circumference;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Índice de salud ${index ?? 'sin datos'}`}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#e9edf3" strokeWidth="14" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={level ? DONUT_COLORS[level] : '#c4cad4'}
        strokeWidth="14"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1d2433">
        {index ?? '—'}
      </text>
    </svg>
  );
}
