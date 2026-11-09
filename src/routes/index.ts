import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { cargoRoutes } from './cargo.routes';
import { usuarioRoutes } from './usuario.routes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/cargos', cargoRoutes);
routes.use('/usuarios', usuarioRoutes);
