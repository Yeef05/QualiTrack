import { mkdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

/**
 * Interfaz mínima de acceso a datos. Las dos implementaciones hablan SQL de PostgreSQL:
 * - PGlite (PostgreSQL en WebAssembly) para desarrollo local y pruebas, sin instalar nada.
 * - pg (PostgreSQL real) en producción, con DATABASE_URL.
 * Ver docs/02-diseno/decisiones/ADR-002-base-de-datos.md.
 */
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

/** dataDir vacío = base de datos en memoria (se usa en las pruebas). */
export async function createPgliteDb(dataDir?: string): Promise<Db> {
  if (dataDir && !dataDir.includes('://')) {
    // DEF-002: PGlite no crea las carpetas intermedias; en un clon nuevo .data/ no existe.
    await mkdir(dataDir, { recursive: true });
  }
  const client = new PGlite(dataDir);
  await client.waitReady;
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const result = await client.query<T>(sql, params);
      return { rows: result.rows };
    },
    async exec(sql: string) {
      await client.exec(sql);
    },
    async close() {
      await client.close();
    },
  };
}

export function createPgDb(connectionString: string): Db {
  const ssl = process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false };
  const pool = new pg.Pool({ connectionString, ssl });
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const result = await pool.query(sql, params);
      return { rows: result.rows as T[] };
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    },
  };
}
