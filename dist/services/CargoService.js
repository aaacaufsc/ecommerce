"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoService = void 0;
const AppError_1 = require("../utils/AppError");
class CargoService {
    cargoRepository;
    constructor(cargoRepository) {
        this.cargoRepository = cargoRepository;
    }
    async create(data) {
        if (!data.nome || data.nome.trim().length === 0) {
            throw new AppError_1.AppError('O nome do cargo é obrigatório.', 400);
        }
        const trimmedName = data.nome.trim();
        const existingCargo = await this.cargoRepository.findByName(trimmedName);
        if (existingCargo) {
            throw new AppError_1.AppError('Já existe um cargo cadastrado com este nome.', 409);
        }
        const setorFormatted = data.setor ? data.setor.trim().toUpperCase() : null;
        const cargo = await this.cargoRepository.create({
            nome: trimmedName,
            setor: setorFormatted,
            descricao: data.descricao?.trim() ?? null,
            permissoes: data.permissoes?.trim() ?? null,
        });
        return cargo;
    }
    async listAll() {
        return this.cargoRepository.findAll();
    }
    async findById(idCargo) {
        const cargo = await this.cargoRepository.findById(idCargo);
        if (!cargo) {
            throw new AppError_1.AppError('Cargo não encontrado.', 404);
        }
        return cargo;
    }
    async update(idCargo, data) {
        await this.findById(idCargo);
        if (data.nome) {
            const trimmedName = data.nome.trim();
            const existing = await this.cargoRepository.findByName(trimmedName);
            if (existing && existing.idCargo !== idCargo) {
                throw new AppError_1.AppError('Já existe outro cargo com este nome.', 409);
            }
        }
        const updated = await this.cargoRepository.update(idCargo, {
            ...data,
            ...(data.setor && { setor: data.setor.trim().toUpperCase() }),
        });
        return updated;
    }
    async delete(idCargo) {
        await this.findById(idCargo);
        await this.cargoRepository.delete(idCargo);
    }
}
exports.CargoService = CargoService;
