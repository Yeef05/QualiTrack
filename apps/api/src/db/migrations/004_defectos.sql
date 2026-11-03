-- CU-11: registro de defectos del proyecto (HU-11, RF-36 a RF-38).
-- Con el registro, QualiTrack calcula solo la densidad, los críticos abiertos, la eficiencia de QA
-- y el tiempo medio de corrección, en lugar de capturarlos a mano como mediciones.

-- Tamaño del proyecto para la densidad: historias entregadas (RF-38, ADR-004).
ALTER TABLE projects ADD COLUMN delivered_stories INTEGER NOT NULL DEFAULT 0 CHECK (delivered_stories >= 0);

CREATE TABLE defects (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critica', 'mayor', 'menor', 'cosmetica')),
  -- Clasificación de tipo de TSP: 10 Documentación … 100 Entorno.
  tsp_type INTEGER NOT NULL CHECK (tsp_type IN (10, 20, 30, 40, 50, 60, 70, 80, 90, 100)),
  -- Quién lo encontró, para la eficiencia de QA (lámina 47): A = equipo, B = cliente en una revisión,
  -- C = usuario después de entregar.
  found_by TEXT NOT NULL CHECK (found_by IN ('equipo', 'cliente', 'usuario')),
  found_on DATE NOT NULL,
  closed_on DATE,
  fix_note TEXT NOT NULL DEFAULT '',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT defects_closed_after_found CHECK (closed_on IS NULL OR closed_on >= found_on)
);

CREATE INDEX idx_defects_project ON defects (project_id, found_on);
