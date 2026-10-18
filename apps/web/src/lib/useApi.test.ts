import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useApi } from './useApi';

function respond(...bodies: { status: number; body: unknown }[]) {
  const fn = vi.fn();
  for (const { status, body } of bodies) {
    fn.mockResolvedValueOnce({ status, ok: status < 400, json: () => Promise.resolve(body) });
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('useApi', () => {
  it('carga los datos y los vuelve a pedir con reload', async () => {
    const fetch = respond({ status: 200, body: [1] }, { status: 200, body: [1, 2] });
    const { result } = renderHook(() => useApi<number[]>('/metrics'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual([1]));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual([1, 2]));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('expone el mensaje de error', async () => {
    respond({ status: 404, body: { error: 'Proyecto no encontrado' } });
    const { result } = renderHook(() => useApi('/projects/9'));
    await waitFor(() => expect(result.current.error).toBe('Proyecto no encontrado'));
    expect(result.current.loading).toBe(false);
  });

  it('no pide nada si la ruta es null', () => {
    const fetch = respond();
    const { result } = renderHook(() => useApi(null));
    expect(result.current.loading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
