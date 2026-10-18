# Guion de la demo · Check-in 2 (3 minutos)

**Antes de empezar:** `npm run dev`, abrir http://localhost:5173 y tener abierta en otra pestaña la terminal con `npm run check` ya ejecutado.

| Tiempo | Pantalla | Qué decir y hacer |
| --- | --- | --- |
| 0:00 – 0:20 | Inicio de sesión | "QualiTrack es el centro de control de SQA del equipo." Entrar con `qa@qualitrack.local` (rol Líder QA). |
| 0:20 – 0:50 | Dashboard | Mostrar el periodo 2026-2, los 3 indicadores y el semáforo: QualiTrack en verde (90), Odín en amarillo (78) y Portal en rojo (5). "Cada proyecto se registra una vez por periodo." Crear un proyecto rápido con un periodo inválido para enseñar la validación por campo y luego corregirlo. |
| 0:50 – 1:30 | Proyecto · Métricas | Abrir QualiTrack: gráfica de cobertura contra la meta de 70 %. Registrar una medición nueva (por ejemplo, % de funciones terminadas = 70) y ver cómo cambia el semáforo. |
| 1:30 – 2:00 | Proyecto · Técnicas | Cumplimiento del plan al 100 %. Registrar una revisión de código "con hallazgos". Explicar que una técnica sin ejecución en su ventana aparece atrasada. |
| 2:00 – 2:20 | Proyecto · Reporte | Índice de salud con su ponderación (métricas 50 %, plan 30 %, defectos 20 %), "Guardar en historial" y "Exportar PDF". |
| 2:20 – 3:00 | Repositorio | Mostrar `npm run check` en verde (78 pruebas, cobertura 97 % / 99 %), el workflow de CI, el registro de defectos (DEF-002 encontrado en la prueba de humo y cerrado con prueba de regresión), el hallazgo de complejidad HAL-001 y el ADR-002. "Así controlamos la calidad mientras construimos la herramienta." |

**Si algo falla en vivo:** decirlo, mostrar la prueba automática que cubre ese flujo y registrarlo como defecto después de la demo.
