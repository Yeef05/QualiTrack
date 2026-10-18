import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABEL } from '../lib/format';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">
          QualiTrack
        </Link>
        <span className="muted small">Centro de control de SQA</span>
        <span className="spacer" />
        {user && (
          <>
            <span className="small">
              {user.name} · <span className="muted">{ROLE_LABEL[user.role]}</span>
            </span>
            <button className="secondary" onClick={logout}>
              Salir
            </button>
          </>
        )}
      </header>
      <main className="page">{children}</main>
    </>
  );
}
