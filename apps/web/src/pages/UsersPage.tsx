import { useState, type FormEvent } from 'react';
import { api, errorMessage, fieldErrors } from '../api/client';
import type { Role, User } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert, Field } from '../components/Field';
import { ROLE_LABEL } from '../lib/format';
import { useApi } from '../lib/useApi';

const EMPTY = { name: '', email: '', password: '', role: 'miembro' as Role };

function UserForm({ onSaved }: { onSaved: () => void }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setSaved(null);
    try {
      const user = await api<User>('/users', { method: 'POST', body: values });
      setValues(EMPTY);
      setSaved(`${user.name} ya puede iniciar sesión como ${ROLE_LABEL[user.role]}.`);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(errorMessage(err));
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorAlert message={message} />
      {saved && <div className="alert success">{saved}</div>}
      <div className="form-row">
        <Field label="Nombre" error={errors.name}>
          <input value={values.name} onChange={set('name')} />
        </Field>
        <Field label="Correo" error={errors.email}>
          <input type="email" value={values.email} onChange={set('email')} />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Contraseña inicial" error={errors.password}>
          <input type="password" autoComplete="new-password" value={values.password} onChange={set('password')} />
        </Field>
        <Field label="Rol" error={errors.role}>
          <select value={values.role} onChange={set('role')}>
            {Object.entries(ROLE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="actions">
        <button type="submit">+ Dar acceso</button>
      </div>
    </form>
  );
}

/** CU-10: el Administrador da acceso a un integrante con su rol (RF-34). */
export function UsersPage() {
  const { user } = useAuth();
  const users = useApi<User[]>(user?.role === 'admin' ? '/users' : null);
  if (user?.role !== 'admin') {
    return <ErrorAlert message="Solo el Administrador puede ver y dar de alta usuarios." />;
  }
  return (
    <>
      <div className="page-header">
        <h1>Usuarios</h1>
      </div>
      <ErrorAlert message={users.error} />
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABEL[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2>Dar acceso a un integrante</h2>
        <UserForm onSaved={users.reload} />
      </div>
    </>
  );
}
