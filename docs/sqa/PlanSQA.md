# Plan de Aseguramiento de la Calidad (SQA) · QualiTrack

Versión 2.0 · 19 de octubre de 2026 · Responsable: Flavio Uriel Huizar González (Responsable de calidad).

Basado en el **perfil de entrada de ISO/IEC 29110** para entidades muy pequeñas, en la adaptación de sus tareas que hizo la maestra para equipos de la carrera y en el material de *Calidad de Software*. La versión 1.1 decía seguir IEEE 730, pero ese estándar es de pago y está pensado para organizaciones grandes; el cambio se explica en el [ADR-005](../decisiones/ADR-005-iso29110.md).

## 1. Propósito y alcance

Asegurar que QualiTrack cumpla el enunciado SQA26 (registro de proyectos por periodo, métricas, técnicas de SQA y reportes de salud) y que cada práctica deje evidencia verificable en el repositorio. Aplica a `apps/`, `docs/` y a cada check-in: 6 oct, 20 oct, 3 nov y 19 nov.

En ISO/IEC 29110, el aseguramiento de la calidad en un equipo pequeño se logra con **verificación** (¿lo construimos bien?) y **validación** (¿construimos lo correcto?) dentro de los dos procesos del proyecto: administración (PM) e implementación (SI).

## 2. Fuentes

Solo se usan fuentes que el equipo tiene, sin estándares de pago:

| Fuente | Para qué |
| --- | --- |
| ISO/IEC 29110-5-1-1, perfil de entrada (copia con licencia personal; no se sube al repositorio) | Procesos PM y SI, tareas y productos de trabajo |
| "Adaptación de las tareas del ISO/IEC 29110 Perfil de Entrada" (material de la maestra) | Qué tareas hace cada rol |
| *Calidad del producto de software 3.0* e `ISO25000_Factors.pdf` (material de clase) | Factores de ISO/IEC 25010, modelo definido y fórmulas de métricas |
| *Software Engineering Standards* (material de clase) | Actividades de aseguramiento de producto y de proceso |
| TSPi: scripts, formas y tipos de defecto (material de TSP) | Registro de defectos y de tiempos |
| Enunciado y rúbrica SQA26 | Alcance, fechas y niveles de calificación |

## 3. Roles y tareas de ISO/IEC 29110

Según la adaptación de la maestra. Con 5 integrantes, cada rol de responsabilidad tiene una persona, y todos desarrollan.

| Rol | Integrante | Tareas de 29110 | En la práctica |
| --- | --- | --- | --- |
| Líder de equipo | Camila Rachel Sánchez Molina | PM.01.01–03, .05, .06, .08, .09 · PM.02.02 · PM.03.01, .03 · PM.04.01 · SI.0x.01 | Plan del ciclo, reuniones con la maestra, asignación de tareas, reporte de avance y cierre |
| Responsable técnico | David Ignacio Becerra Morán | PM.03.02 · SI.02.02 · SI.03.02–03 · SI.04.02 · SI.05.03 · SI.06.02 | Requisitos técnicos, diseño (ADR), estándares de código, CI, armado de la entrega |
| Responsable de calidad | Flavio Uriel Huizar González | SI.02.03 · SI.03.03 (apoyo) · SI.04.03–04 · SI.05.02 · SI.05.04–06 | Validar requisitos, casos de prueba, revisiones, registro de defectos, validación con la maestra, este plan |
| Responsable de colaboración | *Por asignar en la junta del equipo* | PM.01.04, .07, .10 · PM.02.01 · PM.04.02 · SI.01.02 · SI.0x.04/05/07 | Herramientas y repositorio al día, seguimiento del plan, guardar productos en el repositorio |
| Desarrolladores | Jorge Eduardo López Morán, Martin Alejandro Gaspar Mercado | Tareas de construcción del proceso SI | Código, pruebas de su código y revisión de PR de otros integrantes |

## 4. Productos de trabajo de 29110 y dónde están

