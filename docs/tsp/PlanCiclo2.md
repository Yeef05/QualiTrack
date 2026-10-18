# Plan del ciclo 2 (TSP) · 7 al 20 de octubre de 2026

Seguimos los pasos de un ciclo TSP: **lanzamiento → estrategia → plan → requisitos → diseño → implementación → pruebas → postmortem**.
Las horas reales las anota cada responsable al cerrar su tarea; el postmortem compara plan contra real.

> El prototipo inicial (tareas 1 a 12 y 14) se generó el 18/10 con apoyo de un asistente de IA. Cada responsable debe revisar su parte en el PR, ajustarla y anotar sus horas reales antes de marcarla como terminada.

## 1. Lanzamiento: objetivos del ciclo

| Objetivo | Medida de éxito |
| --- | --- |
| Prototipo funcional para la demo del 20 de octubre | M1 y M2 completos; M3 y M4 navegables con datos de ejemplo |
| Evidencia de SQA en el repositorio | CI con lint, pruebas y cobertura; bitácora, registro de defectos y ADR actualizados |
| Calidad del producto | Cobertura ≥ 70 %, complejidad ≤ 10, 0 defectos críticos abiertos al entregar |

## 2. Roles del ciclo

Igual que en el Entregable 1: líder del proyecto (Camila), QA (Flavio), líder técnico (David), developers (Jorge, Martin).

## 3. Estrategia

1. Primero la API con pruebas de integración (la lógica del semáforo y del índice se prueba como funciones puras).
2. Después las pantallas, siguiendo los 4 wireframes.
3. Al final, una prueba de humo con el sistema completo y la auditoría interna.

## 4. Plan de tareas

| # | Tarea | Fase TSP | Responsable | Horas plan | Horas real | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Crear repositorio, estándares (ESLint, EditorConfig) y plantillas de PR/Issues | Diseño | David | 2 | | Implementado, falta revisión del responsable |
| 2 | Historias de usuario M1-M5 con criterios de aceptación | Requisitos | Flavio | 2 | | Implementado, falta revisión del responsable |
| 3 | Esquema de BD y migraciones | Diseño | Martin | 2 | | Implementado, falta revisión del responsable |
| 4 | API M1 proyectos + pruebas | Implementación | Martin | 4 | | Implementado, falta revisión del responsable |
| 5 | API M2 métricas, mediciones y semáforo + pruebas | Implementación | Martin | 4 | | Implementado, falta revisión del responsable |
| 6 | API M3 técnicas y cumplimiento + pruebas | Implementación | David | 3 | | Implementado, falta revisión del responsable |
| 7 | API M4 índice de salud y reportes + pruebas | Implementación | David | 3 | | Implementado, falta revisión del responsable |
| 8 | API M5 login y roles + pruebas | Implementación | David | 2 | | Implementado, falta revisión del responsable |
| 9 | Pantallas dashboard y detalle de métricas | Implementación | Jorge | 5 | | Implementado, falta revisión del responsable |
| 10 | Pantallas técnicas y reporte (PDF) | Implementación | Jorge | 4 | | Implementado, falta revisión del responsable |
| 11 | Pruebas de componentes del frontend | Pruebas | Jorge | 2 | | Implementado, falta revisión del responsable |
| 12 | Pipeline de CI y SonarCloud | Pruebas | David | 2 | | CI listo; falta conectar SonarCloud |
| 13 | Subir repositorio, proteger `main` y revisión cruzada del PR | Pruebas | Todos | 2 | | Pendiente |
| 14 | Auditoría interna, bitácora y registro de defectos | Postmortem | Flavio | 2 | | Implementado, falta revisión del responsable |
| 15 | Reporte de estado y ensayo de la demo de 3 minutos | Postmortem | Camila | 2 | | Pendiente |
| | **Total** | | | **41** | | |

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| No tener PostgreSQL en todas las máquinas | Alta (ocurrió) | Alto | PGlite en desarrollo y pruebas ([ADR-002](../decisiones/ADR-002-base-de-datos.md)) |
| Versiones nuevas de herramientas incompatibles | Media (ocurrió con TypeScript 7) | Medio | Fijar versiones y registrar la decisión ([ADR-003](../decisiones/ADR-003-versiones-herramientas.md)) |
| Revisión de código tardía | Media | Medio | PR pequeños por módulo y revisor asignado en cada tarea |
| Despliegue en Render sin probar | Media | Alto | Probar el despliegue antes de la Beta (3 de noviembre) |
