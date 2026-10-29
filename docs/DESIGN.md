# DESIGN — Arquitetura e Engenharia de Sistema
## AAACA (Associação Atlética Acadêmica Campus Araranguá — UFSC)

---

| Metadado | Detalhe |
| :--- | :--- |
| **Projeto** | Sistema de E-commerce, Gestão de Sócios, Estoque e Vendas (AAACA) |
| **Documento** | Architecture & System Design Document (`DESIGN.md`) |
| **Modelos de Origem** | `logico_corrigido.sql`, `Fluxo_Arquitetura_Backend_Sistema_AAACA.brM3`, `Conceitual.brM3` |
| **Padrão Arquitetural** | Backend em Camadas com Middleware de Permissões + Banco Relacional PostgreSQL |
| **Versão** | 2.0.0 (Congelado) |

---

## 1. Visão Geral da Arquitetura do Backend

O fluxo de processamento de requisições no backend do sistema segue a modelagem formal de arquitetura definida no diagrama **`Fluxo_Arquitetura_Backend_Sistema_AAACA.brM3`**:

```mermaid
flowchart TD
    User(["👤 Usuário (Cliente Externo)"]) --> Routes["1. Routes<br/>(Torna as funções acessíveis externamente)"]
    Routes --> Middleware["2. Middleware<br/>(Lida com as permissões no sistema)"]
    
    Middleware -- "Possui Permissão?" --> PermCheck{"Validação"}
    PermCheck -- "Não" --> Denied["❌ 403 Forbidden"]
    PermCheck -- "Sim" --> Controller["3. Controller<br/>(Recebe os campos e aponta para as funções lógicas)"]
    
    Controller --> Service["4. Service<br/>(Onde toda a lógica bruta e regras acontecem)"]
    Service --> Repository["5. Repository<br/>(Comunicação com banco: queries, CRUD)"]
    Repository --> Model["6. Model<br/>(Padroniza, estrutura e transporta os dados)"]
    Model --> DB[(7. Banco de Dados PostgreSQL)]

    DB -. "Retorna registros" .-> Repository
    Repository -. "Dados persistidos" .-> Service
    Service -. "Dados tratados" .-> Controller
    Controller -. "Resposta HTTP tratada" .-> User
```

### Especificação de Responsabilidades das Camadas:

| Camada | Função Oficial no Projeto |
| :--- | :--- |
| **`Routes`** | Faz com que as funções dentro do sistema sejam acessíveis pelo usuário em ambientes externos através dos métodos HTTP (GET, POST, PUT, DELETE, PATCH). |
| **`MiddleWare`** | Camada específica responsável por lidar com as permissões dentro do sistema. Inspeciona o cargo e o setor do usuário autenticado: caso possua a devida permissão, o fluxo segue adiante; caso contrário, a requisição é interceptada. |
| **`Controller`** | Responsável por receber os campos de informação da requisição (body, params, query) e apontar para as funções lógicas no Service, recebendo de volta os dados tratados para montar a resposta HTTP. Não contém regras de negócio. |
| **`Service`** | Onde toda a lógica bruta acontece. Executa validações de regras de negócio, cálculos de valores, composição de compras, restrições e orquestração de operações. Não realiza requisições HTTP nem lida com objetos `req`/`res`. |
| **`Repository`** | Onde toda a comunicação com o banco de dados é desenvolvida. Concentra as queries SQL e métodos de CRUD (CREATE, READ, UPDATE, DELETE). Apenas recebe dados e joga para o banco de dados ou retorna os dados de dentro dele. Não realiza chamadas HTTP. |
| **`Model`** | Mantém estruturados e padronizados todos os dados. Dita como os dados são organizados e mapeados para as tabelas do PostgreSQL. Não realiza validações complexas nem chamadas HTTP. |
| **`Banco de Dados`** | Sistema Gerenciador de Banco de Dados Relacional (PostgreSQL), executando o esquema físico gerado pelo script DDL. |

---

## 2. Diagrama Entidade-Relacionamento (ERD Oficial)

Este diagrama reflete com fidelidade de 100% o modelo de dados definido em **`logico_corrigido.sql`**:

