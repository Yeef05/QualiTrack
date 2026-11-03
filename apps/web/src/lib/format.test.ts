import { describe, expect, it } from 'vitest';
import {
  average,
  FOUND_BY_LABEL,
  SEVERITY_LABEL,
  TSP_TYPE_LABEL,
  canManage,
  formatDate,
  formatPercent,
  formatBest,
  formatWorst,
  formatValue,
  projectsQuery,
  sum,
  todayIso,
} from './format';

describe('formato de valores', () => {
  it('formatea valores con y sin unidad', () => {
    expect(formatValue(72, '%')).toBe('72 %');
    expect(formatValue(3.456, 'defectos')).toBe('3.5 defectos');
    expect(formatValue(8, '')).toBe('8');
  });

  it('muestra los valores peor y mejor con su dirección', () => {
    expect(formatBest({ direction: 'mayor', best: 100, unit: '%' })).toBe('≥ 100 %');
    expect(formatWorst({ direction: 'mayor', worst: 70, unit: '%' })).toBe('≥ 70 %');
    expect(formatBest({ direction: 'menor', best: 0.5, unit: 'por funcionalidad' })).toBe('≤ 0.5 por funcionalidad');
    expect(formatWorst({ direction: 'menor', worst: 7, unit: 'días' })).toBe('≤ 7 días');
  });

  it('convierte fechas ISO a dd/mm/aaaa', () => {
    expect(formatDate('2026-10-20')).toBe('20/10/2026');
    expect(formatDate('2026-10-20T15:00:00.000Z')).toBe('20/10/2026');
    expect(formatDate(null)).toBe('—');
  });

  it('DEF-003: un instante con hora se muestra en el día local', () => {
    // 19 oct a las 18:40 en México = 20 oct 00:40 UTC.
    expect(formatDate('2026-10-20T00:40:00.000Z', 'America/Mexico_City')).toBe('19/10/2026');
    expect(formatDate('2026-10-20', 'America/Mexico_City')).toBe('20/10/2026');
  });

  it('formatea porcentajes', () => {
    expect(formatPercent(0.666)).toBe('67 %');
    expect(formatPercent(null)).toBe('Sin datos');
  });
});

describe('agregados del dashboard', () => {
  it('promedia y suma ignorando valores sin datos', () => {
    expect(average([80, null, 61])).toBe(71);
    expect(average([null])).toBeNull();
    expect(sum([2, null, 3])).toBe(5);
    expect(sum([])).toBeNull();
  });

  it('arma la ruta de proyectos por periodo', () => {
    expect(projectsQuery('2026-2', false)).toBe('/projects?archived=false&period=2026-2');
    expect(projectsQuery(null, true)).toBe('/projects?archived=true');
  });
});

describe('utilidades', () => {
  it('fecha local de hoy en formato AAAA-MM-DD', () => {
    expect(todayIso(new Date(2026, 9, 18, 23, 30))).toBe('2026-10-18');
  });

  it('solo administrador y líder de QA gestionan', () => {
    expect(canManage('admin')).toBe(true);
    expect(canManage('lider_qa')).toBe(true);
    expect(canManage('miembro')).toBe(false);
    expect(canManage(undefined)).toBe(false);
  });
});

describe('etiquetas del registro de defectos (CU-11)', () => {
  it('cubre la clasificación TSP y los tres orígenes de la eficiencia de QA', () => {
    expect(Object.keys(TSP_TYPE_LABEL).map(Number)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(Object.values(FOUND_BY_LABEL).map((l) => l.slice(-3))).toEqual(['(A)', '(B)', '(C)']);
    expect(SEVERITY_LABEL.critica).toBe('Crítica');
  });
});
