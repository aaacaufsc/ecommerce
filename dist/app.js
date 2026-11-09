"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Endpoint de saúde do sistema
exports.app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        organization: 'AAACA - UFSC Araranguá',
    });
});
// Prefixo global de rotas da API v1
exports.app.use('/api/v1', routes_1.routes);
// Middleware global de tratamento de erros
exports.app.use(errorHandler_1.errorHandler);
