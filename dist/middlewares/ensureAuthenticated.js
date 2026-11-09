"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
function ensureAuthenticated(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError_1.AppError('Token JWT ausente no cabeçalho Authorization.', 401);
    }
    const [scheme, token] = authHeader.split(' ');
    if (!/^Bearer$/i.test(scheme) || !token) {
        throw new AppError_1.AppError('Formato de token inválido. Esperado: Bearer <token>.', 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
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
    }
    catch (err) {
        throw new AppError_1.AppError('Token JWT inválido ou expirado.', 401);
    }
}
