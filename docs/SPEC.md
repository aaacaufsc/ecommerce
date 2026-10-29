# SPEC — Especificação Técnica de Baixo Nível
## AAACA (Associação Atlética Acadêmica Campus Araranguá — UFSC)

---

| Metadado | Detalhe |
| :--- | :--- |
| **Projeto** | Sistema de E-commerce, Gestão de Sócios, Estoque e Vendas (AAACA) |
| **Documento** | Low-Level Technical Specification (`SPEC.md`) |
| **Modelos de Origem** | `logico_corrigido.sql`, `Fluxo_Arquitetura_Backend_Sistema_AAACA.brM3` |
| **Objetivo** | Definir tipos exatos, esquema relacional, contratos de API e algoritmos de código |
| **Versão** | 2.0.0 (Congelado) |

---

## 1. Esquema Relacional de Dados Completo (Prisma Schema)

O esquema relacional a seguir é o mapeamento fiel do script DDL `logico_corrigido.sql` para o **Prisma ORM** com banco de dados **PostgreSQL**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// TABELAS BASE: CARGO E USUÁRIO (GESTAO)
// -------------------------------------------------------------

model Cargo {
  idCargo    Int       @id @default(autoincrement()) @map("idcargo")
  nome       String    @db.VarChar(50)
  setor      String?   @db.VarChar(50)
  descricao  String?   @db.VarChar(255)
  permissoes String?   @db.VarChar(255)

  usuarios   Usuario[]

  @@map("cargo")
}

model Usuario {
  idUsuario    Int       @id @default(autoincrement()) @map("idusuario")
  idCargo      Int?      @map("idcargo")
  nome         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(100)
  cpf          String    @unique @db.VarChar(11)
  matricula    String?   @unique @db.VarChar(20)
  endereco     String?   @db.VarChar(255)
  telefone     String?   @db.VarChar(15)
  curso        String?   @db.VarChar(50)
  dtNascimento DateTime? @map("dtnascimento") @db.Date
  gestao       Boolean   @default(false)
  passwordHash String    @default("") @map("password_hash") @db.VarChar(255)

  cargo        Cargo?    @relation(fields: [idCargo], references: [idCargo], onDelete: SetNull)
  compras      Compra[]

  @@map("usuario")
}

// -------------------------------------------------------------
// TABELAS DE EVENTOS, LOCAIS E ATRAÇÕES (DJ)
// -------------------------------------------------------------

model Local {
  idLocal  Int      @id @default(autoincrement()) @map("idlocal")
  nome     String   @db.VarChar(100)
  rua      String?  @db.VarChar(150)
  numero   Int?
  bairro   String?  @db.VarChar(50)
  cidade   String?  @db.VarChar(50)
  estado   String?  @db.VarChar(2)
  telefone String?  @db.VarChar(15)

  eventos  Evento[]

  @@map("local")
}

model Evento {
  idEvento   Int        @id @default(autoincrement()) @map("idevento")
  idLocal    Int?       @map("idlocal")
  nome       String     @db.VarChar(100)
  descricao  String?    @db.VarChar(255)
  dataEvento DateTime   @map("dataevento") @db.Date
  horario    DateTime?  @db.Time(6)

  local      Local?     @relation(fields: [idLocal], references: [idLocal], onDelete: SetNull)
  ingressos  Ingresso[]
  eventoDjs  EventoDJ[]

  @@map("evento")
}

model DJ {
  idDJ      Int        @id @default(autoincrement()) @map("iddj")
  nome      String     @db.VarChar(100)
  telefone  String?    @db.VarChar(15)
  estilo    String?    @db.VarChar(50)
  spotify   String?    @db.VarChar(255)
  instagram String?    @db.VarChar(100)
  email     String?    @db.VarChar(100)

  eventoDjs EventoDJ[]

  @@map("dj")
}

model EventoDJ {
  idEvento Int @map("idevento")
  idDJ     Int @map("iddj")

  evento   Evento @relation(fields: [idEvento], references: [idEvento], onDelete: Cascade)
  dj       DJ     @relation(fields: [idDJ], references: [idDJ], onDelete: Cascade)

  @@id([idEvento, idDJ])
  @@map("eventodj")
}

// -------------------------------------------------------------
// TABELAS DE PRODUTOS: INGRESSO, VESTUÁRIO E OBJETO
// -------------------------------------------------------------

