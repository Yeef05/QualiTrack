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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/** Tendencia de una métrica con su línea de meta punteada (wireframe 2). */
export function TrendChart({ metric, measurements }: { metric: Metric; measurements: Measurement[] }) {
  if (measurements.length === 0) {
    return <div className="empty">Todavía no hay mediciones de {metric.name}.</div>;
  }
  const labels = measurements.map((m) => formatDate(m.measuredOn));
  const data = {
    labels,
    datasets: [
      {
        label: metric.name,
        data: measurements.map((m) => m.value),
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.25,
      },
      {
        label: 'Meta',
        data: measurements.map(() => metric.target),
        borderColor: '#9aa4b2',
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };
  return (
    <div style={{ height: 260 }}>
      <Line data={data} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
    </div>
  );
}
