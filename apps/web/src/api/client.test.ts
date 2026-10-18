import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, errorMessage, fieldErrors, getToken, setToken, setUnauthorizedHandler } from './client';

function mockFetch(status: number, body?: unknown) {
  const fn = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => (body === undefined ? Promise.reject(new Error('sin cuerpo')) : Promise.resolve(body)),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(undefined);
});

describe('cliente de la API', () => {
  it('guarda y borra el token', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('envía el token y el cuerpo en JSON', async () => {
    setToken('abc');
    const fetch = mockFetch(201, { id: 1 });
    const res = await api<{ id: number }>('/projects', { method: 'POST', body: { name: 'X' } });
    expect(res.id).toBe(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/projects');
    expect(init.headers.Authorization).toBe('Bearer abc');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"name":"X"}');
  });

  it('no envía cuerpo en GET ni token si no hay sesión', async () => {
    const fetch = mockFetch(200, []);
    await api('/metrics');
    const [, init] = fetch.mock.calls[0];
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('resuelve 204 sin cuerpo', async () => {
    mockFetch(204);
    await expect(api('/projects/1/plan/2', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('convierte los errores en ApiError con detalles por campo', async () => {
    mockFetch(400, { error: 'Datos inválidos', details: [{ path: 'name', message: 'Muy corto' }] });
    const error = await api('/projects', { method: 'POST', body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect(fieldErrors(error)).toEqual({ name: 'Muy corto' });
    expect(errorMessage(error)).toBe('Datos inválidos');
  });

  it('usa un mensaje genérico si la respuesta no trae JSON', async () => {
    mockFetch(500);
    await expect(api('/x')).rejects.toThrow('Error 500');
  });

  it('avisa cuando la sesión expira', async () => {
    setToken('vencido');
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { error: 'La sesión expiró' });
    await expect(api('/projects')).rejects.toThrow('La sesión expiró');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('maneja errores que no vienen de la API', () => {
    expect(fieldErrors(new Error('x'))).toEqual({});
    expect(errorMessage('texto')).toBe('Ocurrió un error inesperado');
  });
});
