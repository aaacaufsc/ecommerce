import { Router } from 'express';
import { CargoController } from '../controllers/CargoController';
import { CargoService } from '../services/CargoService';
import { PrismaCargoRepository } from '../repositories/prisma/PrismaCargoRepository';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSector } from '../middlewares/ensureSector';

export function createCargoRouter(cargoRepo = new PrismaCargoRepository()) {
  const router = Router();
  const cargoService = new CargoService(cargoRepo);
  const cargoController = new CargoController(cargoService);

  // Somente Gestão de Pessoas, Presidência e TI podem criar/editar/excluir cargos
  const sectorGuard = ensureSector(['GESTAO_PESSOAS', 'TI', 'PRESIDENCIA']);

  router.post('/', ensureAuthenticated, sectorGuard, cargoController.create);
  router.get('/', ensureAuthenticated, cargoController.listAll);
  router.get('/:idCargo', ensureAuthenticated, cargoController.findById);
  router.patch('/:idCargo', ensureAuthenticated, sectorGuard, cargoController.update);
  router.delete('/:idCargo', ensureAuthenticated, sectorGuard, cargoController.delete);

  return router;
}

export const cargoRoutes = createCargoRouter();
