import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      message: 'Erro de validação nos campos informados',
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  console.error('[ERRO INTERNO NÃO TRATADO]:', error);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
