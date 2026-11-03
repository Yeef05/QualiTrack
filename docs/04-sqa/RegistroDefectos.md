# Registro de defectos

Clasificación de tipo según TSP: 10 Documentación · 20 Sintaxis · 30 Build/paquetes · 40 Asignación · 50 Interfaz · 60 Verificación · 70 Datos · 80 Función · 90 Sistema · 100 Entorno.
Gravedad: crítica · mayor · menor · cosmética. A partir de la Beta, cada defecto nuevo se registra también como Issue `DEF:` en GitHub.

| ID | Fecha | Tipo | Gravedad | Fase inyectado | Fase detectado | Descripción | Corrección | Prueba de regresión | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | 18/10/2026 | 30 Build/paquetes | mayor | Configuración | Instalación | `npm install` falla: npm resolvió TypeScript 7.0 y `typescript-eslint` solo admite `< 6.1` | Fijar `typescript@~6.0.3` en raíz y workspaces ([ADR-003](../02-diseno/decisiones/ADR-003-versiones-herramientas.md)) | La instalación limpia (`npm ci`) en CI | Cerrado |
| DEF-002 | 18/10/2026 | 100 Entorno | crítica | Codificación | Prueba de humo del prototipo | El servidor no arranca en un clon nuevo: PGlite lanza `ENOENT` porque no crea las carpetas de `DATA_DIR` | `createPgliteDb` crea la carpeta con `mkdir -p` antes de abrir la BD (commit `5514def`) | `unit.test.ts`: "DEF-002: crea la carpeta de datos…" | Cerrado |
| DEF-003 | 19/10/2026 | 80 Función | mayor | Codificación | Revisión previa al check-in 2 (prueba manual después de las 18:00) | La API calcula "hoy" en UTC y la web en hora local. Después de las 18:00 en Zacatecas, las mediciones de ejemplo salen con fecha de mañana, una técnica puede verse al día o atrasada con un día de diferencia y el historial de reportes muestra el día siguiente | `todayIso` usa la zona `America/Mexico_City` (configurable con `APP_TIMEZONE`); la web convierte los instantes con hora al día local antes de mostrarlos | `unit.test.ts`: 'DEF-003: "hoy" es el día de Zacatecas…' y `format.test.ts`: "DEF-003: un instante con hora…" | Cerrado |
| DEF-004 | 19/10/2026 | 70 Datos | cosmética | Codificación | Revisión previa al check-in 2 | El encabezado muestra "Líder QA · Líder QA" porque el usuario de ejemplo se llama igual que su rol | Dar nombres de persona a los usuarios de ejemplo en `seed.ts` | `auth.test.ts`: "los usuarios de ejemplo tienen nombre de persona" | Cerrado |
| DEF-005 | 20/10/2026 | 50 Interfaz | cosmética | Codificación | Revisión del prototipo al preparar el manual del equipo | En el reporte, el subtítulo "Métricas que requieren atención" queda pegado al semáforo del índice | Margen superior de 24 px después del bloque del índice (`styles.css`, commit `dd2ddfd`) | Revisión visual en el navegador (margen calculado 24 px) | Cerrado 02/11 |
| DEF-006 | 20/10/2026 | 50 Interfaz | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | La barra "Defectos críticos" se ve llena cuando hay 0 abiertos, así que se lee como "100 % críticos" | La barra se llama "Libre de defectos críticos" y dice "Sí · 0 abiertos" o "No · N abiertos" (commit `dd2ddfd`) | `ReportTab.test.tsx`: "DEF-006: barra de defectos críticos del reporte" | Cerrado 02/11 |
| DEF-007 | 20/10/2026 | 50 Interfaz | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | "Responsable de QA" del proyecto es texto libre: no se liga a un usuario y la misma persona puede escribirse de varias formas | Ahora que existe la pantalla de usuarios (CU-10), elegir al responsable de una lista de usuarios | Por escribir | **Abierto** (entrega final) |
| DEF-008 | 20/10/2026 | 70 Datos | menor | Diseño | Revisión del prototipo al preparar el manual del equipo | El responsable de cada ejecución de técnica es texto libre: en el historial la misma persona sale con nombres distintos | Igual que DEF-007: lista de usuarios, con el usuario de la sesión por omisión | Por escribir | **Abierto** (entrega final) |

## Hallazgos de análisis estático

| ID | Fecha | Herramienta | Hallazgo | Acción |
| --- | --- | --- | --- | --- |
| HAL-001 | 18/10/2026 | ESLint `complexity` | `DashboardPage` (17), `TechniquesTab` (16) y `MetricsTab` (13) superaban la meta de complejidad ≤ 10 | Se separó la carga de datos en hooks (`useDashboard`, `useMetricsData`, `useTechniquesData`) y la interfaz en subcomponentes; ahora todas las funciones cumplen (commit `d0a3ab6`) |
| HAL-002 | 02/11/2026 | ESLint `complexity` | `ModelRow` de la tabla editable "Modelo de calidad" (CU-03) tenía complejidad 11 | Se separó la celda de peor/mejor en `ThresholdCell`; lint sin errores antes del commit `1d66b58` |

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
