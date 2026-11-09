import bcrypt from 'bcryptjs';
import { IUsuario, ICreateUsuarioDTO, IUsuarioFilters } from '../models/Usuario';
import { IUsuarioRepository } from '../repositories/IUsuarioRepository';
import { ICargoRepository } from '../repositories/ICargoRepository';
import { AppError } from '../utils/AppError';

export class UsuarioService {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private cargoRepository?: ICargoRepository
  ) {}

  private cleanDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  async register(data: ICreateUsuarioDTO): Promise<Omit<IUsuario, 'passwordHash'>> {
    const emailNormalized = data.email.trim().toLowerCase();
    const cpfCleaned = this.cleanDigits(data.cpf);

    if (cpfCleaned.length !== 11) {
      throw new AppError('O CPF deve conter exatamente 11 dígitos numéricos.', 400);
    }

    if (data.password.length < 8) {
      throw new AppError('A senha deve ter no mínimo 8 caracteres.', 400);
    }

    // Valida e-mail duplicado
    const existingEmail = await this.usuarioRepository.findByEmail(emailNormalized);
    if (existingEmail) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail.', 409);
    }

    // Valida CPF duplicado
    const existingCpf = await this.usuarioRepository.findByCpf(cpfCleaned);
    if (existingCpf) {
      throw new AppError('Já existe um usuário cadastrado com este CPF.', 409);
    }

    // Valida Matrícula duplicada
    if (data.matricula) {
      const matriculaTrimmed = data.matricula.trim();
      const existingMatricula = await this.usuarioRepository.findByMatricula(matriculaTrimmed);
      if (existingMatricula) {
        throw new AppError('Já existe um usuário cadastrado com esta matrícula.', 409);
      }
    }

    // Hash seguro com bcrypt (salt 10)
    const passwordHash = await bcrypt.hash(data.password, 10);

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

  async findById(idUsuario: number): Promise<Omit<IUsuario, 'passwordHash'>> {
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    const { passwordHash: _, ...usuarioSafe } = usuario;
    return usuarioSafe;
  }

  async listWithFilters(filters: IUsuarioFilters): Promise<Array<Omit<IUsuario, 'passwordHash'>>> {
    const usuarios = await this.usuarioRepository.findWithFilters(filters);
    return usuarios.map(({ passwordHash: _, ...u }) => u);
  }

  async atribuirCargo(idUsuario: number, idCargo: number | null): Promise<Omit<IUsuario, 'passwordHash'>> {
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    let gestao = false;
    if (idCargo !== null) {
      if (this.cargoRepository) {
        const cargo = await this.cargoRepository.findById(idCargo);
        if (!cargo) {
          throw new AppError('O cargo informado não existe.', 404);
        }
      }
      gestao = true;
    }

    const updated = await this.usuarioRepository.updateCargo(idUsuario, idCargo, gestao);
    const { passwordHash: _, ...usuarioSafe } = updated;
    return usuarioSafe;
  }
}
