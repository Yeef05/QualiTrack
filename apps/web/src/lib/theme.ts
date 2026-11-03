import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'qualitrack.theme';

/** Tema guardado por la persona; si no eligió, el del sistema operativo. */
export function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Sin almacenamiento (modo privado): se usa el del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const listeners = new Set<() => void>();
let current: Theme = typeof document === 'undefined' ? 'light' : preferredTheme();

export function currentTheme(): Theme {
  return current;
}

/** Aplica el tema al documento (atributo data-theme) y lo recuerda en este navegador. */
export function setTheme(theme: Theme): void {
  current = theme;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Sin almacenamiento: el tema dura lo que la pestaña.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tema actual y función para alternar entre claro y oscuro. */
export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, currentTheme, currentTheme);
  return [theme, () => setTheme(theme === 'dark' ? 'light' : 'dark')];
}
