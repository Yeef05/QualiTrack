# Revisiones de código de la Beta (revisión cruzada)

El código de la Beta (2 y 3 de noviembre) se integró sin la revisión de otro integrante. Para cumplir la definición de terminado ([Plan SQA §10](PlanSQA.md)), cada integrante revisa una parte que no escribió con la [lista de revisión](ListaRevision.md), a más tardar el **9 de noviembre** (tarea 2 del [plan del ciclo 4](../03-planeacion-tsp/PlanCiclo4.md)).

## Cómo hacer la revisión

1. Abre el commit de tu revisión en GitHub (enlace en la tabla) y revisa los archivos de la columna "Qué revisar".
2. Ve punto por punto la [lista de revisión](ListaRevision.md). Deja los comentarios en las líneas del commit, en GitHub.
3. Corre `npm run check` en tu máquina y prueba la funcionalidad en la página (`npm run dev`).
4. Llena tu fila: fecha, resultado, hallazgos y horas.
5. Si encuentras un error, regístralo como defecto (DEF-009 en adelante) en [RegistroDefectos.md](RegistroDefectos.md) y en la pestaña Defectos del proyecto "QualiTrack". Lo corrige quien tenga la tarea relacionada, en una rama `fix/DEF-xxx-…` con PR.

Resultado: **Aprobada** (sin cambios), **Con hallazgos** (comentarios menores, sin defecto) o **Rechazada** (hay al menos un defecto que corregir).

## Revisiones asignadas

| # | Qué revisar | Commit | Archivos principales | Revisa | Fecha | Resultado | Hallazgos | Horas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | CU-11 · API del registro de defectos y cálculo de las 4 métricas | [`664c4c3`](https://github.com/Yeef05/QualiTrack/commit/664c4c3) | `migrations/004_defectos.sql`, `modules/defects/*`, `metrics.repo.ts` (`statusFor`), `test/defects.test.ts` | David | ✍ | ✍ | ✍ | ✍ |
| R2 | CU-11 · Pestaña Defectos e historias entregadas | [`664c4c3`](https://github.com/Yeef05/QualiTrack/commit/664c4c3) | `pages/DefectsTab.tsx`, `components/ProjectForm.tsx`, `lib/format.ts` | Camila | ✍ | ✍ | ✍ | ✍ |
| R3 | CU-03 · API del modelo por proyecto | [`fc3762e`](https://github.com/Yeef05/QualiTrack/commit/fc3762e) | `migrations/003_modelo_por_proyecto.sql`, `metrics.repo.ts` (`projectModel`, `setProjectMetric`), `metrics.routes.ts`, `test/model.test.ts` | Martin | ✍ | ✍ | ✍ | ✍ |
| R4 | CU-03 · Tabla editable "Modelo de calidad" y métrica propia | [`fc3762e`](https://github.com/Yeef05/QualiTrack/commit/fc3762e) | `pages/QualityModelCard.tsx`, `pages/MetricsTab.tsx` | Jorge | ✍ | ✍ | ✍ | ✍ |
| R5 | CU-10 · Pantalla de usuarios | [`a4ef57e`](https://github.com/Yeef05/QualiTrack/commit/a4ef57e) | `pages/UsersPage.tsx`, `App.tsx`, `components/Layout.tsx` | David | ✍ | ✍ | ✍ | ✍ |
| R6 | DEF-005 y DEF-006 · Reporte de salud | [`5050e69`](https://github.com/Yeef05/QualiTrack/commit/5050e69) | `pages/ReportTab.tsx`, `pages/ReportTab.test.tsx`, `seed.ts` | Camila | ✍ | ✍ | ✍ | ✍ |
| R7 | Interfaz de la Beta y modo claro/oscuro | [`d7172cf`](https://github.com/Yeef05/QualiTrack/commit/d7172cf) | `styles.css`, `lib/theme.ts`, `components/Layout.tsx`, `components/TrendChart.tsx`, `index.html` | Martin | ✍ | ✍ | ✍ | ✍ |

## Preguntas guía para quien revisa

- **R1 y R3:** ¿todas las consultas usan parámetros (`$1`)? ¿Los errores devuelven el código correcto (400, 403, 404, 409)? ¿Las pruebas cubren el caso normal y los de error?
- **R1:** ¿la densidad, la eficiencia de QA y el tiempo de corrección coinciden con un cálculo a mano de tus propios datos?
- **R3:** ¿cambiar el modelo de un proyecto deja igual a los demás? ¿"Restaurar" regresa a los valores del catálogo?
- **R2, R4 y R5:** ¿un Miembro ve botones que no puede usar? ¿Los mensajes de error dicen cómo corregir?
- **R7:** ¿se lee bien todo en modo claro y en oscuro? ¿El PDF del reporte sale en claro?

## Resumen (lo llena el Responsable de calidad al cerrar las revisiones)

| Revisiones hechas | Aprobadas | Con hallazgos | Rechazadas | Defectos nuevos | Horas de revisión |
| --- | --- | --- | --- | --- | --- |
| ✍ de 7 | ✍ | ✍ | ✍ | ✍ | ✍ |
