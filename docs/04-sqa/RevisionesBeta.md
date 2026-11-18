# Revisiones de código de la Beta y casos de prueba

El código de la Beta (2 y 3 de noviembre) se integró a `main` sin la revisión de otro integrante. El plan del ciclo 4 (tarea 2) repartió siete revisiones con la [lista de revisión](ListaRevision.md), con fecha límite el 9/11. Para esa fecha no había ninguna registrada, así que el Responsable de calidad las hizo: empezó el 3/11 con R1, R3, R4 y R5 y terminó todas el 18/11.

Estas revisiones son técnicas, pero no cuentan como revisión cruzada para la definición de terminado ([Plan SQA §10](PlanSQA.md)): el código de la Beta salió de la misma cuenta que lo revisó.

Resultado: **Aprobada** (sin cambios), **Con hallazgos** (comentarios menores, sin defecto) o **Rechazada** (al menos un defecto que corregir).

## Revisiones

| # | Qué se revisó | Commit | Asignada a | Revisó | Fecha | Resultado | Hallazgos | Horas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | CU-11 · API del registro de defectos y cálculo de las 4 métricas | [`664c4c3`](https://github.com/Yeef05/QualiTrack/commit/664c4c3) | David | Flavio | 03/11 y 18/11 | Rechazada | DEF-009: la API cerraba defectos de un proyecto archivado. El cálculo a mano de densidad, eficiencia y tiempo coincide con el de la API. No se puede editar un defecto mal capturado (comentario, queda fuera del alcance) | |
| R2 | CU-11 · Pestaña Defectos e historias entregadas | [`664c4c3`](https://github.com/Yeef05/QualiTrack/commit/664c4c3) | Camila | Flavio | 18/11 | Con hallazgos | El subtítulo decía "1 abiertos de 4"; se corrigió el plural en `ef9f40e` | |
| R3 | CU-03 · API del modelo por proyecto | [`fc3762e`](https://github.com/Yeef05/QualiTrack/commit/fc3762e) | Martin | Flavio | 03/11 y 18/11 | Rechazada | DEF-010: el modelo de un proyecto archivado se podía cambiar y restaurar. Cambiar el modelo de un proyecto no altera a los demás y "Restaurar" regresa al catálogo | |
| R4 | CU-03 · Tabla editable "Modelo de calidad" y métrica propia | [`fc3762e`](https://github.com/Yeef05/QualiTrack/commit/fc3762e) | Jorge | Flavio | 03/11 y 18/11 | Rechazada | DEF-011: borrar peor o mejor lo guardaba como 0. La tabla de un proyecto archivado seguía editable (parte de DEF-010) | |
| R5 | CU-10 · Pantalla de usuarios | [`a4ef57e`](https://github.com/Yeef05/QualiTrack/commit/a4ef57e) | David | Flavio | 03/11 y 18/11 | Rechazada | DEF-012: errores de validación en inglés y mensaje genérico con un correo repetido. Un Miembro y un Líder de QA no ven el enlace ni la pantalla | |
| R6 | DEF-005 y DEF-006 · Reporte de salud | [`5050e69`](https://github.com/Yeef05/QualiTrack/commit/5050e69) | Camila | Flavio | 18/11 | Con hallazgos | La barra decía "No · 1 abiertos"; se corrigió con la misma función de plural (`ef9f40e`). El margen de DEF-005 se mantiene en 24 px | |
| R7 | Interfaz de la Beta y modo claro/oscuro | [`d7172cf`](https://github.com/Yeef05/QualiTrack/commit/d7172cf) | Martin | Flavio | 18/11 | Rechazada | DEF-014: a 375 px la lista de técnicas se salía de la tarjeta. Las pestañas del proyecto se desplazan de lado en celular sin una pista visual (comentario). El CSS de impresión fuerza el tema claro | |

### Lista de revisión por revisión

Sí = cumple · No = dejó comentario o defecto · N/A = no aplica a ese cambio.

| Punto de la lista | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cumple los criterios de aceptación de la historia | No | Sí | No | No | Sí | Sí | Sí |
| Los errores devuelven el código HTTP correcto | No | N/A | No | N/A | Sí | N/A | N/A |
| Mensajes en español que dicen cómo corregir | Sí | Sí | Sí | No | No | Sí | Sí |
| Pruebas del caso normal y de al menos un error | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Prueba de regresión con el ID del defecto | N/A | N/A | N/A | N/A | N/A | Sí | N/A |
| CI en verde y cobertura ≥ 70 % | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| SQL con parámetros | Sí | N/A | Sí | N/A | Sí | N/A | N/A |
| Rutas con sesión y rol adecuado | Sí | N/A | Sí | Sí | Sí | N/A | N/A |
| Sin contraseñas ni datos personales reales | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| ESLint sin errores | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Lógica fuera de la interfaz | Sí | Sí | Sí | No | Sí | Sí | Sí |
| ADR si cambia la arquitectura | N/A | N/A | Sí | N/A | N/A | N/A | N/A |
| Se ve bien en claro, oscuro y celular | N/A | Sí | N/A | Sí | Sí | Sí | No |
| Textos y espacios iguales a las demás pantallas | N/A | No | N/A | Sí | Sí | No | Sí |
| Datos coherentes, sin campos libres que deberían ser lista | Sí | Sí | Sí | Sí | Sí | Sí | No |

En R4, "lógica fuera de la interfaz" es No porque la conversión de peor y mejor estaba dentro del componente; ahora está en `lib/format.ts` (`parseNumber`). En R7, "datos coherentes" es No por DEF-007 y DEF-008, que seguían abiertos al revisar.

### Resumen

| Revisiones hechas | Aprobadas | Con hallazgos | Rechazadas | Defectos nuevos | Horas de revisión |
| --- | --- | --- | --- | --- | --- |
| 7 de 7 | 0 | 2 | 5 | 5 (DEF-009 a DEF-012 y DEF-014) | |

## Casos de prueba manuales

Los 33 criterios de aceptación de las historias HU-01 a HU-11 tienen un caso de prueba (CP-01 a CP-33) en la hoja *QualiTrack_23_RevisionesYPruebas* del Drive. Flavio los corrió el 18/11 con el commit `8f3f3e6`, en el navegador y contra la API local, con una base nueva y los usuarios de ejemplo.

| Resultado | Casos |
| --- | --- |
| Pasa | 30: CP-01, CP-03 a CP-10, CP-12 a CP-18, CP-20 a CP-24 y CP-26 a CP-33 |
| Pasa después de corregir DEF-013 | 2: CP-02 (proyecto repetido) y CP-19 (técnica repetida). Rechazaban bien el duplicado, pero con un mensaje que no decía qué cambiar |
| Solo automático | 1: CP-11 (actualizar una base del check-in 1) |
| Sin probar a mano | La exportación a PDF de CP-25. El reporte se generó y se guardó en el historial; el PDF no se imprimió en esta prueba |

Comprobaciones a mano, por ejemplo: con 4 defectos y 8 historias, la pestaña Defectos dio densidad 0.5, eficiencia 75 % (A 3, B 1) y 3 días de corrección, igual que el cálculo a mano. El índice del reporte, (4 × 100 + 2 × 50 + 0) ÷ 7 = 71, coincide con el de la pantalla.

**Criterios de aceptación cumplidos: 33 de 33 (100 %).** CP-25 cuenta como cumplido porque su prueba automática pasa y la parte manual no falló.

## Prueba de humo

| Paso | Local (18/11) | Con PostgreSQL (18/11) |
| --- | --- | --- |
| Clonar en una carpeta nueva, `npm ci` y `npm run check` | Pasa: 109 pruebas, cobertura 97.8 % API y 98.9 % web, build correcto | — |
| Abrir la página e iniciar sesión | Pasa | Pasa |
| Recorrer Métricas, Técnicas, Defectos y Reporte | Pasa; en consola solo aparecen los 400/403/409 de los casos negativos | Pasa (API) |
| Registrar una medición | Pasa | Pasa |
| Registrar y cerrar un defecto | Pasa | Pasa: con el crítico abierto el índice bajó a 63 y volvió a subir al cerrarlo |
| Generar el reporte y guardarlo | Pasa | Pasa |
| Exportar a PDF | No se probó | No se probó |
| Modo oscuro, modo claro y ancho de celular | Pasa después de DEF-014 | — |
| Salir y volver a entrar | Pasa: sin sesión, `/proyectos/1` regresa al inicio de sesión | — |

La columna "Con PostgreSQL" es el modo de producción (`NODE_ENV=production`, `npm run build` y `npm start`) con el driver `pg`, contra un servidor que habla el protocolo de PostgreSQL (`pglite-socket`). No es todavía el servidor de Render; esa prueba se repite al desplegar.

## Exploración (Plan SQA §8.1)

| Integrante | Misión | Fecha | Minutos | Qué se probó | Hallazgos |
| --- | --- | --- | --- | --- | --- |
| Flavio | Llevar el índice de salud a los extremos | 18/11 | | Proyecto sin datos ("Sin datos" en las 6 métricas), proyecto con un crítico abierto (índice 58), mismo proyecto con el crítico cerrado (71), y proyecto archivado (no admite mediciones) | Ninguno nuevo; DEF-013 salió en los casos de prueba |
| Camila | Fechas y valores raros en las mediciones | | | | |
| David | Hacer como Miembro lo que solo puede el Líder de QA, desde la página y la API | | | | |
| Jorge | Todas las pantallas en celular y en modo oscuro | | | | |
| Martin | Defectos con fechas límite, proyectos archivados y textos largos | | | | |

Para David: el 18/11 ya se probó desde la API que un Miembro recibe 403 al crear proyectos, métricas, planes y usuarios y al cambiar el modelo, y que en la página ve la tabla del modelo de solo lectura.
