# TASKS — Plano de Implementação e Matriz de Rastreabilidade
## Sistema de E-commerce, Gestão de Sócios, Estoque e Vendas (AAACA)

---

| Metadado | Detalhe |
| :--- | :--- |
| **Projeto** | Sistema de E-commerce, Gestão de Sócios, Estoque e Vendas (AAACA) |
| **Documento** | Implementation Plan & Task Breakdown (`TASKS.md`) |
| **Documentos Base** | `docs/PRD.md` (v2.0), `docs/DESIGN.md` (v2.0), `docs/SPEC.md` (v2.0) |
| **Metodologia** | Spec-Driven Development (SDD) com desenvolvimento orientado a camadas |
| **Versão** | 2.0.0 |

---

## 1. Visão Geral da Estratégia de Desenvolvimento

O desenvolvimento seguirá uma abordagem estruturada em fases ordenadas por dependência de dados (*bottom-up*). Cada funcionalidade implementada no sistema deve obedecer rigorosamente ao fluxo arquitetural em camadas homologado:

```
[Model] ──> [Repository] ──> [Service] ──> [Controller] ──> [MiddleWare] ──> [Routes] ──> [Testes]
```

### Regras de Execução:
1. **Isolamento de Camadas**: Nenhuma regra de negócio deve ser implementada no Controller; nenhuma consulta SQL/Prisma fora do Repository; nenhum middleware executando tarefas do Service.
2. **Conformidade com o DDL**: Nenhuma tabela ou coluna fora do script `logico_corrigido.sql` pode ser criada sem aprovação.
3. **Segurança por Padrão**: Todas as rotas de mutação (POST, PUT, PATCH, DELETE) nascem vinculadas ao middleware de autenticação e de validação de setor (`ensureSector`).

---

## 2. Matriz de Rastreabilidade (Requisitos $\times$ Entidades $\times$ Camadas $\times$ Tarefas)

A tabela a seguir correlaciona cada tarefa com os requisitos do **PRD**, as entidades do **SPEC** e as camadas do **DESIGN**:

| Task ID | Requisito PRD | Entidades Afetadas | Camadas Impactadas | Setor Responsável no Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | RNF01, RNF02 | Todas | Infraestrutura / Config | Presidência / TI |
| **TASK-002** | RNF02 | As 12 tabelas do DDL | Database / Model | Presidência / TI |
| **TASK-003** | RNF01, RNF03 | Todas | Middlewares Base / Utils | Presidência / TI |
| **TASK-010** | RF02, RF13 | `Cargo` | Model, Repo, Svc, Ctrl, Routes | Gestão de Pessoas / TI |
| **TASK-011** | RF01, RF02, RF03 | `Usuario`, `Cargo` | Model, Repo, Svc, Ctrl, Routes | Gestão de Pessoas / TI |
| **TASK-012** | RF13, RNF03 | `Usuario`, `Cargo` | MiddleWare (`ensureSector`, JWT) | TI / Presidência |
| **TASK-020** | RF04, RF05, RF06 | `Vestuario` | Model, Repo, Svc, Ctrl, Routes | Comercial (Produto) |
| **TASK-021** | RF04, RF05, RF06 | `Objeto` | Model, Repo, Svc, Ctrl, Routes | Comercial (Produto) |
| **TASK-030** | RF10.1 | `Local` | Model, Repo, Svc, Ctrl, Routes | Esportes / Comercial / TI |
| **TASK-031** | RF10.2 | `DJ`, `EventoDJ` | Model, Repo, Svc, Ctrl, Routes | Comercial (Marketing) |
| **TASK-032** | RF10.3, RF11, RF12 | `Evento`, `Ingresso`, `Local`, `EventoDJ` | Model, Repo, Svc, Ctrl, Routes | Comercial (Produto) / Esportes |
| **TASK-040** | RF07 | `FormaPagamento` | Model, Repo, Svc, Ctrl, Routes | Financeiro / TI |
| **TASK-041** | RF07, RF08, RF09 | `Compra`, `CompraItem`, `CompraFormaPagamento` | Model, Repo, Svc, Ctrl, Routes | Usuário / Comercial / Financeiro |
| **TASK-042** | RF07.1 | `Compra` (`dataRetirada`) | Repo, Svc, Ctrl, Routes | Comercial (Produto) / TI |
| **TASK-050** | RF14, RF15 | `Compra`, `CompraItem`, `CompraFormaPagamento` | Repo, Svc, Ctrl, Routes | Financeiro |
| **TASK-051** | RF14 | `Compra`, `CompraItem` | Service (Stream CSV), Controller | Financeiro |
| **TASK-060** | RF17, RF18 | `Evento`, `Local` | Svc, Ctrl, Routes | Esportes |
| **TASK-061** | RF16 | `Usuario` | Svc (Token/QR), Ctrl, Routes | Diretoria Geral / Portaria |
| **TASK-070** | RNF01 a RNF04 | Todas as 12 entidades | Testes Integrados E2E | Todos os Setores |

