import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';

const loginSchema = z.object({
  email: z.string().email('E-mail em formato inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await this.authService.login(email, password);
    return res.status(200).json(result);
  };
}
