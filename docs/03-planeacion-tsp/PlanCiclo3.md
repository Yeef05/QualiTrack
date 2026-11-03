# Plan del ciclo 3 (TSP) · Versión Beta · 21 de octubre al 3 de noviembre de 2026

Pasos del ciclo TSP: **lanzamiento → estrategia → plan → requisitos → diseño → implementación → pruebas → postmortem**. El trabajo se divide por [caso de uso](../01-requisitos/CasosDeUso.md): cada CU tiene un responsable que lo implementa y **otro integrante que lo revisa en el PR**. Esa revisión es la evidencia que pide la definición de terminado del [Plan SQA](../04-sqa/PlanSQA.md).

> Las horas plan son una estimación inicial. Se ajustan en la junta de lanzamiento del 21/10 y cada responsable anota sus horas reales al cerrar la tarea.

## 1. Objetivos del ciclo

| Objetivo | Medida de éxito |
| --- | --- |
| Completar los casos de uso parciales y agregar el registro de defectos | CU-03, CU-10 y CU-11 implementados con sus pruebas |
| Que el repositorio muestre al equipo | Cada integrante con al menos un PR propio aprobado por otro; `main` protegida; etiqueta `v0.4-beta` |
| Calidad del producto (modelo del ADR-004) | Índice de salud de QualiTrack ≥ 80, 0 defectos críticos abiertos, cumplimiento del plan de técnicas ≥ 90 % |
| Validar con la maestra | Demo de la Beta el 3 nov; sus observaciones van al registro de defectos (valor B de la eficiencia de QA) |

## 2. Roles (ISO/IEC 29110, adaptación de la maestra)

| Rol | Integrante |
| --- | --- |
| Líder de equipo | Camila |
| Responsable técnico | David |
| Responsable de calidad | Flavio |
| Responsable de colaboración | *Asignar en la junta del 21/10* |
| Desarrolladores | Jorge y Martin (todos desarrollan) |

## 3. Dueños de los casos de uso ya implementados

El prototipo se integró en un solo bloque el 18/10. Cada dueño revisa el código de su caso de uso, corrige lo que encuentre (registrándolo como defecto) y anota sus horas. Los dueños siguen la asignación del ciclo 2.

| CU | Dueño | Revisa | Qué revisar |
| --- | --- | --- | --- |
| CU-01 Registrar un proyecto | Martin | Jorge | API de proyectos, `ProjectForm` y validaciones |
| CU-02 Concluir el seguimiento | Martin | Jorge | Archivar y restaurar, mediciones bloqueadas |
| CU-04 Registrar una medición | Martin | Flavio | API de mediciones, fechas (DEF-003), formulario |
| CU-05 Revisar el estado de calidad | Jorge | Martin | Tabla de estado, gráfica y tabla "Modelo de calidad" |
| CU-06 Planear las técnicas | David | Camila | Plan, ventanas de frecuencia y cumplimiento |
| CU-07 Registrar una ejecución | David | Camila | Validación de ejecuciones e historial |
| CU-08 Generar el reporte de salud | David | Flavio | Índice (ADR-004), tope por críticos, historial y PDF |
| CU-09 Identificar proyectos con atención | Jorge | David | Dashboard por periodo y KPI |

## 4. Plan de tareas por caso de uso

