import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Measurement, Metric } from '../api/types';
import { formatDate } from '../lib/format';
import { useTheme, type Theme } from '../lib/theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
ChartJS.defaults.font.family = "Inter, 'Segoe UI', system-ui, sans-serif";

/** Colores de la gráfica por tema (los mismos tonos que las variables de styles.css). */
export const CHART_COLORS: Record<Theme, { value: string; best: string; worst: string; text: string; grid: string }> = {
  light: { value: '#2f5bea', best: '#16a34a', worst: '#dc2626', text: '#5d6879', grid: '#e8ecf2' },
  dark: { value: '#6c8cff', best: '#34c77b', worst: '#f26b61', text: '#95a1b3', grid: '#252e3b' },
};

/** Tendencia de una métrica con las líneas punteadas de sus valores mejor y peor (wireframe 2). */
export function TrendChart({ metric, measurements }: { metric: Metric; measurements: Measurement[] }) {
  const [theme] = useTheme();
  if (measurements.length === 0) {
    return <div className="empty">Todavía no hay mediciones de {metric.name}.</div>;
  }
  const colors = CHART_COLORS[theme];
  const labels = measurements.map((m) => formatDate(m.measuredOn));
  const data = {
    labels,
    datasets: [
      {
        label: metric.name,
        data: measurements.map((m) => m.value),
        borderColor: colors.value,
        backgroundColor: colors.value,
        borderWidth: 2.5,
        pointRadius: 3.5,
        tension: 0.3,
      },
      {
        label: 'Mejor',
        data: measurements.map(() => metric.best),
        borderColor: colors.best,
        borderDash: [6, 6],
        pointRadius: 0,
      },
      {
        label: 'Peor',
        data: measurements.map(() => metric.worst),
        borderColor: colors.worst,
        borderDash: [2, 4],
        pointRadius: 0,
      },
    ],
  };
  return (
    <div style={{ height: 260 }}>
      <Line data={data} options={chartOptions(colors)} />
    </div>
  );
}

function chartOptions(colors: (typeof CHART_COLORS)[Theme]) {
  const axis = { ticks: { color: colors.text }, grid: { color: colors.grid }, border: { color: colors.grid } };
  return {
    maintainAspectRatio: false,
    scales: { x: axis, y: axis },
    plugins: { legend: { position: 'bottom' as const, labels: { color: colors.text, usePointStyle: true } } },
  };
}
