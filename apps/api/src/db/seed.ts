import bcrypt from 'bcryptjs';
import { isoDaysAgo } from '../validation';
import type { Db } from './index';

// Métricas de ejemplo del Entregable 1 (cada equipo puede agregar las suyas).
const METRICS = [
  ['funciones_terminadas', '% de funciones terminadas', '%', 100, 'mayor', 'Funciones terminadas contra las pedidas'],
  ['defectos_criticos', 'Defectos críticos abiertos', 'defectos', 0, 'menor', 'Errores graves sin resolver'],
  ['defectos_abiertos', 'Defectos abiertos', 'defectos', 5, 'menor', 'Errores abiertos de cualquier gravedad'],
  ['cobertura', 'Cobertura de pruebas', '%', 70, 'mayor', 'Porcentaje del código ejecutado por las pruebas'],
  ['complejidad', 'Complejidad ciclomática máxima', 'por función', 10, 'menor', 'Medida por ESLint/SonarCloud'],
] as const;

const TECHNIQUES = [
  ['Revisión de código', 'estatica', 'Otro integrante revisa y aprueba cada pull request'],
  ['Inspección de requisitos', 'estatica', 'Revisión de historias de usuario y criterios de aceptación'],
  ['Análisis estático', 'estatica', 'ESLint y SonarCloud en cada cambio'],
  ['Pruebas unitarias', 'dinamica', 'Pruebas automáticas de cada módulo'],
  ['Pruebas de integración', 'dinamica', 'Pruebas de la API contra la base de datos'],
  ['Pruebas de flujo completo (E2E)', 'dinamica', 'Flujos principales como los usaría una persona'],
  ['Auditoría interna', 'proceso', 'QA verifica que se siguió el plan antes de cada entrega'],
  ['Retrospectiva', 'proceso', 'Ciclo PDCA al cierre de cada check-in'],
] as const;

export interface SeedOptions {
  demo: boolean;
  adminPassword: string;
}

async function count(db: Db, table: string): Promise<number> {
  const { rows } = await db.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return rows[0].n;
}

async function seedCatalogs(db: Db) {
  for (const [code, name, unit, target, direction, description] of METRICS) {
    await db.query(
      `INSERT INTO metrics (code, name, unit, target, direction, description) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO NOTHING`,
      [code, name, unit, target, direction, description],
    );
  }
  for (const [name, kind, description] of TECHNIQUES) {
    await db.query(
      'INSERT INTO techniques (name, kind, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [name, kind, description],
    );
  }
}

async function seedUsers(db: Db, adminPassword: string) {
  if ((await count(db, 'users')) > 0) return;
  const hash = await bcrypt.hash(adminPassword, 10);
  // Nombres de persona: el encabezado muestra "nombre · rol" y con nombres de rol se repetía (DEF-004).
  const users = [
    ['David Becerra', 'admin@qualitrack.local', 'admin'],
    ['Flavio Huizar', 'qa@qualitrack.local', 'lider_qa'],
    ['Jorge López', 'miembro@qualitrack.local', 'miembro'],
  ];
  for (const [name, email, role] of users) {
    await db.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)', [
      name,
      email,
      hash,
      role,
    ]);
  }
}

// Serie semanal de 5 mediciones (de hace 4 semanas a hoy) por métrica.
type Series = Record<string, number[]>;

const DEMO_PROJECTS: { name: string; description: string; team: string; qaLead: string; series: Series; plan: [string, string, number][] }[] = [
  {
    name: 'QualiTrack',
    description: 'La propia herramienta, monitoreada con QualiTrack desde el primer sprint.',
    team: 'Equipo QualiTrack',
    qaLead: 'Flavio Uriel Huizar González',
    series: {
      funciones_terminadas: [10, 22, 35, 48, 60],
      defectos_criticos: [1, 1, 0, 0, 0],
      defectos_abiertos: [6, 5, 4, 3, 2],
      cobertura: [40, 55, 66, 72, 78],
      complejidad: [12, 11, 10, 9, 8],
    },
    plan: [
      ['Revisión de código', 'por_pr', 1],
      ['Pruebas unitarias', 'por_pr', 2],
      ['Análisis estático', 'por_pr', 1],
      ['Auditoría interna', 'por_checkin', 5],
    ],
  },
  {
    name: 'Odín · App educativa',
    description: 'Aplicación Android de retos educativos (TSP, Equipo Æsir).',
    team: 'Equipo Æsir',
    qaLead: 'Flavio Uriel Huizar González',
    series: {
      funciones_terminadas: [55, 62, 70, 78, 92],
      defectos_criticos: [2, 1, 1, 0, 0],
      defectos_abiertos: [9, 8, 7, 6, 5],
      cobertura: [40, 48, 55, 60, 64],
      complejidad: [14, 13, 12, 11, 11],
    },
    plan: [
      ['Revisión de código', 'semanal', 3],
      ['Pruebas unitarias', 'semanal', 12],
      ['Auditoría interna', 'por_checkin', 10],
    ],
  },
  {
    name: 'Portal de Servicio Social',
    description: 'Registro de horas y reportes de servicio social.',
    team: 'Equipo Portal',
    qaLead: 'Responsable QA',
    series: {
      funciones_terminadas: [5, 8, 12, 15, 18],
      defectos_criticos: [3, 3, 4, 3, 3],
      defectos_abiertos: [12, 14, 15, 15, 16],
      cobertura: [10, 10, 12, 12, 15],
      complejidad: [18, 18, 19, 17, 17],
    },
    plan: [
      ['Revisión de código', 'por_pr', 25],
      ['Retrospectiva', 'por_checkin', 40],
    ],
  },
];

async function seedDemoProject(db: Db, demo: (typeof DEMO_PROJECTS)[number], period: string) {
  const { rows } = await db.query<{ id: number }>(
    'INSERT INTO projects (name, description, period, team, qa_lead) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [demo.name, demo.description, period, demo.team, demo.qaLead],
  );
  const projectId = rows[0].id;
  for (const [code, values] of Object.entries(demo.series)) {
    for (const [i, value] of values.entries()) {
      await db.query(
        `INSERT INTO measurements (project_id, metric_id, value, measured_on)
         SELECT $1, id, $2, $3 FROM metrics WHERE code = $4`,
        [projectId, value, isoDaysAgo((values.length - 1 - i) * 7), code],
      );
    }
  }
  for (const [technique, frequency, lastDaysAgo] of demo.plan) {
    const plan = await db.query<{ id: number }>(
      `INSERT INTO technique_plans (project_id, technique_id, frequency, responsible)
       SELECT $1, id, $2, $3 FROM techniques WHERE name = $4 RETURNING id`,
      [projectId, frequency, demo.qaLead, technique],
    );
    await db.query(
      `INSERT INTO technique_executions (plan_id, executed_on, responsible, result, findings)
       VALUES ($1, $2, $3, $4, $5)`,
      [plan.rows[0].id, isoDaysAgo(lastDaysAgo), demo.qaLead, lastDaysAgo > 10 ? 'con_hallazgos' : 'aprobada', lastDaysAgo > 10 ? 2 : 0],
    );
  }
}

/** Idempotente: solo inserta lo que falte. */
export async function seed(db: Db, options: SeedOptions): Promise<void> {
  await seedCatalogs(db);
  await seedUsers(db, options.adminPassword);
  if (options.demo && (await count(db, 'projects')) === 0) {
    for (const demo of DEMO_PROJECTS) {
      await seedDemoProject(db, demo, '2026-2');
    }
  }
}
