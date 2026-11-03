import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { preferredTheme, setTheme, THEME_KEY, useTheme } from './theme';

afterEach(() => vi.unstubAllGlobals());

describe('modo claro y oscuro', () => {
  it('usa el tema guardado y, si no hay, el del sistema operativo', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    expect(preferredTheme()).toBe('dark');
    localStorage.removeItem(THEME_KEY);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(preferredTheme()).toBe('dark');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(preferredTheme()).toBe('light');
  });

  it('alterna el tema, lo aplica al documento y lo recuerda', () => {
    setTheme('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('light');
    act(() => result.current[1]());
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });
});
