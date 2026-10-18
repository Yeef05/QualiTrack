import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../errors';

export const ROLES = ['admin', 'lider_qa', 'miembro'] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export function signToken(user: AuthUser, secret: string): string {
  const payload: TokenPayload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

export function verifyToken(token: string, secret: string): AuthUser {
  const payload = jwt.verify(token, secret) as TokenPayload;
  return { id: Number(payload.sub), name: payload.name, email: payload.email, role: payload.role };
}

/** Exige un token Bearer válido y deja el usuario en res.locals.user. */
export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      next(new HttpError(401, 'Inicia sesión para continuar'));
      return;
    }
    try {
      res.locals.user = verifyToken(token, secret);
      next();
    } catch {
      next(new HttpError(401, 'La sesión expiró o no es válida'));
    }
  };
}

export function currentUser(res: Response): AuthUser {
  return res.locals.user as AuthUser;
}

export function requireRole(...roles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(currentUser(res).role)) {
      next(new HttpError(403, 'Tu rol no tiene permiso para esta acción'));
      return;
    }
    next();
  };
}

/** Roles que pueden configurar proyectos, catálogos y planes. */
export const canManage = requireRole('admin', 'lider_qa');
