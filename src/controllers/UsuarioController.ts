import { Request, Response } from 'express';
import { z } from 'zod';
import { UsuarioService } from '../services/UsuarioService';

const registerUsuarioSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail em formato inválido'),
  cpf: z.string().min(11, 'CPF deve ter no mínimo 11 dígitos'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  matricula: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  curso: z.string().optional(),
  dtNascimento: z.string().optional(),
});

const atribuirCargoSchema = z.object({
  idCargo: z.number().nullable(),
});

export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    const data = registerUsuarioSchema.parse(req.body);
    const usuario = await this.usuarioService.register(data);
    return res.status(201).json(usuario);
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    const idUsuario = Number(req.params.idUsuario);
    const usuario = await this.usuarioService.findById(idUsuario);
    return res.status(200).json(usuario);
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    const usuario = await this.usuarioService.findById(req.user.idUsuario);
    return res.status(200).json(usuario);
  };

  listWithFilters = async (req: Request, res: Response): Promise<Response> => {
    const { searchTerm, gestao, idCargo, curso } = req.query;

    const filters = {
      searchTerm: typeof searchTerm === 'string' ? searchTerm : undefined,
      gestao: gestao !== undefined ? gestao === 'true' : undefined,
      idCargo: idCargo ? Number(idCargo) : undefined,
      curso: typeof curso === 'string' ? curso : undefined,
    };

    const usuarios = await this.usuarioService.listWithFilters(filters);
    return res.status(200).json(usuarios);
  };

  atribuirCargo = async (req: Request, res: Response): Promise<Response> => {
    const idUsuario = Number(req.params.idUsuario);
    const { idCargo } = atribuirCargoSchema.parse(req.body);
    const usuario = await this.usuarioService.atribuirCargo(idUsuario, idCargo);
    return res.status(200).json(usuario);
  };
}
