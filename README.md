# QualiTrack

Centro de control de **aseguramiento de la calidad (SQA)** para proyectos de software.
Permite registrar proyectos por periodo, dar seguimiento a sus métricas de calidad, gestionar las técnicas de SQA que se aplican y generar un reporte del estado de salud de cada proyecto.

Proyecto de la materia **Calidad de Software** (SQA26) · Docente: Mtra. María de León Sigg.

| Rol | Integrante |
| --- | --- |
| Líder del proyecto | Camila Rachel Sánchez Molina |
| Responsable de QA | Flavio Uriel Huizar González |
| Líder técnico | David Ignacio Becerra Morán |
| Developer | Jorge Eduardo López Morán |
| Developer | Martin Alejandro Gaspar Mercado |

## Módulos

| Módulo | Qué permite | Estado (Beta, 3 nov) |
| --- | --- | --- |
| M1. Proyectos y periodos | Alta, edición y archivo; un proyecto por periodo; historias entregadas | Beta |
| M2. Métricas de calidad | Modelo definido: cada métrica con valor peor y mejor, criterio de ISO/IEC 25010 y fuente; mediciones, tendencia y semáforo. **Modelo editable por proyecto** y métricas propias (CU-03) | Beta |
| M3. Técnicas SQA | Catálogo, plan por proyecto, ejecuciones y cumplimiento. **Registro de defectos** que calcula densidad, críticos, eficiencia de QA y tiempo de corrección (CU-11) | Beta |
| M4. Reportes de salud | Índice 0-100 (promedio de indicadores, tope 79 con defectos críticos), historial y exportación a PDF | Beta |
| M5. Usuarios y acceso | Inicio de sesión con JWT; roles Administrador, Líder QA y Miembro; **pantalla de usuarios** (CU-10) | Beta |

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

Para borrar los datos locales y empezar de cero, elimina la carpeta `apps/api/.data/`. Hazlo también después de actualizar a las migraciones `003` y `004` (Beta) si quieres ver los datos de ejemplo con el registro de defectos.

### Producción

```bash
npm run build          # genera apps/web/dist
NODE_ENV=production JWT_SECRET=... DATABASE_URL=postgres://... ADMIN_PASSWORD=... npm start
```

Con `DATABASE_URL` la API usa PostgreSQL real y sirve también el frontend compilado (un solo servicio, por ejemplo en Render).

## Calidad: cómo se verifica cada cambio

| Comando | Qué revisa | Meta del Plan SQA |
| --- | --- | --- |
| `npm run lint` | ESLint, incluida la regla `complexity` | Complejidad ciclomática ≤ 10 por función |
| `npm run typecheck` | Tipos de TypeScript en API y web | 0 errores |
| `npm run test:coverage` | Pruebas unitarias y de integración (Vitest) | Cobertura ≥ 70 % (el comando falla si baja) |
| `npm run check` | Todo lo anterior y el build | Debe pasar antes de abrir un PR |

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) corre `lint`, `typecheck`, `test:coverage` y `build` en cada pull request. SonarCloud se activa al configurar el secreto `SONAR_TOKEN`.

## Documentación

Índice completo en [`docs/README.md`](docs/README.md), separado en requisitos, diseño, planeación TSP, SQA y entregas.

- [Plan de SQA](docs/04-sqa/PlanSQA.md) (ISO/IEC 29110, perfil de entrada, y material de la clase)
- [Modelo de métricas para proyectos chicos](docs/02-diseno/decisiones/ADR-004-modelo-metricas.md): de dónde sale cada criterio
- [Bitácora de SQA](docs/04-sqa/BitacoraSQA.md) · [Registro de defectos](docs/04-sqa/RegistroDefectos.md) · [Mediciones](docs/04-sqa/Mediciones.md) · [Lista de revisión](docs/04-sqa/ListaRevision.md)
- [Casos de uso](docs/01-requisitos/CasosDeUso.md) · [Historias de usuario](docs/01-requisitos/HistoriasUsuario.md)
- [Diagramas de clases](docs/02-diseno/DiagramasClases.md)
- [Decisiones de arquitectura (ADR)](docs/02-diseno/decisiones/)
- Proceso TSP: [Plan del ciclo 2](docs/03-planeacion-tsp/PlanCiclo2.md) · [Postmortem del ciclo 2](docs/03-planeacion-tsp/PostmortemCiclo2.md) · [Plan del ciclo 3 (Beta), por caso de uso](docs/03-planeacion-tsp/PlanCiclo3.md)
- Check-in 2 (20 de octubre): [Reporte de estado](docs/05-entregas/checkin2/Checkin2_ReporteEstado.md) · [Reporte SQA](docs/05-entregas/checkin2/ReporteSQA_Checkin2.pdf)
- Beta (3 de noviembre): [Reporte de estado](docs/05-entregas/checkin3/Beta_ReporteEstado.md) · [Reporte SQA](docs/05-entregas/checkin3/ReporteSQA_Beta.pdf)

## Estructura

```
apps/
  api/   Express + TypeScript + PostgreSQL (PGlite en desarrollo)
    src/modules/{projects,metrics,techniques,health}
    test/          pruebas de integración con supertest
  web/   React + TypeScript + Vite + Chart.js
docs/
  01-requisitos/       casos de uso e historias de usuario
  02-diseno/           diagramas de clases y decisiones (ADR)
  03-planeacion-tsp/   planes y postmortem de cada ciclo
  04-sqa/              plan SQA, bitácora, defectos, mediciones, lista de revisión
  05-entregas/         lo entregado en cada check-in
```
