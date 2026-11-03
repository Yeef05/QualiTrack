# Postmortem del ciclo 2 (TSP) · Prototipo funcional · 7 al 20 de octubre de 2026

Cierre del ciclo del [plan del ciclo 2](PlanCiclo2.md). Los datos salen del historial del repositorio, del [registro de defectos](../04-sqa/RegistroDefectos.md) y de la [bitácora de SQA](../04-sqa/BitacoraSQA.md). Las celdas marcadas con ✍ las llena el equipo.

## 1. Plan contra real

| Medida | Plan | Real | Diferencia |
| --- | --- | --- | --- |
| Horas totales | 41 | ✍ Suma de [Registro de tiempos](RegistroTiempos.md) | ✍ |
| Tareas hechas | 15 | 13 hechas, 1 parcial (tarea 12, falta SonarCloud) y 1 pendiente (tarea 13, revisión cruzada) | −1 pendiente, −1 parcial |
| Tareas terminadas según la definición de terminado (Plan SQA §10) | 15 | 0, porque ningún PR tuvo revisión de otro integrante | −15 |
| Defectos registrados | — | 4 (DEF-001 a DEF-004) y 1 hallazgo de análisis estático (HAL-001) | — |
| Defectos críticos abiertos al entregar | 0 | 0 | 0 |
| Cobertura de líneas (API / web) | ≥ 70 % | 97.5 % / 99.2 % | + |
| Índice de salud de QualiTrack | ≥ 80 | 93 | + |

## 2. Defectos por fase en que se detectaron

| Fase | Cantidad | Defectos |
| --- | --- | --- |
| Instalación / configuración | 1 | DEF-001 (versión de TypeScript) |
| Análisis estático | 1 hallazgo | HAL-001 (complejidad de 3 componentes) |
| Prueba de humo | 1 | DEF-002 (crítico: carpeta de datos de PGlite) |
| Revisión manual previa a la demo | 2 | DEF-003 (zona horaria) y DEF-004 (nombre de usuario de ejemplo) |
| Revisión de código entre integrantes | 0 | No se hizo |
| Demo con la maestra (valor B) | ✍ | Anotar las observaciones de la maestra del 20/10, si las hubo |

## 3. Qué funcionó (mantener)

- La regla de complejidad de ESLint detectó los componentes grandes antes de integrarlos (HAL-001).
- Las pruebas de integración contra una base de datos real en memoria (PGlite) encontraron errores sin instalar PostgreSQL.
- La prueba de humo en un clon nuevo encontró el único defecto crítico (DEF-002) antes de la demo.
- Cada defecto se cerró con una prueba de regresión.

## 4. Qué no funcionó (cambiar)

- Todo el prototipo se integró en un solo bloque el 18/10 y no hubo revisión de código por otro integrante. Por eso ninguna historia cumple la definición de terminado.
- No se anotaron las horas reales, así que no se puede comparar el plan contra lo real.
- No se nombró al Responsable de colaboración, y nadie protegió `main` ni conectó SonarCloud.
- No quedó registro de las reuniones del equipo.
- ✍ Lo que el equipo agregue en la junta de cierre.

## 5. Acciones para el ciclo 3 (PDCA → Actuar) y cómo quedaron al 3/11

| Acción | Responsable | Fecha | Estado al 3/11 |
| --- | --- | --- | --- |
| Revisión cruzada del código del prototipo y `main` protegida | Dueños de cada CU · Responsable de colaboración | 27/10 | **No se hizo.** Pasa al [plan del ciclo 4](PlanCiclo4.md) |
| Conectar SonarCloud | David | 27/10 | **No se hizo.** Pasa al ciclo 4 |
| Pruebas E2E de los flujos principales | Flavio (plan del ciclo 3, tarea 11) | 1/11 | **No se hizo.** Pasa al ciclo 4 |
| Pantalla de administración de usuarios (M5, CU-10) | Camila (plan del ciclo 3, tarea 6) | 1/11 | Hecha el 2/11 por Flavio |
| Importación de mediciones por CSV | — | — | Se descarta para la entrega final: no está en el alcance mínimo del enunciado |
| Desplegar con PostgreSQL real | David | 1/11 | **No se hizo.** Pasa al ciclo 4 |