model Ingresso {
  idIngresso  Int          @id @default(autoincrement()) @map("idingresso")
  idEvento    Int          @map("idevento")
  nome        String       @db.VarChar(100)
  tipo        String?      @db.VarChar(50)
  valor       Decimal      @db.Decimal(10, 2)

  evento      Evento       @relation(fields: [idEvento], references: [idEvento], onDelete: Cascade)
  compraItens CompraItem[]

  @@map("ingresso")
}

model Vestuario {
  idVestuario  Int          @id @default(autoincrement()) @map("idvestuario")
  nome         String       @db.VarChar(100)
  tamanho      String?      @db.VarChar(5)
  valor        Decimal      @db.Decimal(10, 2)
  cor          String?      @db.VarChar(30)
  categoria    String?      @db.VarChar(50)
  customizacao String?      @db.VarChar(255)

  compraItens  CompraItem[]

  @@map("vestuario")
}

model Objeto {
  idObjeto     Int          @id @default(autoincrement()) @map("idobjeto")
  nome         String       @db.VarChar(100)
  cor          String?      @db.VarChar(30)
  customizacao String?      @db.VarChar(255)
  valor        Decimal      @db.Decimal(10, 2)

  compraItens  CompraItem[]

  @@map("objeto")
}

// -------------------------------------------------------------
// TABELAS DE VENDAS E FORMAS DE PAGAMENTO
// -------------------------------------------------------------

model FormaPagamento {
  idFormaPagamento      Int                     @id @default(autoincrement()) @map("idformapagamento")
  descricao             String                  @db.VarChar(50)

  compraFormasPagamento CompraFormaPagamento[]

  @@map("formapagamento")
}

model Compra {
  idCompra              Int                     @id @default(autoincrement()) @map("idcompra")
  idUsuario             Int                     @map("idusuario")
  dataPedido            DateTime                @map("datapedido") @db.Date
  valorTotal            Decimal                 @map("valortotal") @db.Decimal(10, 2)
  dataRetirada          DateTime?               @map("dataretirada") @db.Date

  usuario               Usuario                 @relation(fields: [idUsuario], references: [idUsuario], onDelete: Restrict)
  itens                 CompraItem[]
  compraFormasPagamento CompraFormaPagamento[]

  @@map("compra")
}

model CompraItem {
  idCompraItem  Int        @id @default(autoincrement()) @map("idcompraitem")
  idCompra      Int        @map("idcompra")
  idVestuario   Int?       @map("idvestuario")
  idObjeto      Int?       @map("idobjeto")
  idIngresso    Int?       @map("idingresso")
  quantidade    Int        @default(1)
  valorUnitario Decimal    @map("valorunitario") @db.Decimal(10, 2)
  descricao     String?    @db.VarChar(255)

  compra        Compra     @relation(fields: [idCompra], references: [idCompra], onDelete: Cascade)
  vestuario     Vestuario? @relation(fields: [idVestuario], references: [idVestuario], onDelete: SetNull)
  objeto        Objeto?    @relation(fields: [idObjeto], references: [idObjeto], onDelete: SetNull)
  ingresso      Ingresso?  @relation(fields: [idIngresso], references: [idIngresso], onDelete: SetNull)

  @@map("compraitem")
}

model CompraFormaPagamento {
  idCompraFormaPagamento Int            @id @default(autoincrement()) @map("idcompraformapagamento")
  idCompra               Int            @map("idcompra")
  idFormaPagamento       Int            @map("idformapagamento")
  valorPago              Decimal?       @map("valorpago") @db.Decimal(10, 2)

  compra                 Compra         @relation(fields: [idCompra], references: [idCompra], onDelete: Cascade)
  formaPagamento         FormaPagamento @relation(fields: [idFormaPagamento], references: [idFormaPagamento], onDelete: Restrict)

  @@map("compraformapagamento")
}
```

---

## 2. Contratos de API REST (Endpoints Detalhados)

Prefixo Global: `/api/v1`  
Formato de dados: `Content-Type: application/json`

### 2.1 Módulo: Usuários, Autenticação e Gestão

#### `POST /auth/register`
* **Permissão**: Pública
* **Request Body**:
```json
{
  "nome": "Carlos Silva",
  "email": "carlos.silva@ufsc.br",
  "cpf": "12345678901",
  "matricula": "23101234",
  "endereco": "Rua Universitária, 150, Araranguá - SC",
  "telefone": "48999998888",
  "curso": "Engenharia de Computação",
  "dtNascimento": "2003-05-14",
  "password": "SenhaSegura123"
}
```
* **Response (201 Created)**: Retorna os dados do `Usuario` criado (sem expor o hash de senha) e o token JWT.

#### `PATCH /usuarios/:idUsuario/cargo`
* **Permissão**: Exclusivo para `GESTAO_PESSOAS`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "idCargo": 3,
  "gestao": true
}
```
* **Response (200 OK)**: Dados do usuário com o novo vínculo de cargo e flag de gestão ativada.

