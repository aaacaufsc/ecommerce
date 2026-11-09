import { CargoService } from './CargoService';
import { InMemoryCargoRepository } from '../repositories/in-memory/InMemoryCargoRepository';
import { AppError } from '../utils/AppError';

describe('CargoService', () => {
  let cargoRepository: InMemoryCargoRepository;
  let cargoService: CargoService;

  beforeEach(() => {
    cargoRepository = new InMemoryCargoRepository();
    cargoService = new CargoService(cargoRepository);
  });

  it('deve cadastrar um novo cargo com sucesso', async () => {
    const cargo = await cargoService.create({
      nome: 'Diretor de Esportes',
      setor: 'esportes',
      descricao: 'Responsável pelos treinos e campeonatos',
      permissoes: 'ESPORTES_WRITE,EVENTOS_WRITE',
    });

    expect(cargo).toHaveProperty('idCargo');
    expect(cargo.nome).toBe('Diretor de Esportes');
    expect(cargo.setor).toBe('ESPORTES'); // Verifica se converteu para maiúsculo
  });

  it('não deve permitir cadastrar dois cargos com o mesmo nome', async () => {
    await cargoService.create({
      nome: 'Diretor Financeiro',
      setor: 'FINANCEIRO',
    });

    await expect(
      cargoService.create({
        nome: 'Diretor Financeiro',
        setor: 'FINANCEIRO',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('deve listar todos os cargos cadastrados', async () => {
    await cargoService.create({ nome: 'Presidente', setor: 'PRESIDENCIA' });
    await cargoService.create({ nome: 'Diretor de TI', setor: 'TI' });

    const cargos = await cargoService.listAll();
    expect(cargos).toHaveLength(2);
  });

  it('deve encontrar um cargo por ID', async () => {
    const created = await cargoService.create({ nome: 'Diretor de Produto', setor: 'COMERCIAL_PRODUTO' });
    const found = await cargoService.findById(created.idCargo);

    expect(found.idCargo).toBe(created.idCargo);
  });

  it('deve lançar erro 404 ao buscar cargo inexistente', async () => {
    await expect(cargoService.findById(999)).rejects.toBeInstanceOf(AppError);
  });
});
