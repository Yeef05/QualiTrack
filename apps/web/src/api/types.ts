// Tipos que devuelve la API (apps/api).
export type Status = 'verde' | 'amarillo' | 'rojo';
export type Role = 'admin' | 'lider_qa' | 'miembro';
export type Direction = 'mayor' | 'menor';
export type Frequency = 'por_pr' | 'semanal' | 'por_checkin' | 'mensual';
export type TechniqueKind = 'estatica' | 'dinamica' | 'proceso';
export type ExecutionResult = 'aprobada' | 'con_hallazgos' | 'rechazada';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  period: string;
  repositoryUrl: string;
  team: string;
  qaLead: string;
  archived: boolean;
  createdAt: string;
}

export interface ProjectSummary extends Project {
  health: { index: number | null; level: Status | null };
  criticalOpen: number | null;
}

export type ProjectInput = Pick<Project, 'name' | 'description' | 'period' | 'repositoryUrl' | 'team' | 'qaLead'>;

export interface Metric {
  id: number;
  code: string;
  name: string;
  unit: string;
  /** Valor peor aceptable (modelo definido). */
  worst: number;
  /** Valor mejor esperado (modelo definido). */
  best: number;
  direction: Direction;
  /** Fórmula. */
  description: string;
  /** Factor y criterio de ISO/IEC 25010. */
  criterion: string;
  /** De dónde salen los valores peor y mejor. */
  source: string;
  active: boolean;
}

export interface Measurement {
  id: number;
  metricId: number;
  value: number;
  measuredOn: string;
  note: string;
  status: Status;
}

export interface MetricStatus {
  metric: Metric;
  latest: { value: number; measuredOn: string } | null;
  status: Status | null;
}

export interface Technique {
  id: number;
  name: string;
  kind: TechniqueKind;
  description: string;
}

export interface PlanItem {
  id: number;
  techniqueId: number;
  techniqueName: string;
  kind: TechniqueKind;
  frequency: Frequency;
  responsible: string;
  lastExecutedOn: string | null;
  executions: number;
  findings: number;
  upToDate: boolean;
}

export interface Execution {
  id: number;
  planId: number;
  techniqueName: string;
  executedOn: string;
  responsible: string;
  result: ExecutionResult;
  findings: number;
  notes: string;
}

export interface Health {
  index: number | null;
  level: Status | null;
  indicators: Record<Status, number>;
  planStatus: Status | null;
  cappedByCritical: boolean;
  metrics: MetricStatus[];
  planCompliance: number | null;
  criticalOpen: number | null;
  metricsInTarget: { met: number; total: number };
}

export interface HealthReport {
  id: number;
  generatedAt: string;
  healthIndex: number;
  summary: string;
}
