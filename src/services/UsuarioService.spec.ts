import { UsuarioService } from './UsuarioService';
import { InMemoryUsuarioRepository } from '../repositories/in-memory/InMemoryUsuarioRepository';
import { InMemoryCargoRepository } from '../repositories/in-memory/InMemoryCargoRepository';
import { AppError } from '../utils/AppError';

describe('UsuarioService', () => {
  let usuarioRepository: InMemoryUsuarioRepository;
  let cargoRepository: InMemoryCargoRepository;
  let usuarioService: UsuarioService;

  beforeEach(() => {
    cargoRepository = new InMemoryCargoRepository();
    usuarioRepository = new InMemoryUsuarioRepository(cargoRepository);
    usuarioService = new UsuarioService(usuarioRepository, cargoRepository);
  });

  it('deve registrar um novo estudante/usuário com sucesso', async () => {
    const usuario = await usuarioService.register({
      nome: 'João da Silva',
      email: 'joao@ufsc.br',
      cpf: '123.456.789-01',
      password: 'SenhaForte123',
      matricula: '22100123',
      curso: 'Engenharia',
    });

    expect(usuario).toHaveProperty('idUsuario');
    expect(usuario.email).toBe('joao@ufsc.br');
    expect(usuario.cpf).toBe('12345678901'); // Limpou pontuação
    expect(usuario.gestao).toBe(false);
    expect((usuario as any).passwordHash).toBeUndefined(); // Não expõe senha
  });

  it('não deve permitir registro com e-mail duplicado', async () => {
    await usuarioService.register({
      nome: 'Maria',
      email: 'maria@ufsc.br',
      cpf: '11122233344',
      password: 'SenhaForte123',
    });

    await expect(
      usuarioService.register({
        nome: 'Maria Outra',
        email: 'maria@ufsc.br',
        cpf: '55566677788',
        password: 'SenhaForte123',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('não deve permitir registro com CPF inválido (menos de 11 dígitos)', async () => {
    await expect(
      usuarioService.register({
        nome: 'Carlos',
        email: 'carlos@ufsc.br',
        cpf: '12345',
        password: 'SenhaForte123',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('deve atribuir um cargo a um usuário e ativar gestao = true', async () => {
    const cargo = await cargoRepository.create({
      nome: 'Diretor de Marketing',
      setor: 'COMERCIAL_MARKETING',
    });

    const user = await usuarioService.register({
      nome: 'Lucas',
      email: 'lucas@ufsc.br',
      cpf: '99988877766',
      password: 'SenhaForte123',
    });

    const updated = await usuarioService.atribuirCargo(user.idUsuario, cargo.idCargo);

    expect(updated.gestao).toBe(true);
    expect(updated.idCargo).toBe(cargo.idCargo);
    expect(updated.cargo?.setor).toBe('COMERCIAL_MARKETING');
  });

  it('deve desvincular cargo e definir gestao = false ao passar idCargo nulo', async () => {
    const cargo = await cargoRepository.create({
      nome: 'Assessor',
      setor: 'ESPORTES',
    });

    const user = await usuarioService.register({
      nome: 'Ana',
      email: 'ana@ufsc.br',
      cpf: '44455566677',
      password: 'SenhaForte123',
    });

    await usuarioService.atribuirCargo(user.idUsuario, cargo.idCargo);
    const semCargo = await usuarioService.atribuirCargo(user.idUsuario, null);

    expect(semCargo.gestao).toBe(false);
    expect(semCargo.idCargo).toBeNull();
  });
});
