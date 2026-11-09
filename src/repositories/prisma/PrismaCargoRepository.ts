import { prisma } from '../../config/prisma';
import { ICargo, ICreateCargoDTO } from '../../models/Cargo';
import { ICargoRepository } from '../ICargoRepository';

export class PrismaCargoRepository implements ICargoRepository {
  async create(data: ICreateCargoDTO): Promise<ICargo> {
    const cargo = await prisma.cargo.create({
      data: {
        nome: data.nome,
        setor: data.setor ?? null,
        descricao: data.descricao ?? null,
        permissoes: data.permissoes ?? null,
      },
    });

    return cargo;
  }

  async findById(idCargo: number): Promise<ICargo | null> {
    const cargo = await prisma.cargo.findUnique({
      where: { idCargo },
    });

    return cargo;
  }

  async findByName(nome: string): Promise<ICargo | null> {
    const cargo = await prisma.cargo.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } },
    });

    return cargo;
  }

  async findAll(): Promise<ICargo[]> {
    const cargos = await prisma.cargo.findMany({
      orderBy: { nome: 'asc' },
    });

    return cargos;
  }

  async update(idCargo: number, data: Partial<ICreateCargoDTO>): Promise<ICargo> {
    const cargo = await prisma.cargo.update({
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

  async delete(idCargo: number): Promise<void> {
    await prisma.cargo.delete({
      where: { idCargo },
    });
  }
}
