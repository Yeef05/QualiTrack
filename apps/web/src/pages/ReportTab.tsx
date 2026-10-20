import { useState } from 'react';
import { api, errorMessage } from '../api/client';
import type { Health, HealthReport, Project } from '../api/types';
import { ErrorAlert } from '../components/Field';
import { HealthDonut, ProgressBar, StatusDot } from '../components/Status';
import { formatDate, formatPercent, formatValue, STATUS_LABEL, todayIso } from '../lib/format';
import { useApi } from '../lib/useApi';

function Bar({ label, value, text }: { label: string; value: number | null; text: string }) {
  return (
    <div className="bar-row">
      <div className="bar-label">
        <span>{label}</span>
        <span className="muted">{text}</span>
      </div>
      <ProgressBar value={value} label={label} />
    </div>
  );
}

function HealthBars({ health }: { health: Health }) {
  const { verde, amarillo, rojo } = health.indicators;
  const total = verde + amarillo + rojo;
  const critical = health.criticalOpen;
  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <Bar
        label="Indicadores en verde"
        value={total ? (verde / total) * 100 : null}
        text={`${verde} de ${total} (${amarillo} amarillo, ${rojo} rojo)`}
      />
      <Bar
        label="Cumplimiento plan SQA"
        value={health.planCompliance === null ? null : health.planCompliance * 100}
        text={formatPercent(health.planCompliance)}
      />
      <Bar
        label="Defectos críticos"
        value={critical === null ? null : critical === 0 ? 100 : 0}
        text={critical === null ? 'Sin datos' : `${critical} abiertos`}
      />
    </div>
  );
}

function OffTarget({ health }: { health: Health }) {
  const off = health.metrics.filter((m) => m.status === 'rojo' || m.status === 'amarillo');
  const planOff = health.planStatus !== null && health.planStatus !== 'verde';
  if (off.length === 0 && !planOff) {
    return <p className="muted">Todos los indicadores con datos están en meta.</p>;
  }
  return (
    <ul>
      {off.map(({ metric, latest, status }) => (
        <li key={metric.id}>
          <StatusDot status={status} label={`${metric.name}: ${formatValue(latest?.value ?? 0, metric.unit)}`} />
        </li>
      ))}
      {planOff && (
        <li>
          <StatusDot
            status={health.planStatus}
            label={`Cumplimiento del plan de técnicas: ${formatPercent(health.planCompliance)}`}
          />
        </li>
      )}
    </ul>
  );
}

/** Wireframe 4: reporte de salud exportable a PDF (M4). */
export function ReportTab({ project }: { project: Project }) {
  const health = useApi<Health>(`/projects/${project.id}/health`);
  const reports = useApi<HealthReport[]>(`/projects/${project.id}/reports`);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    try {
      await api(`/projects/${project.id}/reports`, { method: 'POST' });
      reports.reload();
      health.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!health.data) {
    return <ErrorAlert message={health.error} />;
  }
  const h = health.data;
  return (
    <>
      <ErrorAlert message={error ?? reports.error} />
      <div className="card">
        <h2>Reporte de salud · {project.name}</h2>
        <div className="donut-wrap">
          <div style={{ textAlign: 'center' }}>
            <HealthDonut index={h.index} level={h.level} />
            <div className="muted small">Índice de salud /100</div>
            {h.level && <StatusDot status={h.level} label={STATUS_LABEL[h.level]} />}
          </div>
          <HealthBars health={h} />
        </div>
        <h3>Métricas que requieren atención</h3>
        <OffTarget health={h} />
        <p className="muted small">
          Generado: {formatDate(todayIso())} · Periodo {project.period} · Cálculo: cada indicador vale verde 100,
          amarillo 50 y rojo 0, y se promedian (métricas activas y plan de técnicas). Con defectos críticos abiertos
          el índice no pasa de 79.
          {h.cappedByCritical && <strong> Este proyecto está limitado a 79 por defectos críticos.</strong>}
        </p>
        <div className="actions no-print">
          <button className="secondary" onClick={generate}>
            Guardar en historial
          </button>
          <button onClick={() => window.print()}>Exportar PDF</button>
        </div>
      </div>
      <div className="card">
        <h2>Historial de reportes</h2>
        {(reports.data ?? []).length === 0 ? (
          <div className="empty">Aún no se ha guardado ningún reporte.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Índice</th>
                <th>Resumen</th>
              </tr>
            </thead>
            <tbody>
              {(reports.data ?? []).map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.generatedAt)}</td>
                  <td>{r.healthIndex}</td>
                  <td className="small">{r.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
