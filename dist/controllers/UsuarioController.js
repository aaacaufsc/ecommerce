"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const zod_1 = require("zod");
const registerUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    email: zod_1.z.string().email('E-mail em formato inválido'),
    cpf: zod_1.z.string().min(11, 'CPF deve ter no mínimo 11 dígitos'),
    password: zod_1.z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    matricula: zod_1.z.string().optional(),
    endereco: zod_1.z.string().optional(),
    telefone: zod_1.z.string().optional(),
    curso: zod_1.z.string().optional(),
    dtNascimento: zod_1.z.string().optional(),
});
const atribuirCargoSchema = zod_1.z.object({
    idCargo: zod_1.z.number().nullable(),
});
class UsuarioController {
    usuarioService;
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    register = async (req, res) => {
        const data = registerUsuarioSchema.parse(req.body);
        const usuario = await this.usuarioService.register(data);
        return res.status(201).json(usuario);
    };
    findById = async (req, res) => {
        const idUsuario = Number(req.params.idUsuario);
        const usuario = await this.usuarioService.findById(idUsuario);
        return res.status(200).json(usuario);
    };
    me = async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }
        const usuario = await this.usuarioService.findById(req.user.idUsuario);
        return res.status(200).json(usuario);
    };
    listWithFilters = async (req, res) => {
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
    atribuirCargo = async (req, res) => {
        const idUsuario = Number(req.params.idUsuario);
        const { idCargo } = atribuirCargoSchema.parse(req.body);
        const usuario = await this.usuarioService.atribuirCargo(idUsuario, idCargo);
        return res.status(200).json(usuario);
    };
}
exports.UsuarioController = UsuarioController;