---

## 3. Detalhamento das Tarefas Fase a Fase

---

### Fase 0: Setup do Ambiente e Fundação de Dados

#### `TASK-001` — Inicialização do Projeto e Configuração da Toolchain
* **Objetivo**: Configurar o ambiente Node.js com TypeScript, scripts de build, linter e variáveis de ambiente.
* **Entidades Afetadas**: Nenhuma diretamente (infraestrutura de código).
* **Requisitos**: RNF01, RNF02.
* **Passos de Execução**:
  1. Inicializar `package.json` com scripts (`dev`, `build`, `start`, `test`).
  2. Configurar `tsconfig.json` com tipagem estrita (`strict: true`) e paths aliases (`@models/*`, `@services/*`, etc.).
  3. Instalar dependências base: `express`, `cors`, `dotenv`, `zod`, `bcryptjs`, `jsonwebtoken`.
  4. Instalar dependências de desenvolvimento: `typescript`, `ts-node-dev`, `@types/express`, `@types/node`, `@types/jsonwebtoken`, `jest`, `supertest`.
* **Critério de Aceitação**: Servidor HTTP inicializa na porta 3333 e responde `GET /health` com status `200 OK`.

---

#### `TASK-002` — Configuração do Prisma ORM e Migração do Esquema DDL
* **Objetivo**: Configurar o Prisma Client e espelhar integralmente o script `logico_corrigido.sql` no PostgreSQL.
* **Entidades Afetadas**: As 12 tabelas do banco: `Cargo`, `Usuario`, `Local`, `Evento`, `DJ`, `EventoDJ`, `Ingresso`, `Vestuario`, `Objeto`, `FormaPagamento`, `Compra`, `CompraItem`, `CompraFormaPagamento`.
* **Requisitos**: RNF02.
* **Passos de Execução**:
  1. Configurar `prisma/schema.prisma` com o código fornecido em `docs/SPEC.md`.
  2. Configurar string de conexão com o PostgreSQL em `.env`.
  3. Executar o script DDL `logico_corrigido.sql` no banco de dados para garantir integridade das constraints e tipos originais.
  4. Executar `npx prisma db pull` ou `npx prisma generate` para validar o alinhamento das models com as tabelas.
* **Critério de Aceitação**: O Prisma Client conecta ao PostgreSQL e realiza operações nas 12 tabelas sem conflito de tipos ou restrições de chaves estrangeiras.

---

#### `TASK-003` — Camada Base de Erros e Middlewares Globais
* **Objetivo**: Padronizar o tratamento de exceções e a interceptação de erros da aplicação.
* **Requisitos**: RNF01, RNF03.
* **Passos de Execução**:
  1. Criar a classe `AppError` em `src/utils/AppError.ts` com `message` e `statusCode`.
  2. Criar o middleware global `errorHandler.ts` para capturar `AppError`, erros de validação do `Zod` e erros inesperados (`500 Internal Server Error`).
  3. Configurar parsing de JSON e cabeçalhos de segurança (CORS).
* **Critério de Aceitação**: Qualquer erro lançado via `throw new AppError('...', 400)` retorna resposta padronizada em JSON com `status: "error"` e código HTTP correto.

---

### Fase 1: Módulo de Governança, Cargos e Autenticação

#### `TASK-010` — Implementação das Camadas de `Cargo`
* **Objetivo**: Permitir o cadastro e consulta de cargos da gestão e definição de seus setores e permissões.
* **Entidades Afetadas**: `Cargo`.
* **Requisitos**: RF02, RF13.
* **Passos de Execução**:
  1. **Model**: Interface TypeScript `ICargo` correspondente aos campos de `Cargo`.
  2. **Repository** (`CargoRepository`): Métodos `create`, `findById`, `findAll`, `update`, `delete`.
  3. **Service** (`CargoService`): Validação de nome obrigatório, validação de unicidade de cargo e padronização do nome do setor.
  4. **Controller** (`CargoController`): Handlers HTTP para criação e listagem.
  5. **Routes** (`cargo.routes.ts`): Mapeamento dos endpoints `POST /cargos` e `GET /cargos`.
