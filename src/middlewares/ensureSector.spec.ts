import { Request, Response, NextFunction } from 'express';
import { ensureSector } from './ensureSector';
import { AppError } from '../utils/AppError';

describe('ensureSector Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('deve permitir acesso total para o setor TI (Superadmin)', () => {
    mockRequest = {
      user: {
        idUsuario: 1,
        nome: 'Admin',
        email: 'admin@ufsc.br',
        gestao: true,
        idCargo: 1,
        setor: 'TI',
        permissoes: 'ALL',
      },
    };

    const middleware = ensureSector(['FINANCEIRO']); // Rota de financeiro
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('deve permitir acesso total para o setor PRESIDENCIA', () => {
    mockRequest = {
      user: {
        idUsuario: 2,
        nome: 'Presidente',
        email: 'pres@ufsc.br',
        gestao: true,
        idCargo: 2,
        setor: 'PRESIDENCIA',
        permissoes: 'ALL',
      },
    };

    const middleware = ensureSector(['COMERCIAL_PRODUTO']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('deve permitir acesso para o setor explicitamente autorizado', () => {
    mockRequest = {
      user: {
        idUsuario: 3,
        nome: 'Diretor Financeiro',
        email: 'fin@ufsc.br',
        gestao: true,
        idCargo: 3,
        setor: 'FINANCEIRO',
        permissoes: 'FINANCE_READ',
      },
    };

    const middleware = ensureSector(['FINANCEIRO', 'TI']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('deve bloquear com 403 usuário de setor diferente do autorizado', () => {
    mockRequest = {
      user: {
        idUsuario: 4,
        nome: 'Diretor de Esportes',
        email: 'esporte@ufsc.br',
        gestao: true,
        idCargo: 4,
        setor: 'ESPORTES',
        permissoes: 'SPORT_WRITE',
      },
    };

    const middleware = ensureSector(['FINANCEIRO']); // Esportes tentando acessar financeiro

    expect(() => {
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow(AppError);

    try {
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    } catch (err: any) {
      expect(err.statusCode).toBe(403);
    }
  });

  it('deve bloquear com 401 se o usuário não estiver autenticado', () => {
    mockRequest = {};

    const middleware = ensureSector(['ESPORTES']);

    expect(() => {
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow(AppError);

    try {
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });
});
