# Bitácora de SQA

Registro cronológico de las actividades de aseguramiento y control de la calidad. Cada entrada dice qué se hizo, qué se encontró y qué decisión se tomó.

## 06/10/2026 · Check-in 1: Definición y arquitectura

- Se entregó el alcance final, los wireframes de las 4 pantallas y la estrategia de calidad (IEEE 730 + ISO/IEC 25010).
- Metas acordadas: 100 % de funciones al final, 0 defectos críticos por entrega, cobertura ≥ 70 % y complejidad ≤ 10.

## 18/10/2026 · Ciclo 2: construcción del prototipo

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Configuración del estándar de código | ESLint con regla `complexity: 10` y TypeScript estricto en ambos workspaces | La meta de complejidad se verifica automáticamente, no a mano |
| Instalación de dependencias | Falla por incompatibilidad TypeScript 7 / typescript-eslint (DEF-001) | Fijar TypeScript 6.0 ([ADR-003](../02-diseno/decisiones/ADR-003-versiones-herramientas.md)); no usar `--force` |
| Revisión de la decisión de base de datos | Docker detenido y sin PostgreSQL local; Prisma no se integra con PGlite | Cambiar a PGlite + SQL parametrizado ([ADR-002](../02-diseno/decisiones/ADR-002-base-de-datos.md)) |
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
| Revisión del producto contra el enunciado, la rúbrica y el Entregable 1 | Los 4 mínimos funcionan. El semáforo, el índice y el catálogo de métricas no coinciden con la hoja del Entregable 1; el código decía "del Entregable 1" sin serlo | Modelo de métricas con peor/mejor y fuente por criterio ([ADR-004](../02-diseno/decisiones/ADR-004-modelo-metricas.md)) |
| Revisión de las métricas para proyectos chicos | La complejidad ciclomática es "métrica en desuso" según el curso y necesita una herramienta; "defectos abiertos ≤ 5" y la tolerancia de 10 % no tienen fuente | Se retiran del catálogo. Complejidad y cobertura quedan como controles automáticos de CI |
| Revisión de las fuentes del plan | IEEE 730 y el texto completo de ISO/IEC 25010 son de pago | Plan SQA 2.0 sobre ISO/IEC 29110 y la adaptación de la maestra ([ADR-005](../02-diseno/decisiones/ADR-005-iso29110.md)) |
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

## 20/10/2026 · Cierre del check-in 2

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Integración a `main` | `fix/DEF-003-…`, `fix/DEF-004-…`, `feature/HU-04-modelo-metricas` y `feature/casos-de-uso` integradas con merge sin fast-forward | DEF-004 pasa a Cerrado. Etiqueta `v0.3-checkin2`. La revisión cruzada en PR sigue pendiente y no se cuenta como hecha |
| Chequeo completo (`npm run check`) en la rama integrada | Lint y tipos sin errores; 84 pruebas en verde (51 API + 33 web); cobertura de líneas 97.5 % API y 99.2 % web; build correcto | Listo para la demo |
| Orden de la documentación | `docs/` separado por carpetas: requisitos, diseño, planeación TSP, SQA y entregas ([índice](../README.md)); los documentos internos del equipo (manual y guion de la demo) quedan en el Drive | Enlaces relativos verificados: 0 rotos |
| Diseño | Diagramas de clases general y de CU-03, CU-10 y CU-11 ([DiagramasClases](../02-diseno/DiagramasClases.md)) | El revisor de cada PR de la Beta compara el código contra la página de su caso de uso |
| Revisión del prototipo al preparar el manual del equipo | 4 detalles menores: título del reporte pegado al semáforo, barra de críticos que se lee al revés, "Responsable de QA" como texto libre y nombres distintos en ejecuciones | Se registran como defectos al iniciar el ciclo 3 |
| Reporte de calidad | [Reporte SQA del check-in 2](../05-entregas/checkin2/ReporteSQA_Checkin2.pdf) con actividades, métricas, índice de salud y autoevaluación con la rúbrica | Se entrega junto con la demo |
| CI en GitHub | La corrida #4 de GitHub Actions sobre `main` (commit `3e2e986`; GitHub muestra la corrida con el hash anterior `65d201f`) pasó lint, tipos, pruebas con cobertura y build | Primer corrido verificado en GitHub; cierra el pendiente del 18/10 |

