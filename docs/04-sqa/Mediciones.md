# Mediciones de calidad

Valores medidos con las herramientas del proyecto. También se capturan en QualiTrack, en el proyecto "QualiTrack".

## Beta · 02/11/2026 · modelo del ADR-004 y registro de defectos

| Métrica | Peor | Mejor | Valor | Cómo se obtuvo | Estado |
| --- | --- | --- | --- | --- | --- |
| Capacidad funcional (%E) | 70 % | 100 % | 100 % (3 de 3 casos de uso comprometidos para la Beta: CU-03, CU-10 y CU-11) | Plan del ciclo 3 §1 | Verde |
| Criterios de aceptación cumplidos | 90 % | 100 % | 100 % | Las 98 pruebas automáticas pasan (62 API + 36 web) | Verde |
| Densidad de defectos | 1.0 | 0.5 | 0.73 (8 defectos ÷ 11 historias) | Registro de defectos, calculado por QualiTrack | Amarillo |
| Defectos críticos abiertos | 0 | 0 | 0 | Registro de defectos | Verde |
| Eficiencia de QA | 85 % | 95 % | 100 % (A = 8, B = 0, C = 0) | Registro de defectos; B se actualiza después de la demo | Verde |
| Tiempo medio de corrección | 7 días | 2 días | 4.3 días | DEF-005 y DEF-006 tardaron 13 días | Amarillo |
| Cumplimiento del plan de técnicas | 70 % | 90 % | 6 de 8 = 75 % | Siguen sin hacerse la revisión de código por otro integrante y `main` protegida | Amarillo |

Índice de salud: (4 × 100 + 3 × 50) ÷ 7 = **79** (amarillo). Baja de 93 a 79 porque desde la Beta la densidad y el tiempo de corrección salen del registro real y no de una captura a mano: el modelo detectó que los 4 detalles del 20/10 esperaron casi dos semanas.

**Controles automáticos internos.** Lint sin errores (complejidad ≤ 10; HAL-002 se corrigió antes del commit), 0 errores de tipos, cobertura de líneas API 97.95 % (478/488) y web 99.2 % (125/126), 98 pruebas en verde, build correcto.

## Check-in 2 · 19–20/10/2026 · modelo de métricas del ADR-004

| Métrica | Peor | Mejor | Valor | Cómo se obtuvo | Estado |
| --- | --- | --- | --- | --- | --- |
| Capacidad funcional (%E) | 70 % | 100 % | 100 % (10 de 10 historias) | Historias implementadas y con pruebas | Verde |
| Criterios de aceptación cumplidos | 90 % | 100 % | 100 % | Las 84 pruebas automáticas pasan (51 API + 33 web) | Verde |
| Densidad de defectos | 1.0 | 0.5 | 0.4 (4 defectos ÷ 10 historias) | DEF-001 a DEF-004 | Verde |
| Defectos críticos abiertos | 0 | 0 | 0 | Registro de defectos | Verde |
| Eficiencia de QA | 85 % | 95 % | 100 % (A = 4, B = 0, C = 0) | Todos los encontró el equipo; B se actualiza después de la demo | Verde |
| Tiempo medio de corrección | 7 días | 2 días | 0 días en los cerrados | DEF-001 a DEF-003 se corrigieron el mismo día | Verde |
| Cumplimiento del plan de técnicas | 70 % | 90 % | 6 de 8 = 75 % | Faltan revisión de código por otro integrante y `main` protegida | Amarillo |

Índice de salud con este modelo: (6 × 100 + 50) ÷ 7 = **93**.

**Controles automáticos internos.** No son métricas del producto. Lint sin errores (incluye complejidad ≤ 10), 0 errores de tipos, cobertura de líneas API 97.5 % y web 99.2 %, todas las pruebas en verde.

## Check-in 2 · 18/10/2026 (modelo anterior)

| Métrica | Meta | Valor | Estado | Fuente |
| --- | --- | --- | --- | --- |
| Cobertura de líneas · API | ≥ 70 % | 97.4 % (377/387) | En meta | `npm run test:coverage -w apps/api` |
| Cobertura de líneas · Web (lógica, cliente y componentes) | ≥ 70 % | 99.1 % (116/117) | En meta | `npm run test:coverage -w apps/web` |
| Pruebas automáticas | — | 78 (46 API + 32 web), 0 fallas | — | Vitest |
| Complejidad ciclomática máxima | ≤ 10 | ≤ 10 en todas las funciones | En meta | ESLint `complexity` sin errores |
| Defectos críticos abiertos | 0 | 0 | En meta | [Registro de defectos](RegistroDefectos.md) |
| Defectos abiertos (todas las gravedades) | ≤ 5 | 0 | En meta | Registro de defectos |
| Módulos con prototipo funcional | 100 % al final | 5 de 5 (M5 sin pantalla de usuarios) | En progreso | README |
| Historias terminadas (definición completa, con PR aprobado) | 100 % al final | 0 de 10: falta la revisión cruzada | Fuera de meta | Tablero |

**Nota sobre la cobertura web:** el umbral se aplica a `src/lib`, `src/api` y `src/components`. Las páginas completas se cubrirán con pruebas E2E (Playwright) en la versión Beta; hoy solo la página de inicio de sesión tiene prueba de componente.