* **Critério de Aceitação**: Diretoria de Gestão de Pessoas e TI conseguem criar e listar cargos com seus respectivos setores.

---

#### `TASK-011` — Implementação das Camadas de `Usuario` (Cadastro e Perfil)
* **Objetivo**: Viabilizar o registro de estudantes e membros da gestão, incluindo hash de senha e validação de dados únicos.
* **Entidades Afetadas**: `Usuario`, `Cargo`.
* **Requisitos**: RF01, RF02, RF03, RNF03.
* **Passos de Execução**:
  1. **Model**: Interface `IUsuario` com os campos `cpf`, `matricula`, `email`, `curso`, `dtNascimento`, etc.
  2. **Repository** (`UsuarioRepository`): Métodos para busca por ID, e-mail, CPF, matrícula, listagem paginada com filtros e atualização de cargo (`idCargo`, `gestao`).
  3. **Service** (`UsuarioService`):
     - Validação de formato de CPF e unicidade de e-mail/CPF/matrícula.
     - Hash da senha com `bcryptjs` (salt 10).
     - Método de alocação de cargo (`atribuirCargo`) com validação de existência do `idCargo`.
  4. **Controller** (`UsuarioController`): Endpoints de registro, listagem e atualização de cargo.
  5. **Routes** (`usuario.routes.ts`): `POST /auth/register`, `GET /usuarios`, `PATCH /usuarios/:idUsuario/cargo`.
* **Critério de Aceitação**: Cadastro rejeita CPFs e e-mails duplicados; senhas nunca são salvas em texto puro; vínculo de cargo atualiza corretamente a flag `gestao = true`.

---

#### `TASK-012` — Camada de Autenticação JWT e Middleware de Setores (`MiddleWare`)
* **Objetivo**: Implementar a camada específica de segurança e autorização descrita no diagrama de fluxo do backend.
* **Entidades Afetadas**: `Usuario`, `Cargo`.
* **Requisitos**: RF13, RNF03.
* **Passos de Execução**:
  1. **Service** (`AuthService`): Autenticação de e-mail e senha, carregamento dos dados do usuário com seu `Cargo` e emissão do JWT com payload contendo `idUsuario`, `gestao`, `idCargo`, `setor` e `permissoes`.
  2. **Middleware** (`ensureAuthenticated`): Validação da presença e integridade do token no header `Authorization: Bearer <token>`.
  3. **Middleware** (`ensureSector`): Checagem se o setor do usuário logado confere acesso à rota ou se o usuário pertence à Presidência/TI.
* **Critério de Aceitação**: Usuário sem o setor correto recebe HTTP `403 Forbidden`; token ausente/inválido retorna HTTP `401 Unauthorized`.

---

### Fase 2: Módulo de Catálogo de Produtos (Vestuário e Objetos)

#### `TASK-020` — Implementação das Camadas de `Vestuario`
* **Objetivo**: Gerenciamento de roupas oficiais da atlética (tamanhos, cores, categorias e customização).
* **Entidades Afetadas**: `Vestuario`.
* **Requisitos**: RF04, RF05, RF06.
* **Passos de Execução**:
  1. **Model**: Tipos `IVestuario` (tamanho: PP, P, M, G, GG, XGG; valor: Decimal).
  2. **Repository** (`VestuarioRepository`): Queries para `create`, `findById`, `findWithFilters` (filtro por tamanho, cor, categoria), `update`, `delete`.
  3. **Service** (`VestuarioService`): Validação de valor positivo, obrigatoriedade de tamanho e nome.
  4. **Controller** (`VestuarioController`): Endpoints REST.
  5. **Routes** (`vestuario.routes.ts`):
     - `GET /vestuarios` (Pública)
     - `POST /vestuarios`, `PATCH /vestuarios/:id` (Protegidas: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`)
* **Critério de Aceitação**: Comercial (Produto) cadastra e edita roupas com tamanhos específicos; usuários públicos conseguem filtrar por tamanho e categoria.

---

#### `TASK-021` — Implementação das Camadas de `Objeto`
* **Objetivo**: Gerenciamento de acessórios, canecas, tirantes e brindes da atlética.
* **Entidades Afetadas**: `Objeto`.
* **Requisitos**: RF04, RF05, RF06.
* **Passos de Execução**:
  1. **Model**: Tipos `IObjeto` (nome, cor, customizacao, valor).
  2. **Repository** (`ObjetoRepository`): Métodos de CRUD e busca por termo/cor.
  3. **Service** (`ObjetoService`): Regras de precificação e validações.
  4. **Controller** (`ObjetoController`): Handlers de requisição/resposta.
  5. **Routes** (`objeto.routes.ts`):
     - `GET /objetos` (Pública)
     - `POST /objetos`, `PATCH /objetos/:id` (Protegidas: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`)
