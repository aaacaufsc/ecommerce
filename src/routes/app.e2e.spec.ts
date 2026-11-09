import request from 'supertest';
import express from 'express';
import { InMemoryUsuarioRepository } from '../repositories/in-memory/InMemoryUsuarioRepository';
import { InMemoryCargoRepository } from '../repositories/in-memory/InMemoryCargoRepository';
import { createAuthRouter } from './auth.routes';
import { createCargoRouter } from './cargo.routes';
import { createUsuarioRouter } from './usuario.routes';
import { errorHandler } from '../middlewares/errorHandler';

function buildTestApp() {
  const testApp = express();
  testApp.use(express.json());

  const cargoRepo = new InMemoryCargoRepository();
  const usuarioRepo = new InMemoryUsuarioRepository(cargoRepo);

  testApp.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  const apiRouter = express.Router();
  apiRouter.use('/auth', createAuthRouter(usuarioRepo, cargoRepo));
  apiRouter.use('/cargos', createCargoRouter(cargoRepo));
  apiRouter.use('/usuarios', createUsuarioRouter(usuarioRepo, cargoRepo));

  testApp.use('/api/v1', apiRouter);
  testApp.use(errorHandler);

  return { testApp, cargoRepo, usuarioRepo };
}

describe('E2E API Endpoints (Fase 0 e Fase 1)', () => {
  let appInstance: express.Application;
  let cargoRepo: InMemoryCargoRepository;
  let usuarioRepo: InMemoryUsuarioRepository;

  beforeEach(() => {
    const built = buildTestApp();
    appInstance = built.testApp;
    cargoRepo = built.cargoRepo;
    usuarioRepo = built.usuarioRepo;
  });

  it('GET /health deve responder 200 OK', async () => {
    const response = await request(appInstance).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('POST /api/v1/auth/register e POST /api/v1/auth/login fluxo completo', async () => {
    // 1. Cadastra usuário
    const registerRes = await request(appInstance)
      .post('/api/v1/auth/register')
      .send({
        nome: 'Bruna Estudante',
        email: 'bruna@ufsc.br',
        cpf: '12345678909',
        password: 'MinhaSenha123',
        matricula: '20261001',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.email).toBe('bruna@ufsc.br');

    // 2. Realiza Login
    const loginRes = await request(appInstance)
      .post('/api/v1/auth/login')
      .send({
        email: 'bruna@ufsc.br',
        password: 'MinhaSenha123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    const token = loginRes.body.token;

    // 3. Consulta /me
    const meRes = await request(appInstance)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.nome).toBe('Bruna Estudante');
  });

  it('deve bloquear criação de Cargo por usuário comum (403 Forbidden)', async () => {
    // Registra e autentica usuário comum
    await request(appInstance).post('/api/v1/auth/register').send({
      nome: 'Aluno Comum',
      email: 'aluno@ufsc.br',
      cpf: '99911122233',
      password: 'SenhaForte123',
    });

    const loginRes = await request(appInstance).post('/api/v1/auth/login').send({
      email: 'aluno@ufsc.br',
      password: 'SenhaForte123',
    });

    const token = loginRes.body.token;

    // Tenta criar cargo
    const cargoRes = await request(appInstance)
      .post('/api/v1/cargos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Tentativa Invasão',
        setor: 'TI',
      });

    expect(cargoRes.status).toBe(403);
  });
});
