# Check-in 2 · Prototipo funcional · QualiTrack

**Materia:** Calidad de Software · **Docente:** Mtra. María de León Sigg · **Fecha:** martes 20 de octubre de 2026 · **Equipo:** QualiTrack

**Qué mostramos:** un prototipo web para equipos chicos. Registra proyectos por periodo y mide su calidad con un modelo de métricas en el que cada criterio dice de dónde sale. También gestiona el plan de técnicas de SQA y calcula un índice de salud de 0 a 100 exportable a PDF.

## Avance del producto

| Módulo | Estado | Qué se puede hacer hoy |
| --- | --- | --- |
| M1 Proyectos y periodos | Funcional | Registrar, editar, archivar y filtrar por periodo |
| M2 Métricas | Funcional | 6 métricas con valor peor y mejor, criterio de ISO/IEC 25010 y fuente; mediciones, tendencia y semáforo |
| M3 Técnicas SQA | Funcional | Plan por proyecto, ejecuciones con hallazgos y % de cumplimiento |
| M4 Reportes | Funcional | Índice de salud (promedio de indicadores), historial y exportación a PDF |
| M5 Usuarios | Básico | Inicio de sesión y permisos por rol (falta pantalla de usuarios) |

## Cambios desde el Entregable 1 (y por qué)

| Antes | Ahora | Decisión |
| --- | --- | --- |
| Complejidad ciclomática y cobertura como métricas del producto | Se retiran del catálogo: la complejidad es métrica en desuso según el curso y ambas necesitan herramientas. Quedan como controles automáticos del CI de QualiTrack | [ADR-004](../decisiones/ADR-004-modelo-metricas.md) |
| Umbrales sin fuente (10 % de tolerancia, "defectos abiertos ≤ 5") | Modelo definido: cada métrica tiene valor peor y mejor con su fuente (rúbrica, láminas o acuerdo del equipo) | ADR-004 |
| Índice ponderado 50/30/20 | Promedio de indicadores (verde 100, amarillo 50, rojo 0), como decía la hoja del Entregable 1, con tope de 79 si hay defectos críticos | ADR-004 |
| Plan SQA "basado en IEEE 730" (de pago) | Plan SQA 2.0 sobre ISO/IEC 29110 para entidades muy pequeñas y la adaptación de roles de la maestra | [ADR-005](../decisiones/ADR-005-iso29110.md) |

## Evidencia de aseguramiento y control de la calidad

| Práctica del plan | Evidencia en el repositorio |
| --- | --- |
| Gestión de configuración | Ramas `feature/HU-04-modelo-metricas`, `fix/DEF-003-…` y `fix/DEF-004-…`, cada una con su PR para revisión |
| Registro de defectos | 4 defectos encontrados por el equipo (1 crítico, 2 mayores, 1 cosmético), cada uno con prueba de regresión; 0 críticos abiertos |
| Pruebas automáticas | 84 pruebas al integrar las tres ramas; el pipeline falla si la cobertura baja de 70 % |
| Análisis estático | ESLint con `complexity ≤ 10`: detectó 3 componentes de 13 a 17 que se refactorizaron (HAL-001) |
| Decisiones documentadas | 5 ADR |
| Requisitos claros | 10 historias de usuario con criterios ligados a pruebas |
| Auditoría interna | Bitácora con la auditoría del 19/10 |

## Métricas al corte (modelo del ADR-004)

| Indicador | Valor | Estado |
| --- | --- | --- |
| Capacidad funcional | 100 % (10 de 10 historias) | Verde |
| Criterios de aceptación cumplidos | 100 % | Verde |
| Densidad de defectos | 0.4 por historia | Verde |
| Defectos críticos abiertos | 0 | Verde |
| Eficiencia de QA | 100 % (4 de 4 encontrados por el equipo) | Verde |
| Tiempo medio de corrección | 0 días | Verde |
| Cumplimiento del plan de técnicas | 75 %: falta revisión cruzada y `main` protegida | Amarillo |

**Índice de salud: 93/100.**

## Siguiente entrega (3 de noviembre, Beta)

- Revisión cruzada en todos los PR y `main` protegida.
- Pantalla para ajustar peor y mejor y activar métricas por proyecto.
- Pruebas E2E de los 3 flujos principales.
- Prueba con usuarios (tareas sin ayuda).
- Despliegue con PostgreSQL real.
