import express from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de saúde do sistema
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    organization: 'AAACA - UFSC Araranguá',
  });
});

// Prefixo global de rotas da API v1
app.use('/api/v1', routes);

// Middleware global de tratamento de erros
app.use(errorHandler);
