# Guion de la demo · Check-in 2 (3 minutos)

**Antes de empezar:**
1. Borrar `apps/api/.data/` para cargar los datos de ejemplo del modelo nuevo.
2. Ejecutar `npm run dev` y abrir http://localhost:5173.
3. Tener en otra pestaña la terminal con `npm run check` ya ejecutado.

| Tiempo | Pantalla | Qué decir y hacer |
| --- | --- | --- |
| 0:00 – 0:20 | Inicio de sesión | Decir: "QualiTrack es el centro de control de SQA para equipos chicos." Entrar con `qa@qualitrack.local` (rol Líder QA). |
| 0:20 – 0:50 | Dashboard | Mostrar el periodo 2026-2, los 3 indicadores y el semáforo: QualiTrack en verde (93), Odín en amarillo (50) y Portal en rojo (7). Crear un proyecto con un periodo inválido para enseñar la validación por campo y luego corregirlo. |
| 0:50 – 1:40 | Proyecto · Métricas | Abrir QualiTrack y mostrar la tabla con peor y mejor de cada métrica. Bajar a "Modelo de calidad" y decir: "cada criterio sale del modelo definido de la clase: el factor de ISO 25010, la fórmula de la lámina y por qué esos valores, por ejemplo el 70 % y el 100 % de la rúbrica." Registrar una medición en amarillo, por ejemplo capacidad funcional = 85, y ver el semáforo. |
| 1:40 – 2:05 | Proyecto · Técnicas | Mostrar el plan al 75 %. Decir: "la revisión de código por otro integrante todavía no tiene ejecución; por eso estamos en amarillo." |
| 2:05 – 2:25 | Proyecto · Reporte | Índice 93: 6 indicadores en verde y el plan en amarillo, promediados. Decir: "con un defecto crítico abierto el índice no pasa de 79." Pulsar "Guardar en historial" y "Exportar PDF". |
| 2:25 – 3:00 | Repositorio | Mostrar las ramas y los PR, `npm run check` en verde, el registro de defectos (DEF-003, encontrado en la revisión de ayer y cerrado con prueba de regresión) y los ADR-004 y ADR-005. Decir: "cambiamos de IEEE 730 a ISO/IEC 29110 porque está hecha para equipos como el nuestro." |

**Si algo falla en vivo:** decirlo, mostrar la prueba automática que cubre ese flujo y registrarlo como defecto después de la demo. Lo que encuentre la maestra cuenta como B en la eficiencia de QA.
