# Documentación de QualiTrack

Proyecto Integrador SQA26 · Calidad de Software · Mtra. María de León Sigg. El código está en [`apps/`](../apps/); aquí está todo lo demás, separado por tipo de documento.

| Carpeta | Contenido | Documentos |
| --- | --- | --- |
| [01-requisitos](01-requisitos/) | Qué debe hacer el producto | [Casos de uso](01-requisitos/CasosDeUso.md) (CU-01 a CU-11, flujos y RF-01 a RF-38) · [Historias de usuario](01-requisitos/HistoriasUsuario.md) (criterios de aceptación ligados a pruebas) |
| [02-diseno](02-diseno/) | Cómo está construido | [Diagramas de clases](02-diseno/DiagramasClases.md) ([editable en draw.io](02-diseno/DiagramasClases.drawio)) · [Decisiones de arquitectura (ADR-001 a ADR-005)](02-diseno/decisiones/) |
| [03-planeacion-tsp](03-planeacion-tsp/) | Cómo se organiza el trabajo | [Plan del ciclo 2](03-planeacion-tsp/PlanCiclo2.md) · [Postmortem del ciclo 2](03-planeacion-tsp/PostmortemCiclo2.md) · [Plan del ciclo 3 (Beta), por caso de uso](03-planeacion-tsp/PlanCiclo3.md) |
| [04-sqa](04-sqa/) | Aseguramiento y control de la calidad | [Plan SQA](04-sqa/PlanSQA.md) (ISO/IEC 29110) · [Bitácora de SQA](04-sqa/BitacoraSQA.md) · [Registro de defectos](04-sqa/RegistroDefectos.md) · [Mediciones](04-sqa/Mediciones.md) · [Lista de revisión](04-sqa/ListaRevision.md) |
| [05-entregas](05-entregas/) | Lo que se entregó en cada punto de control | Check-in 1 (6 oct): [definición y arquitectura](05-entregas/checkin1/Entregable1_Definicion_y_Arquitectura_SQA26.pdf), [entregable](05-entregas/checkin1/Entregable1_SQA26.pdf), [resumen de 1 página](05-entregas/checkin1/Entregable1_Resumen_1pagina_SQA26.pdf) y [hoja de avance](05-entregas/checkin1/Avance_610_QSwA.xlsx) · Check-in 2 (20 oct): [reporte de estado](05-entregas/checkin2/Checkin2_ReporteEstado.md), [guion de la demo](05-entregas/checkin2/Checkin2_GuionDemo.md) y [reporte SQA](05-entregas/checkin2/ReporteSQA_Checkin2.pdf) |
| [06-manuales](06-manuales/) | Cómo usar el prototipo | [Manual del equipo](06-manuales/ManualEquipo.pdf): credenciales de ejemplo, roles, permisos y casos de uso paso a paso |

## Cómo se relacionan

1. Cada **caso de uso** se detalla en historias de usuario con criterios de aceptación, y cada criterio tiene una prueba automática.
2. El **diseño** (diagramas de clases y ADR) dice en qué capa va cada clase; el revisor de cada PR lo compara con el código.
3. El **plan del ciclo** reparte las tareas por caso de uso con responsable y revisor.
4. El **plan SQA** define las métricas (valores peor y mejor con fuente) y las prácticas de verificación y validación. La **bitácora**, el **registro de defectos** y las **mediciones** son la evidencia de que se aplicaron.
5. Cada **entrega** resume el avance y los valores de calidad al corte.
