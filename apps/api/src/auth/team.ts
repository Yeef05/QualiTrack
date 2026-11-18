import { ZodError } from 'zod';
import type { Db } from '../db';

export interface TeamMember {
  id: number;
  name: string;
}

/** Usuarios que se pueden elegir como responsables (DEF-007 y DEF-008). Solo nombre e id, sin correo ni rol. */
export async function listTeam(db: Db): Promise<TeamMember[]> {
  const { rows } = await db.query<TeamMember>('SELECT id, name FROM users ORDER BY name');
  return rows;
}

/** Nombre del usuario elegido en un campo; si no existe, el error sale junto a ese campo del formulario. */
export async function memberName(db: Db, id: number, field: string): Promise<string> {
  const { rows } = await db.query<{ name: string }>('SELECT name FROM users WHERE id = $1', [id]);
  if (!rows[0]) {
    throw new ZodError([{ code: 'custom', path: [field], message: 'Elige a una persona de la lista de usuarios' }]);
  }
  return rows[0].name;
}
