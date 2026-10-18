import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db';
import { HttpError } from '../errors';
import { ROLES, currentUser, requireAuth, requireRole, signToken, type AuthUser, type Role } from './auth';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  password_hash: string;
}

const loginInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const userInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(ROLES),
});

const toUser = (r: UserRow): AuthUser => ({ id: r.id, name: r.name, email: r.email, role: r.role });

export function authRouter(db: Db, secret: string): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = loginInput.parse(req.body);
    const { rows } = await db.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    const row = rows[0];
    const ok = row ? await bcrypt.compare(password, row.password_hash) : false;
    if (!row || !ok) {
      throw new HttpError(401, 'Correo o contraseña incorrectos');
    }
    const user = toUser(row);
    res.json({ token: signToken(user, secret), user });
  });

  router.get('/me', requireAuth(secret), (_req, res) => {
    res.json({ user: currentUser(res) });
  });

  return router;
}

export function usersRouter(db: Db): Router {
  const router = Router();
  router.use(requireRole('admin'));

  router.get('/', async (_req, res) => {
    const { rows } = await db.query<UserRow>('SELECT * FROM users ORDER BY name');
    res.json(rows.map(toUser));
  });

  router.post('/', async (req, res) => {
    const input = userInput.parse(req.body);
    const hash = await bcrypt.hash(input.password, 10);
    const { rows } = await db.query<UserRow>(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [input.name, input.email, hash, input.role],
    );
    res.status(201).json(toUser(rows[0]));
  });

  return router;
}
