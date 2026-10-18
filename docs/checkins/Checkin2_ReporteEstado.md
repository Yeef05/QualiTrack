# Check-in 2 · Prototipo funcional · QualiTrack

**Materia:** Calidad de Software · **Docente:** Mtra. María de León Sigg · **Fecha:** martes 20 de octubre de 2026 · **Equipo:** QualiTrack

**Qué mostramos:** un prototipo web que registra proyectos por periodo, captura métricas de calidad con semáforo y tendencia, gestiona el plan de técnicas de SQA con su cumplimiento y calcula un índice de salud de 0 a 100 exportable a PDF.

## Avance del producto

| Módulo | Estado | Qué se puede hacer hoy |
| --- | --- | --- |
| M1 Proyectos y periodos | Funcional | Registrar, editar, archivar y filtrar por periodo |
| M2 Métricas | Funcional | Catálogo con meta, mediciones, gráfica de tendencia y semáforo |
| M3 Técnicas SQA | Funcional | Plan por proyecto, ejecuciones con hallazgos y % de cumplimiento |
| M4 Reportes | Funcional | Índice de salud ponderado, historial y exportación a PDF |
| M5 Usuarios | Básico | Inicio de sesión y permisos por rol (falta pantalla de usuarios) |

## Evidencia de aseguramiento y control de la calidad

| Práctica del plan | Evidencia en el repositorio |
| --- | --- |
| Análisis estático | ESLint con `complexity ≤ 10`: detectó 3 componentes de 13 a 17 y se refactorizaron (HAL-001) |
| Pruebas automáticas | 78 pruebas (46 API, 32 web); cobertura 97.4 % API y 99.1 % web; el pipeline falla si baja de 70 % |
| Integración continua | `.github/workflows/ci.yml`: lint, tipos, pruebas con cobertura y build en cada PR |
| Registro de defectos | 2 defectos (1 crítico) detectados y cerrados con prueba de regresión; 0 críticos abiertos |
| Decisiones documentadas | 3 ADR, entre ellas el cambio de Prisma a PGlite + SQL parametrizado |
| Requisitos claros | 10 historias de usuario con criterios ligados a pruebas |
| Auditoría interna | Bitácora de SQA con la auditoría previa al check-in |

## Métricas al corte

Cobertura ≥ 70 %: **97.4 % / 99.1 %** · Complejidad ≤ 10: **cumple** · Defectos críticos abiertos: **0** · Historias terminadas con PR aprobado: **0 de 10** (falta la revisión cruzada).

## Siguiente entrega (3 de noviembre, Beta)

Revisión cruzada de PR y `main` protegida, SonarCloud, pruebas E2E con Playwright, pantalla de usuarios, importación CSV y despliegue en Render con PostgreSQL.