| # | CU | Tarea | Fase TSP | Responsable | Revisa | Horas plan | Horas real | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Todos | Junta de lanzamiento: ajustar este plan, asignar al Responsable de colaboración y revisar los PR del check-in 2 | Lanzamiento | Camila | Todos | 2 | | Sin registro |
| 2 | Todos | Revisión de dueños de los CU implementados (§3) | Pruebas | Dueño de cada CU | Ver §3 | 5 | | Pendiente |
| 3 | CU-03 | Tabla `project_metrics` (migración 003) y API para guardar el modelo por proyecto (RF-14) | Diseño · Implementación | Martin | David | 4 | | Hecha 02/11 por Flavio (sin revisión de David) |
| 4 | CU-03 | Pantalla "Modelo de calidad" editable: activar métricas y ajustar peor/mejor (RF-10, RF-11) | Implementación | Jorge | Martin | 5 | | Hecha 02/11 por Flavio (sin revisión de Martin) |
| 5 | CU-03 | Formulario para agregar una métrica propia con criterio y fuente (RF-13) | Implementación | Martin | Flavio | 2 | | Hecha 02/11 por Flavio |
| 6 | CU-10 | Pantalla de usuarios: listar y dar de alta con rol (solo Administrador) | Implementación | Camila | David | 4 | | Hecha 02/11 por Flavio (sin revisión de David) |
| 7 | CU-11 | HU-11 con criterios de aceptación y casos de prueba | Requisitos | Flavio | Camila | 2 | | Hecha 02/11 |
| 8 | CU-11 | Tabla `defects` (migración 004), API para registrar y cerrar defectos | Diseño · Implementación | David | Martin | 4 | | Hecha 02/11 por Flavio (sin revisión de Martin) |
| 9 | CU-11 | Cálculo automático de densidad, críticos abiertos, eficiencia de QA y tiempo de corrección (RF-37, RF-38) | Implementación | David | Flavio | 3 | | Hecha 02/11 por Flavio |
| 10 | CU-11 | Pestaña "Defectos": registrar, cerrar y listar | Implementación | Jorge | Camila | 4 | | Hecha 02/11 por Flavio (sin revisión de Camila) |
| 11 | CU-01, CU-04, CU-08 | Pruebas de flujo completo (E2E) de los 3 flujos principales | Pruebas | Flavio | Jorge | 5 | | Pendiente (prueba manual en el navegador el 02/11) |
| 12 | Todos | Prueba con 3 usuarios de otro equipo, 5 tareas (métrica "tareas sin ayuda") | Pruebas | Flavio | Camila | 2 | | Pendiente |
| 13 | Todos | Desplegar con PostgreSQL real y repetir la prueba de humo ahí | Pruebas | David | Flavio | 3 | | Pendiente |
| 14 | Todos | Proteger `main`, etiquetar `v0.4-beta`, mantener el repositorio | Pruebas | Responsable de colaboración | Flavio | 1 | | Parcial: etiqueta `v0.4-beta`; `main` sin proteger |
| 15 | Todos | Auditoría interna, bitácora, mediciones y registro de defectos | Postmortem | Flavio | Camila | 2 | | Hecha 02/11 |
| 16 | Todos | Reporte de estado y ensayo de la demo de la Beta | Postmortem | Camila | Todos | 2 | | Reporte hecho 02/11; ensayo pendiente |
| 17 | Todos | Postmortem del ciclo 3: plan contra real, defectos por tipo TSP (Pareto) | Postmortem | Camila | Flavio | 2 | | Borrador 03/11 por Flavio ([postmortem](PostmortemCiclo3.md)); faltan horas y aportes del equipo |
| | | **Total** | | | | **52** | | |

**Carga por persona (horas plan).** La tarea 2 se reparte entre los dueños de la §3. Las revisiones de PR de la columna "Revisa" se anotan aparte como horas reales.

| Integrante | Tareas | Horas plan |
| --- | --- | --- |
| Camila | 1, 6, 16, 17 | 10 |
| David | 8, 9, 13 y 2 h de la tarea 2 (CU-06 a CU-08) | 12 |
| Jorge | 4, 10 y 1 h de la tarea 2 (CU-05 y CU-09) | 10 |
| Martin | 3, 5 y 2 h de la tarea 2 (CU-01, CU-02 y CU-04) | 8 |
| Flavio | 7, 11, 12, 15 | 11 |
| Responsable de colaboración | 14 | 1 |
| **Total** | | **52** |

## 5. Orden de trabajo

1. **Semana 1 (21–27 oct):** tareas 1 a 3, 6 a 8. Primero lo que cambia el esquema (migraciones 003 y 004), para que las pantallas no esperen.
2. **Semana 2 (28 oct–3 nov):** tareas 4, 5, 9 a 17. El 1 de noviembre se congela el código: solo correcciones, prueba de humo y ensayo.

Cada tarea va en su rama (`feature/CU-xx-…` o `fix/DEF-xxx-…`) con un PR pequeño. Un PR solo se integra con CI en verde y la aprobación del revisor de la tabla.

## Estado al 2 de noviembre (víspera de la Beta)

Del 21/10 al 1/11 no hubo avance registrado (ni commits ni documentos). El 2/11 el Responsable de calidad hizo las tareas 3 a 10 y 15 para cumplir los tres casos de uso comprometidos: **9 de 17 tareas hechas, 3 parciales (14, 16 y 17) y 5 pendientes**. Ninguna tiene la revisión del integrante asignado, así que las historias no cumplen todavía la definición de terminado. Las horas reales las anota cada integrante en el postmortem.

El cierre del ciclo está en el [postmortem del ciclo 3](PostmortemCiclo3.md), y lo pendiente pasa al [plan del ciclo 4](PlanCiclo4.md).

## 6. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| PR sin revisar a tiempo | Alta (ocurrió en el ciclo 2) | Alto | Revisor asignado por tarea; revisar en menos de 24 h |
| Conflictos entre migraciones 003 y 004 | Media | Medio | Martin y David acuerdan el orden el 21/10; una migración por PR |
| Despliegue sin probar | Media | Alto | Tarea 13 en la primera mitad de la semana 2 |
| CONISOFT (27–30 oct) reduce horas disponibles | Alta | Medio | Congelar el código el 1 nov y no dejar tareas grandes para la última semana |
