export interface ServerConfig {
  port: number;
  jwtSecret: string;
  databaseUrl?: string;
  dataDir: string;
  seedDemo: boolean;
  adminPassword: string;
  webDist?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const isProd = env.NODE_ENV === 'production';
  const jwtSecret = env.JWT_SECRET ?? (isProd ? '' : 'dev-secret-solo-local');
  if (!jwtSecret) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }
  return {
    port: Number(env.PORT ?? 3001),
    jwtSecret,
    databaseUrl: env.DATABASE_URL || undefined,
    dataDir: env.DATA_DIR ?? '.data/qualitrack',
    seedDemo: env.SEED_DEMO !== 'false',
    adminPassword: env.ADMIN_PASSWORD ?? 'qualitrack2026',
    webDist: env.WEB_DIST || undefined,
  };
}