| Producto de trabajo | En QualiTrack | Estado |
| --- | --- | --- |
| Acuerdo con el cliente | Enunciado SQA26 de la maestra | Listo |
| Plan del proyecto | [Plan del ciclo](../tsp/PlanCiclo2.md) y este plan | Listo |
| Registro de estado de avance | [Reportes de check-in](../checkins/) | Listo |
| Especificación de requisitos | [Historias de usuario](../HistoriasUsuario.md) con criterios de aceptación | Listo |
| Especificación de componentes | [ADR-001](../decisiones/ADR-001-arquitectura.md) y estructura del README | Listo |
| Casos y procedimientos de prueba | `apps/api/test` y `apps/web/src/**/*.test.ts(x)` | Listo |
| Resultados de verificación | Ejecuciones de CI, PR revisados con la [lista de revisión](ListaRevision.md), [bitácora](BitacoraSQA.md) | Faltan PR revisados |
| Resultados de validación | Demo de cada check-in con la maestra, anotada en la bitácora | Desde el 20 oct |
| Solicitudes de cambio | [ADR](../decisiones/) e Issues de GitHub | Listo |
| Registro de reuniones | *Falta*: `docs/tsp/Reuniones.md` con acuerdos y pendientes | Pendiente |
| Repositorio del proyecto | GitHub `Yeef05/QualiTrack`, `main` protegida y una etiqueta por entrega | Falta proteger `main` |
| Registro de aceptación | Entrega final del 19 nov | Pendiente |

## 5. Características de calidad que priorizamos

Factores de ISO/IEC 25010, tomados del resumen `ISO25000_Factors.pdf`:

| Característica | Cómo la atendemos | Evidencia |
| --- | --- | --- |
| Adecuación funcional | Historias con criterios de aceptación ligados a pruebas | `HistoriasUsuario.md`, pruebas |
| Fiabilidad | Validación de entradas (zod), restricciones en BD, manejo de errores centralizado | `errors.ts`, migraciones SQL |
| Seguridad | Contraseñas con bcrypt, JWT con expiración, permisos por rol, SQL parametrizado | `auth/`, pruebas 401/403 |
| Mantenibilidad | Módulos separados, ADR por decisión, controles automáticos en CI | `docs/decisiones`, CI |
| Usabilidad | Errores en español junto a cada campo, semáforo con texto (no solo color) | Pantallas, pruebas de componentes |

## 6. Métricas

QualiTrack se mide con su propio modelo ([ADR-004](../decisiones/ADR-004-modelo-metricas.md)). Cada valor peor/mejor tiene fuente, y se capturan en el proyecto "QualiTrack" de la herramienta. Los valores medidos van en [Mediciones](Mediciones.md).

| Métrica | Peor | Mejor | Se cuenta con |
| --- | --- | --- | --- |
| Capacidad funcional (%E) | 70 % | 100 % | Historias entregadas ÷ comprometidas |
| Criterios de aceptación cumplidos | 90 % | 100 % | Pruebas ligadas a criterios |
| Densidad de defectos | 1.0 | 0.5 | Registro de defectos ÷ historias entregadas |
| Defectos críticos abiertos | 0 | 0 | Registro de defectos |
| Eficiencia de QA | 85 % | 95 % | A ÷ (A + B + C) con el registro de defectos |
| Tiempo medio de corrección | 7 días | 2 días | Fechas del registro de defectos |
| Cumplimiento del plan de técnicas | 70 % | 90 % | Prácticas de la §7 hechas ÷ planeadas |

**Controles automáticos internos.** No son métricas del producto. Los revisa el CI sin trabajo manual y detienen el pipeline si fallan:
- Cobertura de líneas ≥ 70 %.
- Complejidad ≤ 10 por función (ESLint).
- 0 errores de tipos.

## 7. Prácticas de verificación y validación

