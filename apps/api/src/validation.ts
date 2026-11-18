import { z } from 'zod';

function typeMessage(issue: z.ZodInvalidTypeIssue): string {
  return issue.received === 'undefined' || issue.received === 'null' ? 'Este campo es obligatorio' : 'El tipo de dato no es válido';
}

function sizeMessage(issue: z.ZodTooSmallIssue | z.ZodTooBigIssue): string {
  const [words, limit] =
    issue.code === 'too_small' ? [['al menos', 'mínimo'], issue.minimum] : [['como máximo', 'máximo'], issue.maximum];
  return issue.type === 'string' ? `Escribe ${words[0]} ${limit} caracteres` : `El valor ${words[1]} es ${limit}`;
}

/**
 * DEF-012: los mensajes por omisión de zod salían en inglés ("Invalid email", "Required") en los formularios.
 * Los mensajes escritos en cada esquema tienen prioridad sobre estos.
 */
export const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case 'invalid_type':
      return { message: typeMessage(issue) };
    case 'too_small':
    case 'too_big':
      return { message: sizeMessage(issue) };
    case 'invalid_string':
      return {
        message: issue.validation === 'email' ? 'Escribe un correo válido, por ejemplo nombre@dominio.mx' : 'El formato no es válido',
      };
    case 'invalid_enum_value':
      return { message: 'Elige una de las opciones de la lista' };
    case 'not_finite':
      return { message: 'Escribe un número' };
    default:
      return { message: ctx.defaultError };
  }
};

z.setErrorMap(spanishErrorMap);

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
