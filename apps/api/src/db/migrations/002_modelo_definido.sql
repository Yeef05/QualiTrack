-- Modelo de métricas para proyectos chicos (ADR-004, HU-04 y HU-06).
-- Cada métrica tiene un valor "peor" aceptable y uno "mejor" esperado (modelo definido, láminas 31-33
-- de "Calidad del producto de software"), en lugar de una meta con 10 % de tolerancia.

ALTER TABLE metrics RENAME COLUMN target TO best;
ALTER TABLE metrics ADD COLUMN worst DOUBLE PRECISION;
-- Factor y criterio de ISO/IEC 25010 al que responde la métrica.
ALTER TABLE metrics ADD COLUMN criterion TEXT NOT NULL DEFAULT '';
-- De dónde salen los valores peor y mejor.
ALTER TABLE metrics ADD COLUMN source TEXT NOT NULL DEFAULT '';
-- Las métricas inactivas conservan su historial, pero no cuentan en el semáforo ni en el índice.
ALTER TABLE metrics ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Métricas que ya existían: sin amarillo hasta que el equipo fije su valor peor.
UPDATE metrics SET worst = best;
ALTER TABLE metrics ALTER COLUMN worst SET NOT NULL;
ALTER TABLE metrics ADD CONSTRAINT metrics_worst_best CHECK (
  (direction = 'mayor' AND worst <= best) OR (direction = 'menor' AND worst >= best)
);

-- Catálogo anterior (bases creadas antes de este cambio).
UPDATE metrics SET
  name = 'Capacidad funcional (%E)',
  worst = 70,
  best = 100,
  description = 'Funcionalidades entregadas ÷ comprometidas para la entrega × 100',
  criterion = 'Adecuación funcional · completitud',
  source = 'Rúbrica SQA26: "Suficiente" = 70 %, "Excelente" = 100 %. Fórmula de la lámina 43.'
WHERE code = 'funciones_terminadas';

UPDATE metrics SET
  description = 'Defectos de gravedad crítica sin cerrar',
  criterion = 'Fiabilidad · tolerancia a fallos',
  source = 'Plan SQA: un defecto crítico bloquea la entrega. Rúbrica: "Insuficiente" si hay defectos críticos.'
WHERE code = 'defectos_criticos';

-- La cobertura pasa a opcional (necesita pruebas automáticas); valores del Entregable 1.
UPDATE metrics SET
  worst = 50,
  active = false,
  criterion = 'Mantenibilidad · facilidad de prueba',
  source = 'Opcional: requiere pruebas automáticas. Valores peor y mejor del Entregable 1.'
WHERE code = 'cobertura';

-- Se retiran: la complejidad ciclomática está en "Métricas en desuso" (lámina 49) y depende de una
-- herramienta; "defectos abiertos ≤ 5" no depende del tamaño del proyecto (se cambia por densidad).
UPDATE metrics SET active = false WHERE code IN ('complejidad', 'defectos_abiertos');
