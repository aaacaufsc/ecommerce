"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoController = void 0;
const zod_1 = require("zod");
const createCargoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    setor: zod_1.z.string().optional(),
    descricao: zod_1.z.string().optional(),
    permissoes: zod_1.z.string().optional(),
});
const updateCargoSchema = createCargoSchema.partial();
class CargoController {
    cargoService;
    constructor(cargoService) {
        this.cargoService = cargoService;
    }
    create = async (req, res) => {
        const data = createCargoSchema.parse(req.body);
        const cargo = await this.cargoService.create(data);
        return res.status(201).json(cargo);
    };
    listAll = async (_req, res) => {
        const cargos = await this.cargoService.listAll();
        return res.status(200).json(cargos);
    };
    findById = async (req, res) => {
        const idCargo = Number(req.params.idCargo);
        const cargo = await this.cargoService.findById(idCargo);
        return res.status(200).json(cargo);
    };
    update = async (req, res) => {
        const idCargo = Number(req.params.idCargo);
        const data = updateCargoSchema.parse(req.body);
        const cargo = await this.cargoService.update(idCargo, data);
        return res.status(200).json(cargo);
    };
    delete = async (req, res) => {
        const idCargo = Number(req.params.idCargo);
        await this.cargoService.delete(idCargo);
        return res.status(204).send();
    };
}
exports.CargoController = CargoController;
