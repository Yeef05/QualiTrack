import type { ReactNode } from 'react';

/** Etiqueta + control + mensaje de error de validación. */
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <div className="alert" role="alert">
      {message}
    </div>
  );
}
