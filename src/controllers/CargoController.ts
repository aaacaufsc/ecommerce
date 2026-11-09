import { Request, Response } from 'express';
import { z } from 'zod';
import { CargoService } from '../services/CargoService';

const createCargoSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  setor: z.string().optional(),
  descricao: z.string().optional(),
  permissoes: z.string().optional(),
});

const updateCargoSchema = createCargoSchema.partial();

export class CargoController {
  constructor(private cargoService: CargoService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const data = createCargoSchema.parse(req.body);
    const cargo = await this.cargoService.create(data);
    return res.status(201).json(cargo);
  };

  listAll = async (_req: Request, res: Response): Promise<Response> => {
    const cargos = await this.cargoService.listAll();
    return res.status(200).json(cargos);
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    const idCargo = Number(req.params.idCargo);
    const cargo = await this.cargoService.findById(idCargo);
    return res.status(200).json(cargo);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const idCargo = Number(req.params.idCargo);
    const data = updateCargoSchema.parse(req.body);
    const cargo = await this.cargoService.update(idCargo, data);
    return res.status(200).json(cargo);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const idCargo = Number(req.params.idCargo);
    await this.cargoService.delete(idCargo);
    return res.status(204).send();
  };
}
