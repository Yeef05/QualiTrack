# ADR-002 · PGlite en desarrollo y pruebas, SQL directo en lugar de Prisma

- **Estado:** aceptada
- **Fecha:** 18 de octubre de 2026
- **Reemplaza:** el uso de Prisma ORM indicado en el Entregable 1

## Contexto

El Entregable 1 planteaba PostgreSQL con Prisma. Al iniciar el prototipo encontramos que:

1. No todos los equipos de desarrollo tienen PostgreSQL ni Docker funcionando; en la máquina de desarrollo Docker estaba detenido y PostgreSQL no estaba instalado.
2. Las pruebas de integración necesitan una base de datos limpia en cada archivo de prueba, sin depender de un servidor externo, tanto en las máquinas del equipo como en GitHub Actions.

## Decisión

- Mantener **PostgreSQL** como motor (mismo SQL en todos los entornos).
- En desarrollo y pruebas usar **PGlite** (`@electric-sql/pglite`): PostgreSQL compilado a WebAssembly que corre dentro de Node, en memoria (pruebas) o en una carpeta local (`.data/`).
- En producción usar el driver `pg` contra PostgreSQL real con `DATABASE_URL`.
- Acceder a datos con **SQL parametrizado** detrás de una interfaz mínima `Db` (`query`, `exec`, `close`) en lugar de Prisma, porque Prisma no se conecta a PGlite de forma estable.
- Versionar el esquema con migraciones SQL numeradas (`apps/api/src/db/migrations`), aplicadas al iniciar el servidor y registradas en `schema_migrations`.

## Consecuencias

- **A favor:** cualquier integrante corre `npm install && npm run dev` sin instalar nada más; las 46 pruebas de la API usan PostgreSQL real (restricciones `UNIQUE`, `CHECK` y llaves foráneas incluidas) en unos 13 segundos.
- **En contra:** se escribe SQL a mano. Para controlar ese riesgo: solo se usan consultas parametrizadas (`$1, $2…`), nunca concatenación de datos del usuario, y cada repositorio tiene pruebas de integración.
- Se debe validar el despliegue con PostgreSQL real (Render) antes de la versión Beta.
