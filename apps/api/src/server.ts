import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';
import { loadConfig } from './config';
import { createPgDb, createPgliteDb } from './db';
import { migrate } from './db/migrate';
import { seed } from './db/seed';

const config = loadConfig();
const db = config.databaseUrl ? createPgDb(config.databaseUrl) : await createPgliteDb(config.dataDir);

const applied = await migrate(db);
if (applied.length) {
  console.info(`Migraciones aplicadas: ${applied.join(', ')}`);
}
await seed(db, { demo: config.seedDemo, adminPassword: config.adminPassword });

const defaultDist = fileURLToPath(new URL('../../web/dist', import.meta.url));
const webDist = config.webDist ?? (existsSync(defaultDist) ? defaultDist : undefined);

createApp({ db, jwtSecret: config.jwtSecret, webDist }).listen(config.port, () => {
  console.info(`QualiTrack API en http://localhost:${config.port} (${config.databaseUrl ? 'PostgreSQL' : 'PGlite'})`);
});
