import { daysBetween } from '../../validation';

export const FREQUENCIES = ['por_pr', 'semanal', 'por_checkin', 'mensual'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

/** Días que puede pasar una técnica sin ejecutarse antes de considerarse atrasada. */
export const FREQUENCY_DAYS: Record<Frequency, number> = {
  por_pr: 7,
  semanal: 7,
  por_checkin: 14,
  mensual: 30,
};

export function isUpToDate(lastExecutedOn: string | null, frequency: Frequency, today: string): boolean {
  if (!lastExecutedOn) {
    return false;
  }
  return daysBetween(lastExecutedOn, today) <= FREQUENCY_DAYS[frequency];
}

/** Fracción (0 a 1) de técnicas del plan que están al día; null si el plan está vacío. */
export function planCompliance(
  items: { frequency: Frequency; lastExecutedOn: string | null }[],
  today: string,
): number | null {
  if (items.length === 0) {
    return null;
  }
  const upToDate = items.filter((i) => isUpToDate(i.lastExecutedOn, i.frequency, today)).length;
  return upToDate / items.length;
}
