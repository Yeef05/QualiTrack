# Registro de defectos

Clasificación de tipo según TSP: 10 Documentación · 20 Sintaxis · 30 Build/paquetes · 40 Asignación · 50 Interfaz · 60 Verificación · 70 Datos · 80 Función · 90 Sistema · 100 Entorno.
Gravedad: crítica · mayor · menor · cosmética. A partir de la Beta, cada defecto nuevo se registra también como Issue `DEF:` en GitHub.

| ID | Fecha | Tipo | Gravedad | Fase inyectado | Fase detectado | Descripción | Corrección | Prueba de regresión | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | 18/10/2026 | 30 Build/paquetes | mayor | Configuración | Instalación | `npm install` falla: npm resolvió TypeScript 7.0 y `typescript-eslint` solo admite `< 6.1` | Fijar `typescript@~6.0.3` en raíz y workspaces ([ADR-003](../decisiones/ADR-003-versiones-herramientas.md)) | La instalación limpia (`npm ci`) en CI | Cerrado |
| DEF-002 | 18/10/2026 | 100 Entorno | crítica | Codificación | Prueba de humo del prototipo | El servidor no arranca en un clon nuevo: PGlite lanza `ENOENT` porque no crea las carpetas de `DATA_DIR` | `createPgliteDb` crea la carpeta con `mkdir -p` antes de abrir la BD (commit `5514def`) | `unit.test.ts`: "DEF-002: crea la carpeta de datos…" | Cerrado |
| DEF-003 | 19/10/2026 | 80 Función | mayor | Codificación | Revisión previa al check-in 2 (prueba manual después de las 18:00) | La API calcula "hoy" en UTC y la web en hora local. Después de las 18:00 en Zacatecas, las mediciones de ejemplo salen con fecha de mañana, una técnica puede verse al día o atrasada con un día de diferencia y el historial de reportes muestra el día siguiente | `todayIso` usa la zona `America/Mexico_City` (configurable con `APP_TIMEZONE`); la web convierte los instantes con hora al día local antes de mostrarlos | `unit.test.ts`: "DEF-003: hoy es el día de Zacatecas…" y `format.test.ts`: "DEF-003: un instante con hora…" | Cerrado |
| DEF-004 | 19/10/2026 | 70 Datos | cosmética | Codificación | Revisión previa al check-in 2 | El encabezado muestra "Líder QA · Líder QA" porque el usuario de ejemplo se llama igual que su rol | Dar nombres de persona a los usuarios de ejemplo en `seed.ts` | `auth.test.ts`: "los usuarios de ejemplo tienen nombre de persona" | Abierto (rama `fix/DEF-004-nombres-usuarios-demo`) |

## Hallazgos de análisis estático

| ID | Fecha | Herramienta | Hallazgo | Acción |
| --- | --- | --- | --- | --- |
| HAL-001 | 18/10/2026 | ESLint `complexity` | `DashboardPage` (17), `TechniquesTab` (16) y `MetricsTab` (13) superaban la meta de complejidad ≤ 10 | Se separó la carga de datos en hooks (`useDashboard`, `useMetricsData`, `useTechniquesData`) y la interfaz en subcomponentes; ahora todas las funciones cumplen (commit `d0a3ab6`) |

## Resumen al check-in 2

- Defectos registrados: 4 (1 crítico, 2 mayores, 1 cosmético). Cerrados: 3. **Críticos abiertos: 0** (meta: 0).
- Todos los encontró el equipo antes de la demo, con prueba de humo, instalación limpia y revisión manual (A = 4, B = 0, C = 0).
- Hallazgos de análisis estático: 1 (3 funciones), atendido antes de integrar.
