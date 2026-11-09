import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { UsuarioService } from '../services/UsuarioService';
import { PrismaUsuarioRepository } from '../repositories/prisma/PrismaUsuarioRepository';
import { PrismaCargoRepository } from '../repositories/prisma/PrismaCargoRepository';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSector } from '../middlewares/ensureSector';

export function createUsuarioRouter(
  usuarioRepo = new PrismaUsuarioRepository(),
  cargoRepo = new PrismaCargoRepository()
) {
  const router = Router();
  const usuarioService = new UsuarioService(usuarioRepo, cargoRepo);
  const usuarioController = new UsuarioController(usuarioService);

  const sectorGuard = ensureSector(['GESTAO_PESSOAS', 'TI', 'PRESIDENCIA']);

  router.get('/', ensureAuthenticated, sectorGuard, usuarioController.listWithFilters);
  router.get('/:idUsuario', ensureAuthenticated, usuarioController.findById);
  router.patch('/:idUsuario/cargo', ensureAuthenticated, sectorGuard, usuarioController.atribuirCargo);

  return router;
}

export const usuarioRoutes = createUsuarioRouter();
