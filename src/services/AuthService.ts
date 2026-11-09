import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUsuario } from '../models/Usuario';
import { IUsuarioRepository } from '../repositories/IUsuarioRepository';
import { AppError } from '../utils/AppError';

export interface ILoginResponse {
  token: string;
  user: {
    idUsuario: number;
    nome: string;
    email: string;
    cpf: string;
    matricula: string | null;
    gestao: boolean;
    idCargo: number | null;
    setor: string | null;
    permissoes: string | null;
  };
}

export class AuthService {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async login(email: string, password: string): Promise<ILoginResponse> {
    const emailNormalized = email.trim().toLowerCase();
    const usuario = await this.usuarioRepository.findByEmail(emailNormalized);

    if (!usuario) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordMatch) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const setor = usuario.cargo?.setor ?? null;
    const permissoes = usuario.cargo?.permissoes ?? null;

    const payload = {
      idUsuario: usuario.idUsuario,
      nome: usuario.nome,
      email: usuario.email,
      gestao: usuario.gestao,
      idCargo: usuario.idCargo,
      setor,
      permissoes,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      subject: String(usuario.idUsuario),
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        matricula: usuario.matricula ?? null,
        gestao: usuario.gestao,
        idCargo: usuario.idCargo ?? null,
        setor,
        permissoes,
      },
    };
  }
}
