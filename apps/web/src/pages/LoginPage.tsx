import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert, Field } from '../components/Field';

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="login card">
      <h1>QualiTrack</h1>
      <p className="muted">Centro de control de aseguramiento de la calidad.</p>
      <form className="form" onSubmit={handleSubmit}>
        <ErrorAlert message={error} />
        <Field label="Correo">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <button type="submit" disabled={sending}>
          {sending ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
