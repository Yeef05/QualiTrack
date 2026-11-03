# Historias de usuario

Cada criterio de aceptación está ligado a una o más pruebas automáticas. Cada historia se rastrea a un [caso de uso](CasosDeUso.md#trazabilidad-cu--historias--pruebas). Estado al check-in 2: implementadas y con pruebas; pendiente la revisión cruzada para darlas por terminadas.

## M1. Proyectos y periodos

**HU-01 · Registrar proyecto.** Como líder de QA quiero registrar un proyecto en un periodo para darle seguimiento a su calidad.
- Se captura nombre, periodo (AAAA-1 o AAAA-2), descripción, repositorio, equipo y responsable de QA → `projects.test.ts` "el líder de QA registra un proyecto"
- No se puede registrar el mismo proyecto dos veces en el mismo periodo, pero sí en otro → "no permite registrar…", "sí permite el mismo proyecto en otro periodo"
- Los datos inválidos muestran el error en el campo correspondiente → "valida nombre, periodo y URL", `components.test.tsx` "ProjectForm muestra los errores"

**HU-02 · Ver proyectos por periodo.** Como integrante quiero ver los proyectos del periodo con su salud para saber cuáles necesitan atención.
- Se filtra por periodo y se listan los periodos existentes → "lista por periodo con índice de salud"
- El dashboard muestra total de proyectos, salud promedio y defectos críticos abiertos → `format.test.ts` "promedia y suma…"

**HU-03 · Editar y archivar.** Como líder de QA quiero editar o archivar un proyecto.
- Los archivados no aparecen salvo que se pidan → "consulta, edita y archiva un proyecto"
- Un proyecto archivado no admite mediciones nuevas → `metrics.test.ts` "no admite mediciones en proyectos archivados"

## M2. Métricas de calidad

**HU-04 · Catálogo de métricas.** Como líder de QA quiero un catálogo de métricas que un equipo chico pueda contar a mano, y saber de dónde sale cada criterio ([ADR-004](../02-diseno/decisiones/ADR-004-modelo-metricas.md)).
- El sistema trae 6 métricas activas y 3 opcionales, cada una con su factor de ISO/IEC 25010, su fórmula y la fuente de sus valores peor y mejor → "incluye el modelo de métricas para proyectos chicos"
- El equipo puede agregar, ajustar o desactivar las suyas; el valor peor no puede ser mejor que el mejor → "el equipo puede agregar y ajustar…", "valida el código de la métrica…"
- Las métricas inactivas conservan su historial, pero no se pueden medir ni cuentan en el semáforo → "no registra mediciones de métricas inactivas"
- Una base anterior se actualiza sin perder mediciones → `unit.test.ts` "ADR-004: una base del check-in 1 se actualiza…"

**HU-05 · Registrar mediciones.** Como integrante quiero registrar el valor de una métrica en una fecha.
- No se aceptan fechas futuras ni valores no numéricos → "rechaza fechas futuras…"
- Cada medición muestra su semáforo → "registra mediciones y calcula su semáforo"

**HU-06 · Tendencia y semáforo.** Como integrante quiero ver la tendencia de una métrica contra su meta.
- Verde si llega al valor mejor, amarillo entre el peor y el mejor, rojo si es peor que el peor → `unit.test.ts` "semáforo de métricas con peor y mejor"
- La gráfica muestra las líneas de mejor y peor → `components.test.tsx` "grafica los valores y las líneas de mejor y peor"

## M3. Técnicas SQA

**HU-07 · Plan de técnicas.** Como líder de QA quiero definir qué técnicas aplica el proyecto y con qué frecuencia.
- No se repite una técnica en el plan → "agrega técnicas al plan del proyecto sin duplicarlas"
- Una técnica sin ejecución dentro de su ventana aparece atrasada → "una técnica sin ejecuciones está atrasada", `unit.test.ts` "cumplimiento del plan"

**HU-08 · Registrar ejecuciones.** Como integrante quiero registrar cada vez que se aplica una técnica, con su resultado y hallazgos.
- Una ejecución "aprobada" no puede tener hallazgos → "valida las ejecuciones"
- El cumplimiento del plan se actualiza → "registra ejecuciones con sus hallazgos…"

## M4. Reportes de salud

**HU-09 · Índice de salud.** Como líder del proyecto quiero un índice de 0 a 100 para ver de un vistazo el estado del proyecto.
- Promedia los indicadores (verde 100, amarillo 50, rojo 0); el plan de técnicas cuenta como un indicador más (verde ≥ 90 %, amarillo ≥ 70 %) → `unit.test.ts` "índice de salud"
- Con defectos críticos abiertos el índice no pasa de 79 → "con defectos críticos abiertos el índice no pasa de 79"
- Se puede guardar el reporte en un historial y exportarlo a PDF → "genera reportes y guarda su historial"

## M5. Usuarios y acceso

**HU-10 · Iniciar sesión con roles.** Como usuario quiero iniciar sesión y que el sistema respete mi rol.
- Credenciales incorrectas muestran un mensaje que no revela si el correo existe → `auth.test.ts` "rechaza contraseña incorrecta…"
- Un miembro no puede crear proyectos, métricas ni planes → pruebas 403 de cada módulo

## Beta

**HU-11 · Registrar defectos (CU-11).** Como integrante quiero registrar los defectos del proyecto y cerrarlos al corregirlos, para que QualiTrack calcule solo la densidad, los críticos abiertos, la eficiencia de QA y el tiempo de corrección.
- Un defecto se registra abierto con descripción, gravedad, tipo TSP, fecha y quién lo encontró (equipo, cliente o después de entregar), y se cierra con su fecha → `defects.test.ts` "un integrante registra un defecto abierto y lo cierra al corregirlo"
- La fecha de cierre no puede ser anterior a la de registro; no se aceptan fechas futuras, tipos TSP fuera de la clasificación ni defectos en proyectos archivados → "A4.1: rechaza un cierre anterior al registro…", "no admite defectos en un proyecto archivado"
- Las 4 métricas se calculan a partir del registro y coinciden con un cálculo a mano de un caso de ejemplo (4 defectos, 8 historias: densidad 0.5, 1 crítico abierto, eficiencia 50 %, 1.5 días) → "calcula densidad, críticos abiertos, eficiencia de QA y tiempo medio de corrección"
- El semáforo y el índice de salud usan los valores del registro en lugar de las mediciones capturadas a mano → "el semáforo y el índice usan los valores del registro…"
- La densidad usa las historias entregadas del proyecto como tamaño (RF-38) → "deja sin dato lo que no se puede calcular", `components.test.tsx` "ProjectForm envía los valores capturados"
