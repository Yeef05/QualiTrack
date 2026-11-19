# Especificación de requisitos · QualiTrack 1.0

Producto de trabajo "Especificación de requisitos" de ISO/IEC 29110. Este documento es la portada: reúne el alcance, los requisitos no funcionales y el estado final. Los requisitos funcionales están detallados en dos documentos:

- [Casos de uso](CasosDeUso.md): CU-01 a CU-11 con sus flujos, y los requisitos funcionales RF-01 a RF-38.
- [Historias de usuario](HistoriasUsuario.md): HU-01 a HU-11 con 33 criterios de aceptación, cada uno ligado a una prueba.

Versión final al 19/11/2026.

## 1. Introducción

QualiTrack es una aplicación web para equipos de desarrollo que quieren controlar la calidad de sus proyectos. Cada equipo registra su proyecto del periodo, captura sus métricas contra un modelo definido, planea y registra las técnicas de calidad que aplica, lleva su registro de defectos y obtiene un índice de salud de 0 a 100.

| Usuario | Rol en el sistema | Qué hace |
| --- | --- | --- |
| Líder de QA | `lider_qa` | Registra proyectos, define el modelo de calidad y el plan de técnicas |
| Integrante del equipo | `miembro` | Registra mediciones, ejecuciones de técnicas y defectos; consulta el estado |
| Administrador | `admin` | Todo lo anterior, más dar acceso a los integrantes |

## 2. Requisitos funcionales

| Requisito del enunciado | Casos de uso | Historias | Estado final |
| --- | --- | --- | --- |
| Registro de un proyecto de software por periodo | CU-01, CU-02 | HU-01 a HU-03 | Implementado; responsable de QA elegido de la lista de usuarios (DEF-007) |
| Seguimiento de métricas de calidad definidas por el equipo | CU-03, CU-04, CU-05 | HU-04 a HU-06 | Implementado; modelo editable por proyecto con peor, mejor y fuente |
| Gestión de técnicas de SQA (aplicación y monitoreo) | CU-06, CU-07, CU-11 | HU-07, HU-08, HU-11 | Implementado; responsable de cada ejecución elegido de la lista (DEF-008) y registro de defectos |
| Reportes del estado de salud | CU-08, CU-09 | HU-09 | Implementado; historial y exportación a PDF |
| (Soporte) Usuarios y acceso | CU-10 | HU-10 | Implementado; solo alta de usuarios |

**Los 11 casos de uso están implementados y los 33 criterios de aceptación se cumplen** (pruebas automáticas y casos manuales; ver el [reporte de pruebas](../04-sqa/ReportePruebas.md)). Ninguna historia cumple la definición de terminado del Plan SQA, porque ningún cambio tuvo la aprobación de otro integrante en un PR.

## 3. Requisitos no funcionales

| ID | Característica (ISO/IEC 25010) | Requisito | Cómo se comprueba | Resultado final |
| --- | --- | --- | --- | --- |
| RNF-01 | Mantenibilidad | Al menos 70 % del código cubierto por pruebas automáticas; complejidad ciclomática ≤ 10 por función | CI en cada cambio (cobertura y ESLint `complexity`) | Cumple: 97.8 % API y 98.9 % web; ESLint como compuerta (HAL-001 a HAL-003) |
| RNF-02 | Seguridad | Contraseñas cifradas, sesión que expira y permisos por rol | Pruebas de acceso sin sesión, sin permiso y con contraseña incorrecta | Cumple: bcrypt, JWT, 401 y 403 probados; el mensaje de acceso no dice si el correo existe |
| RNF-03 | Usabilidad | Mensajes de error en español junto al campo, que digan cómo corregir; semáforo con texto, no solo color | Pruebas de pantallas, revisiones y casos manuales | Cumple después de DEF-012 y DEF-013 |
| RNF-04 | Portabilidad | Funciona en navegadores actuales, en celular y se instala en una computadora nueva con el README | Prueba de humo en clon nuevo, E2E y revisión a 375 px | Cumple en Chrome (E2E y humo) y a 375 px después de DEF-014. Edge y Firefox sin prueba registrada |
| RNF-05 | Fiabilidad | El sistema se despliega con PostgreSQL real y actualiza bases anteriores sin perder datos | Migraciones con prueba y prueba de humo en Render | Cumple: migraciones 001 a 005 en Render el 19/11 |

## 4. Restricciones

- Aplicación web: React en el frontend, Node.js con Express en el servidor y PostgreSQL ([ADR-001](../02-diseno/decisiones/ADR-001-arquitectura.md), [ADR-002](../02-diseno/decisiones/ADR-002-base-de-datos.md)). En desarrollo se usa PGlite para no instalar PostgreSQL.
- El código vive en GitHub y las pruebas corren solas en cada cambio.
- No incluye: conexión automática con otras herramientas, app móvil, correos ni varios idiomas.

## 5. Diferencias con lo acordado

| Acordado (Agreement) | Versión 1.0 |
| --- | --- |
| Mediciones capturadas "a mano o por CSV" | Solo a mano |
| Usuarios con roles | Solo alta: no hay edición, baja ni cambio de contraseña |
