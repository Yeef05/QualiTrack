export type Direction = 'mayor' | 'menor';
export type Status = 'verde' | 'amarillo' | 'rojo';

/**
 * Semáforo de una medición contra su umbral meta.
 * - verde: cumple la meta.
 * - amarillo: no la cumple, pero está dentro de una tolerancia del 10 % de la meta
 *   (mínimo 1 unidad, para metas en 0 como "defectos críticos abiertos").
 * - rojo: fuera de la tolerancia.
 */
export function evaluate(value: number, target: number, direction: Direction): Status {
  const tolerance = Math.abs(target) * 0.1 || 1;
  if (direction === 'mayor') {
    if (value >= target) return 'verde';
    return value >= target - tolerance ? 'amarillo' : 'rojo';
  }
  if (value <= target) return 'verde';
  return value <= target + tolerance ? 'amarillo' : 'rojo';
}
