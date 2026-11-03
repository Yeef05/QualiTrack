# Plan del ciclo 4 (TSP) · Entrega final · 4 al 19 de noviembre de 2026

Pasos del ciclo TSP: **lanzamiento → estrategia → plan → requisitos → diseño → implementación → pruebas → postmortem**. Este plan sale de las acciones de los postmortems de los [ciclos 2](PostmortemCiclo2.md) y [3](PostmortemCiclo3.md).

> **Borrador para la junta de lanzamiento del 4/11.** Los responsables y revisores son una propuesta que sigue los roles del [Plan SQA](../04-sqa/PlanSQA.md) y los dueños de cada caso de uso. El equipo los confirma o los cambia en la junta y lo anota en [Reuniones](Reuniones.md).

## 1. Objetivos (rúbrica SQA26 en "Excelente")

| Objetivo | Medida de éxito |
| --- | --- |
| Producto sin defectos y desplegado | 0 defectos abiertos de gravedad crítica o mayor; DEF-007 y DEF-008 cerrados; sistema en línea con PostgreSQL real |
| Historial claro del uso de SQA | Cada cambio del ciclo entra por PR con aprobación de otro integrante; el código de la Beta revisado por sus dueños ([Revisiones de la Beta](../04-sqa/RevisionesBeta.md)) |
| Calidad medida con el propio modelo | Índice de salud de QualiTrack ≥ 80 y cumplimiento del plan de técnicas ≥ 90 % |
| Evidencia de cada integrante | Los 5 integrantes con commits o revisiones propias, y horas reales en el [registro de tiempos](RegistroTiempos.md) |
| Entrega a tiempo | Código congelado el 17/11; entrega el 19/11 con bitácora SQA final |

## 2. Roles

| Rol | Integrante |
| --- | --- |
| Líder de equipo | Camila |
| Responsable técnico | David |
| Responsable de calidad | Flavio |
| Responsable de colaboración | ✍ *Nombrarlo en la junta del 4/11* |
| Desarrolladores | Jorge y Martin (todos desarrollan) |

## 3. Plan de tareas

| # | Tarea | Fase TSP | Responsable | Revisa | Fecha límite | Horas plan | Horas real | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Junta de lanzamiento: nombrar al Responsable de colaboración, confirmar este plan y registrarla en Reuniones | Lanzamiento | Camila | Todos | 04/11 | 1 | | Pendiente |
| 2 | Revisión cruzada del código de la Beta con la lista de revisión ([formato](../04-sqa/RevisionesBeta.md)) | Pruebas | Ver formato (David, Martin, Jorge y Camila) | Flavio | 09/11 | 4 | | Pendiente |
| 3 | Registrar las observaciones de la maestra en la Beta como defectos de origen B | Pruebas | Flavio | Camila | 04/11 | 1 | | Pendiente |
| 4 | Proteger `main`: los PR requieren 1 aprobación y CI en verde | Pruebas | Responsable de colaboración | David | 04/11 | 0.5 | | Pendiente |
| 5 | DEF-007: elegir al "Responsable de QA" del proyecto de la lista de usuarios | Implementación | Martin | Flavio | 07/11 | 3 | | Pendiente |
| 6 | DEF-008: elegir al responsable de cada ejecución de la lista de usuarios (el de la sesión por omisión) | Implementación | David | Camila | 07/11 | 2 | | Pendiente |
| 7 | Pruebas E2E (Playwright) de 3 flujos: registrar proyecto y medición, registrar y cerrar defecto, generar reporte | Pruebas | Jorge | Flavio | 12/11 | 5 | | Pendiente |
| 8 | Prueba con 3 usuarios de otro equipo, 5 tareas cada uno (métrica "Tareas completadas sin ayuda") | Pruebas | Flavio | Camila | 12/11 | 2 | | Pendiente |
| 9 | Seguimiento a mitad del ciclo: avance de tareas y horas, y ajuste del plan | Plan | Camila | Responsable de colaboración | 10/11 | 1 | | Pendiente |
| 10 | Desplegar con PostgreSQL real y repetir la prueba de humo ahí | Pruebas | David | Flavio | 13/11 | 4 | | Pendiente |
| 11 | Conectar SonarCloud (`sonar-project.properties` con la organización real y secreto `SONAR_TOKEN`) | Pruebas | David | Martin | 13/11 | 1 | | Pendiente |
| 12 | Manual de usuario de la versión final (pantallas de la Beta y modo claro/oscuro) | Requisitos | Camila | Jorge | 14/11 | 3 | | Pendiente |
| 13 | Exploración de 30 min por integrante con una misión (Plan SQA §8.1); lo encontrado va al registro de defectos | Pruebas | Todos | Flavio | 14/11 | 2.5 | | Pendiente |
| 14 | Congelar código, auditoría final, bitácora SQA final y mediciones | Postmortem | Flavio | Camila | 17/11 | 3 | | Pendiente |
| 15 | Postmortem del ciclo 4, reporte final y ensayo de la demo final | Postmortem | Camila | Todos | 18/11 | 3 | | Pendiente |
| 16 | Anotar las horas de la semana en el registro de tiempos (cada viernes: 7/11 y 14/11) | Postmortem | Todos | Camila | 14/11 | 1 | | Pendiente |
| 17 | Etiqueta `v1.0-final` y entrega en Classroom | Postmortem | Responsable de colaboración | Flavio | 19/11 | 0.5 | | Pendiente |
| | **Total** | | | | | **37.5** | | |

