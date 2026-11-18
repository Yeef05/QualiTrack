# Registro de defectos

Clasificación de tipo según TSP: 10 Documentación · 20 Sintaxis · 30 Build/paquetes · 40 Asignación · 50 Interfaz · 60 Verificación · 70 Datos · 80 Función · 90 Sistema · 100 Entorno.
Gravedad: crítica · mayor · menor · cosmética. Desde la Beta cada defecto se registra también en la pestaña Defectos del proyecto "QualiTrack".

| ID | Fecha | Tipo | Gravedad | Fase inyectado | Fase detectado | Descripción | Corrección | Prueba de regresión | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | 18/10/2026 | 30 Build/paquetes | mayor | Configuración | Instalación | `npm install` falla: npm resolvió TypeScript 7.0 y `typescript-eslint` solo admite `< 6.1` | Fijar `typescript@~6.0.3` en raíz y workspaces ([ADR-003](../02-diseno/decisiones/ADR-003-versiones-herramientas.md)) | La instalación limpia (`npm ci`) en CI | Cerrado |
| DEF-002 | 18/10/2026 | 100 Entorno | crítica | Codificación | Prueba de humo del prototipo | El servidor no arranca en un clon nuevo: PGlite lanza `ENOENT` porque no crea las carpetas de `DATA_DIR` | `createPgliteDb` crea la carpeta con `mkdir -p` antes de abrir la BD (commit `5514def`) | `unit.test.ts`: "DEF-002: crea la carpeta de datos…" | Cerrado |
| DEF-003 | 19/10/2026 | 80 Función | mayor | Codificación | Revisión previa al check-in 2 (prueba manual después de las 18:00) | La API calcula "hoy" en UTC y la web en hora local. Después de las 18:00 en Zacatecas, las mediciones de ejemplo salen con fecha de mañana, una técnica puede verse al día o atrasada con un día de diferencia y el historial de reportes muestra el día siguiente | `todayIso` usa la zona `America/Mexico_City` (configurable con `APP_TIMEZONE`); la web convierte los instantes con hora al día local antes de mostrarlos | `unit.test.ts`: 'DEF-003: "hoy" es el día de Zacatecas…' y `format.test.ts`: "DEF-003: un instante con hora…" | Cerrado |
| DEF-004 | 19/10/2026 | 70 Datos | cosmética | Codificación | Revisión previa al check-in 2 | El encabezado muestra "Líder QA · Líder QA" porque el usuario de ejemplo se llama igual que su rol | Dar nombres de persona a los usuarios de ejemplo en `seed.ts` | `auth.test.ts`: "los usuarios de ejemplo tienen nombre de persona" | Cerrado |
| DEF-005 | 20/10/2026 | 50 Interfaz | cosmética | Codificación | Revisión del prototipo al preparar el manual del equipo | En el reporte, el subtítulo "Métricas que requieren atención" queda pegado al semáforo del índice | Margen superior de 24 px después del bloque del índice (`styles.css`, commit `5050e69`) | Revisión visual en el navegador (margen calculado 24 px) | Cerrado 02/11 |
| DEF-006 | 20/10/2026 | 50 Interfaz | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | La barra "Defectos críticos" se ve llena cuando hay 0 abiertos, así que se lee como "100 % críticos" | La barra se llama "Libre de defectos críticos" y dice "Sí · 0 abiertos" o "No · N abiertos" (commit `5050e69`) | `ReportTab.test.tsx`: "DEF-006: barra de defectos críticos del reporte" | Cerrado 02/11 |
| DEF-007 | 20/10/2026 | 50 Interfaz | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | "Responsable de QA" del proyecto es texto libre: no se liga a un usuario y la misma persona puede escribirse de varias formas | Migración 005 (`qa_lead_id`), `GET /api/team` y lista desplegable en el formulario del proyecto (commit `8f3f3e6`) | `projects.test.ts` y `components.test.tsx`: "DEF-007: el responsable de QA se elige de la lista de usuarios" | Cerrado 18/11 |
| DEF-008 | 20/10/2026 | 70 Datos | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | El responsable de cada ejecución de técnica es texto libre: en el historial la misma persona sale con nombres distintos | `responsible_id` en las ejecuciones y lista desplegable con el usuario de la sesión por omisión (commit `8f3f3e6`) | `techniques-health.test.ts`: "DEF-008: el responsable de la ejecución es un usuario de la lista…" | Cerrado 18/11 |
| DEF-009 | 03/11/2026 | 80 Función | menor | Codificación | Revisión del código de la Beta (R1) | La pestaña Defectos oculta "Cerrar" en un proyecto archivado, pero la API sí acepta el cierre | La API responde 409 al cerrar un defecto de un proyecto archivado (commit `f7c71f9`) | `defects.test.ts`: "DEF-009: tampoco permite cerrar defectos de un proyecto archivado" | Cerrado 18/11 |
| DEF-010 | 03/11/2026 | 80 Función | menor | Diseño | Revisión del código de la Beta (R3 y R4) | El modelo de calidad de un proyecto archivado se puede cambiar y restaurar, aunque sus mediciones ya no se pueden capturar | La API responde 409 y la tabla del modelo queda de solo lectura (commit `ef9f40e`) | `model.test.ts`: "DEF-010: el modelo de un proyecto archivado no se puede cambiar ni restaurar" | Cerrado 18/11 |
| DEF-011 | 03/11/2026 | 70 Datos | mayor | Codificación | Revisión del código de la Beta (R4) | Si se borra el valor peor o mejor en la tabla del modelo, `Number('')` lo guarda como 0 sin avisar | `parseNumber` deja el campo sin dato y la tabla pide escribirlo (commit `ef9f40e`) | `format.test.ts`: "DEF-011: un campo vacío no se convierte en 0" | Cerrado 18/11 |
| DEF-012 | 03/11/2026 | 50 Interfaz | menor | Codificación | Revisión del código de la Beta (R5) | Los errores de validación salen en inglés ("Invalid email", "Required") y un correo repetido da el mensaje genérico de duplicado | Mapa de errores de zod en español y 409 con mensaje propio para el correo (commit `3df84c2`) | `auth.test.ts`: "DEF-012: los errores al dar de alta un usuario están en español…" | Cerrado 18/11 |
| DEF-013 | 18/11/2026 | 50 Interfaz | menor | Codificación | Casos de prueba manuales (CP-02 y CP-19) | Un proyecto repetido en el periodo o una técnica repetida en el plan responden "Ya existe un registro con esos datos", sin decir qué cambiar | Mensajes propios para cada duplicado (commit `77a2ae8`) | `projects.test.ts` y `techniques-health.test.ts` comparan el mensaje | Cerrado 18/11 |
| DEF-014 | 18/11/2026 | 50 Interfaz | cosmética | Codificación | Revisión visual en ancho de celular (R7) | La lista de técnicas de "Agregar técnica al plan" se sale de la tarjeta: la celda de la cuadrícula crece con la opción más larga | `min-width: 0` en los campos del formulario (`styles.css`, commit `77a2ae8`) | Revisión en el navegador a 375 px: todos los campos quedan dentro de la tarjeta | Cerrado 18/11 |

