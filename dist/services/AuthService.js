"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
class AuthService {
    usuarioRepository;
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async login(email, password) {
        const emailNormalized = email.trim().toLowerCase();
        const usuario = await this.usuarioRepository.findByEmail(emailNormalized);
        if (!usuario) {
            throw new AppError_1.AppError('E-mail ou senha inválidos.', 401);
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, usuario.passwordHash);
        if (!passwordMatch) {
            throw new AppError_1.AppError('E-mail ou senha inválidos.', 401);
        }
        const setor = usuario.cargo?.setor ?? null;
        const permissoes = usuario.cargo?.permissoes ?? null;
        const payload = {
            idUsuario: usuario.idUsuario,
            nome: usuario.nome,
            email: usuario.email,
            gestao: usuario.gestao,
            idCargo: usuario.idCargo,
            setor,
            permissoes,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            subject: String(usuario.idUsuario),
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        return {
            token,
            user: {
                idUsuario: usuario.idUsuario,
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                matricula: usuario.matricula ?? null,
                gestao: usuario.gestao,
                idCargo: usuario.idCargo ?? null,
                setor,
                permissoes,
            },
        };
    }
}
exports.AuthService = AuthService;
