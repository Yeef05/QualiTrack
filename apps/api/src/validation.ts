import { z } from 'zod';

export const idSchema = z.coerce.number().int().positive();

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Fecha inválida');

/** Lee y valida un parámetro numérico de la ruta (también en routers con mergeParams). */
export function paramId(req: { params: unknown }, name = 'id'): number {
  return idSchema.parse((req.params as Record<string, string | undefined>)[name]);
}

export const PERIOD_RE = /^\d{4}-[12]$/;

/**
 * Zona horaria de los usuarios. Las fechas de mediciones y ejecuciones son días del calendario local:
 * con UTC, después de las 18:00 en Zacatecas el servidor ya estaba en el día siguiente (DEF-003).
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Mexico_City';

/** Fecha de hoy en formato AAAA-MM-DD en la zona horaria de la aplicación. */
export function todayIso(now: Date = new Date(), timeZone: string = APP_TIMEZONE): string {
  // en-CA formatea como AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Días completos entre dos fechas AAAA-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function isoDaysAgo(days: number, now: Date = new Date()): string {
  return todayIso(new Date(now.getTime() - days * 86_400_000));
}
