import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function ensureSector(setoresPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado.', 401);
    }

    const { setor, gestao } = req.user;

    // Presidência e TI possuem acesso total irrestrito a qualquer dado
    if (setor === 'PRESIDENCIA' || setor === 'TI') {
      return next();
    }

    if (!gestao || !setor || !setoresPermitidos.includes(setor)) {
      throw new AppError('Acesso negado para o seu cargo/setor atual.', 403);
    }

    return next();
  };
}
