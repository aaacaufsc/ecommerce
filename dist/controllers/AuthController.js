"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail em formato inválido'),
    password: zod_1.z.string().min(1, 'A senha é obrigatória'),
});
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (req, res) => {
        const { email, password } = loginSchema.parse(req.body);
        const result = await this.authService.login(email, password);
        return res.status(200).json(result);
    };
}
exports.AuthController = AuthController;
