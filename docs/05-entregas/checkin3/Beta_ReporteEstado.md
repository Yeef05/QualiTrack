# Check-in 3 · Versión Beta · QualiTrack

**Materia:** Calidad de Software · **Docente:** Mtra. María de León Sigg · **Fecha:** martes 3 de noviembre de 2026 · **Equipo:** QualiTrack · **Versión:** etiqueta `v0.4-beta`

**Qué mostramos:** QualiTrack ya registra los defectos de cada proyecto y calcula solo cuatro de sus métricas de calidad. Cada proyecto define su propio modelo de calidad, y el Administrador da acceso a los integrantes. Con eso quedan implementados los 11 casos de uso. La interfaz se renovó para la Beta y tiene modo claro y oscuro.

## Avance del producto

| Caso de uso | Estado | Qué se puede hacer hoy |
| --- | --- | --- |
| CU-11 Registrar un defecto | **Nuevo** | Pestaña Defectos: registrar con gravedad, tipo TSP y quién lo encontró, y cerrarlo. Densidad, críticos abiertos, eficiencia de QA y tiempo de corrección se calculan del registro |
| CU-03 Definir el modelo de calidad | **Completo** (era parcial) | Activar métricas, ajustar peor y mejor por proyecto, restaurar al catálogo y agregar métricas propias |
| CU-10 Dar acceso a un integrante | **Completo** (era parcial) | Pantalla Usuarios para el Administrador |
| CU-01, 02, 04 a 09 | Completos desde el check-in 2 | Proyectos por periodo, mediciones, técnicas, reporte de salud y dashboard |

## Resultados del aseguramiento de la calidad

| Indicador (modelo del ADR-004) | Check-in 2 | Beta | Estado |
| --- | --- | --- | --- |
| Capacidad funcional | 100 % | 100 % (3 de 3 CU comprometidos) | Verde |
| Criterios de aceptación cumplidos | 100 % | 100 % (98 pruebas en verde) | Verde |
| Densidad de defectos | 0.4 | 0.73 (8 defectos ÷ 11 historias) | Amarillo |
| Defectos críticos abiertos | 0 | 0 | Verde |
| Eficiencia de QA | 100 % | 100 % (A = 8) | Verde |
| Tiempo medio de corrección | 0 días | 4.3 días | Amarillo |
| Cumplimiento del plan de técnicas | 75 % | 75 % | Amarillo |

**Índice de salud: 79/100 (antes 93).** Ahora la densidad y el tiempo de corrección salen del registro real. El registro muestra que los 4 detalles del 20/10 esperaron 13 días: el modelo detectó un problema real del proceso.

| Práctica | Evidencia |
| --- | --- |
| Gestión de configuración | Una rama por cambio (`feature/CU-11-…`, `feature/CU-03-…`, `feature/CU-10-…`, `fix/DEF-005-006-…`), integración con merge y etiqueta `v0.4-beta` |
| Análisis estático como compuerta | ESLint rechazó una función con complejidad 11 (HAL-002) antes del commit |
| Pruebas | 98 automáticas (eran 84); cobertura de líneas 97.9 % API y 99.2 % web |
| Defectos | DEF-005 a DEF-008 registrados; 005 y 006 corregidos con regresión; 0 críticos abiertos |
| Auditoría | Bitácora del 2/11: el ciclo 3 no tuvo avance del 21/10 al 1/11 y queda registrado |

## Lo que falta (entrega final, 19 de noviembre)

- **Revisión cruzada en PR y `main` protegida**: sin esto, el plan de técnicas sigue en 75 %.
- Cerrar DEF-007 y DEF-008 (responsables elegidos de la lista de usuarios).
- Pruebas E2E de 3 flujos, prueba con 3 usuarios de otro equipo y despliegue con PostgreSQL real.

Detalle completo en el [Reporte SQA de la Beta](ReporteSQA_Beta.pdf).
