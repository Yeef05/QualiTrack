import { useState, type FormEvent } from 'react';
import { api, errorMessage, fieldErrors } from '../api/client';
import type { Execution, ExecutionResult, Frequency, PlanItem, Technique } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert, Field } from '../components/Field';
import { ProgressBar, StatusDot } from '../components/Status';
import { canManage, formatDate, formatPercent, FREQUENCY_LABEL, KIND_LABEL, RESULT_LABEL, todayIso } from '../lib/format';
import { useApi } from '../lib/useApi';

interface Plan {
  items: PlanItem[];
  compliance: number | null;
}

function PlanTable({ items, onRemove }: { items: PlanItem[]; onRemove?: (item: PlanItem) => void }) {
  if (items.length === 0) {
    return <div className="empty">El plan de SQA todavía no tiene técnicas.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Técnica</th>
            <th>Tipo</th>
            <th>Frecuencia</th>
            <th>Última</th>
            <th>Ejecuciones</th>
            <th>Hallazgos</th>
            <th>Estado</th>
            {onRemove && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.techniqueName}</td>
              <td>{KIND_LABEL[item.kind]}</td>
              <td>{FREQUENCY_LABEL[item.frequency]}</td>
              <td>{formatDate(item.lastExecutedOn)}</td>
              <td>{item.executions}</td>
              <td>{item.findings}</td>
              <td>
                <StatusDot status={item.upToDate ? 'verde' : 'rojo'} label={item.upToDate ? 'Al día' : 'Atrasada'} />
              </td>
              {onRemove && (
                <td>
                  <button className="ghost" onClick={() => onRemove(item)} aria-label={`Quitar ${item.techniqueName}`}>
                    Quitar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddPlanForm({ projectId, techniques, onSaved }: { projectId: number; techniques: Technique[]; onSaved: () => void }) {
  const [techniqueId, setTechniqueId] = useState(techniques[0]?.id);
  const [frequency, setFrequency] = useState<Frequency>('por_pr');
  const [responsible, setResponsible] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await api(`/projects/${projectId}/plan`, { method: 'POST', body: { techniqueId, frequency, responsible } });
      onSaved();
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  if (techniques.length === 0) {
    return <p className="muted small">Todas las técnicas del catálogo ya están en el plan.</p>;
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorAlert message={message} />
      <div className="form-row">
        <Field label="Técnica">
          <select value={techniqueId} onChange={(e) => setTechniqueId(Number(e.target.value))}>
            {techniques.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({KIND_LABEL[t.kind]})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Frecuencia">
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
            {Object.entries(FREQUENCY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsable">
          <input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </Field>
      </div>
      <div className="actions">
        <button type="submit">Agregar al plan</button>
      </div>
    </form>
  );
}

function ExecutionForm({ projectId, items, onSaved }: { projectId: number; items: PlanItem[]; onSaved: () => void }) {
  const { user } = useAuth();
  const [planId, setPlanId] = useState(items[0]?.id);
  const [executedOn, setExecutedOn] = useState(todayIso());
  const [responsible, setResponsible] = useState(user?.name ?? '');
  const [result, setResult] = useState<ExecutionResult>('aprobada');
  const [findings, setFindings] = useState('0');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    try {
      const body = { executedOn, responsible, result, findings: Number(findings), notes };
      await api(`/projects/${projectId}/plan/${planId}/executions`, { method: 'POST', body });
      setNotes('');
      setFindings('0');
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
        <Field label="Técnica">
          <select value={planId} onChange={(e) => setPlanId(Number(e.target.value))}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.techniqueName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha" error={errors.executedOn}>
          <input type="date" value={executedOn} max={todayIso()} onChange={(e) => setExecutedOn(e.target.value)} />
        </Field>
        <Field label="Responsable" error={errors.responsible}>
          <input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Resultado">
          <select value={result} onChange={(e) => setResult(e.target.value as ExecutionResult)}>
            {Object.entries(RESULT_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hallazgos" error={errors.findings}>
          <input type="number" min={0} value={findings} onChange={(e) => setFindings(e.target.value)} />
        </Field>
        <Field label="Notas" error={errors.notes}>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
      <div className="actions">
        <button type="submit">+ Registrar ejecución</button>
      </div>
    </form>
  );
}

function ExecutionsTable({ executions }: { executions: Execution[] }) {
  if (executions.length === 0) {
    return <div className="empty">Aún no hay ejecuciones registradas.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Técnica</th>
            <th>Responsable</th>
            <th>Resultado</th>
            <th>Hallazgos</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.executedOn)}</td>
              <td>{e.techniqueName}</td>
              <td>{e.responsible}</td>
              <td>{RESULT_LABEL[e.result]}</td>
              <td>{e.findings}</td>
              <td>{e.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplianceCard({ compliance, items, onRemove }: { compliance: number | null; items: PlanItem[]; onRemove?: (item: PlanItem) => void }) {
  return (
    <div className="card">
      <div className="bar-row">
        <div className="bar-label">
          <strong>Cumplimiento del plan</strong>
          <span>{formatPercent(compliance)}</span>
        </div>
        <ProgressBar value={(compliance ?? 0) * 100} label="Cumplimiento del plan" />
      </div>
      <PlanTable items={items} onRemove={onRemove} />
    </div>
  );
}

function useTechniquesData(projectId: number) {
  const plan = useApi<Plan>(`/projects/${projectId}/plan`);
  const executions = useApi<Execution[]>(`/projects/${projectId}/executions`);
  const catalog = useApi<Technique[]>('/techniques');
  const items = plan.data?.items ?? [];
  const available = (catalog.data ?? []).filter((t) => !items.some((i) => i.techniqueId === t.id));
  const refresh = () => {
    plan.reload();
    executions.reload();
  };
  return {
    items,
    available,
    catalogLoaded: catalog.data !== null,
    compliance: plan.data?.compliance ?? null,
    executions: executions.data ?? [],
    loadError: plan.error ?? executions.error,
    refresh,
  };
}

/** Wireframe 3: plan de técnicas de SQA y sus ejecuciones (M3). */
export function TechniquesTab({ projectId }: { projectId: number }) {
  const { user } = useAuth();
  const manager = canManage(user?.role);
  const { items, available, catalogLoaded, compliance, executions, loadError, refresh } = useTechniquesData(projectId);
  const [error, setError] = useState<string | null>(null);

  async function remove(item: PlanItem) {
    if (!window.confirm(`¿Quitar ${item.techniqueName} del plan? Se borrarán sus ejecuciones.`)) return;
    try {
      await api(`/projects/${projectId}/plan/${item.id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <ErrorAlert message={error ?? loadError} />
      <ComplianceCard compliance={compliance} items={items} onRemove={manager ? remove : undefined} />
      {manager && (
        <div className="card no-print">
          <h2>Agregar técnica al plan</h2>
          {catalogLoaded && <AddPlanForm key={available.length} projectId={projectId} techniques={available} onSaved={refresh} />}
        </div>
      )}
      {items.length > 0 && (
        <div className="card no-print">
          <h2>Registrar ejecución</h2>
          <ExecutionForm key={items.length} projectId={projectId} items={items} onSaved={refresh} />
        </div>
      )}
      <div className="card">
        <h2>Historial de ejecuciones</h2>
        <ExecutionsTable executions={executions} />
      </div>
    </>
  );
}