* **Critério de Aceitação**: Cadastro de objetos persistido com sucesso na tabela `Objeto`; somente o setor Comercial ou Presidência/TI pode alterar preços.

---

### Fase 3: Módulo de Eventos, Locais, DJs e Ingressos

#### `TASK-030` — Implementação das Camadas de `Local`
* **Objetivo**: Cadastro e manutenção dos locais onde ocorrem os eventos e treinos.
* **Entidades Afetadas**: `Local`.
* **Requisitos**: RF10.1.
* **Passos de Execução**:
  1. **Model**: Interface `ILocal` (nome, rua, numero, bairro, cidade, estado, telefone).
  2. **Repository** (`LocalRepository`): CRUD e busca por cidade/nome.
  3. **Service** (`LocalService`): Validação de estado (UF com 2 caracteres) e dados de endereço.
  4. **Controller** (`LocalController`) e **Routes** (`local.routes.ts`): Endpoints `/locais`.
* **Critério de Aceitação**: Locais persistidos na tabela `Local` e reutilizáveis por eventos festivos e esportivos.

---

#### `TASK-031` — Implementação das Camadas de `DJ` e Vínculo `EventoDJ`
* **Objetivo**: Cadastro de atrações musicais e associação N:M com eventos.
* **Entidades Afetadas**: `DJ`, `EventoDJ`.
* **Requisitos**: RF10.2.
* **Passos de Execução**:
  1. **Model**: Tipos `IDJ` e `IEventoDJ`.
  2. **Repository** (`DJRepository`): CRUD de DJs e métodos de vincular/desvincular DJ a Evento (`EventoDJ`).
  3. **Service** (`DJService`): Validação de links (Spotify/Instagram) e telefone de contato.
  4. **Controller** (`DJController`) e **Routes** (`dj.routes.ts`): Endpoints protegidos para o setor de **Marketing** e **Comercial**.
* **Critério de Aceitação**: Permite vincular múltiplos DJs a um evento e listar as atrações de cada evento via tabela `EventoDJ`.

---

#### `TASK-032` — Implementação das Camadas de `Evento` e Emissão de `Ingresso`
* **Objetivo**: Cadastro de eventos festivos/esportivos e seus lotes de ingressos correspondentes.
* **Entidades Afetadas**: `Evento`, `Ingresso`, `Local`.
* **Requisitos**: RF10.3, RF11, RF12.
* **Passos de Execução**:
  1. **Model**: Tipos `IEvento` e `IIngresso`.
  2. **Repository** (`EventoRepository` e `IngressoRepository`): Métodos para salvar eventos com `idLocal`, listar com DJs vinculados e gerenciar ingressos por evento (`idEvento`).
  3. **Service** (`EventoService` e `IngressoService`):
     - Validação de data do evento (não permitir datas passadas).
     - Garantir que cada ingresso esteja estritamente atrelado a um `idEvento` existente (conforme FK adicionada no DDL).
  4. **Controller** e **Routes** (`evento.routes.ts`, `ingresso.routes.ts`):
     - Cadastro de festas permitido para `COMERCIAL_PRODUTO`.
     - Cadastro de eventos esportivos permitido para `ESPORTES`.
* **Critério de Aceitação**: Evento criado com chave estrangeira válida de `Local`; ingressos cadastrados e consultáveis pelo público com valores e tipos definidos.

---

### Fase 4: Módulo de Compras, Pagamentos e Retirada Presencial

#### `TASK-040` — Implementação das Camadas de `FormaPagamento`
* **Objetivo**: Gestão das opções de pagamento aceitas pela atlética (ex: PIX, Cartão de Crédito, Dinheiro, Maquininha Balcão).
* **Entidades Afetadas**: `FormaPagamento`.
* **Requisitos**: RF07.
* **Passos de Execução**:
  1. **Model**: Interface `IFormaPagamento`.
  2. **Repository** (`FormaPagamentoRepository`): CRUD e busca por descrição.
  3. **Service**, **Controller** e **Routes** (`formaPagamento.routes.ts`).
