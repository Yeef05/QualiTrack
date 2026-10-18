const TOKEN_KEY = 'qualitrack.token';

export interface FieldIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: FieldIssue[] = [],
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura lo que la pestaña.
  }
}

let onUnauthorized: (() => void) | undefined;

/** La app registra aquí qué hacer cuando la sesión expira (volver al login). */
export function setUnauthorizedHandler(handler: (() => void) | undefined): void {
  onUnauthorized = handler;
}

function buildRequest(method: string, body: unknown): RequestInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body === undefined) {
    return { method, headers };
  }
  headers['Content-Type'] = 'application/json';
  return { method, headers, body: JSON.stringify(body) };
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, buildRequest(options.method ?? 'GET', options.body));
  if (res.status === 204) {
    return undefined as T;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      onUnauthorized?.();
    }
    throw new ApiError(res.status, data.error ?? `Error ${res.status}`, data.details ?? []);
  }
  return data as T;
}

/** Convierte los errores de validación de la API en { campo: mensaje }. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) {
    return {};
  }
  return Object.fromEntries(error.details.map((d) => [d.path, d.message]));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}
