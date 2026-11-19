# QualiTrack

Centro de control de **aseguramiento de la calidad (SQA)** para proyectos de software.
Permite registrar proyectos por periodo, dar seguimiento a sus métricas de calidad, gestionar las técnicas de SQA que se aplican y generar un reporte del estado de salud de cada proyecto.

Proyecto de la materia **Calidad de Software** (SQA26) · Docente: Mtra. María de León Sigg.

**En línea:** https://qualitrack-x1u0.onrender.com (Render, plan gratuito: si nadie lo usa en 15 minutos se duerme y la primera visita tarda cerca de un minuto).

| Rol | Integrante |
| --- | --- |
| Líder del proyecto | Camila Rachel Sánchez Molina |
| Responsable de QA | Flavio Uriel Huizar González |
| Líder técnico | David Ignacio Becerra Morán |
| Developer | Jorge Eduardo López Morán |
| Developer | Martin Alejandro Gaspar Mercado |

## Módulos

| Módulo | Qué permite | Estado (versión 1.0, 19 nov) |
| --- | --- | --- |
| M1. Proyectos y periodos | Alta, edición y archivo; un proyecto por periodo; historias entregadas; responsable de QA elegido de la lista de usuarios | Terminado |
| M2. Métricas de calidad | Modelo definido: cada métrica con valor peor y mejor, criterio de ISO/IEC 25010 y fuente; mediciones, tendencia y semáforo. **Modelo editable por proyecto** y métricas propias (CU-03) | Terminado |
| M3. Técnicas SQA | Catálogo, plan por proyecto, ejecuciones y cumplimiento. **Registro de defectos** que calcula densidad, críticos, eficiencia de QA y tiempo de corrección (CU-11) | Terminado |
| M4. Reportes de salud | Índice 0-100 (promedio de indicadores, tope 79 con defectos críticos), historial y exportación a PDF | Terminado |
| M5. Usuarios y acceso | Inicio de sesión con JWT; roles Administrador, Líder QA y Miembro; **pantalla de usuarios** (CU-10) | Terminado |

La interfaz tiene modo claro y oscuro: el botón del encabezado lo cambia, y la primera vez se usa el del sistema operativo.

## Cómo correrlo

Requisitos: Node.js 20.19 o superior. **No hace falta instalar PostgreSQL**: en desarrollo se usa PGlite, que es PostgreSQL compilado a WebAssembly ([ADR-002](docs/02-diseno/decisiones/ADR-002-base-de-datos.md)).

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (Vite, con proxy a la API)
- API: http://localhost:3001

La primera vez se crean el esquema, los catálogos y tres proyectos de ejemplo. Usuarios de demostración (contraseña `qualitrack2026`, solo para desarrollo local):

| Correo | Rol |
| --- | --- |
| admin@qualitrack.local | Administrador |
| qa@qualitrack.local | Líder QA |
| miembro@qualitrack.local | Miembro |

Para borrar los datos locales y empezar de cero, elimina la carpeta `apps/api/.data/`. Una base anterior se actualiza sola con las migraciones al arrancar, pero los datos de ejemplo solo se cargan en una base vacía.

### Producción

```bash
npm run build          # genera apps/web/dist
NODE_ENV=production JWT_SECRET=... DATABASE_URL=postgres://... ADMIN_PASSWORD=... npm start
```

Con `DATABASE_URL` la API usa PostgreSQL real y sirve también el frontend compilado (un solo servicio).

**Render.** El archivo [`render.yaml`](render.yaml) crea el servicio web y la base de datos PostgreSQL:

1. En Render: *New → Blueprint* y elegir este repositorio.
2. Desplegar. `JWT_SECRET` y `ADMIN_PASSWORD` (contraseña de los usuarios de ejemplo) se generan solos; la contraseña se consulta en *Environment* del servicio `qualitrack`. `DATABASE_URL` sale de la base de datos.
3. Al terminar el despliegue, abrir `/api/health` (debe responder `{"status":"ok"}`) y repetir la prueba de humo.

Si el registro dice que el servidor no admite SSL, agrega la variable `PGSSL=false`.

## Calidad: cómo se verifica cada cambio

