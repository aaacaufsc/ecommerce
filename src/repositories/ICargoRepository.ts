import { ICargo, ICreateCargoDTO } from '../models/Cargo';

export interface ICargoRepository {
  create(data: ICreateCargoDTO): Promise<ICargo>;
  findById(idCargo: number): Promise<ICargo | null>;
  findByName(nome: string): Promise<ICargo | null>;
  findAll(): Promise<ICargo[]>;
  update(idCargo: number, data: Partial<ICreateCargoDTO>): Promise<ICargo>;
  delete(idCargo: number): Promise<void>;
}
