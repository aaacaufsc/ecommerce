import { prisma } from '../../config/prisma';
import { IUsuario, ICreateUsuarioDTO, IUsuarioFilters } from '../../models/Usuario';
import { IUsuarioRepository } from '../IUsuarioRepository';

export class PrismaUsuarioRepository implements IUsuarioRepository {
  async create(data: Omit<ICreateUsuarioDTO, 'password'> & { passwordHash: string }): Promise<IUsuario> {
    const usuario = await prisma.usuario.create({
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

  async findById(idUsuario: number): Promise<IUsuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario },
      include: { cargo: true },
    });
    return usuario;
  }

  async findByEmail(email: string): Promise<IUsuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { cargo: true },
    });
    return usuario;
  }

  async findByCpf(cpf: string): Promise<IUsuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: { cargo: true },
    });
    return usuario;
  }

  async findByMatricula(matricula: string): Promise<IUsuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { matricula },
      include: { cargo: true },
    });
    return usuario;
  }

  async findWithFilters(filters: IUsuarioFilters): Promise<IUsuario[]> {
    const whereClause: any = {};

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

    const usuarios = await prisma.usuario.findMany({
      where: whereClause,
      include: { cargo: true },
      orderBy: { nome: 'asc' },
    });

    return usuarios;
  }

  async updateCargo(idUsuario: number, idCargo: number | null, gestao: boolean): Promise<IUsuario> {
    const usuario = await prisma.usuario.update({
      where: { idUsuario },
      data: {
        idCargo,
        gestao,
      },
      include: { cargo: true },
    });
    return usuario;
  }

  async update(idUsuario: number, data: Partial<IUsuario>): Promise<IUsuario> {
    const usuario = await prisma.usuario.update({
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

  async delete(idUsuario: number): Promise<void> {
    await prisma.usuario.delete({
      where: { idUsuario },
    });
  }
}