### Carga por persona (horas plan)

Las tareas de "Todos" (13 y 16) se reparten por igual: 0.5 h de exploración y 0.2 h de registro de tiempos por integrante. Las revisiones de la columna "Revisa" se anotan aparte como horas reales.

| Integrante | Tareas | Horas plan |
| --- | --- | --- |
| Camila | 1, 9, 12, 15 y su parte de 2 (DEF-005/006, UI de CU-11) | 9.7 |
| David | 6, 10, 11 y su parte de 2 (API de CU-10 y CU-11) | 8.7 |
| Jorge | 7 y su parte de 2 (UI de CU-03) | 6.7 |
| Martin | 5 y su parte de 2 (API de CU-03) | 4.7 |
| Flavio | 3, 8, 14 | 6.7 |
| Responsable de colaboración | 4, 17 | 1 |
| **Total** | | **37.5** |

## 4. Reglas del ciclo

1. Nada entra a `main` sin PR aprobado por el revisor de la tabla y CI en verde.
2. Cada defecto se registra **el día que se encuentra**, en `RegistroDefectos.md` y en la pestaña Defectos del proyecto "QualiTrack".
3. Cada quien anota sus horas reales al cerrar su tarea y cada viernes.
4. Cada junta queda en [Reuniones](Reuniones.md) con asistentes, acuerdos y pendientes.

## 5. Calendario

| Semana | Qué se cierra |
| --- | --- |
| 4–9 nov | Tareas 1 a 6; revisión cruzada de la Beta terminada el 9/11 |
| 10–14 nov | Seguimiento (10/11); tareas 7, 8, 10 a 13 y 16 |
| 15–19 nov | Código congelado el 17/11; auditoría, postmortem, reporte final, ensayo y entrega el 19/11 |

## 6. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| El trabajo se vuelve a concentrar en una persona | Alta (pasó en los ciclos 2 y 3) | Alto: la maestra califica a quien aparece en la evidencia | Cada integrante tiene una tarea con fecha y un PR propio; seguimiento el 10/11 |
| PR sin revisar a tiempo | Alta | Alto | Revisor asignado por tarea; revisar en menos de 24 h |
| El despliegue falla cerca de la entrega | Media | Alto | Desplegar a más tardar el 13/11 y probar ahí |
| Defectos nuevos al cerrar DEF-007/008 | Media | Medio | Pruebas de regresión y revisión antes de integrar |
