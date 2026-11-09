export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        idUsuario: number;
        nome: string;
        email: string;
        gestao: boolean;
        idCargo: number | null;
        setor: string | null;
        permissoes: string | null;
      };
    }
  }
}
