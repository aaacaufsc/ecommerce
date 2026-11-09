import { AuthService } from './AuthService';
import { UsuarioService } from './UsuarioService';
import { InMemoryUsuarioRepository } from '../repositories/in-memory/InMemoryUsuarioRepository';
import { InMemoryCargoRepository } from '../repositories/in-memory/InMemoryCargoRepository';
import { AppError } from '../utils/AppError';

describe('AuthService', () => {
  let usuarioRepository: InMemoryUsuarioRepository;
  let cargoRepository: InMemoryCargoRepository;
  let usuarioService: UsuarioService;
  let authService: AuthService;

  beforeEach(async () => {
    cargoRepository = new InMemoryCargoRepository();
    usuarioRepository = new InMemoryUsuarioRepository(cargoRepository);
    usuarioService = new UsuarioService(usuarioRepository, cargoRepository);
    authService = new AuthService(usuarioRepository);

    // Registra um diretor para teste
    const cargo = await cargoRepository.create({
      nome: 'Diretor de TI',
      setor: 'TI',
      permissoes: 'ALL',
    });

    const user = await usuarioService.register({
      nome: 'Admin TI',
      email: 'ti@aaaca.com',
      cpf: '00011122233',
      password: 'SenhaSecreta123',
    });

    await usuarioService.atribuirCargo(user.idUsuario, cargo.idCargo);
  });

  it('deve autenticar com sucesso e retornar token JWT e dados do usuário com cargo', async () => {
    const response = await authService.login('ti@aaaca.com', 'SenhaSecreta123');

    expect(response).toHaveProperty('token');
    expect(response.user.email).toBe('ti@aaaca.com');
    expect(response.user.gestao).toBe(true);
    expect(response.user.setor).toBe('TI');
  });

  it('não deve autenticar com senha incorreta', async () => {
    await expect(authService.login('ti@aaaca.com', 'SenhaErrada')).rejects.toBeInstanceOf(AppError);
  });

  it('não deve autenticar com e-mail inexistente', async () => {
    await expect(authService.login('inexistente@aaaca.com', 'SenhaQualquer')).rejects.toBeInstanceOf(AppError);
  });
});