| Práctica | Tipo | Tarea 29110 | Responsable | Cuándo | Evidencia |
| --- | --- | --- | --- | --- | --- |
| Inspección de requisitos con las características de un buen requisito (láminas 35–36: necesario, sin ambigüedad, verificable…) | Verificación estática | SI.02.03 · SI.03.02 | Calidad y técnico | Al agregar o cambiar una historia | Comentarios en el PR de la historia |
| Revisión de código por otro integrante con la lista de revisión | Verificación estática | SI.04.02–04 | Cualquier otro integrante | Cada pull request | PR aprobados |
| Análisis estático y revisión de tipos | Verificación estática | SI.04.04 | Técnico | Cada cambio, en CI | Historial de Actions |
| Pruebas unitarias y de integración | Verificación dinámica | SI.04.03–04 · SI.05.04 | Quien escribe el código | Cada cambio | Pruebas en verde en CI |
| Prueba de humo antes de cada demo (clon nuevo, instalar, entrar y recorrer las 4 pantallas) | Verificación dinámica | SI.05.04 | Calidad | Antes de cada check-in | Bitácora (así se encontró DEF-002) |
| Validación con la maestra en cada check-in | Validación | SI.05.06 · PM.02.02 | Líder y calidad | 20 oct, 3 nov, 19 nov | Bitácora con sus comentarios (cuentan como B en la eficiencia de QA) |
| Gestión de configuración: ramas `feature/` y `fix/`, PR, `main` protegida y una etiqueta por entrega | Proceso | PM.01.10 · SI.0x.05/07 | Colaboración | Siempre | Historial de Git |
| Registro de defectos con tipo TSP, gravedad y prueba de regresión | Proceso | SI.04.04 · SI.05.05 | Calidad | Al encontrar un error | [Registro de defectos](RegistroDefectos.md) |
| Auditoría interna del plan | Proceso | PM.03.01 | Calidad | Antes de cada check-in | Bitácora |
| Retrospectiva PDCA | Proceso | PM.03.03 · PM.04 | Líder | Al cerrar cada ciclo | `docs/tsp/Postmortem*.md` |

## 8. Otras formas de asegurar la calidad para el resto del semestre

Son prácticas ligeras que caben en un equipo chico. Cada una alimenta una métrica de la §6.

1. **Pruebas exploratorias por sesión.** 30 minutos con una misión, por ejemplo: "intentar romper el registro de mediciones con fechas y valores raros". Lo encontrado va al registro de defectos y sube el valor A de la eficiencia de QA.
2. **Prueba con usuarios.** Tres compañeros de otro equipo hacen 5 tareas sin ayuda. Activa la métrica opcional "Tareas completadas sin ayuda" (usabilidad).
3. **Análisis de causa de defectos.** Al cerrar cada ciclo se agrupan los defectos por tipo TSP (Pareto). A los más frecuentes se les hace un diagrama de Ishikawa para decidir qué práctica cambiar.
4. **Matriz de trazabilidad.** Historia → criterio → prueba → resultado. Ya existe dentro de `HistoriasUsuario.md`; mantenerla al día da el valor de "Criterios de aceptación cumplidos".
5. **Registro de tiempos de TSP.** Permite calcular el **desperdicio** (tiempo corrigiendo defectos ÷ tiempo total, lámina 44) después de liberar.
6. **Pruebas de flujo completo (E2E)** de los 3 flujos principales para la Beta, para cubrir las páginas que hoy no cuentan en la cobertura web.
7. **Revisión del despliegue.** Antes del 19 nov: desplegar en un servicio con PostgreSQL real y repetir la prueba de humo ahí.

## 9. Estándares

- TypeScript `strict`. ESLint con `typescript-eslint`, `complexity: 10`, `max-depth: 4` y `eqeqeq`.
- Commits con prefijo de tipo (`feat`, `fix`, `test`, `docs`, `chore`, `refactor`) y un cuerpo que explique el porqué.
- Ramas `feature/HU-xx-descripcion` o `fix/DEF-xxx-descripcion`, y PR con al menos una aprobación de otro integrante.
- Toda decisión que cambie la arquitectura, las herramientas o el modelo de calidad se documenta como ADR.

## 10. Definición de terminado

Una historia está terminada cuando:
1. Cumple sus criterios de aceptación.
2. Tiene pruebas automáticas que pasan en CI.
3. Otro integrante revisó y aprobó el PR.
4. La documentación afectada está actualizada.

## 11. Gestión de defectos

- Cada defecto se registra con gravedad (crítica, mayor, menor o cosmética), fase en que se inyectó, fase en que se detectó y tipo TSP.
- Se cierra solo con una prueba de regresión.
- Los defectos críticos bloquean la entrega, y en la herramienta limitan el índice de salud a 79.

## 12. Auditorías y mejora continua

Antes de cada check-in, el Responsable de calidad revisa cuatro cosas y anota el resultado en la bitácora:
- CI en verde en `main`.
- Métricas capturadas en QualiTrack.
- Registro de defectos al día.
- Historias terminadas según la §10.

El ciclo PDCA:
1. **Planear:** plan del ciclo.
2. **Hacer:** prácticas de la §7.
3. **Revisar:** auditoría y mediciones.
4. **Actuar:** las acciones del postmortem entran al siguiente plan.
