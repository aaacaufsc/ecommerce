import { ICargo, ICreateCargoDTO } from '../../models/Cargo';
import { ICargoRepository } from '../ICargoRepository';

export class InMemoryCargoRepository implements ICargoRepository {
  public items: ICargo[] = [];
  private currentId = 1;

  async create(data: ICreateCargoDTO): Promise<ICargo> {
    const cargo: ICargo = {
      idCargo: this.currentId++,
      nome: data.nome,
      setor: data.setor ?? null,
      descricao: data.descricao ?? null,
      permissoes: data.permissoes ?? null,
    };

    this.items.push(cargo);
    return cargo;
  }

  async findById(idCargo: number): Promise<ICargo | null> {
    const cargo = this.items.find((item) => item.idCargo === idCargo);
    return cargo ?? null;
  }

  async findByName(nome: string): Promise<ICargo | null> {
    const cargo = this.items.find((item) => item.nome.toLowerCase() === nome.toLowerCase());
    return cargo ?? null;
  }

  async findAll(): Promise<ICargo[]> {
    return [...this.items];
  }

  async update(idCargo: number, data: Partial<ICreateCargoDTO>): Promise<ICargo> {
    const index = this.items.findIndex((item) => item.idCargo === idCargo);
    if (index === -1) {
      throw new Error('Cargo não encontrado');
    }

    const current = this.items[index];
    const updated: ICargo = {
      ...current,
      ...(data.nome && { nome: data.nome }),
      ...(data.setor !== undefined && { setor: data.setor }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
      ...(data.permissoes !== undefined && { permissoes: data.permissoes }),
    };

    this.items[index] = updated;
    return updated;
  }

  async delete(idCargo: number): Promise<void> {
    this.items = this.items.filter((item) => item.idCargo !== idCargo);
  }
}
