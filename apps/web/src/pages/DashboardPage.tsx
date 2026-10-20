import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Project, ProjectInput, ProjectSummary } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorAlert } from '../components/Field';
import { ProjectForm } from '../components/ProjectForm';
import { HealthBadge } from '../components/Status';
import { average, canManage, projectsQuery, sum } from '../lib/format';
import { useApi } from '../lib/useApi';

function Kpis({ projects }: { projects: ProjectSummary[] }) {
  const health = average(projects.map((p) => p.health.index));
  const critical = sum(projects.map((p) => p.criticalOpen));
  return (
    <div className="grid grid-3">
      <div className="card kpi">
        <div className="label">Proyectos</div>
        <div className="value">{projects.length}</div>
      </div>
      <div className="card kpi">
        <div className="label">Salud promedio</div>
        <div className="value">{health === null ? '—' : `${health}/100`}</div>
      </div>
      <div className="card kpi">
        <div className="label">Defectos críticos abiertos</div>
        <div className="value">{critical ?? '—'}</div>
      </div>
    </div>
  );
}

function ProjectsTable({ projects, loading }: { projects: ProjectSummary[]; loading: boolean }) {
  if (loading) {
    return <div className="empty">Cargando…</div>;
  }
  if (projects.length === 0) {
    return <div className="empty">No hay proyectos registrados en este periodo.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Equipo</th>
            <th>Responsable QA</th>
            <th>Salud</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/proyectos/${p.id}`}>{p.name}</Link>
                {p.archived && <span className="badge gray"> Archivado</span>}
              </td>
              <td>{p.team || '—'}</td>
              <td>{p.qaLead || '—'}</td>
              <td>
                <HealthBadge index={p.health.index} level={p.health.level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ToolbarProps {
  periods: string[];
  period: string | null;
  onPeriod: (period: string) => void;
  showArchived: boolean;
  onShowArchived: (value: boolean) => void;
  onCreate?: () => void;
}

function Toolbar({ periods, period, onPeriod, showArchived, onShowArchived, onCreate }: ToolbarProps) {
  return (
    <div className="actions">
      <select aria-label="Periodo" value={period ?? ''} onChange={(e) => onPeriod(e.target.value)}>
        {periods.map((p) => (
          <option key={p} value={p}>
            Periodo {p}
          </option>
        ))}
      </select>
      <label className="small">
        <input type="checkbox" checked={showArchived} onChange={(e) => onShowArchived(e.target.checked)} /> Ver
        archivados
      </label>
      {onCreate && <button onClick={onCreate}>+ Nuevo proyecto</button>}
    </div>
  );
}

function useDashboard() {
  const periods = useApi<string[]>('/projects/periods');
  const [selected, setSelected] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const period = selected ?? periods.data?.[0] ?? null;
  const projects = useApi<ProjectSummary[]>(periods.loading ? null : projectsQuery(period, showArchived));
  return { periods, period, setSelected, showArchived, setShowArchived, projects };
}

/** Wireframe 1: dashboard de proyectos del periodo (M1 y M4). */
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const d = useDashboard();
  const [creating, setCreating] = useState(false);
  const allowCreate = canManage(user?.role) && !creating;

  async function create(input: ProjectInput) {
    const project = await api<Project>('/projects', { method: 'POST', body: input });
    navigate(`/proyectos/${project.id}`);
  }

  return (
    <>
      <div className="page-header">
        <h1>Proyectos</h1>
        <Toolbar
          periods={d.periods.data ?? []}
          period={d.period}
          onPeriod={d.setSelected}
          showArchived={d.showArchived}
          onShowArchived={d.setShowArchived}
          onCreate={allowCreate ? () => setCreating(true) : undefined}
        />
      </div>

      {creating && (
        <div className="card">
          <h2>Nuevo proyecto</h2>
          <ProjectForm
            initial={{ period: d.period ?? '' }}
            submitLabel="Registrar proyecto"
            onSubmit={create}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <ErrorAlert message={d.projects.error ?? d.periods.error} />
      <Kpis projects={d.projects.data ?? []} />
      <div className="card">
        <ProjectsTable projects={d.projects.data ?? []} loading={d.projects.loading} />
      </div>
    </>
  );
}