```mermaid
erDiagram
    CARGO ||--o{ USUARIO : "atribuido_a"
    USUARIO ||--o{ COMPRA : "realiza"
    
    COMPRA ||--|{ COMPRA_ITEM : "possui"
    COMPRA ||--|{ COMPRA_FORMA_PAGAMENTO : "pago_com"
    FORMA_PAGAMENTO ||--o{ COMPRA_FORMA_PAGAMENTO : "utilizada_em"

    VESTUARIO ||--o{ COMPRA_ITEM : "item_vestuario"
    OBJETO ||--o{ COMPRA_ITEM : "item_objeto"
    INGRESSO ||--o{ COMPRA_ITEM : "item_ingresso"

    EVENTO ||--|{ INGRESSO : "oferece"
    LOCAL ||--o{ EVENTO : "sedia"
    
    EVENTO ||--|{ EVENTO_DJ : "contrata"
    DJ ||--|{ EVENTO_DJ : "toca_em"

    CARGO {
        int idCargo PK
        string nome
        string setor
        string descricao
        string permissoes
    }

    USUARIO {
        int idUsuario PK
        int idCargo FK
        string nome
        string email UK
        string cpf UK
        string matricula UK
        string endereco
        string telefone
        string curso
        date dtNascimento
        boolean gestao
    }

    LOCAL {
        int idLocal PK
        string nome
        string rua
        int numero
        string bairro
        string cidade
        string estado
        string telefone
    }

    EVENTO {
        int idEvento PK
        int idLocal FK
        string nome
        string descricao
        date dataEvento
        time horario
    }

    DJ {
        int idDJ PK
        string nome
        string telefone
        string estilo
        string spotify
        string instagram
        string email
    }

    EVENTO_DJ {
        int idEvento PK, FK
        int idDJ PK, FK
    }

    INGRESSO {
        int idIngresso PK
        int idEvento FK
        string nome
        string tipo
        decimal valor
    }

    VESTUARIO {
        int idVestuario PK
        string nome
        string tamanho
        decimal valor
        string cor
        string categoria
        string customizacao
    }

    OBJETO {
        int idObjeto PK
        string nome
        string cor
        string customizacao
        decimal valor
    }

    FORMA_PAGAMENTO {
        int idFormaPagamento PK
        string descricao
    }

    COMPRA {
        int idCompra PK
        int idUsuario FK
        date dataPedido
        decimal valorTotal
        date dataRetirada
    }

    COMPRA_ITEM {
        int idCompraItem PK
        int idCompra FK
        int idVestuario FK
        int idObjeto FK
        int idIngresso FK
        int quantidade
        decimal valorUnitario
        string descricao
    }

    COMPRA_FORMA_PAGAMENTO {
        int idCompraFormaPagamento PK
        int idCompra FK
        int idFormaPagamento FK
        decimal valorPago
    }
```

---

## 3. Fluxos de Negócio e Sequência

### 3.1 Fluxo de Realização de Compra (Checkout de Múltiplos Itens)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Usuário
    participant Route as Routes
    participant Mid as Middleware (Auth)
    participant Ctrl as CompraController
    participant Svc as CompraService
    participant Repo as CompraRepository
    participant DB as PostgreSQL

    Cliente->>Route: POST /api/v1/compras (itens, pagamentos)
    Route->>Mid: Intercepta e valida token JWT do Usuário
    Mid->>Ctrl: Encaminha requisição autenticada
    Ctrl->>Svc: criarCompra(idUsuario, itens, formasPagamento)
    
    Note over Svc: Valida existência dos itens<br/>(Vestuário, Objeto ou Ingresso)<br/>Calcula valorTotal e valida soma de valorPago
    
    Svc->>Repo: registrarCompra(compraData)
    Repo->>DB: Inicia Transação:
    Repo->>DB: INSERT INTO Compra (idUsuario, dataPedido, valorTotal)
    Repo->>DB: INSERT INTO CompraItem (idCompra, idVestuario/idObjeto/idIngresso...)
    Repo->>DB: INSERT INTO CompraFormaPagamento (idCompra, idFormaPagamento, valorPago)
    DB-->>Repo: Transação Confirmada (Commit)
    Repo-->>Svc: Retorna objeto Compra consolidado
    Svc-->>Ctrl: DTO de Compra com status criado
    Ctrl-->>Cliente: 201 Created (JSON com idCompra e detalhes)
```

### 3.2 Fluxo de Entrega e Retirada Presencial (`dataRetirada`)

```mermaid
sequenceDiagram
    autonumber
    actor Diretor as Diretor Comercial / Produto
    participant Route as Routes
    participant Mid as Middleware (Permissão: COMERCIAL_PRODUTO ou TI)
    participant Ctrl as CompraController
    participant Svc as CompraService
    participant Repo as CompraRepository
    participant DB as PostgreSQL

    Diretor->>Route: PATCH /api/v1/compras/:id/retirada
    Route->>Mid: Verifica Cargo e Setor do Usuário logado
    Note over Mid: Consulta se o idCargo pertence ao setor Comercial ou Presidência/TI
    Mid->>Ctrl: Permissão Concedida!
    Ctrl->>Svc: confirmarRetirada(idCompra, dataRetirada)
    Svc->>Repo: atualizarDataRetirada(idCompra, dataAtual)
    Repo->>DB: UPDATE Compra SET dataRetirada = CURRENT_DATE WHERE idCompra = :id
    DB-->>Repo: 1 linha atualizada
    Repo-->>Svc: Compra atualizada
    Svc-->>Ctrl: Confirmação de baixa
    Ctrl-->>Diretor: 200 OK (Retirada registrada com sucesso)
```

---

## 4. Arquitetura de Permissões por Setor e Cargo

A validação de permissões é realizada pela camada de **`MiddleWare`**:

1. Ao efetuar login, o sistema busca o registro em **`Usuario`** e seu respectivo **`Cargo`**.
2. O payload do token JWT contém:
   ```json
   {
     "idUsuario": 10,
     "nome": "Lucas Silveira",
     "gestao": true,
     "idCargo": 2,
     "setor": "COMERCIAL_PRODUTO",
     "permissoes": "PRODUTOS_WRITE,EVENTOS_WRITE,RETIRADA_WRITE"
   }
   ```
3. O middleware avalia a restrição de rota:
   ```typescript
   // Exemplo de aplicação na camada Routes:
   router.post(
     '/vestuarios',
     ensureAuthenticated,
     ensureSector(['COMERCIAL_PRODUTO', 'PRESIDENCIA', 'TI']),
     vestuarioController.create
   );
   ```

Se o usuário for aluno comum (`gestao = false`, `idCargo = null`), qualquer tentativa de acesso administrativo é rejeitada no Middleware com HTTP `403 Forbidden`.
