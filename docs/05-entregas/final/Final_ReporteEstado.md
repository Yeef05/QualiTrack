# Entrega final · QualiTrack

**Materia:** Calidad de Software · **Docente:** Mtra. María de León Sigg · **Fecha:** jueves 19 de noviembre de 2026 · **Equipo:** QualiTrack · **Versión:** etiqueta `v1.0-final` · **En línea:** https://qualitrack-x1u0.onrender.com

**Qué entregamos:** QualiTrack 1.0 registra proyectos por periodo, da seguimiento a sus métricas con un modelo definido (valor peor y mejor con fuente), gestiona el plan de técnicas de SQA y sus ejecuciones, lleva el registro de defectos y genera el reporte de salud de cada proyecto. Los 11 casos de uso están implementados y los 14 defectos registrados están cerrados.

## Producto

| Requisito del enunciado | En QualiTrack |
| --- | --- |
| Registro de un proyecto por periodo | CU-01 y CU-02: alta, edición y archivo; un nombre por periodo; responsable de QA elegido de la lista de usuarios |
| Seguimiento de métricas de calidad | CU-03 a CU-05: modelo por proyecto, mediciones con semáforo y tendencia; 4 métricas se calculan solas del registro de defectos (CU-11) |
| Gestión de técnicas de SQA | CU-06 y CU-07: plan con frecuencia, ejecuciones con responsable y cumplimiento del plan |
| Reportes del estado de salud | CU-08 y CU-09: índice de 0 a 100, historial, exportación a PDF y dashboard por periodo |

Cambios desde la Beta: DEF-007 y DEF-008 (responsables elegidos de la lista de usuarios), 6 defectos de la revisión del código de la Beta y de los casos de prueba, y el despliegue en Render con PostgreSQL (19/11). Lo desplegado es `v1.0-final` más un cambio en `render.yaml` para que Render genere la contraseña de los usuarios de ejemplo; el código es el mismo.

## Resultados del aseguramiento de la calidad

| Indicador (modelo del ADR-004) | Check-in 2 | Beta | Final | Estado |
| --- | --- | --- | --- | --- |
| Capacidad funcional | 100 % | 100 % | 100 % (11 de 11 CU) | Verde |
| Criterios de aceptación cumplidos | 100 % | 100 % | 100 % (33 de 33, automática y manual) | Verde |
| Densidad de defectos | 0.4 | 0.73 | 1.27 (14 ÷ 11 historias) | Rojo |
| Defectos críticos abiertos | 0 | 0 | 0 | Verde |
| Eficiencia de QA | 100 % | 100 % | 100 % (A = 14) | Verde |
| Tiempo medio de corrección | 0 días | 4.3 días | 10.3 días | Rojo |
| Cumplimiento del plan de técnicas | 75 % | 75 % | 75 % | Amarillo |

**Índice de salud: 64/100 (Beta: 79).** Ningún defecto quedó abierto. El índice baja porque la revisión del código de la Beta encontró defectos que llevaban semanas ahí, y porque las correcciones tardaron en llegar a `main`. El análisis está en el [postmortem del ciclo 4](../../03-planeacion-tsp/PostmortemCiclo4.md).

| Práctica | Evidencia |
| --- | --- |
| Revisión de código con lista | 7 revisiones de la Beta: 5 rechazadas, 2 con hallazgos ([revisiones](../../04-sqa/RevisionesBeta.md)) |
| Casos de prueba por criterio | 33 casos manuales, 109 pruebas automáticas (cobertura de líneas 97.8 % API y 98.9 % web) y 3 flujos E2E en Playwright |
| Registro de defectos | 14 defectos con tipo TSP, gravedad, fase y prueba de regresión; Pareto por tipo |
| Análisis estático como compuerta | 3 hallazgos de complejidad atendidos antes del commit (HAL-001 a HAL-003) |
| Prueba de humo | Clon nuevo, instalación y recorrido completo; modo de producción con el driver de PostgreSQL |
| Gestión de configuración | Una rama por defecto o caso de uso, integración con merge y etiquetas `v0.3-checkin2`, `v0.4-beta` y `v1.0-final` |
| Mejora del proceso (PDCA) | Postmortem de cada ciclo con acciones que entran al plan del siguiente |

## Lo que no se cumplió

- Revisión cruzada en PR y `main` protegida: ninguna historia cumple la definición de terminado del Plan SQA.
- Prueba con 3 usuarios de otro equipo y SonarCloud. Las pruebas E2E sí se hicieron, pero el día de la entrega.
- Registro de horas reales y de juntas del equipo.

Bitácora completa: [Bitácora de SQA](../../04-sqa/BitacoraSQA.md).
