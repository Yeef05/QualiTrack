# Registro de defectos

Clasificación de tipo según TSP: 10 Documentación · 20 Sintaxis · 30 Build/paquetes · 40 Asignación · 50 Interfaz · 60 Verificación · 70 Datos · 80 Función · 90 Sistema · 100 Entorno.
Gravedad: crítica · mayor · menor · cosmética. A partir de la Beta, cada defecto nuevo se registra también como Issue `DEF:` en GitHub.

| ID | Fecha | Tipo | Gravedad | Fase inyectado | Fase detectado | Descripción | Corrección | Prueba de regresión | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | 18/10/2026 | 30 Build/paquetes | mayor | Configuración | Instalación | `npm install` falla: npm resolvió TypeScript 7.0 y `typescript-eslint` solo admite `< 6.1` | Fijar `typescript@~6.0.3` en raíz y workspaces ([ADR-003](../decisiones/ADR-003-versiones-herramientas.md)) | La instalación limpia (`npm ci`) en CI | Cerrado |
| DEF-002 | 18/10/2026 | 100 Entorno | crítica | Codificación | Prueba de humo del prototipo | El servidor no arranca en un clon nuevo: PGlite lanza `ENOENT` porque no crea las carpetas de `DATA_DIR` | `createPgliteDb` crea la carpeta con `mkdir -p` antes de abrir la BD (commit `534623c`) | `unit.test.ts`: "DEF-002: crea la carpeta de datos…" | Cerrado |

## Hallazgos de análisis estático

| ID | Fecha | Herramienta | Hallazgo | Acción |
| --- | --- | --- | --- | --- |
| HAL-001 | 18/10/2026 | ESLint `complexity` | `DashboardPage` (17), `TechniquesTab` (16) y `MetricsTab` (13) superaban la meta de complejidad ≤ 10 | Se separó la carga de datos en hooks (`useDashboard`, `useMetricsData`, `useTechniquesData`) y la interfaz en subcomponentes; ahora todas las funciones cumplen (commit `1d0d001`) |

## Resumen al check-in 2

- Defectos registrados: 2 (1 crítico, 1 mayor). Cerrados: 2. **Críticos abiertos: 0** (meta: 0).
- Hallazgos de análisis estático: 1 (3 funciones), atendido antes de integrar.
