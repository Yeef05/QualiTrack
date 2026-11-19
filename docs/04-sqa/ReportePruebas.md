# Reporte de pruebas · QualiTrack 1.0

Producto de trabajo "Reporte de pruebas" de ISO/IEC 29110 ([Plan SQA §4](PlanSQA.md)). Reúne todas las pruebas de la versión final: automáticas, de flujo completo (E2E), casos manuales por criterio de aceptación, pruebas de humo y exploración. Corte: 19/11/2026, `main` con la etiqueta `v1.0-final` más las pruebas E2E.

## Resumen

| Tipo | Cuántas | Resultado | Dónde |
| --- | --- | --- | --- |
| Unitarias e integración de la API (Vitest + supertest) | 68 | 68 pasan · cobertura de líneas 97.8 % | `apps/api/test/` |
| Unitarias y de componentes de la web (Vitest + Testing Library) | 41 | 41 pasan · cobertura de líneas 98.9 % | `apps/web/src/**/*.test.ts(x)` |
| Flujo completo E2E (Playwright, Chrome) | 3 | 3 pasan, tres corridas seguidas | `e2e/flujos.spec.ts` |
| Casos manuales por criterio de aceptación | 33 | 33 de 33 criterios cumplidos | [Revisiones y casos de prueba](RevisionesBeta.md#casos-de-prueba-manuales) |
| Prueba de humo | 10 pasos × 3 ambientes | Local 9 de 10 · PostgreSQL 5 de 5 probados · Render 3 de 10 (sin sesión) | [Prueba de humo](RevisionesBeta.md#prueba-de-humo) |
| Exploración con misión | 1 de 5 sesiones | Sin defectos nuevos | [Exploración](RevisionesBeta.md#exploración-plan-sqa-81) |

Las pruebas automáticas corren en cada push y PR (GitHub Actions: trabajo `calidad` y, desde el 19/11, trabajo `e2e`). La meta del Plan SQA es cobertura ≥ 70 %; el comando falla si baja.

## Pruebas automáticas por módulo

| ID | Tipo | Qué prueba | Archivo | Pruebas | Resultado |
| --- | --- | --- | --- | --- | --- |
| INT-001 | Integración | Inicio de sesión, roles, usuarios (CU-10) con mensajes en español (DEF-012), `/api/team` (DEF-007 y DEF-008) y rutas inexistentes | `auth.test.ts` | 11 | Pasan |
| INT-002 | Integración | Proyectos y periodos (CU-01, CU-02): un nombre por periodo, edición, archivo, responsable de la lista (DEF-007), mensaje de duplicado (DEF-013) | `projects.test.ts` | 9 | Pasan |
| INT-003 | Integración | Métricas y mediciones (CU-04, CU-05): semáforo, fechas futuras, proyectos archivados | `metrics.test.ts` | 8 | Pasan |
| INT-004 | Integración | Modelo por proyecto (CU-03): activar, peor y mejor, restaurar, métrica propia, proyecto archivado (DEF-010) | `model.test.ts` | 6 | Pasan |
| INT-005 | Integración | Técnicas, plan, ejecuciones e índice de salud (CU-06 a CU-09): responsable de la lista (DEF-008), técnica repetida (DEF-013), índice del proyecto de ejemplo (64) | `techniques-health.test.ts` | 10 | Pasan |
| INT-006 | Integración | Registro de defectos (CU-11): registrar, cerrar, las 4 métricas y cierre en proyecto archivado (DEF-009) | `defects.test.ts` | 7 | Pasan |
| UNI-001 | Unitaria | Reglas de cálculo sin base de datos: semáforo con peor y mejor, índice con tope de 79, cumplimiento del plan, fecha de Zacatecas (DEF-003), arranque en carpeta vacía (DEF-002) y actualización de una base del check-in 1 (ADR-004) | `unit.test.ts` | 17 | Pasan |
| UNI-002 | Unitaria | Cliente de la API: sesión, errores por campo, sesión expirada | `client.test.ts` | 8 | Pasan |
| UNI-003 | Unitaria | Formato de valores, fechas, porcentajes, plural "1 abierto" y conversión de peor/mejor (DEF-011) | `format.test.ts` | 12 | Pasan |
| UNI-004 | Unitaria | Tema claro/oscuro y carga de datos de las pantallas | `theme.test.ts`, `useApi.test.ts` | 5 | Pasan |
| COM-001 | Componentes | Semáforo, índice, formulario de proyecto con lista de responsables (DEF-007), gráfica, enlace a Usuarios solo para el Administrador | `components.test.tsx` | 13 | Pasan |
| COM-002 | Componentes | Inicio de sesión y reporte de salud (DEF-005, DEF-006) | `LoginPage.test.tsx`, `ReportTab.test.tsx` | 3 | Pasan |

Cada defecto cerrado tiene al menos una prueba de regresión que cita su ID ([registro de defectos](RegistroDefectos.md)).

## Pruebas de flujo completo (E2E)

Corren en Chrome contra el servidor de producción local (API y frontend compilado, `NODE_ENV=production`) con una base nueva en cada corrida. Comando: `npm run e2e`.

| Flujo | Casos de uso | Pasos | Resultado esperado | Resultado (19/11) |
| --- | --- | --- | --- | --- |
| F1 | CU-01 | Entrar como Líder de QA, registrar un proyecto con responsable de la lista y volver al dashboard | El proyecto aparece en el periodo con su responsable y "Sin datos" | Pasa |
| F2 | CU-04 y CU-08 | Registrar una medición en cada métrica activa y guardar el reporte | Ninguna métrica queda sin semáforo; el índice aparece en el historial | Pasa |
| F3 | CU-11 | Registrar un defecto crítico, ver el reporte, cerrarlo y volver a verlo | Con el crítico abierto: "No · 1 abierto" e índice ≤ 79. Cerrado: "Sí · 0 abiertos" y el índice sube | Pasa |

Se escribieron el 19/11; el plan del ciclo 4 los tenía para el 12/11 (tarea 7).

## Casos de prueba manuales

Los 33 criterios de aceptación de HU-01 a HU-11 tienen un caso (CP-01 a CP-33). Se corrieron el 18/11 sobre el commit `8f3f3e6`:

| Resultado | Casos |
| --- | --- |
| Pasa | 30 |
| Pasa después de corregir DEF-013 | 2: CP-02 (proyecto repetido) y CP-19 (técnica repetida) |
| Solo automático | 1: CP-11 (actualizar una base anterior) |
| Parte sin probar a mano | La impresión a PDF de CP-25; el reporte sí se generó y se guardó |

**Criterios de aceptación cumplidos: 33 de 33 (100 %).** El detalle de cada caso está en la hoja *QualiTrack_23_RevisionesYPruebas*.

## Pruebas de humo

| Ambiente | Fecha | Resultado |
| --- | --- | --- |
| Local, clon nuevo (`npm ci`, `npm run check`, recorrido completo) | 18/11 | 9 de 10 pasos; la impresión a PDF no se probó |
| Modo de producción con el driver de PostgreSQL | 18/11 | Migraciones 001 a 005, datos de ejemplo, frontend compilado y escrituras correctas |
| Render con PostgreSQL (https://qualitrack-x1u0.onrender.com) | 19/11 | Compila y arranca; inicio de sesión, rutas sin sesión (401) y vista de celular correctos. Faltan los pasos con sesión iniciada |

## Defectos encontrados por las pruebas

| Prueba | Defecto | Gravedad | Estado |
| --- | --- | --- | --- |
| Humo del prototipo (18/10) | DEF-002: el servidor no arrancaba en un clon nuevo | Crítica | Cerrado con prueba (UNI-001) |
| Casos CP-02 y CP-19 (18/11) | DEF-013: duplicados con un mensaje que no decía qué cambiar | Menor | Cerrado con prueba (INT-002, INT-005) |
| Revisión R7 a 375 px (18/11) | DEF-014: la lista de técnicas se salía de la tarjeta en celular | Cosmética | Cerrado |

Los demás defectos salieron de revisiones de código y de prototipo; están en el [registro de defectos](RegistroDefectos.md).

## Lo que no se probó

- Prueba con 3 usuarios de otro equipo (métrica "Tareas completadas sin ayuda").
- La impresión a PDF, a mano.
- Cuatro de las cinco sesiones de exploración.
- Los pasos de la prueba de humo en Render que piden iniciar sesión.
