"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioRoutes = void 0;
exports.createUsuarioRouter = createUsuarioRouter;
const express_1 = require("express");
const UsuarioController_1 = require("../controllers/UsuarioController");
const UsuarioService_1 = require("../services/UsuarioService");
const PrismaUsuarioRepository_1 = require("../repositories/prisma/PrismaUsuarioRepository");
const PrismaCargoRepository_1 = require("../repositories/prisma/PrismaCargoRepository");
const ensureAuthenticated_1 = require("../middlewares/ensureAuthenticated");
const ensureSector_1 = require("../middlewares/ensureSector");
function createUsuarioRouter(usuarioRepo = new PrismaUsuarioRepository_1.PrismaUsuarioRepository(), cargoRepo = new PrismaCargoRepository_1.PrismaCargoRepository()) {
    const router = (0, express_1.Router)();
    const usuarioService = new UsuarioService_1.UsuarioService(usuarioRepo, cargoRepo);
    const usuarioController = new UsuarioController_1.UsuarioController(usuarioService);
    const sectorGuard = (0, ensureSector_1.ensureSector)(['GESTAO_PESSOAS', 'TI', 'PRESIDENCIA']);
    router.get('/', ensureAuthenticated_1.ensureAuthenticated, sectorGuard, usuarioController.listWithFilters);
    router.get('/:idUsuario', ensureAuthenticated_1.ensureAuthenticated, usuarioController.findById);
    router.patch('/:idUsuario/cargo', ensureAuthenticated_1.ensureAuthenticated, sectorGuard, usuarioController.atribuirCargo);
    return router;
}
exports.usuarioRoutes = createUsuarioRouter();
