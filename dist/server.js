"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
app_1.app.listen(env_1.env.PORT, () => {
    console.log(`🚀 Servidor AAACA Backend executando na porta ${env_1.env.PORT}`);
    console.log(`📡 Health check disponível em: http://localhost:${env_1.env.PORT}/health`);
});
