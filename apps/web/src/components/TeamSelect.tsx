import type { TeamMember } from '../api/types';
import { useApi } from '../lib/useApi';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  /** Texto de la opción vacía; sin él, hay que elegir a alguien. */
  emptyLabel?: string;
}

/**
 * Lista de usuarios para elegir a un responsable (DEF-007 y DEF-008).
 * Antes eran campos de texto libre y la misma persona aparecía escrita de varias formas.
 */
export function TeamSelect({ value, onChange, emptyLabel }: Props) {
  const team = useApi<TeamMember[]>('/team');
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      {(emptyLabel !== undefined || value === null) && <option value="">{emptyLabel ?? 'Elige a una persona'}</option>}
      {(team.data ?? []).map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  );
}
