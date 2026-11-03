import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import type { Project, ProjectInput } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert } from '../components/Field';
import { ProjectForm } from '../components/ProjectForm';
import { canManage } from '../lib/format';
import { useApi } from '../lib/useApi';
import { DefectsTab } from './DefectsTab';
import { MetricsTab } from './MetricsTab';
import { ReportTab } from './ReportTab';
import { TechniquesTab } from './TechniquesTab';

const TABS = [
  ['metricas', 'Métricas'],
  ['tecnicas', 'Técnicas'],
  ['defectos', 'Defectos'],
  ['reporte', 'Reporte'],
] as const;
type Tab = (typeof TABS)[number][0];

function ProjectHeader({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(input: ProjectInput) {
    await api(`/projects/${project.id}`, { method: 'PUT', body: input });
    setEditing(false);
    onChanged();
  }

  async function toggleArchive() {
    try {
      await api(`/projects/${project.id}/archive`, { method: 'POST', body: { archived: !project.archived } });
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <p className="no-print small">
        <Link to="/">← Proyectos</Link>
      </p>
      <div className="page-header">
        <div>
          <h1>
            {project.name} · {project.period} {project.archived && <span className="badge gray">Archivado</span>}
          </h1>
          <div className="muted small">
            {project.team || 'Sin equipo'} · QA: {project.qaLead || 'sin asignar'}
            {project.repositoryUrl && (
              <>
                {' · '}
                <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
                  Repositorio
                </a>
              </>
            )}
          </div>
        </div>
        {canManage(user?.role) && (
          <div className="actions">
            <button className="secondary" onClick={() => setEditing((v) => !v)}>
              Editar
            </button>
            <button className="danger" onClick={toggleArchive}>
              {project.archived ? 'Restaurar' : 'Archivar'}
            </button>
          </div>
        )}
      </div>
      <ErrorAlert message={error} />
      {editing && (
        <div className="card">
          <ProjectForm initial={project} submitLabel="Guardar cambios" onSubmit={save} onCancel={() => setEditing(false)} />
        </div>
      )}
    </>
  );
}

/** Detalle de un proyecto con pestañas para M2 (métricas), M3 (técnicas), defectos (CU-11) y M4 (reporte). */
export function ProjectPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find(([key]) => key === params.get('tab'))?.[0] ?? 'metricas') as Tab;
  const project = useApi<Project>(`/projects/${id}`);

  if (project.error) {
    return <ErrorAlert message={project.error} />;
  }
  if (!project.data) {
    return <div className="empty">Cargando…</div>;
  }
  const projectId = project.data.id;

  return (
    <>
      <ProjectHeader project={project.data} onChanged={project.reload} />
      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setParams({ tab: key })}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'metricas' && <MetricsTab projectId={projectId} archived={project.data.archived} />}
      {tab === 'tecnicas' && <TechniquesTab projectId={projectId} />}
      {tab === 'defectos' && <DefectsTab project={project.data} />}
      {tab === 'reporte' && <ReportTab project={project.data} />}
    </>
  );
}
