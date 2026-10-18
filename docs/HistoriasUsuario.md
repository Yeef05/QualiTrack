# Historias de usuario

Cada criterio de aceptación está ligado a una o más pruebas automáticas. Estado al check-in 2: implementadas y con pruebas; pendiente la revisión cruzada para darlas por terminadas.

## M1. Proyectos y periodos

**HU-01 · Registrar proyecto.** Como líder de QA quiero registrar un proyecto en un periodo para darle seguimiento a su calidad.
- Se captura nombre, periodo (AAAA-1 o AAAA-2), descripción, repositorio, equipo y responsable de QA → `projects.test.ts` "el líder de QA registra un proyecto"
- No se puede registrar el mismo proyecto dos veces en el mismo periodo, pero sí en otro → "no permite registrar…", "sí permite el mismo proyecto en otro periodo"
- Los datos inválidos muestran el error en el campo correspondiente → "valida nombre, periodo y URL", `components.test.tsx` "ProjectForm muestra los errores"

**HU-02 · Ver proyectos por periodo.** Como integrante quiero ver los proyectos del periodo con su salud para saber cuáles necesitan atención.
- Se filtra por periodo y se listan los periodos existentes → "lista por periodo con índice de salud"
- El dashboard muestra total de proyectos, salud promedio y defectos abiertos → `format.test.ts` "promedia y suma…"

**HU-03 · Editar y archivar.** Como líder de QA quiero editar o archivar un proyecto.
- Los archivados no aparecen salvo que se pidan → "consulta, edita y archiva un proyecto"
- Un proyecto archivado no admite mediciones nuevas → `metrics.test.ts` "no admite mediciones en proyectos archivados"

## M2. Métricas de calidad

**HU-04 · Catálogo de métricas.** Como líder de QA quiero definir métricas con su meta y si mayor o menor es mejor.
- El sistema trae las 5 métricas del Entregable 1 → "incluye el catálogo de métricas"
- El equipo puede agregar y ajustar las suyas → "el equipo puede agregar y ajustar…"

**HU-05 · Registrar mediciones.** Como integrante quiero registrar el valor de una métrica en una fecha.
- No se aceptan fechas futuras ni valores no numéricos → "rechaza fechas futuras…"
- Cada medición muestra su semáforo → "registra mediciones y calcula su semáforo"

**HU-06 · Tendencia y semáforo.** Como integrante quiero ver la tendencia de una métrica contra su meta.
- Verde si cumple la meta, amarillo dentro del 10 % de tolerancia, rojo fuera → `unit.test.ts` "semáforo de métricas"
- La gráfica muestra la línea de meta → `components.test.tsx` "grafica los valores y la línea de meta"

## M3. Técnicas SQA

**HU-07 · Plan de técnicas.** Como líder de QA quiero definir qué técnicas aplica el proyecto y con qué frecuencia.
- No se repite una técnica en el plan → "agrega técnicas al plan del proyecto sin duplicarlas"
- Una técnica sin ejecución dentro de su ventana aparece atrasada → "una técnica sin ejecuciones está atrasada", `unit.test.ts` "cumplimiento del plan"

**HU-08 · Registrar ejecuciones.** Como integrante quiero registrar cada vez que se aplica una técnica, con su resultado y hallazgos.
- Una ejecución "aprobada" no puede tener hallazgos → "valida las ejecuciones"
- El cumplimiento del plan se actualiza → "registra ejecuciones con sus hallazgos…"

## M4. Reportes de salud

**HU-09 · Índice de salud.** Como líder del proyecto quiero un índice de 0 a 100 para ver de un vistazo el estado del proyecto.
- Pondera métricas 50 %, plan 30 % y defectos críticos 20 %, y reparte el peso si falta un componente → `unit.test.ts` "índice de salud"
- Se puede guardar el reporte en un historial y exportarlo a PDF → "genera reportes y guarda su historial"

## M5. Usuarios y acceso

**HU-10 · Iniciar sesión con roles.** Como usuario quiero iniciar sesión y que el sistema respete mi rol.
- Credenciales incorrectas muestran un mensaje que no revela si el correo existe → `auth.test.ts` "rechaza contraseña incorrecta…"
- Un miembro no puede crear proyectos, métricas ni planes → pruebas 403 de cada módulo
