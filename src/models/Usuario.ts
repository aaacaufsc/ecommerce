import { ICargo } from './Cargo';

export interface IUsuario {
  idUsuario: number;
  idCargo?: number | null;
  nome: string;
  email: string;
  cpf: string;
  matricula?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  curso?: string | null;
  dtNascimento?: Date | null;
  gestao: boolean;
  passwordHash: string;
  cargo?: ICargo | null;
}

export interface ICreateUsuarioDTO {
  nome: string;
  email: string;
  cpf: string;
  password: string;
  matricula?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  curso?: string | null;
  dtNascimento?: string | Date | null;
  idCargo?: number | null;
  gestao?: boolean;
}

export interface IUsuarioFilters {
  searchTerm?: string;
  gestao?: boolean;
  idCargo?: number;
  curso?: string;
}
