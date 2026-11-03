import { useState, type FormEvent } from 'react';
import { api, errorMessage, fieldErrors } from '../api/client';
import type { Defect, DefectSummary, FoundBy, Project, Severity } from '../api/types';
import { ErrorAlert, Field } from '../components/Field';
import { StatusDot } from '../components/Status';
import { formatDate, formatNumber, FOUND_BY_LABEL, SEVERITY_LABEL, todayIso, TSP_TYPE_LABEL } from '../lib/format';
import { useApi } from '../lib/useApi';

interface DefectsResponse {
  items: Defect[];
  summary: DefectSummary;
}

const show = (value: number | null, suffix = '') => (value === null ? '—' : `${formatNumber(value)}${suffix}`);

/** Las 4 métricas del modelo que calcula el registro (RF-37); también alimentan la pestaña Métricas. */
function DefectKpis({ summary, deliveredStories }: { summary: DefectSummary; deliveredStories: number }) {
  const kpis: [string, string, string][] = [
    ['Críticos abiertos', show(summary.criticalOpen), `${summary.open} abiertos de ${summary.total}`],
    ['Densidad de defectos', show(summary.density), `${summary.total} ÷ ${deliveredStories} historias entregadas`],
    [
      'Eficiencia de QA',
      show(summary.qaEfficiency, ' %'),
      `A ${summary.byFinder.equipo} · B ${summary.byFinder.cliente} · C ${summary.byFinder.usuario}`,
    ],
    ['Tiempo medio de corrección', show(summary.meanFixDays, ' días'), 'De registro a cierre'],
  ];
  return (
    <div className="grid grid-4">
      {kpis.map(([label, value, detail]) => (
        <div key={label} className="card kpi">
          <div className="label">{label}</div>
          <div className="value">{value}</div>
          <div className="muted small">{detail}</div>
        </div>
      ))}
    </div>
  );
}

function DefectForm({ projectId, onSaved }: { projectId: number; onSaved: () => void }) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('mayor');
  const [tspType, setTspType] = useState(80);
  const [foundBy, setFoundBy] = useState<FoundBy>('equipo');
  const [foundOn, setFoundOn] = useState(todayIso());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    try {
      const body = { description, severity, tspType, foundBy, foundOn };
      await api(`/projects/${projectId}/defects`, { method: 'POST', body });
      setDescription('');
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(errorMessage(err));
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorAlert message={message} />
      <Field label="Descripción" error={errors.description}>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qué falla y dónde" />
      </Field>
      <div className="form-row">
        <Field label="Gravedad">
          <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
            {Object.entries(SEVERITY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo TSP" error={errors.tspType}>
          <select value={tspType} onChange={(e) => setTspType(Number(e.target.value))}>
            {Object.entries(TSP_TYPE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {key} {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lo encontró">
          <select value={foundBy} onChange={(e) => setFoundBy(e.target.value as FoundBy)}>
            {Object.entries(FOUND_BY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha" error={errors.foundOn}>
          <input type="date" value={foundOn} max={todayIso()} onChange={(e) => setFoundOn(e.target.value)} />
        </Field>
      </div>
      <div className="actions">
        <button type="submit">+ Registrar defecto</button>
      </div>
    </form>
  );
}

function CloseButton({ projectId, defect, onSaved }: { projectId: number; defect: Defect; onSaved: () => void }) {
  const [closedOn, setClosedOn] = useState(todayIso());
  const [message, setMessage] = useState<string | null>(null);

  async function close() {
    setMessage(null);
    try {
      await api(`/projects/${projectId}/defects/${defect.id}/close`, { method: 'POST', body: { closedOn } });
      onSaved();
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  return (
    <div className="actions">
      <input
        type="date"
        aria-label={`Fecha de cierre del defecto ${defect.id}`}
        value={closedOn}
        min={defect.foundOn}
        max={todayIso()}
        onChange={(e) => setClosedOn(e.target.value)}
      />
      <button className="secondary" onClick={close}>
        Cerrar
      </button>
      {message && <span className="field-error">{message}</span>}
    </div>
  );
}

interface TableProps {
  projectId: number;
  defects: Defect[];
  canClose: boolean;
  onSaved: () => void;
}

function DefectsTable({ projectId, defects, canClose, onSaved }: TableProps) {
  if (defects.length === 0) {
    return <div className="empty">Aún no hay defectos registrados. Mientras tanto, las métricas se capturan a mano.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Gravedad</th>
            <th>Tipo TSP</th>
            <th>Lo encontró</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {defects.map((d) => (
            <tr key={d.id}>
              <td>{formatDate(d.foundOn)}</td>
              <td>{d.description}</td>
              <td>{SEVERITY_LABEL[d.severity]}</td>
              <td>
                {d.tspType} {TSP_TYPE_LABEL[d.tspType]}
              </td>
              <td className="small">{FOUND_BY_LABEL[d.foundBy]}</td>
              <td>
                {d.closedOn ? (
                  <StatusDot status="verde" label={`Cerrado ${formatDate(d.closedOn)}`} />
                ) : canClose ? (
                  <CloseButton projectId={projectId} defect={d} onSaved={onSaved} />
                ) : (
                  <StatusDot status={d.severity === 'critica' ? 'rojo' : 'amarillo'} label="Abierto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** CU-11: registro de defectos del proyecto. Cualquier integrante registra y cierra. */
export function DefectsTab({ project }: { project: Project }) {
  const defects = useApi<DefectsResponse>(`/projects/${project.id}/defects`);
  return (
    <>
      <ErrorAlert message={defects.error} />
      {defects.data && <DefectKpis summary={defects.data.summary} deliveredStories={project.deliveredStories} />}
      {project.deliveredStories === 0 && (
        <p className="muted small">
          Para calcular la densidad, captura las historias entregadas al editar el proyecto.
        </p>
      )}
      <div className="card">
        <h2>Registro de defectos</h2>
        <DefectsTable
          projectId={project.id}
          defects={defects.data?.items ?? []}
          canClose={!project.archived}
          onSaved={defects.reload}
        />
      </div>
      {!project.archived && (
        <div className="card no-print">
          <h2>Registrar defecto</h2>
          <DefectForm projectId={project.id} onSaved={defects.reload} />
        </div>
      )}
    </>
  );
}
