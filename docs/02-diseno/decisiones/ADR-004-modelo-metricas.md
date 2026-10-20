# ADR-004 · Modelo de métricas para proyectos chicos (peor / mejor)

- **Estado:** aceptada; integrada a `main` el 20/10/2026 (rama `feature/HU-04-modelo-metricas`)
- **Fecha:** 19 de octubre de 2026
- **Reemplaza:** el catálogo y el semáforo del prototipo del check-in 2, y la ponderación 50/30/20 del índice

## Contexto

QualiTrack es para equipos chicos (3 a 5 personas) que no tienen herramientas de análisis y tienen poco tiempo para medir. El catálogo del prototipo tenía tres problemas:

1. **Métricas difíciles de obtener y de explicar.** La complejidad ciclomática necesita una herramienta (ESLint, Sonar) y el curso la clasifica como "métrica en desuso" porque es complejo calcularla (láminas 49 y 61 de *Calidad del producto de software 3.0*). La cobertura de líneas también depende de tener pruebas automáticas.
2. **Umbrales sin fuente.** El amarillo era "10 % de tolerancia" y "defectos abiertos ≤ 5" no tomaba en cuenta el tamaño del proyecto. Ninguno de los dos números se podía justificar.
3. **Inconsistencia con lo entregado.** La hoja del Entregable 1 decía que el índice era un promedio con verde 100, amarillo 50 y rojo 0. El prototipo usaba otra fórmula (50/30/20) y su código decía que venía "del Entregable 1".

Además, IEEE 730 y el texto completo de ISO/IEC 25010 son de pago, así que los criterios deben salir de fuentes que el equipo tenga.

## Decisión

Cada criterio sale de cinco pasos, todos con fuente del curso:

| Paso | Fuente |
| --- | --- |
| Factor y criterio | ISO/IEC 25010, citada por el resumen `ISO25000_Factors.pdf` del material de clase (Laporte & April) |
| Pregunta | Paso de "formulación" del proceso de medición (lámina 70) |
| Métrica | Fórmulas de las láminas 42 a 48; atributos de una buena métrica: simple, objetiva, unidades constantes, independiente de la herramienta (lámina 40) |
| Peor / Mejor | **Modelo definido** (láminas 31 a 33): el equipo fija por consenso el valor peor aceptable y el mejor esperado. Si hay un número externo (rúbrica, ejemplo de la lámina), se usa ese |
| Semáforo | Verde si llega al mejor; amarillo entre peor y mejor; rojo si es peor que el peor |

### Catálogo

| Métrica | Factor · criterio | Fórmula | Peor | Mejor | Por qué |
| --- | --- | --- | --- | --- | --- |
| Capacidad funcional (%E) | Adecuación funcional · completitud | entregadas ÷ comprometidas × 100 | 70 % | 100 % | Rúbrica: "Suficiente" 70 %, "Excelente" 100 %. Lámina 43 |
| Criterios de aceptación cumplidos | Adecuación funcional · corrección | criterios que pasan ÷ probados × 100 | 90 % | 100 % | Definición de terminado del Plan SQA |
| Densidad de defectos | Fiabilidad · madurez | defectos conocidos ÷ funcionalidades entregadas | 1.0 | 0.5 | Lámina 42, con tamaño en funcionalidades en vez de KLOC (lámina 40) |
| Defectos críticos abiertos | Fiabilidad · tolerancia a fallos | conteo | 0 | 0 | Un crítico bloquea la entrega (Plan SQA) |
| Eficiencia de QA | Proceso SQA · eficacia | A ÷ (A + B + C) × 100 | 85 % | 95 % | Lámina 47; el ejemplo de la lámina 48 da 96.7 % |
| Tiempo medio de corrección | Mantenibilidad · modificabilidad | promedio de días de registro a cierre | 7 días | 2 días | Acuerdo del equipo: check-ins cada 2 semanas |

Opcionales (inactivas por omisión): cobertura de pruebas (50 % / 70 %, valores del Entregable 1), funcionalidades con prueba (70 % / 100 %) y tareas completadas sin ayuda (70 % / 90 %). La complejidad ciclomática y "defectos abiertos" se retiran del catálogo; sus mediciones anteriores se conservan como métricas inactivas.

### Índice de salud

Cada indicador vale verde = 100, amarillo = 50 y rojo = 0, y el índice es el promedio, igual que en la hoja del Entregable 1. Los indicadores son las métricas activas con medición y el cumplimiento del plan de técnicas, que es verde desde 90 % y amarillo desde 70 %. Con defectos críticos abiertos el índice no pasa de 79, porque el Plan SQA dice que un crítico bloquea la entrega. Niveles: verde ≥ 80, amarillo 50 a 79, rojo < 50.

## Consecuencias

- **A favor:** cualquier equipo puede medir con su lista de historias, sus casos de prueba y su registro de defectos. Cada semáforo dice de dónde salen sus valores, porque la pestaña Métricas muestra la tabla "Modelo de calidad". Los peor/mejor se ajustan por equipo, que es lo que pide el enunciado con "métricas a definir por el equipo".
- **En contra:** algunos valores (densidad y tiempo de corrección) son acuerdo del equipo y se deben revisar con datos reales en el postmortem. Activar una métrica opcional es global, no por proyecto; la selección por proyecto queda para la Beta.
- La complejidad (≤ 10) y la cobertura (≥ 70 %) siguen como **controles automáticos internos** del código de QualiTrack en CI, porque ESLint y Vitest los revisan sin trabajo manual. Ya no son métricas del producto.
- Las bases creadas antes se actualizan con la migración `002_modelo_definido.sql` sin perder mediciones. Para ver los datos de ejemplo nuevos hay que borrar `apps/api/.data/`.
