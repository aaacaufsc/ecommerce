import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface ITokenPayload {
  sub: string;
  idUsuario: number;
  nome: string;
  email: string;
  gestao: boolean;
  idCargo: number | null;
  setor: string | null;
  permissoes: string | null;
}

export function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token JWT ausente no cabeçalho Authorization.', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme) || !token) {
    throw new AppError('Formato de token inválido. Esperado: Bearer <token>.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as ITokenPayload;

    req.user = {
      idUsuario: decoded.idUsuario,
      nome: decoded.nome,
      email: decoded.email,
      gestao: decoded.gestao,
      idCargo: decoded.idCargo,
      setor: decoded.setor,
      permissoes: decoded.permissoes,
    };

    return next();
  } catch (err) {
    throw new AppError('Token JWT inválido ou expirado.', 401);
  }
}
