"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCargoRepository = void 0;
const prisma_1 = require("../../config/prisma");
class PrismaCargoRepository {
    async create(data) {
        const cargo = await prisma_1.prisma.cargo.create({
            data: {
                nome: data.nome,
                setor: data.setor ?? null,
                descricao: data.descricao ?? null,
                permissoes: data.permissoes ?? null,
            },
        });
        return cargo;
    }
    async findById(idCargo) {
        const cargo = await prisma_1.prisma.cargo.findUnique({
            where: { idCargo },
        });
        return cargo;
    }
    async findByName(nome) {
        const cargo = await prisma_1.prisma.cargo.findFirst({
            where: { nome: { equals: nome, mode: 'insensitive' } },
        });
        return cargo;
    }
    async findAll() {
        const cargos = await prisma_1.prisma.cargo.findMany({
            orderBy: { nome: 'asc' },
        });
        return cargos;
    }
    async update(idCargo, data) {
        const cargo = await prisma_1.prisma.cargo.update({
            where: { idCargo },
            data: {
                ...(data.nome && { nome: data.nome }),
                ...(data.setor !== undefined && { setor: data.setor }),
                ...(data.descricao !== undefined && { descricao: data.descricao }),
                ...(data.permissoes !== undefined && { permissoes: data.permissoes }),
            },
        });
        return cargo;
    }
    async delete(idCargo) {
        await prisma_1.prisma.cargo.delete({
            where: { idCargo },
        });
    }
}
exports.PrismaCargoRepository = PrismaCargoRepository;
