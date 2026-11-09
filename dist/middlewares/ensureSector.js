"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSector = ensureSector;
const AppError_1 = require("../utils/AppError");
function ensureSector(setoresPermitidos) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError_1.AppError('Usuário não autenticado.', 401);
        }
        const { setor, gestao } = req.user;
        // Presidência e TI possuem acesso total irrestrito a qualquer dado
        if (setor === 'PRESIDENCIA' || setor === 'TI') {
            return next();
        }
        if (!gestao || !setor || !setoresPermitidos.includes(setor)) {
            throw new AppError_1.AppError('Acesso negado para o seu cargo/setor atual.', 403);
        }
        return next();
    };
}
