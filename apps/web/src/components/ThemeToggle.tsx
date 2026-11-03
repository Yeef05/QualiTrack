import { useTheme } from '../lib/theme';
import { MoonIcon, SunIcon } from './Icons';

/** Botón para alternar entre el modo claro y el oscuro. */
export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const next = theme === 'dark' ? 'claro' : 'oscuro';
  return (
    <button className="icon-button" onClick={toggle} aria-label={`Cambiar a modo ${next}`} title={`Modo ${next}`}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