## 02/11/2026 · Ciclo 3: versión Beta

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Auditoría interna del avance del ciclo 3 (víspera de la Beta) | Del 21/10 al 1/11 no hubo commits, ramas, PR ni documentos nuevos en el Drive; ninguna de las 17 tareas del [Plan del ciclo 3](../03-planeacion-tsp/PlanCiclo3.md) estaba hecha. La junta de lanzamiento del 21/10 no quedó registrada | Se materializaron los riesgos "PR sin revisar" y "CONISOFT reduce horas". El Responsable de calidad implementó el 2/11 los tres casos de uso comprometidos para no llegar a la Beta sin avance; el plan registra quién hizo cada tarea |
| CU-11 Registro de defectos | Migración 004, API, pestaña Defectos y cálculo automático de 4 métricas; 6 pruebas nuevas (cálculo a mano de un caso de ejemplo, A4.1, fechas futuras, archivado, semáforo e índice) | HU-11 terminada salvo la revisión cruzada. Prueba manual en el navegador: registrar, cerrar y ver la métrica en la pestaña Métricas |
| CU-03 Modelo por proyecto | Migración 003, API del modelo y tabla editable con "Restaurar" y métrica propia; 5 pruebas nuevas (aislamiento entre proyectos, A3.2, A4.1, permisos, restaurar) | Cierra la consecuencia pendiente del ADR-004 (activar una opcional era global) |
| CU-10 Pantalla de usuarios | Ruta `/usuarios` solo para el Administrador; prueba de que el enlace solo aparece para ese rol | Con la lista de usuarios ya se pueden corregir DEF-007 y DEF-008 para la entrega final |
| Análisis estático | HAL-002: complejidad 11 en `ModelRow` | Refactor antes del commit; la regla de ESLint funcionó como compuerta |
| Registro de los 4 detalles del 20/10 | DEF-005 a DEF-008 registrados; DEF-005 y DEF-006 corregidos con prueba de regresión, DEF-007 y DEF-008 abiertos | El tiempo medio de corrección sube a 4.3 días (amarillo). Lección: registrar el defecto el día que se encuentra, no "al iniciar el ciclo" |
| Chequeo completo (`npm run check`) | Lint y tipos sin errores; 98 pruebas en verde (62 API + 36 web); cobertura de líneas 97.95 % API y 99.2 % web; build correcto | Listo para la demo |
| Índice de salud de QualiTrack medido con su propio modelo | 79/100 (amarillo): densidad 0.73 y tiempo de corrección 4.3 días en amarillo, plan de técnicas al 75 % | Para la entrega final: revisión cruzada en cada PR, `main` protegida y cerrar DEF-007 y DEF-008 |
| Revisión cruzada y `main` protegida | **Siguen sin hacerse.** Las ramas se integraron con merge sin fast-forward, sin aprobación de otro integrante | No se cuentan como hechas. Cada dueño de CU revisa el código de la Beta (§3 del plan) antes del 9/11 |

## 03/11/2026 · Gestión de configuración antes de la demo

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Limpieza de los mensajes de commit | Se reescribieron los mensajes del historial a partir del 19/10. El código no cambió: el árbol de cada rama es idéntico al anterior. Cambiaron los hashes de esos commits y se movieron las etiquetas `v0.3-checkin2` y `v0.4-beta` | Se actualizaron los hashes que citan el registro de defectos y esta bitácora. Quien tenga un clon anterior debe volver a clonar el repositorio |
| Interfaz de la Beta | Rediseño visual y modo claro/oscuro (variables de color por tema, selector en el encabezado, gráfica y reporte adaptados; el PDF se imprime siempre en claro). Revisión visual de las pantallas en ambos modos y en ancho de celular | 100 pruebas en verde (62 API + 38 web), 2 nuevas del tema. Se corrigió además que la densidad se mostrara con 1 decimal (0.7 en lugar de 0.73) |
| Artefactos del proceso al día | Postmortem del ciclo 2 llenado con los datos del repositorio; postmortem del ciclo 3 con Pareto por tipo TSP y análisis de causa; plan del ciclo 4 con responsable, revisor y fecha; registro de reuniones y de tiempos; formato de revisión cruzada de la Beta (7 revisiones asignadas) | Lo que solo puede dar el equipo (horas reales, asistentes y acuerdos, revisiones) queda para la junta del 4/11 |