## Hallazgos de análisis estático

| ID | Fecha | Herramienta | Hallazgo | Acción |
| --- | --- | --- | --- | --- |
| HAL-001 | 18/10/2026 | ESLint `complexity` | `DashboardPage` (17), `TechniquesTab` (16) y `MetricsTab` (13) superaban la meta de complejidad ≤ 10 | Se separó la carga de datos en hooks (`useDashboard`, `useMetricsData`, `useTechniquesData`) y la interfaz en subcomponentes; ahora todas las funciones cumplen (commit `d0a3ab6`) |
| HAL-002 | 02/11/2026 | ESLint `complexity` | `ModelRow` de la tabla editable "Modelo de calidad" (CU-03) tenía complejidad 11 | Se separó la celda de peor/mejor en `ThresholdCell`; lint sin errores antes del commit `fc3762e` |
| HAL-003 | 18/11/2026 | ESLint `complexity` | `seedDemoProject` llegó a complejidad 11 al ligar los responsables de ejemplo con usuarios (DEF-007/008) | El plan de técnicas de ejemplo se separó en `seedPlan`; lint sin errores antes del commit `8f3f3e6` |

## Resumen al check-in 2

- Defectos registrados: 4 (1 crítico, 2 mayores, 1 cosmético). Cerrados: 4. **Críticos abiertos: 0** (meta: 0).
- Todos los encontró el equipo antes de la demo, con prueba de humo, instalación limpia y revisión manual (A = 4, B = 0, C = 0).
- Hallazgos de análisis estático: 1 (3 funciones), atendido antes de integrar.

