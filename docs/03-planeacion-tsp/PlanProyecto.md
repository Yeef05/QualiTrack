# Plan del proyecto · QualiTrack

Producto de trabajo "Plan del proyecto" de ISO/IEC 29110. Complementa al [Plan SQA](../04-sqa/PlanSQA.md), que dice cómo se asegura la calidad; este documento dice quién hace qué, cuándo y con qué riesgos. Versión final al 19/11/2026: cada sección dice lo que se planeó y lo que pasó.

## 1. Propósito y alcance

Del Agreement del equipo (19/10/2026, en el Drive como QualiTrack_00_Agreement): desarrollar un dashboard web para que un equipo registre su proyecto del periodo, mida sus métricas de calidad, planee y registre las técnicas de SQA que aplica y obtenga un reporte del estado de salud, aplicando esas mismas prácticas en el desarrollo de la herramienta.

| Módulo | Requisito del enunciado | Casos de uso |
| --- | --- | --- |
| M1 Proyectos y periodos | Registro de un proyecto por periodo | CU-01, CU-02 |
| M2 Métricas de calidad | Seguimiento de métricas definidas por el equipo | CU-03, CU-04, CU-05 |
| M3 Técnicas de SQA | Gestión de técnicas (aplicación y monitoreo) | CU-06, CU-07, CU-11 |
| M4 Reportes de salud | Reportes del estado de salud | CU-08, CU-09 |
| M5 Usuarios | Soporte a los demás módulos | CU-10 |

**No incluye:** integración automática con GitHub, SonarQube o Jira; app móvil nativa; notificaciones por correo; varios idiomas. El Agreement menciona capturar mediciones "a mano o por CSV": la versión 1.0 solo tiene la captura a mano.

## 2. Equipo y roles

| Rol | Integrante | Responsabilidad |
| --- | --- | --- |
| Líder del proyecto | Camila Rachel Sánchez Molina | Planear cada ciclo, dar seguimiento a tareas y horas, reportes de los check-ins |
| Responsable de QA | Flavio Uriel Huizar González | Plan SQA, registro de defectos, pruebas, métricas, auditorías y bitácora |
| Líder técnico | David Ignacio Becerra Morán | Arquitectura, estándares de código, CI y despliegue |
| Developer | Jorge Eduardo López Morán | Pantallas y sus pruebas |
| Developer | Martin Alejandro Gaspar Mercado | Servidor, base de datos y sus pruebas |
| Responsable de colaboración | Sin nombrar | Previsto en el Plan SQA §3; nunca se asignó |

Los roles de ISO/IEC 29110 y sus tareas están en el [Plan SQA §3](../04-sqa/PlanSQA.md).

## 3. Ciclos (TSP)

Cada check-in cierra un ciclo: lanzamiento → estrategia → plan → requisitos → diseño → implementación → pruebas → postmortem.

| Ciclo | Fechas | Objetivo | Tareas · horas plan | Resultado | Plan y postmortem |
| --- | --- | --- | --- | --- | --- |
| 1 | hasta el 06/10 | Definición: alcance, wireframes, arquitectura y estrategia de calidad | — | Entregable 1 | [Check-in 1](../05-entregas/checkin1/) |
| 2 | 07/10 al 20/10 | Prototipo funcional con evidencia de calidad | 15 · 41 h | `v0.3-checkin2`, 78 pruebas, DEF-001 a DEF-004 | [Plan](PlanCiclo2.md) · [Postmortem](PostmortemCiclo2.md) |
| 3 | 21/10 al 03/11 | Beta: CU-03, CU-10, CU-11 | 17 · 52 h | `v0.4-beta`, 98 pruebas, índice 79 | [Plan](PlanCiclo3.md) · [Postmortem](PostmortemCiclo3.md) |
| 4 | 04/11 al 19/11 | Entrega final: revisiones de la Beta, DEF-007/008, despliegue, manual | 17 · 37.5 h | `v1.0-final`, 109 pruebas + 3 E2E, en línea en Render, índice 64 | [Plan](PlanCiclo4.md) · [Postmortem](PostmortemCiclo4.md) |

Las horas reales se registran en [Registro de tiempos](RegistroTiempos.md) y las juntas, en [Reuniones](Reuniones.md).

## 4. Calendario de entregas

| Fecha | Entrega | Qué se presentó |
| --- | --- | --- |
| 06/10/2026 | Check-in 1 | Definición, arquitectura y estrategia de calidad |
| 20/10/2026 | Check-in 2 | Demo del prototipo y [reporte SQA](../05-entregas/checkin2/ReporteSQA_Checkin2.pdf) |
| 03/11/2026 | Check-in 3 (Beta) | Beta `v0.4-beta` y [reporte SQA de la Beta](../05-entregas/checkin3/ReporteSQA_Beta.pdf) |
| 19/11/2026 | Entrega final | Sistema desplegado, [reporte de estado final](../05-entregas/final/Final_ReporteEstado.md), manual y documentos de calidad |

## 5. Gestión de configuración

| Qué | Plan | Lo que pasó |
| --- | --- | --- |
| Repositorio | Un repositorio en GitHub con código y documentación | github.com/Yeef05/QualiTrack |
| Ramas | `feature/`, `fix/` y `docs/` por tarea, integradas a `main` por PR con aprobación de otro integrante | Ramas por tarea integradas con `merge --no-ff`, pero sin PR aprobado por otro integrante |
| `main` protegida | PR con 1 aprobación y CI en verde | No se configuró |
| CI | Lint, tipos, pruebas con cobertura y build en cada cambio | GitHub Actions desde el ciclo 2; pruebas E2E desde el 19/11 |
| Versiones | Una etiqueta por entrega | `v0.3-checkin2`, `v0.4-beta` y `v1.0-final` |
| Documentos | En el repositorio (`docs/`) y copia en el Drive del equipo | Igual; lo interno (manual con credenciales, guiones) solo en el Drive |

## 6. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación prevista | Qué pasó |
| --- | --- | --- | --- | --- |
| No todos pueden instalar PostgreSQL | Alta | Alto | PGlite en desarrollo ([ADR-002](../02-diseno/decisiones/ADR-002-base-de-datos.md)) | Ocurrió en el ciclo 2; resuelto así |
| Versiones de herramientas incompatibles | Media | Medio | Fijar versiones ([ADR-003](../02-diseno/decisiones/ADR-003-versiones-herramientas.md)) | Ocurrió (DEF-001); resuelto |
| El trabajo se concentra en una persona | Alta | Alto | Tarea con fecha y PR por integrante | Ocurrió en los ciclos 2, 3 y 4 ([postmortem del ciclo 4](PostmortemCiclo4.md)) |
| Revisión cruzada que no llega a tiempo | Alta | Alto | Revisor asignado por tarea | Ocurrió: ningún PR tuvo aprobación de otro integrante |
| El despliegue falla cerca de la entrega | Media | Alto | Desplegar antes de la Beta | Se desplegó el 19/11, a la primera, sin errores |
| Poco tiempo por otras materias | Alta | Medio | Registrar horas y ajustar cada plan | No se registraron horas reales |
