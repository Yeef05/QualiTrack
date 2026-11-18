# Postmortem del ciclo 4 (TSP) · Entrega final · 4 al 19 de noviembre de 2026

Cierre del ciclo del [plan del ciclo 4](PlanCiclo4.md) y del proyecto. Los datos salen del historial del repositorio, del [registro de defectos](../04-sqa/RegistroDefectos.md), de las [mediciones](../04-sqa/Mediciones.md), de las [revisiones y casos de prueba](../04-sqa/RevisionesBeta.md) y de la [bitácora de SQA](../04-sqa/BitacoraSQA.md). Las horas reales salen del [registro de tiempos](RegistroTiempos.md).

## 1. Plan contra real

| Medida | Plan | Real | Diferencia |
| --- | --- | --- | --- |
| Horas totales | 37.5 | | |
| Tareas con evidencia de estar hechas | 17 | 5 hechas (2, 5, 6, 14 y 17), 3 parciales (10, 13 y 15) y 9 sin evidencia en el repositorio | −12 |
| Defectos abiertos de gravedad crítica o mayor | 0 | 0 | 0 |
| DEF-007 y DEF-008 cerrados | 7/11 | 18/11 | 11 días tarde |
| PR aprobados por otro integrante | Todos los del ciclo | 0 | — |
| Índice de salud de QualiTrack | ≥ 80 | 64 | −16 |
| Cumplimiento del plan de técnicas | ≥ 90 % | 75 % | −15 puntos |
| Criterios de aceptación cumplidos | 100 % | 100 % (33 de 33, con prueba automática y manual) | 0 |
| Pruebas automáticas | — | 109 (68 API + 41 web); eran 100 en la Beta | +9 |
| Sistema en línea con PostgreSQL | 13/11 | Configuración lista (`render.yaml`) y modo de producción probado; falta crear el servicio en Render | — |

## 2. Defectos del ciclo

| Defecto | Tipo TSP | Gravedad | Fase en que se detectó | Días para corregir |
| --- | --- | --- | --- | --- |
| DEF-007 | 50 Interfaz | Menor | Revisión del prototipo (20/10) | 29 |
| DEF-008 | 70 Datos | Menor | Revisión del prototipo (20/10) | 29 |
| DEF-009 | 80 Función | Menor | Revisión de código R1 (03/11) | 15 |
| DEF-010 | 80 Función | Menor | Revisión de código R3 y R4 (03/11) | 15 |
| DEF-011 | 70 Datos | Mayor | Revisión de código R4 (03/11) | 15 |
| DEF-012 | 50 Interfaz | Menor | Revisión de código R5 (03/11) | 15 |
| DEF-013 | 50 Interfaz | Menor | Casos de prueba CP-02 y CP-19 (18/11) | 0 |
| DEF-014 | 50 Interfaz | Cosmética | Revisión visual R7 (18/11) | 0 |
| HAL-003 | Análisis estático | — | ESLint antes del commit (18/11) | 0 |
| Observaciones de la maestra en la Beta (valor B) | | | Demo del 3/11 | |

### Pareto por tipo TSP (acumulado del proyecto, 14 defectos)

| Tipo | Defectos | % | % acumulado |
| --- | --- | --- | --- |
| 50 Interfaz | 6 | 42.9 % | 42.9 % |
| 70 Datos | 3 | 21.4 % | 64.3 % |
| 80 Función | 3 | 21.4 % | 85.7 % |
| 30 Build/paquetes | 1 | 7.1 % | 92.9 % |
| 100 Entorno | 1 | 7.1 % | 100 % |

Interfaz sigue arriba, como en el ciclo 3. El punto de "Interfaz y datos" que se agregó a la lista de revisión funcionó: DEF-014 salió de la revisión en ancho de celular y DEF-011 de revisar qué se guarda cuando un campo queda vacío.

Tres de los cuatro defectos de la revisión del 3/11 (DEF-009, DEF-010 y DEF-012) son casos de error que la pantalla evitaba pero la API no, o mensajes que no siguen la regla "en español y diciendo cómo corregir". Son justo los puntos de la lista de revisión que no se revisaron cuando el código entró sin PR.

## 3. Por qué el índice bajó de 79 a 64

El producto se entrega con los 14 defectos cerrados y 0 críticos. El índice baja por dos métricas de proceso:

- **Densidad (0.73 → 1.27).** Revisar el código de la Beta y probar cada criterio a mano encontró 6 defectos que estaban en el código desde el 2/11. Habrían salido antes con la revisión en el PR.
- **Tiempo de corrección (4.3 → 10.3 días).** DEF-007 y DEF-008 esperaron 29 días. DEF-009 a DEF-012 se corrigieron el mismo 3/11, pero la rama quedó sin revisar ni integrar 15 días.

Sin las dos métricas en rojo, el índice sería (6 × 100 + 50) ÷ 7 = 93.

## 4. Análisis de causa: por qué los defectos esperaron

| Categoría (Ishikawa) | Causa observada |
| --- | --- |
| Personas | El Responsable de colaboración nunca se nombró; nadie dio seguimiento al plan ni a las ramas abiertas |
| Método | Sin PR ni revisor asignado, una corrección terminada no tenía un paso que la llevara a `main` |
| Método | La junta de lanzamiento del 4/11 y el seguimiento del 10/11 no quedaron registrados |
| Medición | Sin horas semanales no se vio a tiempo que las tareas del 7/11 y del 9/11 no avanzaban |

## 5. Qué funcionó (mantener)

- La lista de revisión con el grupo "Interfaz y datos" encontró defectos reales en las 7 revisiones.
- Cada defecto se cerró con una prueba de regresión que cita su ID.
- ESLint siguió funcionando como compuerta (HAL-003).
- El modelo de calidad de QualiTrack, aplicado a sí mismo, mostró un problema de proceso que el producto terminado no muestra: el índice bajó aunque no quedó ningún defecto abierto.
- La prueba de humo en un clon nuevo y la prueba del modo de producción con el driver de PostgreSQL pasaron antes de desplegar.

## 6. Qué no funcionó (cambiar)

- Ningún PR tuvo la aprobación de otro integrante en todo el proyecto, así que ninguna historia cumple la definición de terminado.
- El trabajo de los ciclos 3 y 4 quedó en una sola cuenta de GitHub.
- No se registraron horas reales, juntas del equipo ni observaciones de la maestra.
- Siguen sin hacerse las pruebas E2E automáticas, la prueba con usuarios de otro equipo y SonarCloud.

## 7. Lecciones para un proyecto siguiente

| Lección | Práctica concreta |
| --- | --- |
| Una corrección no termina hasta que llega a `main` | Proteger `main` desde el primer día y medir el tiempo de corrección hasta la integración, como hace el registro |
| La revisión cruzada no se recupera al final | Revisor asignado en cada tarea y PR pequeños; revisar en menos de 24 h |
| Sin Responsable de colaboración no hay seguimiento | Nombrarlo en la primera junta y registrar cada junta el mismo día |
| Registrar el defecto el día que se encuentra | Mantener la regla; en este ciclo sí se cumplió para DEF-013 y DEF-014 |
