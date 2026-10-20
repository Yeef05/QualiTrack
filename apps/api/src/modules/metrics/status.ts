export type Direction = 'mayor' | 'menor';
export type Status = 'verde' | 'amarillo' | 'rojo';

/** Valores del modelo definido de una métrica (ADR-004). */
export interface Thresholds {
  worst: number;
  best: number;
  direction: Direction;
}

/**
 * Semáforo de una medición:
 * - verde: llega al valor "mejor";
 * - amarillo: está entre el "peor" aceptable y el "mejor";
 * - rojo: es peor que el valor "peor".
 * Si peor y mejor son iguales (por ejemplo, defectos críticos = 0), no hay amarillo.
 */
export function evaluate(value: number, { worst, best, direction }: Thresholds): Status {
  if (direction === 'mayor') {
    if (value >= best) return 'verde';
    return value >= worst ? 'amarillo' : 'rojo';
  }
  if (value <= best) return 'verde';
  return value <= worst ? 'amarillo' : 'rojo';
}

/** El valor peor no puede ser mejor que el valor mejor. */
export function coherent({ worst, best, direction }: Thresholds): boolean {
  return direction === 'mayor' ? worst <= best : worst >= best;
}
