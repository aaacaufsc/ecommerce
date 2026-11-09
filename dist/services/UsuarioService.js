"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = require("../utils/AppError");
class UsuarioService {
    usuarioRepository;
    cargoRepository;
    constructor(usuarioRepository, cargoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.cargoRepository = cargoRepository;
    }
    cleanDigits(value) {
        return value.replace(/\D/g, '');
    }
    async register(data) {
        const emailNormalized = data.email.trim().toLowerCase();
        const cpfCleaned = this.cleanDigits(data.cpf);
        if (cpfCleaned.length !== 11) {
            throw new AppError_1.AppError('O CPF deve conter exatamente 11 dígitos numéricos.', 400);
        }
        if (data.password.length < 8) {
            throw new AppError_1.AppError('A senha deve ter no mínimo 8 caracteres.', 400);
        }
        // Valida e-mail duplicado
        const existingEmail = await this.usuarioRepository.findByEmail(emailNormalized);
        if (existingEmail) {
            throw new AppError_1.AppError('Já existe um usuário cadastrado com este e-mail.', 409);
        }
        // Valida CPF duplicado
        const existingCpf = await this.usuarioRepository.findByCpf(cpfCleaned);
        if (existingCpf) {
            throw new AppError_1.AppError('Já existe um usuário cadastrado com este CPF.', 409);
        }
        // Valida Matrícula duplicada
        if (data.matricula) {
            const matriculaTrimmed = data.matricula.trim();
            const existingMatricula = await this.usuarioRepository.findByMatricula(matriculaTrimmed);
            if (existingMatricula) {
                throw new AppError_1.AppError('Já existe um usuário cadastrado com esta matrícula.', 409);
            }
        }
        // Hash seguro com bcrypt (salt 10)
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const usuario = await this.usuarioRepository.create({
            nome: data.nome.trim(),
            email: emailNormalized,
            cpf: cpfCleaned,
            passwordHash,
            matricula: data.matricula?.trim() ?? null,
            endereco: data.endereco?.trim() ?? null,
            telefone: data.telefone?.trim() ?? null,
            curso: data.curso?.trim() ?? null,
            dtNascimento: data.dtNascimento ?? null,
            idCargo: null,
            gestao: false,
        });
        const { passwordHash: _, ...usuarioSafe } = usuario;
        return usuarioSafe;
    }
    async findById(idUsuario) {
        const usuario = await this.usuarioRepository.findById(idUsuario);
        if (!usuario) {
            throw new AppError_1.AppError('Usuário não encontrado.', 404);
        }
        const { passwordHash: _, ...usuarioSafe } = usuario;
        return usuarioSafe;
    }
    async listWithFilters(filters) {
        const usuarios = await this.usuarioRepository.findWithFilters(filters);
        return usuarios.map(({ passwordHash: _, ...u }) => u);
    }
    async atribuirCargo(idUsuario, idCargo) {
        const usuario = await this.usuarioRepository.findById(idUsuario);
        if (!usuario) {
            throw new AppError_1.AppError('Usuário não encontrado.', 404);
        }
        let gestao = false;
        if (idCargo !== null) {
            if (this.cargoRepository) {
                const cargo = await this.cargoRepository.findById(idCargo);
                if (!cargo) {
                    throw new AppError_1.AppError('O cargo informado não existe.', 404);
                }
            }
            gestao = true;
        }
        const updated = await this.usuarioRepository.updateCargo(idUsuario, idCargo, gestao);
        const { passwordHash: _, ...usuarioSafe } = updated;
        return usuarioSafe;
    }
}
exports.UsuarioService = UsuarioService;
