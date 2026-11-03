import bcrypt from 'bcryptjs';
import { isoDaysAgo } from '../validation';
import type { Db } from './index';

// Modelo de métricas para proyectos chicos (ADR-004). Todas se cuentan a mano con la lista de historias,
// los casos de prueba y el registro de defectos. Cada equipo puede ajustar peor y mejor o agregar las suyas.
interface CatalogMetric {
  code: string;
  name: string;
  unit: string;
  worst: number;
  best: number;
  direction: 'mayor' | 'menor';
  description: string;
  criterion: string;
  source: string;
  active: boolean;
}

const METRICS: CatalogMetric[] = [
  {
    code: 'funciones_terminadas',
    name: 'Capacidad funcional (%E)',
    unit: '%',
    worst: 70,
    best: 100,
    direction: 'mayor',
    description: 'Funcionalidades entregadas ÷ comprometidas para la entrega × 100',
    criterion: 'Adecuación funcional · completitud',
    source: 'Rúbrica SQA26: "Suficiente" = 70 %, "Excelente" = 100 %. Fórmula de la lámina 43.',
    active: true,
  },
  {
    code: 'criterios_aceptacion',
    name: 'Criterios de aceptación cumplidos',
    unit: '%',
    worst: 90,
    best: 100,
    direction: 'mayor',
    description: 'Criterios de aceptación que pasan ÷ criterios probados × 100',
    criterion: 'Adecuación funcional · corrección',
    source: 'Definición de terminado del Plan SQA: una historia está lista si cumple sus criterios.',
    active: true,
  },
  {
    code: 'densidad_defectos',
    name: 'Densidad de defectos',
    unit: 'por funcionalidad',
    worst: 1,
    best: 0.5,
    direction: 'menor',
    description: 'Defectos conocidos ÷ funcionalidades entregadas',
    criterion: 'Fiabilidad · madurez',
    source:
      'Fórmula de la lámina 42, con el tamaño en funcionalidades para no depender de una herramienta (lámina 40). Peor y mejor: acuerdo del equipo.',
    active: true,
  },
  {
    code: 'defectos_criticos',
    name: 'Defectos críticos abiertos',
    unit: 'defectos',
    worst: 0,
    best: 0,
    direction: 'menor',
    description: 'Defectos de gravedad crítica sin cerrar',
    criterion: 'Fiabilidad · tolerancia a fallos',
    source: 'Plan SQA: un defecto crítico bloquea la entrega. Rúbrica: "Insuficiente" si hay defectos críticos.',
    active: true,
  },
  {
    code: 'eficiencia_qa',
    name: 'Eficiencia de QA',
    unit: '%',
    worst: 85,
    best: 95,
    direction: 'mayor',
    description:
      'A ÷ (A + B + C) × 100. A: los encontró el equipo; B: en la revisión con el cliente; C: después de entregar',
    criterion: 'Proceso SQA · eficacia de la verificación',
    source:
      'Fórmula de la lámina 47; el ejemplo de la lámina 48 da 96.7 %. Bajo 85 %, más de 1 de cada 7 defectos se escapa.',
    active: true,
  },
  {
    code: 'tiempo_correccion',
    name: 'Tiempo medio de corrección',
    unit: 'días',
    worst: 7,
    best: 2,
    direction: 'menor',
    description: 'Promedio de días entre el registro y el cierre de cada defecto',
    criterion: 'Mantenibilidad · modificabilidad',
    source:
      'Acuerdo del equipo: con check-ins cada 2 semanas, un defecto de más de una semana llega abierto a la siguiente entrega.',
    active: true,
  },
  {
    code: 'cobertura',
    name: 'Cobertura de pruebas',
    unit: '%',
    worst: 50,
    best: 70,
    direction: 'mayor',
    description: 'Líneas que ejecutan las pruebas ÷ líneas totales × 100',
    criterion: 'Mantenibilidad · facilidad de prueba',
    source: 'Opcional: requiere pruebas automáticas. Valores peor y mejor del Entregable 1.',
    active: false,
  },
  {
    code: 'funcionalidades_con_prueba',
    name: 'Funcionalidades con prueba',
    unit: '%',
    worst: 70,
    best: 100,
    direction: 'mayor',
    description: 'Funcionalidades con al menos un caso de prueba ÷ total × 100',
    criterion: 'Mantenibilidad · facilidad de prueba',
    source: 'Opcional: alternativa a la cobertura sin herramientas. Peor = "Suficiente" de la rúbrica.',
    active: false,
  },
  {
    code: 'tareas_sin_ayuda',
    name: 'Tareas completadas sin ayuda',
    unit: '%',
    worst: 70,
    best: 90,
    direction: 'mayor',
    description: 'Tareas logradas ÷ tareas intentadas × 100 (3 usuarios, 5 tareas)',
    criterion: 'Usabilidad · facilidad de aprendizaje',
    source: 'Opcional: si el producto lo usan personas fuera del equipo. Modelo definido, lámina 33.',
    active: false,
  },
];

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
  // DO NOTHING: no se pisan los valores que un equipo ya ajustó.
  for (const m of METRICS) {
    await db.query(
      `INSERT INTO metrics (code, name, unit, worst, best, direction, description, criterion, source, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (code) DO NOTHING`,
      [m.code, m.name, m.unit, m.worst, m.best, m.direction, m.description, m.criterion, m.source, m.active],
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
// Técnica, frecuencia y hace cuántos días fue la última ejecución (null: nunca se ha hecho).
type PlanEntry = [string, string, number | null];
// Descripción, gravedad, tipo TSP, quién lo encontró, fecha de registro y de cierre (null: abierto).
type DefectEntry = [string, string, number, string, string, string | null];

interface DemoProject {
  name: string;
  description: string;
  team: string;
  qaLead: string;
  series: Series;
  plan: PlanEntry[];
  deliveredStories?: number;
  defects?: DefectEntry[];
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    name: 'QualiTrack',
    description: 'La propia herramienta, monitoreada con QualiTrack desde el primer sprint.',
    team: 'Equipo QualiTrack',
    qaLead: 'Flavio Uriel Huizar González',
    // Valores reales al check-in 2: 10 de 10 historias, 3 defectos, 0 críticos, todos encontrados por el equipo.
    series: {
      funciones_terminadas: [20, 40, 60, 80, 100],
      criterios_aceptacion: [80, 90, 95, 100, 100],
      densidad_defectos: [0, 0, 0, 0.2, 0.3],
      defectos_criticos: [0, 0, 0, 1, 0],
      eficiencia_qa: [100, 100, 100, 100, 100],
      tiempo_correccion: [0, 0, 0, 0, 0],
    },
    // La revisión de código por otro integrante aún no se hace: el plan queda en 75 % (amarillo).
    plan: [
      ['Revisión de código', 'por_pr', null],
      ['Pruebas unitarias', 'por_pr', 1],
      ['Análisis estático', 'por_pr', 1],
      ['Auditoría interna', 'por_checkin', 4],
    ],
    // Registro real de docs/04-sqa/RegistroDefectos.md; con él se calculan densidad, críticos, eficiencia y tiempo.
    deliveredStories: 10,
    defects: [
      ['npm install falla: TypeScript 7.0 no es compatible con typescript-eslint', 'mayor', 30, 'equipo', '2026-10-18', '2026-10-18'],
      ['El servidor no arranca en un clon nuevo: PGlite no crea la carpeta de datos', 'critica', 100, 'equipo', '2026-10-18', '2026-10-18'],
      ['"Hoy" se calcula en UTC: después de las 18:00 las fechas salen del día siguiente', 'mayor', 80, 'equipo', '2026-10-19', '2026-10-19'],
      ['El encabezado muestra "Líder QA · Líder QA" por el nombre del usuario de ejemplo', 'cosmetica', 70, 'equipo', '2026-10-19', '2026-10-19'],
    ],
  },
  {
    name: 'Odín · App educativa',
    description: 'Aplicación Android de retos educativos (TSP, Equipo Æsir).',
    team: 'Equipo Æsir',
    qaLead: 'Flavio Uriel Huizar González',
    series: {
      funciones_terminadas: [55, 62, 70, 78, 85],
      criterios_aceptacion: [80, 85, 88, 90, 92],
      densidad_defectos: [1.4, 1.2, 1.1, 0.9, 0.8],
      defectos_criticos: [2, 1, 1, 0, 0],
      eficiencia_qa: [70, 75, 80, 86, 88],
      tiempo_correccion: [9, 8, 6, 5, 4],
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
      criterios_aceptacion: [50, 55, 60, 62, 65],
      densidad_defectos: [2, 2.5, 3, 3, 3.2],
      defectos_criticos: [3, 3, 4, 3, 3],
      eficiencia_qa: [60, 55, 50, 52, 50],
      tiempo_correccion: [8, 7, 7, 6, 6],
    },
    plan: [
      ['Revisión de código', 'por_pr', 25],
      ['Retrospectiva', 'por_checkin', 40],
    ],
  },
];

async function seedDefects(db: Db, projectId: number, defects: DefectEntry[]) {
  for (const [description, severity, tspType, foundBy, foundOn, closedOn] of defects) {
    await db.query(
      `INSERT INTO defects (project_id, description, severity, tsp_type, found_by, found_on, closed_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [projectId, description, severity, tspType, foundBy, foundOn, closedOn],
    );
  }
}

async function seedDemoProject(db: Db, demo: DemoProject, period: string) {
  const { rows } = await db.query<{ id: number }>(
    `INSERT INTO projects (name, description, period, team, qa_lead, delivered_stories)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [demo.name, demo.description, period, demo.team, demo.qaLead, demo.deliveredStories ?? 0],
  );
  const projectId = rows[0].id;
  await seedDefects(db, projectId, demo.defects ?? []);
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
    if (lastDaysAgo === null) continue;
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
