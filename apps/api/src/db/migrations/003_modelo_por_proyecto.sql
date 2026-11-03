-- CU-03: cada proyecto guarda su propio modelo de calidad (RF-10, RF-11, RF-14).
-- Una fila aquí sobrescribe, solo para ese proyecto, si la métrica está activa y sus valores peor y mejor.
-- Sin fila, el proyecto usa los valores del catálogo. La dirección (mayor o menor es mejor) es de la métrica.
CREATE TABLE project_metrics (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric_id INTEGER NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  worst DOUBLE PRECISION NOT NULL,
  best DOUBLE PRECISION NOT NULL,
  active BOOLEAN NOT NULL,
  PRIMARY KEY (project_id, metric_id)
);
