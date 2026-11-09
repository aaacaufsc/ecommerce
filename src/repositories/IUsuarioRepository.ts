import { IUsuario, ICreateUsuarioDTO, IUsuarioFilters } from '../models/Usuario';

export interface IUsuarioRepository {
  create(data: Omit<ICreateUsuarioDTO, 'password'> & { passwordHash: string }): Promise<IUsuario>;
  findById(idUsuario: number): Promise<IUsuario | null>;
  findByEmail(email: string): Promise<IUsuario | null>;
  findByCpf(cpf: string): Promise<IUsuario | null>;
  findByMatricula(matricula: string): Promise<IUsuario | null>;
  findWithFilters(filters: IUsuarioFilters): Promise<IUsuario[]>;
  updateCargo(idUsuario: number, idCargo: number | null, gestao: boolean): Promise<IUsuario>;
  update(idUsuario: number, data: Partial<IUsuario>): Promise<IUsuario>;
  delete(idUsuario: number): Promise<void>;
}
