import { useState, type FormEvent } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import type { ProjectInput } from '../api/types';
import { ErrorAlert, Field } from './Field';

const EMPTY: ProjectInput = {
  name: '',
  description: '',
  period: '',
  repositoryUrl: '',
  team: '',
  qaLead: '',
  deliveredStories: 0,
};

interface Props {
  initial?: Partial<ProjectInput>;
  submitLabel: string;
  onSubmit: (input: ProjectInput) => Promise<void>;
  onCancel: () => void;
}

/** Alta y edición de proyectos (M1). Muestra los errores de validación que devuelve la API. */
export function ProjectForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ProjectInput>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof ProjectInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorAlert message={message} />
      <div className="form-row">
        <Field label="Nombre del proyecto" error={errors.name}>
          <input value={values.name} onChange={set('name')} required />
        </Field>
        <Field label="Periodo (AAAA-1 o AAAA-2)" error={errors.period}>
          <input value={values.period} onChange={set('period')} placeholder="2026-2" required />
        </Field>
      </div>
      <Field label="Descripción" error={errors.description}>
        <textarea value={values.description} onChange={set('description')} rows={2} />
      </Field>
      <div className="form-row">
        <Field label="Repositorio (URL)" error={errors.repositoryUrl}>
          <input value={values.repositoryUrl} onChange={set('repositoryUrl')} placeholder="https://github.com/..." />
        </Field>
        <Field label="Equipo" error={errors.team}>
          <input value={values.team} onChange={set('team')} />
        </Field>
        <Field label="Responsable de QA" error={errors.qaLead}>
          <input value={values.qaLead} onChange={set('qaLead')} />
        </Field>
        <Field label="Historias entregadas" error={errors.deliveredStories}>
          <input
            type="number"
            min={0}
            value={values.deliveredStories}
            onChange={(e) => setValues((v) => ({ ...v, deliveredStories: Number(e.target.value) }))}
          />
        </Field>
      </div>
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : submitLabel}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
