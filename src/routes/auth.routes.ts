import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UsuarioController } from '../controllers/UsuarioController';
import { AuthService } from '../services/AuthService';
import { UsuarioService } from '../services/UsuarioService';
import { PrismaUsuarioRepository } from '../repositories/prisma/PrismaUsuarioRepository';
import { PrismaCargoRepository } from '../repositories/prisma/PrismaCargoRepository';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

export function createAuthRouter(
  usuarioRepo = new PrismaUsuarioRepository(),
  cargoRepo = new PrismaCargoRepository()
) {
  const router = Router();
  const usuarioService = new UsuarioService(usuarioRepo, cargoRepo);
  const authService = new AuthService(usuarioRepo);

  const authController = new AuthController(authService);
  const usuarioController = new UsuarioController(usuarioService);

  router.post('/login', authController.login);
  router.post('/register', usuarioController.register);
  router.get('/me', ensureAuthenticated, usuarioController.me);

  return router;
}

export const authRoutes = createAuthRouter();
