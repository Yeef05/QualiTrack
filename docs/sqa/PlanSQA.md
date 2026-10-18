# Plan de Aseguramiento de la Calidad (SQA) · QualiTrack

Basado en la estructura de **IEEE 730** (plan de SQA) y en el modelo de calidad de producto **ISO/IEC 25010**.
Responsable del plan: Flavio Uriel Huizar González (Responsable de QA). Versión 1.1 · 18 de octubre de 2026.

## 1. Propósito y alcance

Asegurar que QualiTrack cumpla el alcance del enunciado (registro de proyectos por periodo, métricas, técnicas de SQA y reportes de salud) y que el proceso de construcción deje evidencia verificable en el repositorio. Aplica a todo el código de `apps/api` y `apps/web`, a la documentación de `docs/` y a cada check-in (6 oct, 20 oct, 3 nov y 19 nov).

## 2. Roles

| Rol | Responsabilidad en SQA |
| --- | --- |
| Responsable de QA | Mantiene este plan, la bitácora y el registro de defectos; hace la auditoría interna antes de cada check-in |
| Líder técnico | Estándares de código, pipeline de CI, revisión de arquitectura (ADR) |
| Líder del proyecto | Plan del ciclo (TSP), seguimiento de tareas, reporte ejecutivo |
| Developers | Pruebas de su código, revisión de PR de otros integrantes, registro de defectos que encuentren |

## 3. Características de calidad (ISO/IEC 25010) que priorizamos

| Característica | Cómo la atendemos | Evidencia |
| --- | --- | --- |
| Adecuación funcional | Historias de usuario con criterios de aceptación ligados a pruebas | `docs/HistoriasUsuario.md`, `apps/api/test` |
| Fiabilidad | Validación de entradas (zod), restricciones en BD, manejo de errores centralizado | `errors.ts`, migraciones SQL |
| Seguridad | Contraseñas con bcrypt, JWT con expiración, permisos por rol, SQL parametrizado | `auth/`, pruebas de 401/403 |
| Mantenibilidad | Complejidad ≤ 10, módulos separados, ADR para cada decisión | ESLint en CI, `docs/decisiones` |
| Usabilidad | Mensajes de error en español por campo, semáforo con texto (no solo color) | Pantallas, pruebas de componentes |

## 4. Métricas y metas

| Qué queremos | Métrica | Meta | Cómo se mide |
| --- | --- | --- | --- |
| Que haga lo pedido | % de funciones terminadas (cumplen la definición de terminado) | 100 % en la entrega final | Tablero de historias |
| Pocos errores | Defectos críticos abiertos | 0 en cada entrega | Registro de defectos / Issues |
| Código probado | Cobertura de líneas | ≥ 70 % | `npm run test:coverage` (el umbral detiene el pipeline) |
| Código mantenible | Complejidad ciclomática máxima por función | ≤ 10 | Regla `complexity` de ESLint (y SonarCloud) |

QualiTrack se monitorea a sí mismo: estas mediciones se capturan en el proyecto "QualiTrack" de la herramienta.

## 5. Prácticas (qué vamos a hacer)

| Práctica | Cuándo | Evidencia |
| --- | --- | --- |
| Requisitos claros (historias con criterios de aceptación) | Al planear cada ciclo | `docs/HistoriasUsuario.md`, issues `HU:` |
| Revisión de código por otro integrante | Cada pull request | PR aprobados, [lista de revisión](ListaRevision.md) |
| Análisis estático (ESLint, TypeScript estricto) | Cada cambio, en CI | Historial de GitHub Actions |
| Pruebas unitarias y de integración | Cada cambio, en CI | Reportes de cobertura (artefacto de CI) |
| Pruebas E2E (Playwright) | A partir de la versión Beta | Reporte de Playwright |
| Control de versiones | Siempre: `main` protegida, una etiqueta por entrega | Historial de Git |
| Registro de defectos | Cuando se encuentra un error | [Registro de defectos](RegistroDefectos.md), Issues `DEF:` |
| Auditoría interna | Antes de cada check-in | [Bitácora de SQA](BitacoraSQA.md) |
| Retrospectiva (PDCA) | Al cerrar cada ciclo | `docs/tsp/Postmortem*.md` |

## 6. Estándares

- TypeScript en modo `strict`; ESLint con `typescript-eslint`, `complexity: 10`, `max-depth: 4`, `eqeqeq`.
- Commits con prefijo de tipo: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`; el cuerpo explica el porqué.
- Ramas `feature/HU-xx-descripcion` o `fix/DEF-xxx-descripcion`.
- Toda decisión que cambie la arquitectura o las herramientas se documenta como ADR.

## 7. Definición de terminado

Una historia está terminada cuando: (1) cumple sus criterios de aceptación, (2) tiene pruebas automáticas que pasan en CI, (3) otro integrante revisó y aprobó el PR y (4) la documentación afectada está actualizada.

## 8. Gestión de defectos

Cada defecto se registra con gravedad (crítica, mayor, menor, cosmética), fase en que se detectó y tipo según la clasificación de defectos de TSP. Un defecto se cierra solo con una prueba de regresión que lo cubra. Los defectos críticos bloquean la entrega.

## 9. Auditorías

Antes de cada check-in, el Responsable de QA revisa: que CI esté en verde en `main`, que las métricas estén capturadas en QualiTrack, que el registro de defectos esté al día y que las historias marcadas como terminadas cumplan la definición. El resultado se anota en la bitácora.

## 10. Mejora continua (PDCA)

Planear (plan del ciclo TSP) → Hacer (desarrollo con las prácticas de §5) → Revisar (auditoría y mediciones) → Actuar (acciones del postmortem que entran al siguiente plan).
