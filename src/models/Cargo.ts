export interface ICargo {
  idCargo: number;
  nome: string;
  setor?: string | null;
  descricao?: string | null;
  permissoes?: string | null;
}

export interface ICreateCargoDTO {
  nome: string;
  setor?: string | null;
  descricao?: string | null;
  permissoes?: string | null;
}
