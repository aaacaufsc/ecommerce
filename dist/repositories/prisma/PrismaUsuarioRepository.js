"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUsuarioRepository = void 0;
const prisma_1 = require("../../config/prisma");
class PrismaUsuarioRepository {
    async create(data) {
        const usuario = await prisma_1.prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                cpf: data.cpf,
                passwordHash: data.passwordHash,
                matricula: data.matricula ?? null,
                endereco: data.endereco ?? null,
                telefone: data.telefone ?? null,
                curso: data.curso ?? null,
                dtNascimento: data.dtNascimento ? new Date(data.dtNascimento) : null,
                idCargo: data.idCargo ?? null,
                gestao: data.gestao ?? false,
            },
            include: {
                cargo: true,
            },
        });
        return usuario;
    }
    async findById(idUsuario) {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { idUsuario },
            include: { cargo: true },
        });
        return usuario;
    }
    async findByEmail(email) {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { email },
            include: { cargo: true },
        });
        return usuario;
    }
    async findByCpf(cpf) {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { cpf },
            include: { cargo: true },
        });
        return usuario;
    }
    async findByMatricula(matricula) {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { matricula },
            include: { cargo: true },
        });
        return usuario;
    }
    async findWithFilters(filters) {
        const whereClause = {};
        if (filters.gestao !== undefined) {
            whereClause.gestao = filters.gestao;
        }
        if (filters.idCargo !== undefined) {
            whereClause.idCargo = filters.idCargo;
        }
        if (filters.curso) {
            whereClause.curso = { contains: filters.curso, mode: 'insensitive' };
        }
        if (filters.searchTerm) {
            whereClause.OR = [
                { nome: { contains: filters.searchTerm, mode: 'insensitive' } },
                { email: { contains: filters.searchTerm, mode: 'insensitive' } },
                { matricula: { contains: filters.searchTerm, mode: 'insensitive' } },
            ];
        }
        const usuarios = await prisma_1.prisma.usuario.findMany({
            where: whereClause,
            include: { cargo: true },
            orderBy: { nome: 'asc' },
        });
        return usuarios;
    }
    async updateCargo(idUsuario, idCargo, gestao) {
        const usuario = await prisma_1.prisma.usuario.update({
            where: { idUsuario },
            data: {
                idCargo,
                gestao,
            },
            include: { cargo: true },
        });
        return usuario;
    }
    async update(idUsuario, data) {
        const usuario = await prisma_1.prisma.usuario.update({
            where: { idUsuario },
            data: {
                ...(data.nome && { nome: data.nome }),
                ...(data.telefone !== undefined && { telefone: data.telefone }),
                ...(data.endereco !== undefined && { endereco: data.endereco }),
                ...(data.curso !== undefined && { curso: data.curso }),
            },
            include: { cargo: true },
        });
        return usuario;
    }
    async delete(idUsuario) {
        await prisma_1.prisma.usuario.delete({
            where: { idUsuario },
        });
    }
}
exports.PrismaUsuarioRepository = PrismaUsuarioRepository;
