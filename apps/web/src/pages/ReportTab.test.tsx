import { describe, expect, it } from 'vitest';
import { criticalFreeBar, criticalFreeText } from './ReportTab';

describe('DEF-006: barra de defectos críticos del reporte', () => {
  it('la barra llena significa "libre de críticos" y el texto lo dice', () => {
    expect(criticalFreeBar(0)).toBe(100);
    expect(criticalFreeText(0)).toBe('Sí · 0 abiertos');
    expect(criticalFreeBar(2)).toBe(0);
    expect(criticalFreeText(2)).toBe('No · 2 abiertos');
    expect(criticalFreeBar(null)).toBeNull();
    expect(criticalFreeText(null)).toBe('Sin datos');
  });
});