* **Critério de Aceitação**: Tabela `FormaPagamento` populada com formas ativas para seleção no checkout.

---

#### `TASK-041` — Implementação da Transação de Checkout (`Compra`, `CompraItem`, `CompraFormaPagamento`)
* **Objetivo**: Processar o carrinho de compras polimórfico contendo Vestuário, Objeto ou Ingresso e consolidar os pagamentos.
* **Entidades Afetadas**: `Compra`, `CompraItem`, `CompraFormaPagamento`, `Vestuario`, `Objeto`, `Ingresso`.
* **Requisitos**: RF07, RF08, RF09.
* **Passos de Execução**:
  1. **Model**: Interfaces para `ICompra`, `ICompraItem` e `ICompraFormaPagamento`.
  2. **Repository** (`CompraRepository`): Método transacional `createCompraWithItemsAndPayments` utilizando `$transaction` do Prisma para inserção atômica em `Compra`, `CompraItem` e `CompraFormaPagamento`.
  3. **Service** (`CompraService`):
     - Validar que cada item informe ao menos uma chave válida (`idVestuario`, `idObjeto` ou `idIngresso`).
     - Calcular `valorTotal` multiplicando quantidades por valores unitários.
     - Validar que a soma de `valorPago` em `CompraFormaPagamento` seja exatamente igual ao `valorTotal` da `Compra`.
  4. **Controller** (`CompraController`): Handler `POST /compras` e `GET /compras` (com filtros por usuário ou administrativo).
  5. **Routes** (`compra.routes.ts`): Protegida por `ensureAuthenticated`.
* **Critério de Aceitação**: Compra criada com integridade referencial completa; se o pagamento divergente do total, a transação sofre rollback com HTTP `422 Unprocessable Entity`.

---

#### `TASK-042` — Gestão da Retirada Presencial no Campus (`dataRetirada`)
* **Objetivo**: Permitir que a diretoria dê baixa na entrega presencial dos itens comprados na lojinha física.
* **Entidades Afetadas**: `Compra`.
* **Requisitos**: RF07.1.
* **Passos de Execução**:
  1. **Repository** (`CompraRepository`): Método `updateDataRetirada(idCompra, dataRetirada)`.
  2. **Service** (`CompraService`): Verificar se a compra existe e se já não havia sido retirada anteriormente.
  3. **Controller** e **Routes**: Endpoint `PATCH /compras/:idCompra/retirada`.
  4. **Segurança**: Rota protegida pelo middleware `ensureSector(['COMERCIAL_PRODUTO', 'PRESIDENCIA', 'TI'])`.
* **Critério de Aceitação**: Atualização preenche o campo `dataRetirada` no PostgreSQL com a data atual; usuários não-gestores não conseguem executar esta ação.

---

### Fase 5: Módulo Financeiro e Relatórios

#### `TASK-050` — Camadas de Relatórios de Vendas e Faturamento
* **Objetivo**: Fornecer ao setor Financeiro visibilidade analítica sobre o faturamento de produtos e eventos.
* **Entidades Afetadas**: `Compra`, `CompraItem`, `CompraFormaPagamento`, `Vestuario`, `Objeto`, `Ingresso`.
* **Requisitos**: RF14, RF15.
* **Passos de Execução**:
  1. **Repository** (`ReportRepository`): Queries analíticas agregando totais por período (`dataPedido`), por forma de pagamento (`FormaPagamento`) e por categoria de item.
  2. **Service** (`ReportService`): Processamento dos indicadores financeiros (ticket médio, itens mais vendidos, faturamento total).
  3. **Controller** (`ReportController`) e **Routes** (`report.routes.ts`): Endpoint `GET /relatorios/vendas`.
  4. **Segurança**: Protegida estritamente para `FINANCEIRO`, `PRESIDENCIA` e `TI`.
* **Critério de Aceitação**: Retorna resumo financeiro estruturado com suporte a filtros de data; diretores de outros setores (ex: Esportes) são bloqueados com `403 Forbidden`.

---

