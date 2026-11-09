import { ICargo, ICreateCargoDTO } from '../models/Cargo';
import { ICargoRepository } from '../repositories/ICargoRepository';
import { AppError } from '../utils/AppError';

export class CargoService {
  constructor(private cargoRepository: ICargoRepository) {}

  async create(data: ICreateCargoDTO): Promise<ICargo> {
    if (!data.nome || data.nome.trim().length === 0) {
      throw new AppError('O nome do cargo é obrigatório.', 400);
    }

    const trimmedName = data.nome.trim();
    const existingCargo = await this.cargoRepository.findByName(trimmedName);
    if (existingCargo) {
      throw new AppError('Já existe um cargo cadastrado com este nome.', 409);
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

  async listAll(): Promise<ICargo[]> {
    return this.cargoRepository.findAll();
  }

  async findById(idCargo: number): Promise<ICargo> {
    const cargo = await this.cargoRepository.findById(idCargo);
    if (!cargo) {
      throw new AppError('Cargo não encontrado.', 404);
    }
    return cargo;
  }

  async update(idCargo: number, data: Partial<ICreateCargoDTO>): Promise<ICargo> {
    await this.findById(idCargo);

    if (data.nome) {
      const trimmedName = data.nome.trim();
      const existing = await this.cargoRepository.findByName(trimmedName);
      if (existing && existing.idCargo !== idCargo) {
        throw new AppError('Já existe outro cargo com este nome.', 409);
      }
    }

    const updated = await this.cargoRepository.update(idCargo, {
      ...data,
      ...(data.setor && { setor: data.setor.trim().toUpperCase() }),
    });

    return updated;
  }

  async delete(idCargo: number): Promise<void> {
    await this.findById(idCargo);
    await this.cargoRepository.delete(idCargo);
  }
}