| Comando | Qué revisa | Meta del Plan SQA |
| --- | --- | --- |
| `npm run lint` | ESLint, incluida la regla `complexity` | Complejidad ciclomática ≤ 10 por función |
| `npm run typecheck` | Tipos de TypeScript en API y web | 0 errores |
| `npm run test:coverage` | Pruebas unitarias y de integración (Vitest) | Cobertura ≥ 70 % (el comando falla si baja) |
| `npm run check` | Todo lo anterior y el build | Debe pasar antes de abrir un PR |
| `npm run e2e` | 3 flujos completos en Chrome con Playwright (`e2e/flujos.spec.ts`): registrar un proyecto; registrar mediciones y guardar el reporte; registrar y cerrar un defecto crítico | Los 3 en verde. Necesita Google Chrome instalado |

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) corre `lint`, `typecheck`, `test:coverage` y `build` en cada pull request, y después los 3 flujos E2E en un trabajo aparte. SonarCloud no está conectado: falta poner la organización real en `sonar-project.properties` y el secreto `SONAR_TOKEN`.

Al 18 de noviembre: 109 pruebas en verde (68 de la API y 41 de la web), cobertura de líneas 97.8 % en la API y 98.9 % en la web.

## Documentación

Índice completo en [`docs/README.md`](docs/README.md), separado en requisitos, diseño, planeación TSP, SQA y entregas.

- [Plan de SQA](docs/04-sqa/PlanSQA.md) (ISO/IEC 29110, perfil de entrada, y material de la clase)
- [Modelo de métricas para proyectos chicos](docs/02-diseno/decisiones/ADR-004-modelo-metricas.md): de dónde sale cada criterio
- [Bitácora de SQA](docs/04-sqa/BitacoraSQA.md) · [Registro de defectos](docs/04-sqa/RegistroDefectos.md) · [Mediciones](docs/04-sqa/Mediciones.md) · [Lista de revisión](docs/04-sqa/ListaRevision.md) · [Revisiones y casos de prueba](docs/04-sqa/RevisionesBeta.md)
- [Casos de uso](docs/01-requisitos/CasosDeUso.md) · [Historias de usuario](docs/01-requisitos/HistoriasUsuario.md)
- [Diagramas de clases](docs/02-diseno/DiagramasClases.md)
- [Decisiones de arquitectura (ADR)](docs/02-diseno/decisiones/)
- Proceso TSP: [Plan del ciclo 2](docs/03-planeacion-tsp/PlanCiclo2.md) · [Postmortem del ciclo 2](docs/03-planeacion-tsp/PostmortemCiclo2.md) · [Plan del ciclo 3 (Beta)](docs/03-planeacion-tsp/PlanCiclo3.md) · [Postmortem del ciclo 3](docs/03-planeacion-tsp/PostmortemCiclo3.md) · [Plan del ciclo 4 (entrega final)](docs/03-planeacion-tsp/PlanCiclo4.md) · [Postmortem del ciclo 4](docs/03-planeacion-tsp/PostmortemCiclo4.md) · [Registro de tiempos](docs/03-planeacion-tsp/RegistroTiempos.md) · [Reuniones](docs/03-planeacion-tsp/Reuniones.md)
- Check-in 2 (20 de octubre): [Reporte de estado](docs/05-entregas/checkin2/Checkin2_ReporteEstado.md) · [Reporte SQA](docs/05-entregas/checkin2/ReporteSQA_Checkin2.pdf)
- Beta (3 de noviembre): [Reporte de estado](docs/05-entregas/checkin3/Beta_ReporteEstado.md) · [Reporte SQA](docs/05-entregas/checkin3/ReporteSQA_Beta.pdf)
- Entrega final (19 de noviembre): [Reporte de estado](docs/05-entregas/final/Final_ReporteEstado.md) · [Postmortem del ciclo 4](docs/03-planeacion-tsp/PostmortemCiclo4.md)

## Estructura

```
apps/
  api/   Express + TypeScript + PostgreSQL (PGlite en desarrollo)
    src/modules/{projects,metrics,techniques,defects,health}
    test/          pruebas de integración con supertest
  web/   React + TypeScript + Vite + Chart.js
docs/
  01-requisitos/       casos de uso e historias de usuario
  02-diseno/           diagramas de clases y decisiones (ADR)
  03-planeacion-tsp/   planes y postmortem de cada ciclo
  04-sqa/              plan SQA, bitácora, defectos, mediciones, lista de revisión
  05-entregas/         lo entregado en cada check-in
```
