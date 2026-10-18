import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} no encontrado`);

// Códigos de error de PostgreSQL que son culpa de los datos enviados, no del servidor.
const PG_ERRORS: Record<string, [number, string]> = {
  '23505': [409, 'Ya existe un registro con esos datos'],
  '23503': [400, 'El registro relacionado no existe'],
  '23514': [400, 'Los datos no cumplen las reglas de validación'],
};

function pgErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  const known = PG_ERRORS[pgErrorCode(err) ?? ''];
  if (known) {
    res.status(known[0]).json({ error: known[1] });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