## Resumen a la Beta (02/11/2026)

- Defectos registrados: 8 (1 crítico, 2 mayores, 3 menores, 2 cosméticos). Cerrados: 6. **Críticos abiertos: 0** (meta: 0). Abiertos: DEF-007 y DEF-008, menores, para la entrega final.
- Todos los encontró el equipo (A = 8, B = 0, C = 0): eficiencia de QA 100 %. B se actualiza con las observaciones de la maestra en la demo de la Beta.
- Densidad: 8 defectos ÷ 11 historias entregadas = **0.73** (amarillo; peor 1.0, mejor 0.5).
- Tiempo medio de corrección: (0 + 0 + 0 + 0 + 13 + 13) ÷ 6 = **4.3 días** (amarillo; peor 7, mejor 2). DEF-005 y DEF-006 esperaron 13 días porque se dejaron para el ciclo 3 y nadie los tomó hasta el 2/11.
- Por tipo TSP: 50 Interfaz 3 · 70 Datos 2 · 30 Build 1 · 80 Función 1 · 100 Entorno 1. El tipo más frecuente es Interfaz: para la entrega final se agrega a la lista de revisión un punto de revisión visual de cada pantalla.
- Desde la Beta, el registro también vive en QualiTrack (pestaña Defectos del proyecto "QualiTrack"), que calcula estas 4 métricas solo.
- Hallazgos de análisis estático: 2 (HAL-001 y HAL-002), atendidos antes de integrar.

## Resumen a la entrega final (18/11/2026)

- Defectos registrados: 14 (1 crítico, 3 mayores, 7 menores, 3 cosméticos). Cerrados: 14. **Críticos abiertos: 0** (meta: 0).
- Todos los encontró el equipo (A = 14, B = 0, C = 0): eficiencia de QA 100 %. Las observaciones de la maestra en la Beta no quedaron registradas; si las hubo, entran como B y bajan este valor.
- Densidad: 14 defectos ÷ 11 historias entregadas = **1.27** (rojo; peor 1.0, mejor 0.5). La revisión del código de la Beta y los casos de prueba manuales encontraron 6 defectos más.
- Tiempo medio de corrección: (0 × 4 + 13 × 2 + 29 × 2 + 15 × 4 + 0 × 2) ÷ 14 = **10.3 días** (rojo; peor 7, mejor 2). DEF-007 y DEF-008 estuvieron abiertos 29 días. DEF-009 a DEF-012 se corrigieron en una rama el 3/11, pero nadie la revisó ni la integró hasta el 18/11; el registro cuenta el defecto como cerrado cuando la corrección llega a `main`.
- Por tipo TSP: 50 Interfaz 6 · 70 Datos 3 · 80 Función 3 · 30 Build 1 · 100 Entorno 1. Interfaz sigue siendo el tipo más frecuente (43 %).
- Por fase en que se detectaron: revisión manual o visual 7, revisión de código 4, casos de prueba 1, instalación 1, prueba de humo 1.
- Hallazgos de análisis estático: 3 (HAL-001 a HAL-003), todos atendidos antes del commit.