---

### 2.2 Módulo: Catálogo de Produtos (Vestuário e Objeto)

#### `POST /vestuarios`
* **Permissão**: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "nome": "Camiseta Oficial AAACA 2026",
  "tamanho": "M",
  "valor": 55.00,
  "cor": "Preto",
  "categoria": "CAMISETA",
  "customizacao": "Opcional: Nome e Número silkados nas costas"
}
```
* **Response (201 Created)**: Objeto `Vestuario` criado com `idVestuario`.

#### `POST /objetos`
* **Permissão**: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "nome": "Caneca de Alumínio 850ml com Tirante",
  "cor": "Dourado",
  "customizacao": "Brasão da AAACA gravado a laser",
  "valor": 45.00
}
```
* **Response (201 Created)**: Objeto `Objeto` criado com `idObjeto`.

---

### 2.3 Módulo: Eventos, Locais, DJs e Ingressos

#### `POST /locais`
* **Permissão**: `ESPORTES`, `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "nome": "Arena Araranguá Eventos",
  "rua": "Av. Beira Rio",
  "numero": 1200,
  "bairro": "Centro",
  "cidade": "Araranguá",
  "estado": "SC",
  "telefone": "4835240000"
}
```

#### `POST /djs`
* **Permissão**: `COMERCIAL_MARKETING`, `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "nome": "DJ Pantera",
  "telefone": "48988887777",
  "estilo": "Open Format / Funk",
  "spotify": "https://open.spotify.com/artist/example",
  "instagram": "@djpantera_oficial",
  "email": "contato@djpantera.com"
}
```

#### `POST /eventos`
* **Permissão**: `COMERCIAL_PRODUTO` (festas), `ESPORTES` (jogos), `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "idLocal": 1,
  "nome": "Calourada da Pantera 2026",
  "descricao": "A maior integração universitária do Sul Catarinense",
  "dataEvento": "2026-11-20",
  "horario": "22:00:00",
  "djsIds": [1, 2] // Insere automaticamente na tabela N:M EventoDJ
}
```

