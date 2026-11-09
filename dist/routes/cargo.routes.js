"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cargoRoutes = void 0;
exports.createCargoRouter = createCargoRouter;
const express_1 = require("express");
const CargoController_1 = require("../controllers/CargoController");
const CargoService_1 = require("../services/CargoService");
const PrismaCargoRepository_1 = require("../repositories/prisma/PrismaCargoRepository");
const ensureAuthenticated_1 = require("../middlewares/ensureAuthenticated");
const ensureSector_1 = require("../middlewares/ensureSector");
function createCargoRouter(cargoRepo = new PrismaCargoRepository_1.PrismaCargoRepository()) {
    const router = (0, express_1.Router)();
    const cargoService = new CargoService_1.CargoService(cargoRepo);
    const cargoController = new CargoController_1.CargoController(cargoService);
    // Somente Gestão de Pessoas, Presidência e TI podem criar/editar/excluir cargos
    const sectorGuard = (0, ensureSector_1.ensureSector)(['GESTAO_PESSOAS', 'TI', 'PRESIDENCIA']);
    router.post('/', ensureAuthenticated_1.ensureAuthenticated, sectorGuard, cargoController.create);
    router.get('/', ensureAuthenticated_1.ensureAuthenticated, cargoController.listAll);
    router.get('/:idCargo', ensureAuthenticated_1.ensureAuthenticated, cargoController.findById);
    router.patch('/:idCargo', ensureAuthenticated_1.ensureAuthenticated, sectorGuard, cargoController.update);
    router.delete('/:idCargo', ensureAuthenticated_1.ensureAuthenticated, sectorGuard, cargoController.delete);
    return router;
}
exports.cargoRoutes = createCargoRouter();
