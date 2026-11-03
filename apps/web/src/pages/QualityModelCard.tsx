import { useState, type FormEvent } from 'react';
import { api, errorMessage, fieldErrors } from '../api/client';
import type { Direction, Metric, ProjectMetric } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert, Field } from '../components/Field';
import { canManage, formatBest, formatWorst } from '../lib/format';
import { useApi } from '../lib/useApi';

interface ThresholdProps {
  label: string;
  value: string;
  shown: string;
  canEdit: boolean;
  onChange: (value: string) => void;
}

/** Valor peor o mejor: editable para el Líder de QA, de solo lectura para los demás. */
function ThresholdCell({ label, value, shown, canEdit, onChange }: ThresholdProps) {
  if (!canEdit) {
    return <td>{shown}</td>;
  }
  return (
    <td>
      <input type="number" step="any" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </td>
  );
}

interface RowProps {
  projectId: number;
  metric: ProjectMetric;
  canEdit: boolean;
  onSaved: () => void;
}

/** Una métrica del modelo: el Líder de QA la activa y ajusta peor y mejor solo para este proyecto. */
function ModelRow({ projectId, metric, canEdit, onSaved }: RowProps) {
  const [worst, setWorst] = useState(String(metric.worst));
  const [best, setBest] = useState(String(metric.best));
  const [active, setActive] = useState(metric.active);
  const [message, setMessage] = useState<string | null>(null);
  const path = `/projects/${projectId}/model/${metric.id}`;

  async function run(request: () => Promise<unknown>) {
    setMessage(null);
    try {
      await request();
      onSaved();
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  const save = () => run(() => api(path, { method: 'PUT', body: { worst: Number(worst), best: Number(best), active } }));
  const reset = () => run(() => api(path, { method: 'DELETE' }));

  return (
    <tr className={metric.active ? undefined : 'inactive'}>
      <td>
        <input
          type="checkbox"
          aria-label={`Activa: ${metric.name}`}
          checked={active}
          disabled={!canEdit}
          onChange={(e) => setActive(e.target.checked)}
        />
      </td>
      <td>
        {metric.name} {metric.customized && <span className="badge">Ajustada</span>}
        <div className="muted small">{metric.criterion || '—'}</div>
      </td>
      <ThresholdCell label={`Peor: ${metric.name}`} value={worst} shown={formatWorst(metric)} canEdit={canEdit} onChange={setWorst} />
      <ThresholdCell label={`Mejor: ${metric.name}`} value={best} shown={formatBest(metric)} canEdit={canEdit} onChange={setBest} />
      <td className="small">{metric.description || '—'}</td>
      <td className="small">{metric.source || '—'}</td>
      {canEdit && (
        <td>
          <div className="actions">
            <button className="secondary" onClick={save}>
              Guardar
            </button>
            {metric.customized && (
              <button className="ghost" onClick={reset}>
                Restaurar
              </button>
            )}
          </div>
          {message && <span className="field-error">{message}</span>}
        </td>
      )}
    </tr>
  );
}

const EMPTY_METRIC = { code: '', name: '', unit: '', direction: 'mayor' as Direction, worst: '', best: '', criterion: '', source: '' };

/** A3.1: métrica propia del equipo. Se crea inactiva en el catálogo y se activa solo en este proyecto. */
function OwnMetricForm({ projectId, onSaved }: { projectId: number; onSaved: () => void }) {
  const [values, setValues] = useState(EMPTY_METRIC);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const set = (key: keyof typeof EMPTY_METRIC) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    try {
      const thresholds = { worst: Number(values.worst), best: Number(values.best) };
      const created = await api<Metric>('/metrics', { method: 'POST', body: { ...values, ...thresholds, active: false } });
      await api(`/projects/${projectId}/model/${created.id}`, { method: 'PUT', body: { ...thresholds, active: true } });
      setValues(EMPTY_METRIC);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(errorMessage(err));
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorAlert message={message} />
      <div className="form-row">
        <Field label="Código" error={errors.code}>
          <input value={values.code} onChange={set('code')} placeholder="tiempo_respuesta" />
        </Field>
        <Field label="Nombre" error={errors.name}>
          <input value={values.name} onChange={set('name')} />
        </Field>
        <Field label="Unidad" error={errors.unit}>
          <input value={values.unit} onChange={set('unit')} placeholder="%, ms, días…" />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Es mejor si es">
          <select value={values.direction} onChange={set('direction')}>
            <option value="mayor">Mayor</option>
            <option value="menor">Menor</option>
          </select>
        </Field>
        <Field label="Valor peor" error={errors.worst}>
          <input type="number" step="any" value={values.worst} onChange={set('worst')} />
        </Field>
        <Field label="Valor mejor" error={errors.best}>
          <input type="number" step="any" value={values.best} onChange={set('best')} />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Factor · criterio (ISO/IEC 25010)" error={errors.criterion}>
          <input value={values.criterion} onChange={set('criterion')} placeholder="Eficiencia de desempeño · tiempo" />
        </Field>
        <Field label="De dónde salen peor y mejor" error={errors.source}>
          <input value={values.source} onChange={set('source')} />
        </Field>
      </div>
      <div className="actions">
        <button type="submit">+ Agregar métrica propia</button>
      </div>
    </form>
  );
}

/** CU-03: modelo de calidad del proyecto. Cada proyecto guarda el suyo (RF-14). */
export function QualityModelCard({ projectId, onChanged }: { projectId: number; onChanged: () => void }) {
  const { user } = useAuth();
  const canEdit = canManage(user?.role);
  const model = useApi<ProjectMetric[]>(`/projects/${projectId}/model`);
  const rows = (model.data ?? []).filter((m) => canEdit || m.active);
  const saved = () => {
    model.reload();
    onChanged();
  };
  return (
    <div className="card">
      <h2>Modelo de calidad</h2>
      <p className="muted small">
        Verde si llega al valor mejor, amarillo entre el peor y el mejor, rojo si es peor que el peor (modelo definido).
        {canEdit && ' Los cambios aplican solo a este proyecto; "Restaurar" regresa a los valores del catálogo.'}
      </p>
      <ErrorAlert message={model.error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Activa</th>
              <th>Métrica · factor</th>
              <th>Peor</th>
              <th>Mejor</th>
              <th>Cómo se calcula</th>
              <th>Por qué esos valores</th>
              {canEdit && <th />}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <ModelRow
                key={`${m.id}-${m.worst}-${m.best}-${m.active}`}
                projectId={projectId}
                metric={m}
                canEdit={canEdit}
                onSaved={saved}
              />
            ))}
          </tbody>
        </table>
      </div>
      {canEdit && (
        <div className="no-print">
          <h3>Agregar una métrica propia</h3>
          <OwnMetricForm projectId={projectId} onSaved={saved} />
        </div>
      )}
    </div>
  );
}