#### `TASK-051` — Exportação de Relatórios Financeiros para CSV
* **Objetivo**: Permitir o download de planilhas de prestação de contas para a tesouraria da atlética.
* **Entidades Afetadas**: `Compra`, `CompraItem`, `FormaPagamento`.
* **Requisitos**: RF14.
* **Passos de Execução**:
  1. **Service** (`ExportService`): Gerador de linhas formatadas em padrão CSV (delimitador ponto e vírgula, encoding UTF-8 com BOM para Excel).
  2. **Controller**: Endpoint `GET /relatorios/vendas/export` enviando os headers `Content-Type: text/csv` e `Content-Disposition: attachment; filename="relatorio-vendas.csv"`.
* **Critério de Aceitação**: Arquivo `.csv` baixado abre perfeitamente no Excel e LibreOffice com todos os registros e somatórios coerentes.

---

### Fase 6: Módulo Esportivo e Carteirinha de Sócio

#### `TASK-060` — Gestão de Treinos e Campeonatos
* **Objetivo**: Publicação da grade de treinos esportivos e jogos da atlética no campus.
* **Entidades Afetadas**: `Evento` (tipo esportivo), `Local`.
* **Requisitos**: RF17, RF18.
* **Passos de Execução**:
  1. Reutilizar as camadas de `Evento` e `Local` aplicando a regra de permissão do setor de `ESPORTES`.
  2. Criar endpoints públicos de listagem rápida para consulta de locais de quadra e horários pelos atletas universitários.
* **Critério de Aceitação**: Diretor de Esportes consegue cadastrar treinos sem interferir nos eventos de festas do setor Comercial.

---

#### `TASK-061` — Emissão e Validação da Carteirinha Digital
* **Objetivo**: Exibir a identificação digital do estudante associado e permitir a conferência na portaria via QR Code.
* **Entidades Afetadas**: `Usuario`, `Cargo`.
* **Requisitos**: RF16.
* **Passos de Execução**:
  1. **Service** (`CarteirinhaService`): Geração de payload assinado digitalmente com dados do associado (`idUsuario`, `matricula`, `cpf`).
  2. **Controller** e **Routes**:
     - `GET /usuarios/carteirinha` (Usuário logado visualiza seu cartão digital).
     - `POST /usuarios/carteirinha/validar` (Diretoria escaneia na portaria e valida autenticidade).
* **Critério de Aceitação**: Leitura do QR Code confirma instantaneamente se a matrícula e os dados do usuário pertencem a um associado cadastrado no banco.

---

### Fase 7: Testes Integrados e Homologação Final

#### `TASK-070` — Bateria de Testes Automatizados (Integração e Permissões)
* **Objetivo**: Validar a estabilidade do sistema e assegurar que as fronteiras entre setores não sejam violadas.
* **Entidades Afetadas**: Todas as 12 tabelas.
* **Requisitos**: RNF01, RNF02, RNF03.
* **Passos de Execução**:
  1. Testes de fluxo de compra completo: criação de usuário $\rightarrow$ cadastro de itens $\rightarrow$ checkout $\rightarrow$ baixa de retirada presencial.
  2. Testes de matriz de permissões (RBAC):
     - Diretor de Esportes tentando alterar preços de Vestuário $\rightarrow$ Esperado: `403 Forbidden`.
     - Diretor Comercial tentando emitir relatório financeiro $\rightarrow$ Esperado: `403 Forbidden`.
     - Presidência e TI executando qualquer operação $\rightarrow$ Esperado: `200 OK`.
  3. Testes de integridade referencial: deleção em cascata controlada (`ON DELETE CASCADE` de `CompraItem` ao excluir `Compra`; `ON DELETE SET NULL` de `idCargo` ao excluir `Cargo`).
* **Critério de Aceitação**: 100% dos testes da suíte passando com sucesso e conformidade total com os documentos PRD, DESIGN e SPEC.

---

## 4. Definição de Pronto (Definition of Done - DoD)

Uma tarefa só é considerada concluída quando atender a todos os critérios abaixo:
1. **Código em Camadas**: Estrutura segue o padrão `Routes` $\rightarrow$ `MiddleWare` $\rightarrow$ `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Model`.
2. **Tipagem Estrita**: Nenhum uso de `any` no TypeScript; todas as entradas validadas via esquemas `Zod`.
3. **Persistência Conforme DDL**: Respeito estrito aos nomes de tabelas e colunas de `logico_corrigido.sql`.
4. **Proteção por Setor**: Rota devidamente decorada com `ensureAuthenticated` e `ensureSector` quando aplicável.
5. **Sem Erros de Build**: Compilação TypeScript limpa com `npm run build`.
