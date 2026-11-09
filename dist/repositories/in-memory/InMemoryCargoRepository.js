"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCargoRepository = void 0;
class InMemoryCargoRepository {
    items = [];
    currentId = 1;
    async create(data) {
        const cargo = {
            idCargo: this.currentId++,
            nome: data.nome,
            setor: data.setor ?? null,
            descricao: data.descricao ?? null,
            permissoes: data.permissoes ?? null,
        };
        this.items.push(cargo);
        return cargo;
    }
    async findById(idCargo) {
        const cargo = this.items.find((item) => item.idCargo === idCargo);
        return cargo ?? null;
    }
    async findByName(nome) {
        const cargo = this.items.find((item) => item.nome.toLowerCase() === nome.toLowerCase());
        return cargo ?? null;
    }
    async findAll() {
        return [...this.items];
    }
    async update(idCargo, data) {
        const index = this.items.findIndex((item) => item.idCargo === idCargo);
        if (index === -1) {
            throw new Error('Cargo não encontrado');
        }
        const current = this.items[index];
        const updated = {
            ...current,
            ...(data.nome && { nome: data.nome }),
            ...(data.setor !== undefined && { setor: data.setor }),
            ...(data.descricao !== undefined && { descricao: data.descricao }),
            ...(data.permissoes !== undefined && { permissoes: data.permissoes }),
        };
        this.items[index] = updated;
        return updated;
    }
    async delete(idCargo) {
        this.items = this.items.filter((item) => item.idCargo !== idCargo);
    }
}
exports.InMemoryCargoRepository = InMemoryCargoRepository;
