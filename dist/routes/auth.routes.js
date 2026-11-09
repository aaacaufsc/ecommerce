"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
exports.createAuthRouter = createAuthRouter;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const UsuarioController_1 = require("../controllers/UsuarioController");
const AuthService_1 = require("../services/AuthService");
const UsuarioService_1 = require("../services/UsuarioService");
const PrismaUsuarioRepository_1 = require("../repositories/prisma/PrismaUsuarioRepository");
const PrismaCargoRepository_1 = require("../repositories/prisma/PrismaCargoRepository");
const ensureAuthenticated_1 = require("../middlewares/ensureAuthenticated");
function createAuthRouter(usuarioRepo = new PrismaUsuarioRepository_1.PrismaUsuarioRepository(), cargoRepo = new PrismaCargoRepository_1.PrismaCargoRepository()) {
    const router = (0, express_1.Router)();
    const usuarioService = new UsuarioService_1.UsuarioService(usuarioRepo, cargoRepo);
    const authService = new AuthService_1.AuthService(usuarioRepo);
    const authController = new AuthController_1.AuthController(authService);
    const usuarioController = new UsuarioController_1.UsuarioController(usuarioService);
    router.post('/login', authController.login);
    router.post('/register', usuarioController.register);
    router.get('/me', ensureAuthenticated_1.ensureAuthenticated, usuarioController.me);
    return router;
}
exports.authRoutes = createAuthRouter();
