-- Esquema inicial de QualiTrack (modelo de datos del Entregable 1).

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lider_qa', 'miembro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M1. Un proyecto se registra una sola vez por periodo (nombre + periodo únicos).
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL CHECK (period ~ '^[0-9]{4}-[12]$'),
  repository_url TEXT NOT NULL DEFAULT '',
  team TEXT NOT NULL DEFAULT '',
  qa_lead TEXT NOT NULL DEFAULT '',
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, period)
);

-- M2. Catálogo de métricas con umbral meta y dirección (mayor o menor es mejor).
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  target DOUBLE PRECISION NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('mayor', 'menor')),
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE measurements (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric_id INTEGER NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  value DOUBLE PRECISION NOT NULL,
  measured_on DATE NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_measurements_project_metric ON measurements (project_id, metric_id, measured_on);

-- M3. Técnicas de SQA, plan por proyecto y registro de cada ejecución.
CREATE TABLE techniques (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('estatica', 'dinamica', 'proceso')),
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE technique_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technique_id INTEGER NOT NULL REFERENCES techniques(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('por_pr', 'semanal', 'por_checkin', 'mensual')),
  responsible TEXT NOT NULL DEFAULT '',
  UNIQUE (project_id, technique_id)
);

CREATE TABLE technique_executions (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES technique_plans(id) ON DELETE CASCADE,
  executed_on DATE NOT NULL,
  responsible TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('aprobada', 'con_hallazgos', 'rechazada')),
  findings INTEGER NOT NULL DEFAULT 0 CHECK (findings >= 0),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M4. Fotografías del índice de salud (historial de reportes).
CREATE TABLE health_reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  health_index INTEGER NOT NULL,
  summary TEXT NOT NULL
);
