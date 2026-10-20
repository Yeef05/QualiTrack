# Bitácora de SQA

Registro cronológico de las actividades de aseguramiento y control de la calidad. Cada entrada dice qué se hizo, qué se encontró y qué decisión se tomó.

## 06/10/2026 · Check-in 1: Definición y arquitectura

- Se entregó el alcance final, los wireframes de las 4 pantallas y la estrategia de calidad (IEEE 730 + ISO/IEC 25010).
- Metas acordadas: 100 % de funciones al final, 0 defectos críticos por entrega, cobertura ≥ 70 % y complejidad ≤ 10.

## 18/10/2026 · Ciclo 2: construcción del prototipo

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Configuración del estándar de código | ESLint con regla `complexity: 10` y TypeScript estricto en ambos workspaces | La meta de complejidad se verifica automáticamente, no a mano |
| Instalación de dependencias | Falla por incompatibilidad TypeScript 7 / typescript-eslint (DEF-001) | Fijar TypeScript 6.0 ([ADR-003](../decisiones/ADR-003-versiones-herramientas.md)); no usar `--force` |
| Revisión de la decisión de base de datos | Docker detenido y sin PostgreSQL local; Prisma no se integra con PGlite | Cambiar a PGlite + SQL parametrizado ([ADR-002](../decisiones/ADR-002-base-de-datos.md)) |
| Pruebas de integración de la API | 45 pruebas en el primer corrido, 0 fallas; cobertura de líneas 97.4 % | Se agregan casos negativos (400/401/403/404/409) por cada ruta |
| Análisis estático del frontend | 3 componentes con complejidad 13-17 (HAL-001) | Refactor a hooks + subcomponentes antes de integrar |
| Prueba de humo del prototipo completo | El servidor no arranca en un clon nuevo (DEF-002, crítico) | Corrección + prueba de regresión; se vuelve a probar el flujo completo |
| Prueba manual de las 4 pantallas | Login, dashboard por periodo, métricas con tendencia, plan de técnicas y reporte con índice funcionan con los datos de ejemplo | Sin defectos nuevos |
| Pipeline de CI | Workflow con lint, typecheck, pruebas con umbral de cobertura y build | Pendiente: primer corrido en GitHub al subir el repositorio |
| Chequeo completo local (`npm run check`) | Lint 0 errores · tipos 0 errores · 78 pruebas pasan · build correcto | Listo para el check-in 2 |

### Auditoría interna previa al check-in 2

| Punto | Estado |
| --- | --- |
| CI en verde | Local: sí (`npm run check`). En GitHub: pendiente de subir el repositorio |
| Métricas capturadas | Sí, ver [Mediciones](Mediciones.md) |
| Registro de defectos al día | Sí: 2 registrados, 2 cerrados, 0 críticos abiertos |
| Historias terminadas según la definición | **No todavía**: las historias tienen pruebas y criterios cumplidos, pero falta la revisión de código por otro integrante (PR aprobado). Se hará al subir el repositorio |
| Plantillas de PR e Issues | Sí, en `.github/` |

**Acciones antes de la demo:** subir el repositorio a GitHub, proteger `main`, abrir el PR del prototipo para revisión cruzada y confirmar CI en verde.

## 19/10/2026 · Revisión previa al check-in 2

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Revisión del producto contra el enunciado, la rúbrica y el Entregable 1 | Los 4 mínimos funcionan. El semáforo, el índice y el catálogo de métricas no coinciden con la hoja del Entregable 1; el código decía "del Entregable 1" sin serlo | Modelo de métricas con peor/mejor y fuente por criterio ([ADR-004](../decisiones/ADR-004-modelo-metricas.md)) |
| Revisión de las métricas para proyectos chicos | La complejidad ciclomática es "métrica en desuso" según el curso y necesita una herramienta; "defectos abiertos ≤ 5" y la tolerancia de 10 % no tienen fuente | Se retiran del catálogo. Complejidad y cobertura quedan como controles automáticos de CI |
| Revisión de las fuentes del plan | IEEE 730 y el texto completo de ISO/IEC 25010 son de pago | Plan SQA 2.0 sobre ISO/IEC 29110 y la adaptación de la maestra ([ADR-005](../decisiones/ADR-005-iso29110.md)) |
| Prueba manual después de las 18:00 | Las mediciones de ejemplo salían con fecha de mañana: la API usaba UTC (DEF-003, mayor) | Corrección y pruebas de regresión en `fix/DEF-003-fecha-zona-horaria` |
| Prueba manual del encabezado | "Líder QA · Líder QA" (DEF-004, cosmético) | Corrección en `fix/DEF-004-nombres-usuarios-demo` |
| Chequeo completo (`npm run check`) en cada rama | Lint y tipos sin errores; pruebas en verde; build correcto | Las tres ramas quedan listas para revisión cruzada |

### Auditoría interna previa al check-in 2 (actualizada)

| Punto | Estado |
| --- | --- |
| CI en verde | Local: sí en las tres ramas. En GitHub: confirmar en Actions al subir las ramas |
| Métricas capturadas | Sí, con el modelo nuevo ([Mediciones](Mediciones.md)) |
| Registro de defectos al día | Sí: 4 registrados, 0 críticos abiertos |
| Historias terminadas según la definición | **No todavía**: falta que otro integrante apruebe los PR de `feature/HU-04-modelo-metricas`, `fix/DEF-003-…` y `fix/DEF-004-…` |
| `main` protegida y etiqueta por entrega | **No**: pendiente del responsable de colaboración o del técnico |

**Acciones antes de la demo:**
1. Cada PR lo revisa y aprueba otro integrante con la lista de revisión.
2. Integrar los tres PR a `main`.
3. Etiquetar `v0.3-checkin2`.
4. Borrar `apps/api/.data/` para cargar los datos de ejemplo nuevos.
