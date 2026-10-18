import { useState, type FormEvent } from 'react';
import { api, errorMessage, fieldErrors } from '../api/client';
import type { Measurement, Metric, MetricStatus } from '../api/types';
import { ErrorAlert, Field } from '../components/Field';
import { StatusDot } from '../components/Status';
import { TrendChart } from '../components/TrendChart';
import { formatDate, formatTarget, formatValue, todayIso } from '../lib/format';
import { useApi } from '../lib/useApi';

function MetricsTable({ statuses }: { statuses: MetricStatus[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Meta</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(({ metric, latest, status }) => (
            <tr key={metric.id}>
              <td>{metric.name}</td>
              <td>{latest ? formatValue(latest.value, metric.unit) : '—'}</td>
              <td>{formatTarget(metric)}</td>
              <td>
                <StatusDot status={status} />
              </td>
              <td>{formatDate(latest?.measuredOn ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FormProps {
  projectId: number;
  metrics: Metric[];
  defaultMetricId?: number;
  onSaved: () => void;
}

function MeasurementForm({ projectId, metrics, defaultMetricId, onSaved }: FormProps) {
  const [metricId, setMetricId] = useState(defaultMetricId ?? metrics[0]?.id);
  const [value, setValue] = useState('');
  const [measuredOn, setMeasuredOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setSaved(false);
    try {
      const body = { metricId, value: value === '' ? undefined : Number(value), measuredOn, note };
      await api(`/projects/${projectId}/measurements`, { method: 'POST', body });
      setValue('');
      setNote('');
      setSaved(true);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(errorMessage(err));
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorAlert message={message} />
      {saved && <div className="alert success">Medición registrada.</div>}
      <div className="form-row">
        <Field label="Métrica" error={errors.metricId}>
          <select value={metricId} onChange={(e) => setMetricId(Number(e.target.value))}>
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor" error={errors.value}>
          <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required />
        </Field>
        <Field label="Fecha" error={errors.measuredOn}>
          <input type="date" value={measuredOn} max={todayIso()} onChange={(e) => setMeasuredOn(e.target.value)} />
        </Field>
      </div>
      <Field label="Nota (opcional)" error={errors.note}>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. después de la revisión del sprint" />
      </Field>
      <div className="actions">
        <button type="submit">+ Registrar medición</button>
      </div>
    </form>
  );
}

interface TrendCardProps {
  list: MetricStatus[];
  selected: MetricStatus | undefined;
  history: Measurement[] | null;
  onSelect: (metricId: number) => void;
}

function TrendCard({ list, selected, history, onSelect }: TrendCardProps) {
  return (
    <div className="card">
      <div className="page-header">
        <h2>Tendencia</h2>
        <select
          aria-label="Métrica de la gráfica"
          value={selected?.metric.id ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
        >
          {list.map((s) => (
            <option key={s.metric.id} value={s.metric.id}>
              {s.metric.name}
            </option>
          ))}
        </select>
      </div>
      {selected && history && <TrendChart metric={selected.metric} measurements={history} />}
    </div>
  );
}

function useMetricsData(projectId: number) {
  const statuses = useApi<MetricStatus[]>(`/projects/${projectId}/metrics-status`);
  const [metricId, setMetricId] = useState<number | null>(null);
  const list = statuses.data ?? [];
  const selected = list.find((s) => s.metric.id === metricId) ?? list.find((s) => s.metric.code === 'cobertura') ?? list[0];
  const history = useApi<Measurement[]>(
    selected ? `/projects/${projectId}/measurements?metricId=${selected.metric.id}` : null,
  );
  const refresh = () => {
    statuses.reload();
    history.reload();
  };
  return { list, selected, history, setMetricId, refresh, error: statuses.error ?? history.error };
}

/** Wireframe 2: métricas de calidad del proyecto (M2). */
export function MetricsTab({ projectId, archived }: { projectId: number; archived: boolean }) {
  const { list, selected, history, setMetricId, refresh, error } = useMetricsData(projectId);
  return (
    <>
      <ErrorAlert message={error} />
      <TrendCard list={list} selected={selected} history={history.data} onSelect={setMetricId} />
      <div className="card">
        <h2>Estado actual</h2>
        <MetricsTable statuses={list} />
      </div>
      {!archived && list.length > 0 && (
        <div className="card no-print">
          <h2>Registrar medición</h2>
          <MeasurementForm
            projectId={projectId}
            metrics={list.map((s) => s.metric)}
            defaultMetricId={selected?.metric.id}
            onSaved={refresh}
          />
        </div>
      )}
    </>
  );
}
