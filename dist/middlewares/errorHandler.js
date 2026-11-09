"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
function errorHandler(error, _req, res, _next) {
    if (error instanceof AppError_1.AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
        });
    }
    if (error instanceof zod_1.ZodError) {
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
