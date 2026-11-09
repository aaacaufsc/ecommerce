import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor AAACA Backend executando na porta ${env.PORT}`);
  console.log(`📡 Health check disponível em: http://localhost:${env.PORT}/health`);
});
