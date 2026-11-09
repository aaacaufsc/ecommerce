"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUsuarioRepository = void 0;
class InMemoryUsuarioRepository {
    cargoRepository;
    items = [];
    currentId = 1;
    constructor(cargoRepository) {
        this.cargoRepository = cargoRepository;
    }
    async create(data) {
        let cargo = null;
        if (data.idCargo && this.cargoRepository) {
            cargo = await this.cargoRepository.findById(data.idCargo);
        }
        const usuario = {
            idUsuario: this.currentId++,
            idCargo: data.idCargo ?? null,
            nome: data.nome,
            email: data.email,
            cpf: data.cpf,
            matricula: data.matricula ?? null,
            endereco: data.endereco ?? null,
            telefone: data.telefone ?? null,
            curso: data.curso ?? null,
            dtNascimento: data.dtNascimento ? new Date(data.dtNascimento) : null,
            gestao: data.gestao ?? false,
            passwordHash: data.passwordHash,
            cargo,
        };
        this.items.push(usuario);
        return usuario;
    }
    async findById(idUsuario) {
        const usuario = this.items.find((item) => item.idUsuario === idUsuario);
        if (usuario && usuario.idCargo && this.cargoRepository && !usuario.cargo) {
            usuario.cargo = await this.cargoRepository.findById(usuario.idCargo);
        }
        return usuario ?? null;
    }
    async findByEmail(email) {
        const usuario = this.items.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (usuario && usuario.idCargo && this.cargoRepository && !usuario.cargo) {
            usuario.cargo = await this.cargoRepository.findById(usuario.idCargo);
        }
        return usuario ?? null;
    }
    async findByCpf(cpf) {
        const usuario = this.items.find((item) => item.cpf === cpf);
        if (usuario && usuario.idCargo && this.cargoRepository && !usuario.cargo) {
            usuario.cargo = await this.cargoRepository.findById(usuario.idCargo);
        }
        return usuario ?? null;
    }
    async findByMatricula(matricula) {
        const usuario = this.items.find((item) => item.matricula === matricula);
        if (usuario && usuario.idCargo && this.cargoRepository && !usuario.cargo) {
            usuario.cargo = await this.cargoRepository.findById(usuario.idCargo);
        }
        return usuario ?? null;
    }
    async findWithFilters(filters) {
        return this.items.filter((item) => {
            if (filters.gestao !== undefined && item.gestao !== filters.gestao) {
                return false;
            }
            if (filters.idCargo !== undefined && item.idCargo !== filters.idCargo) {
                return false;
            }
            if (filters.curso && item.curso && !item.curso.toLowerCase().includes(filters.curso.toLowerCase())) {
                return false;
            }
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                const matchesName = item.nome.toLowerCase().includes(term);
                const matchesEmail = item.email.toLowerCase().includes(term);
                const matchesMatricula = item.matricula ? item.matricula.toLowerCase().includes(term) : false;
                if (!matchesName && !matchesEmail && !matchesMatricula) {
                    return false;
                }
            }
            return true;
        });
    }
    async updateCargo(idUsuario, idCargo, gestao) {
        const index = this.items.findIndex((item) => item.idUsuario === idUsuario);
        if (index === -1) {
            throw new Error('Usuário não encontrado');
        }
        let cargo = null;
        if (idCargo && this.cargoRepository) {
            cargo = await this.cargoRepository.findById(idCargo);
        }
        const current = this.items[index];
        const updated = {
            ...current,
            idCargo,
            gestao,
            cargo,
        };
        this.items[index] = updated;
        return updated;
    }
    async update(idUsuario, data) {
        const index = this.items.findIndex((item) => item.idUsuario === idUsuario);
        if (index === -1) {
            throw new Error('Usuário não encontrado');
        }
        const current = this.items[index];
        const updated = {
            ...current,
            ...data,
        };
        this.items[index] = updated;
        return updated;
    }
    async delete(idUsuario) {
        this.items = this.items.filter((item) => item.idUsuario !== idUsuario);
    }
}
exports.InMemoryUsuarioRepository = InMemoryUsuarioRepository;
