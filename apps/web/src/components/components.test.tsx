import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, setToken } from '../api/client';
import type { Metric } from '../api/types';
import { AuthProvider } from '../auth/AuthContext';
import { ErrorAlert, Field } from './Field';
import { Layout } from './Layout';
import { ProjectForm } from './ProjectForm';
import { HealthBadge, HealthDonut, ProgressBar, StatusDot } from './Status';
import { TrendChart } from './TrendChart';

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: { datasets: { label: string; data: number[] }[] } }) => (
    <div data-testid="line">{data.datasets.map((d) => `${d.label}:${d.data.join(',')}`).join('|')}</div>
  ),
}));

afterEach(() => vi.unstubAllGlobals());

describe('semáforo y salud', () => {
  it('muestra el estado con su etiqueta', () => {
    render(<StatusDot status="amarillo" />);
    expect(screen.getByText('En riesgo')).toBeInTheDocument();
  });

  it('muestra "Sin datos" cuando no hay estado', () => {
    render(<HealthBadge index={null} level={null} />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('muestra el índice de salud', () => {
    render(<HealthBadge index={86} level="verde" />);
    expect(screen.getByText('86/100')).toBeInTheDocument();
  });

  it('limita la barra de progreso entre 0 y 100', () => {
    render(<ProgressBar value={140} label="Plan" />);
    expect(screen.getByRole('progressbar', { name: 'Plan' })).toHaveAttribute('aria-valuenow', '100');
  });

  it('dibuja la dona con el índice', () => {
    render(<HealthDonut index={72} level="amarillo" />);
    expect(screen.getByRole('img', { name: 'Índice de salud 72' })).toBeInTheDocument();
    render(<HealthDonut index={null} level={null} />);
    expect(screen.getByRole('img', { name: 'Índice de salud sin datos' })).toBeInTheDocument();
  });
});

describe('formularios', () => {
  it('Field muestra el error y ErrorAlert no se pinta sin mensaje', () => {
    const { container } = render(<ErrorAlert message={null} />);
    expect(container).toBeEmptyDOMElement();
    render(
      <Field label="Nombre" error="Obligatorio">
        <input />
      </Field>,
    );
    expect(screen.getByText('Obligatorio')).toBeInTheDocument();
  });

  it('ProjectForm envía los valores capturados', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProjectForm initial={{ period: '2026-2' }} submitLabel="Registrar" onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Nombre del proyecto'), 'Proyecto X');
    await userEvent.type(screen.getByLabelText('Equipo'), 'Equipo 1');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    await userEvent.clear(screen.getByLabelText('Historias entregadas'));
    await userEvent.type(screen.getByLabelText('Historias entregadas'), '12');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Proyecto X', period: '2026-2', team: 'Equipo 1', deliveredStories: 12 }),
    );
  });

  it('ProjectForm muestra los errores de validación de la API', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, 'Datos inválidos', [{ path: 'period', message: 'El periodo debe tener el formato AAAA-1 o AAAA-2' }]),
    );
    const onCancel = vi.fn();
    render(<ProjectForm submitLabel="Registrar" onSubmit={onSubmit} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Datos inválidos');
    expect(screen.getByText(/formato AAAA-1/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('gráfica de tendencia', () => {
  const metric: Metric = {
    id: 1,
    code: 'cobertura',
    name: 'Cobertura',
    unit: '%',
    worst: 50,
    best: 70,
    direction: 'mayor',
    description: '',
    criterion: 'Mantenibilidad · facilidad de prueba',
    source: 'Entregable 1',
    active: true,
  };

  it('avisa cuando no hay mediciones', () => {
    render(<TrendChart metric={metric} measurements={[]} />);
    expect(screen.getByText(/Todavía no hay mediciones de Cobertura/)).toBeInTheDocument();
  });

  it('grafica los valores y las líneas de mejor y peor', () => {
    const measurements = [
      { id: 1, metricId: 1, value: 50, measuredOn: '2026-10-01', note: '', status: 'rojo' as const },
      { id: 2, metricId: 1, value: 75, measuredOn: '2026-10-15', note: '', status: 'verde' as const },
    ];
    render(<TrendChart metric={metric} measurements={measurements} />);
    expect(screen.getByTestId('line')).toHaveTextContent('Cobertura:50,75|Mejor:70,70|Peor:50,50');
  });
});

describe('layout', () => {
  it('muestra el usuario de la sesión y permite salir', async () => {
    setToken('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, name: 'Flavio', email: 'f@x.mx', role: 'lider_qa' } }),
      }),
    );
    render(
      <AuthProvider>
        <MemoryRouter>
          <Layout>
            <p>contenido</p>
          </Layout>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByText('Líder QA')).toBeInTheDocument();
    // CU-10: solo el Administrador ve el enlace a la pantalla de usuarios.
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
    await waitFor(() => expect(screen.queryByText('Líder QA')).not.toBeInTheDocument());
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('CU-10: el Administrador ve el enlace a Usuarios', async () => {
    setToken('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, name: 'David', email: 'd@x.mx', role: 'admin' } }),
      }),
    );
    render(
      <AuthProvider>
        <MemoryRouter>
          <Layout>
            <p>contenido</p>
          </Layout>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/usuarios');
  });
});
