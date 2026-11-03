# Postmortem del ciclo 3 (TSP) · Versión Beta · 21 de octubre al 3 de noviembre de 2026

Cierre del ciclo del [plan del ciclo 3](PlanCiclo3.md). Los datos salen del historial del repositorio, del [registro de defectos](../04-sqa/RegistroDefectos.md), de las [mediciones](../04-sqa/Mediciones.md) y de la [bitácora de SQA](../04-sqa/BitacoraSQA.md). Las celdas marcadas con ✍ las llena el equipo.

## 1. Plan contra real

| Medida | Plan | Real | Diferencia |
| --- | --- | --- | --- |
| Horas totales | 52 | ✍ Suma de [Registro de tiempos](RegistroTiempos.md) | ✍ |
| Tareas hechas | 17 | 9 hechas, 3 parciales (14, 16 y 17) y 5 pendientes | −8 |
| Casos de uso comprometidos | 3 (CU-03, CU-10, CU-11) | 3 | 0 |
| Integrantes con al menos un PR propio aprobado por otro | 5 | 0 | −5 |
| Días con avance en el repositorio | Repartido en 2 semanas | 1 (2/11); del 21/10 al 1/11 no hubo commits | — |
| Índice de salud de QualiTrack | ≥ 80 | 79 | −1 |
| Cumplimiento del plan de técnicas | ≥ 90 % | 75 % | −15 puntos |
| Defectos críticos abiertos | 0 | 0 | 0 |
| Pruebas automáticas | — | 100 (62 API + 38 web); eran 84 | +16 |

## 2. Defectos del ciclo

| Defecto | Tipo TSP | Gravedad | Fase en que se detectó | Días para corregir |
| --- | --- | --- | --- | --- |
| DEF-005 | 50 Interfaz | Cosmética | Revisión del prototipo (20/10) | 13 |
| DEF-006 | 50 Interfaz | Menor | Revisión del prototipo (20/10) | 13 |
| DEF-007 | 50 Interfaz | Menor | Revisión del prototipo (20/10) | Abierto |
| DEF-008 | 70 Datos | Menor | Revisión del prototipo (20/10) | Abierto |
| HAL-002 | Análisis estático | — | ESLint antes del commit (2/11) | 0 |
| Observaciones de la maestra en la Beta (valor B) | ✍ | ✍ | Demo del 3/11 | ✍ |

### Pareto por tipo TSP (acumulado, 8 defectos)

| Tipo | Defectos | % | % acumulado |
| --- | --- | --- | --- |
| 50 Interfaz | 3 | 37.5 % | 37.5 % |
| 70 Datos | 2 | 25 % | 62.5 % |
| 30 Build/paquetes | 1 | 12.5 % | 75 % |
| 80 Función | 1 | 12.5 % | 87.5 % |
| 100 Entorno | 1 | 12.5 % | 100 % |

Interfaz y Datos suman el 62.5 %. Acción: la [lista de revisión](../04-sqa/ListaRevision.md) agrega un punto de revisión visual de cada pantalla y otro de datos de ejemplo.

## 3. Análisis de causa: por qué el ciclo 3 se concentró en un día

| Categoría (Ishikawa) | Causa observada |
| --- | --- |
| Personas | No se nombró al Responsable de colaboración, así que nadie le dio seguimiento al plan |
| Método | La junta de lanzamiento del 21/10 no quedó registrada y las tareas no se confirmaron |
| Método | Los 4 detalles del 20/10 se dejaron "para el ciclo 3" en vez de registrarse ese día |
| Entorno | CONISOFT (27–30/10) redujo las horas disponibles, como preveía el riesgo del plan |
| Medición | Sin horas reales no se detectó a tiempo que el plan no avanzaba |
| ✍ | Lo que el equipo agregue en la junta de cierre |

## 4. Qué funcionó (mantener)

- Los tres casos de uso comprometidos se entregaron, cada uno con pruebas y en su propia rama.
- ESLint funcionó como compuerta: rechazó una función con complejidad 11 antes del commit (HAL-002).
- El registro de defectos dentro de QualiTrack calcula solo 4 métricas, y con ellas el índice reflejó un problema real del proceso (tiempo de corrección de 13 días).

## 5. Qué no funcionó (cambiar)

- Del 21/10 al 1/11 no hubo avance, y el trabajo de la Beta lo hizo una sola persona el 2/11.
- Siguen sin hacerse la revisión cruzada, `main` protegida, las pruebas E2E, la prueba con usuarios y el despliegue.
- ✍ Lo que el equipo agregue.

## 6. Acciones para el ciclo 4 (PDCA → Actuar)

Están en el [plan del ciclo 4](PlanCiclo4.md):

| Acción | Tarea del ciclo 4 |
| --- | --- |
| Nombrar al Responsable de colaboración y registrar cada junta en [Reuniones](Reuniones.md) | 1 |
| Revisión cruzada del código de la Beta con la lista de revisión | 2 |
| Anotar las horas reales de todos en el [registro de tiempos](RegistroTiempos.md) cada viernes | 1 y 16 |
| Registrar cada defecto el día que se encuentra | Regla del ciclo |
| Seguimiento a mitad del ciclo (10/11) para detectar atrasos | 9 |
