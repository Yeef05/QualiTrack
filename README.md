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

| Módulo | Qué permite | Estado (check-in 2) |
| --- | --- | --- |
| M1. Proyectos y periodos | Alta, edición y archivo; un proyecto por periodo | Prototipo funcional |
| M2. Métricas de calidad | Catálogo con umbral meta, mediciones, tendencia y semáforo | Prototipo funcional |
| M3. Técnicas SQA | Catálogo, plan por proyecto, ejecuciones y cumplimiento | Prototipo funcional |
| M4. Reportes de salud | Índice 0-100, historial y exportación a PDF | Prototipo funcional |
| M5. Usuarios y acceso | Inicio de sesión con JWT; roles Administrador, Líder QA y Miembro | Básico (sin pantalla de usuarios) |

## Cómo correrlo

Requisitos: Node.js 20.19 o superior. **No hace falta instalar PostgreSQL**: en desarrollo se usa PGlite, que es PostgreSQL compilado a WebAssembly ([ADR-002](docs/decisiones/ADR-002-base-de-datos.md)).

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

Para borrar los datos locales y empezar de cero, elimina la carpeta `apps/api/.data/`.

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

- [Plan de SQA](docs/sqa/PlanSQA.md) (IEEE 730 + ISO/IEC 25010)
- [Bitácora de SQA](docs/sqa/BitacoraSQA.md) · [Registro de defectos](docs/sqa/RegistroDefectos.md) · [Mediciones](docs/sqa/Mediciones.md) · [Lista de revisión](docs/sqa/ListaRevision.md)
- [Historias de usuario](docs/HistoriasUsuario.md)
- [Decisiones de arquitectura (ADR)](docs/decisiones/)
- Proceso TSP: [Plan del ciclo 2](docs/tsp/PlanCiclo2.md) · [Postmortem del ciclo 2](docs/tsp/PostmortemCiclo2.md)
- Check-in 2 (20 de octubre): [Reporte de estado](docs/checkins/Checkin2_ReporteEstado.md) · [Guion de la demo](docs/checkins/Checkin2_GuionDemo.md)

## Estructura

```
apps/
  api/   Express + TypeScript + PostgreSQL (PGlite en desarrollo)
    src/modules/{projects,metrics,techniques,health}
    test/          pruebas de integración con supertest
  web/   React + TypeScript + Vite + Chart.js
docs/    plan y bitácora de SQA, ADR, proceso TSP, check-ins
```
