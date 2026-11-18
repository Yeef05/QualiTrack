-- DEF-007 y DEF-008: el responsable de QA del proyecto y el de cada ejecución se eligen de la lista de usuarios.
-- Las columnas de texto se conservan con el nombre del usuario elegido, para no perder el historial anterior.
ALTER TABLE projects ADD COLUMN qa_lead_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE technique_executions ADD COLUMN responsible_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Bases anteriores: se liga el texto que coincide con el nombre de un usuario; lo demás queda solo como texto.
UPDATE projects p SET qa_lead_id = u.id FROM users u WHERE lower(trim(p.qa_lead)) = lower(u.name);
UPDATE technique_executions e SET responsible_id = u.id FROM users u WHERE lower(trim(e.responsible)) = lower(u.name);
