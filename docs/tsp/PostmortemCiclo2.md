# Postmortem del ciclo 2 (TSP) · para llenar después de la demo del 20 de octubre

## 1. Plan contra real

| Medida | Plan | Real | Diferencia |
| --- | --- | --- | --- |
| Horas totales | 41 | | |
| Tareas terminadas | 15 | | |
| Defectos encontrados | — | 2 (DEF-001, DEF-002) + 1 hallazgo de análisis estático | |
| Defectos críticos abiertos al entregar | 0 | 0 | 0 |
| Cobertura de líneas (API / web) | ≥ 70 % | 97.4 % / 99.1 % | + |

## 2. Defectos por fase

| Fase en que se detectó | Cantidad | Comentario |
| --- | --- | --- |
| Instalación / configuración | 1 | DEF-001: versión de TypeScript |
| Análisis estático | 1 hallazgo (3 funciones) | HAL-001: complejidad de componentes |
| Prueba de humo | 1 | DEF-002: carpeta de datos de PGlite |
| Revisión de código | | |
| Demo | | |

## 3. Qué funcionó (mantener)

- Que la regla de complejidad de ESLint detectara los componentes grandes antes de integrarlos.
- Las pruebas de integración con una base de datos real en memoria.

## 4. Qué no funcionó (cambiar)

-

## 5. Acciones para el ciclo 3 (PDCA → Actuar)

| Acción | Responsable | Fecha |
| --- | --- | --- |
| Subir el repositorio, proteger `main` y hacer la revisión cruzada pendiente | | |
| Conectar SonarCloud | David | |
| Pruebas E2E con Playwright de los flujos principales | Jorge | |
| Pantalla de administración de usuarios (M5) | | |
| Importación de mediciones por CSV | | |
| Desplegar en Render con PostgreSQL | David | |