## 03/11/2026 · Revisión del código de la Beta (inicio)

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Revisión de R1, R3, R4 y R5 con la lista de revisión | 4 defectos: cerrar defectos de un proyecto archivado (DEF-009), modelo editable en un proyecto archivado (DEF-010), peor/mejor vacío guardado como 0 (DEF-011), errores en inglés y correo repetido (DEF-012) | Corrección con pruebas de regresión en la rama `fix/revision-cruzada-beta`. Quedó sin commit ni registro hasta el 18/11 |

## 18/11/2026 · Ciclo 4: auditoría final antes de la entrega

| Actividad SQA | Resultado | Decisión / acción |
| --- | --- | --- |
| Auditoría del avance del ciclo 4 | Del 4 al 17/11 no hubo commits, ramas ni cambios en los documentos del repositorio; las revisiones R1 a R7 y las tareas del plan del ciclo 4 no tenían registro | Se repite lo del ciclo 3: el riesgo "el trabajo se concentra en una persona" se materializó. El Responsable de calidad hace las tareas de verificación que faltan para la entrega |
| Registro de los defectos del 3/11 | DEF-009 a DEF-012 registrados con su fecha real (03/11) y cerrados al integrarse (18/11): 15 días cada uno | Tres commits en `fix/DEF-009-012-revision-beta`, uno por defecto o par de defectos |
| DEF-007 y DEF-008 | Migración 005, `GET /api/team` y listas desplegables; 4 pruebas de regresión nuevas | Cerrados después de 29 días. Al ligar los usuarios de ejemplo, ESLint marcó complejidad 11 en `seedDemoProject` (HAL-003) y se separó la función antes del commit |
| Revisión de R2, R6 y R7 | R2 y R6 con hallazgos (plural "1 abiertos", ya corregido); R7 rechazada por DEF-014 (lista que se sale de la tarjeta en celular) | 7 de 7 revisiones hechas: 5 rechazadas y 2 con hallazgos ([revisiones](RevisionesBeta.md)). No cuentan como revisión cruzada: las hizo la misma cuenta que integró el código |
| Casos de prueba manuales CP-01 a CP-33 | 33 de 33 criterios cumplidos. CP-02 y CP-19 rechazaban el duplicado con un mensaje genérico (DEF-013) | DEF-013 corregido con prueba. La métrica "Criterios de aceptación cumplidos" queda en 100 % con prueba automática y manual |
| Prueba de humo en un clon nuevo | `npm ci` y `npm run check` correctos: 109 pruebas, cobertura 97.8 % API y 98.9 % web. Recorrido completo en el navegador, en claro, oscuro y celular | La exportación a PDF no se probó a mano |
| Modo de producción con el driver de PostgreSQL | Migraciones 001 a 005, datos de ejemplo, frontend compilado y escrituras correctas con `NODE_ENV=production` | Se agrega `render.yaml`. Falta desplegar en Render y repetir ahí la prueba de humo |
| Índice de salud de QualiTrack con su propio modelo | 64/100 (antes 79): densidad 1.27 y tiempo de corrección 10.3 días en rojo, plan de técnicas en 75 % | Se entrega con 0 defectos abiertos. El índice baja por cómo se trabajó, no por el estado del producto, y así se explica en el postmortem del ciclo 4 |
| Versión | La interfaz decía "v0.4 Beta"; ahora dice "v1.0". Paquetes en 1.0.0 | Etiqueta `v1.0-final` en `main` |

### Auditoría interna final (Plan SQA §12)

| Punto | Estado |
| --- | --- |
| CI en verde en `main` | Local: sí (`npm run check` y clon nuevo). En GitHub: confirmar la corrida de Actions después de subir `main` |
| Métricas capturadas | Sí: [Mediciones](Mediciones.md) al 18/11 y proyecto "QualiTrack" de la herramienta con el registro real |
| Registro de defectos al día | Sí: 14 registrados, 14 cerrados, 0 críticos abiertos |
| Historias terminadas según la definición | **No:** las 11 cumplen sus criterios y tienen pruebas, pero ningún PR tuvo la aprobación de otro integrante |
| `main` protegida | Sin evidencia en el repositorio |