#### `POST /ingressos`
* **Permissão**: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "idEvento": 1,
  "nome": "Lote 1 - Estudante UFSC",
  "tipo": "GERAL",
  "valor": 30.00
}
```

---

### 2.4 Módulo: Compras, Pagamentos e Retirada Presencial

#### `POST /compras`
* **Permissão**: Autenticado (`Usuario`)
* **Request Body**:
```json
{
  "itens": [
    {
      "idVestuario": 1,
      "quantidade": 1,
      "valorUnitario": 55.00,
      "descricao": "Camiseta Tam M - Preto"
    },
    {
      "idObjeto": 2,
      "quantidade": 1,
      "valorUnitario": 45.00,
      "descricao": "Caneca com Tirante"
    },
    {
      "idIngresso": 1,
      "quantidade": 2,
      "valorUnitario": 30.00,
      "descricao": "Ingressos Calourada Lote 1"
    }
  ],
  "formasPagamento": [
    {
      "idFormaPagamento": 1, // Ex: PIX
      "valorPago": 160.00
    }
  ]
}
```
* **Response (201 Created)**:
```json
{
  "idCompra": 42,
  "idUsuario": 10,
  "dataPedido": "2026-10-29",
  "valorTotal": 160.00,
  "dataRetirada": null,
  "itensCount": 3
}
```

#### `PATCH /compras/:idCompra/retirada`
* **Permissão**: `COMERCIAL_PRODUTO`, `PRESIDENCIA`, `TI`
* **Request Body**:
```json
{
  "dataRetirada": "2026-10-29" // Se omitido, assume CURRENT_DATE no banco
}
```
* **Response (200 OK)**:
```json
{
  "idCompra": 42,
  "status": "RETIRADO",
  "dataRetirada": "2026-10-29"
}
```

---

## 3. Algoritmos de Baixo Nível

### 3.1 Validação e Consistência Transacional de Compra

```typescript
// Implementado na camada CompraService:
export async function processarNovaCompra(
  prismaTx: Prisma.TransactionClient,
  idUsuario: number,
  itensInput: Array<{
    idVestuario?: number;
    idObjeto?: number;
    idIngresso?: number;
    quantidade: number;
    valorUnitario: number;
    descricao?: string;
  }>,
  pagamentosInput: Array<{
    idFormaPagamento: number;
    valorPago: number;
  }>
) {
  // 1. Calcula o total da compra a partir dos itens
  let valorTotalCalculado = new Prisma.Decimal(0);
  for (const item of itensInput) {
    if (!item.idVestuario && !item.idObjeto && !item.idIngresso) {
      throw new AppError('O item deve referenciar um Vestuário, Objeto ou Ingresso.', 400);
    }
    const itemTotal = new Prisma.Decimal(item.valorUnitario).mul(item.quantidade);
    valorTotalCalculado = valorTotalCalculado.add(itemTotal);
  }

  // 2. Valida soma dos pagamentos
  let totalPago = new Prisma.Decimal(0);
  for (const pag of pagamentosInput) {
    totalPago = totalPago.add(new Prisma.Decimal(pag.valorPago));
  }

  if (!totalPago.equals(valorTotalCalculado)) {
    throw new AppError('A soma das formas de pagamento não coincide com o valor total dos itens.', 422);
  }

  // 3. Persistência atômica da Compra
  const compra = await prismaTx.compra.create({
    data: {
      idUsuario,
      dataPedido: new Date(),
      valorTotal: valorTotalCalculado,
      dataRetirada: null,
      itens: {
        create: itensInput.map((it) => ({
          idVestuario: it.idVestuario ?? null,
          idObjeto: it.idObjeto ?? null,
          idIngresso: it.idIngresso ?? null,
          quantidade: it.quantidade,
          valorUnitario: it.valorUnitario,
          descricao: it.descricao,
        })),
      },
      compraFormasPagamento: {
        create: pagamentosInput.map((pg) => ({
          idFormaPagamento: pg.idFormaPagamento,
          valorPago: pg.valorPago,
        })),
      },
    },
    include: {
      itens: true,
      compraFormasPagamento: true,
    },
  });

  return compra;
}
```

### 3.2 Validação de Permissões no Middleware (`ensureSector`)

```typescript
// Implementado na camada MiddleWare:
export function ensureSector(setoresPermitidos: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.setor;
    const isGestao = req.user?.gestao;

    // Presidência e TI possuem acesso total irrestrito
    if (userRole === 'PRESIDENCIA' || userRole === 'TI') {
      return next();
    }

    if (!isGestao || !userRole || !setoresPermitidos.includes(userRole)) {
      throw new AppError('Acesso negado para o seu cargo/setor atual.', 403);
    }

    return next();
  };
}
```

---

## 4. Estrutura Física do Projeto Backend

```
src/
├── config/                  # Conexão com PostgreSQL e variáveis de ambiente
├── models/                  # Tipagens estruturais e tipos do Prisma
├── repositories/            # Camada 5: Queries e persistência
│   ├── CargoRepository.ts
│   ├── UsuarioRepository.ts
│   ├── LocalRepository.ts
│   ├── EventoRepository.ts
│   ├── DJRepository.ts
│   ├── VestuarioRepository.ts
│   ├── ObjetoRepository.ts
│   ├── IngressoRepository.ts
│   ├── CompraRepository.ts
│   └── FormaPagamentoRepository.ts
├── services/                # Camada 4: Regras de negócio puras
│   ├── AuthService.ts
│   ├── UsuarioService.ts
│   ├── EventoService.ts
│   ├── ProdutoService.ts    # Vestuário e Objeto
│   └── CompraService.ts     # Checkout e Retirada
├── controllers/             # Camada 3: Adaptadores de requisição/resposta
│   ├── AuthController.ts
│   ├── UsuarioController.ts
│   ├── EventoController.ts
│   ├── ProdutoController.ts
│   └── CompraController.ts
├── middlewares/             # Camada 2: Permissões e autenticação
│   ├── ensureAuthenticated.ts
│   ├── ensureSector.ts
│   └── errorHandler.ts
├── routes/                  # Camada 1: Endpoints HTTP da API
│   ├── auth.routes.ts
│   ├── usuario.routes.ts
│   ├── evento.routes.ts
│   ├── produto.routes.ts
│   ├── compra.routes.ts
│   └── index.ts
└── app.ts                   # Boot do servidor Express/Fastify
```
