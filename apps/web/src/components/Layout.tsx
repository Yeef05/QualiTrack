import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABEL } from '../lib/format';
import { LogoMark, LogoutIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';

export const APP_VERSION = 'v0.4 Beta';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export function Brand() {
  return (
    <Link to="/" className="brand">
      <LogoMark />
      <span>QualiTrack</span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Brand />
          <span className="badge beta">Beta</span>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/" end>
              Proyectos
            </NavLink>
            {user?.role === 'admin' && <NavLink to="/usuarios">Usuarios</NavLink>}
          </nav>
          <span className="spacer" />
          <ThemeToggle />
          {user && (
            <>
              <div className="user-chip">
                <span className="avatar" aria-hidden="true">
                  {initials(user.name)}
                </span>
                <span className="user-text">
                  <span className="user-name">{user.name}</span>
                  <span className="muted">{ROLE_LABEL[user.role]}</span>
                </span>
              </div>
              <button className="icon-button" onClick={logout} aria-label="Salir" title="Salir">
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </header>
      <main className="page">{children}</main>
      <footer className="footer">
        QualiTrack {APP_VERSION} · Centro de control de SQA · Calidad de Software SQA26
      </footer>
    </div>
  );
}
