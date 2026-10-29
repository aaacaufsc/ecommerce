# PRD — Sistema de E-commerce, Gestão de Sócios, Estoque e Vendas
## Associação Atlética Acadêmica Campus Araranguá (AAACA — UFSC)

---

| Informação | Detalhe |
| :--- | :--- |
| **Projeto** | Plataforma Web de Vendas de Roupas, Gestão de Sócios, Eventos e Estoque |
| **Organização** | Associação Atlética Acadêmica Campus Araranguá (AAACA) — UFSC |
| **Versão** | 2.0.0 (Alinhado aos Modelos Lógico e Conceitual Oficiais) |
| **Status** | Aprovado e Congelado |
| **Metodologia** | Spec-Driven Development (SDD) |

---

## 1. Visão Geral e Justificativa

### 1.1 Contexto
A Associação Atlética Acadêmica Campus Araranguá (AAACA) representa os estudantes da UFSC no campus Araranguá, promovendo a integração universitária, competições desportivas, realização de eventos festivos e o fortalecimento da marca da atlética através da venda de produtos oficiais (vestuário e objetos personalizados) e planos de associação.

### 1.2 O Problema
A gestão da AAACA enfrentava dificuldades operacionais no controle de vendas e estoque, emissão de ingressos para festas, controle de atrações (DJs), registros de locais de eventos e delegação de funções entre diretores. Processos dispersos em planilhas causavam:
- Erros no controle de vestuário por tamanho e cor.
- Dificuldade na conciliação de diferentes formas de pagamento.
- Falta de controle preciso sobre a data de retirada de pedidos na lojinha física.
- Dificuldade em restringir o acesso administrativo de acordo com o cargo e setor de cada membro da gestão.

### 1.3 A Solução
Desenvolver uma plataforma web integrada com arquitetura estrita em camadas (**Routes $\rightarrow$ Middleware $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Model $\rightarrow$ Banco de Dados**), fundamentada na modelagem relacional homologada:
1. **Catálogo Especializado de Produtos**:
   - **Vestuário**: Venda de roupas oficiais com controle de tamanho, cor, categoria e customização.
   - **Objetos**: Acessórios, canecas e brindes com variações de cor e customização.
   - **Ingressos**: Venda de lotes vinculados a eventos com controle de tipo e valor.
2. **Gestão de Eventos, Locais e Atrações**:
   - Cadastro de locais com endereço completo e telefone.
   - Cadastro de eventos com data, horário e descrição.
   - Mapeamento e contratação de DJs com estilos musicais e redes sociais (Spotify, Instagram).
3. **Módulo de Compras e Formas de Pagamento**:
   - Carrinho unificado suportando múltiplos itens (Vestuário, Objeto e Ingresso).
   - Suporte a múltiplas formas de pagamento com controle de valor pago.
   - Controle de entrega presencial via registro de data de retirada (`dataRetirada`).
4. **Governança e Permissões por Cargo/Setor**:
   - Associação de usuários a cargos da gestão (`Cargo` e flag `gestao`), com controle de permissões por setor.

---

## 2. Estrutura Organizacional e Matriz de Permissões (RBAC por Cargo e Setor)

O controle de acesso é baseado na tabela **`Cargo`** (`setor` e `permissoes`) e no atributo **`gestao`** da tabela **`Usuario`**:

### 2.1 Setores da AAACA e Cargos da Gestão

| Setor | Cargos Típicos | Escopo de Atuação e Responsabilidades |
| :--- | :--- | :--- |
| **Presidência & TI** | Presidente, Vice-Presidente, Diretor de TI | **Acesso Total**: Visualizar, editar e excluir qualquer dado no sistema (cargos, usuários, compras, produtos, eventos, locais e DJs). |
| **Gestão de Pessoas** | Diretor de Gestão de Pessoas / RH | **Governança de Membros**: Vincular usuários a cargos, alterar setores da diretoria e gerenciar o cadastro de membros da gestão (`gestao = true`). |
| **Esportes** | Diretor de Esportes, Coordenador de Modalidades | **Gestão Esportiva**: Gerenciamento de treinos semanais, campeonatos e locais de jogos. |
| **Financeiro** | Diretor Financeiro, Tesoureiro | **Controladoria**: Visualização de compras, conciliação de formas de pagamento (`CompraFormaPagamento`), relatórios de faturamento com filtros e controle de valores totais. |
| **Comercial — Produto** | Diretor de Produto, Coordenador de Loja | **E-commerce & Lojinha**: Cadastrar e alterar preços de vestuário e objetos, gerenciar tamanhos, cores e customizações, e cadastrar eventos festivos com seus respectivos ingressos. |
| **Comercial — Marketing** | Diretor de Marketing, Social Media | **Comunicação & Atrações**: Gestão e vínculo de DJs (`EventoDJ`) aos eventos, links de Spotify/Instagram e divulgação geral. |
| **Sócio / Usuário Geral** | Membro Universitário, Aluno Comum | **Cliente / Associado**: Cadastro pessoal completo, realização de compras, escolha de formas de pagamento e acompanhamento da data de retirada de seus pedidos. |

---

### 2.2 Matriz de Acesso por Módulo e Entidade

| Módulo / Tabela | Presidência / TI | Gestão de Pessoas | Esportes | Financeiro | Comercial (Produto) | Comercial (Marketing) | Usuário Comum |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`Cargo` / Permissões** | Total | Total | Bloqueado | Bloqueado | Bloqueado | Bloqueado | Bloqueado |
| **`Usuario` (Vínculo de Cargo)** | Total | Total | Bloqueado | Bloqueado | Bloqueado | Bloqueado | Edição Própria |
| **`Vestuario` & `Objeto`** | Total | Leitura | Bloqueado | Leitura | Total | Leitura | Visualização/Compra |
| **`Evento` & `Local`** | Total | Bloqueado | Eventos Esport. | Leitura | Eventos Festas | Leitura | Visualização |
| **`DJ` & `EventoDJ`** | Total | Bloqueado | Bloqueado | Leitura | Total | Total | Visualização |
| **`Ingresso`** | Total | Bloqueado | Bloqueado | Leitura | Total | Leitura | Visualização/Compra |
| **`Compra` & `CompraItem`** | Total | Bloqueado | Bloqueado | Total (Relatórios) | Total (Baixa Retirada) | Bloqueado | Suas Compras |
| **`FormaPagamento`** | Total | Bloqueado | Bloqueado | Total | Bloqueado | Bloqueado | Apenas Seleção |

---

## 3. Metas do MVP (In-Scope) e Não-Metas (Out-of-Scope)

### 3.1 O que está no escopo (In-Scope)
- [x] Cadastro completo de usuários com dados acadêmicos (`matricula`, `curso`, `dtNascimento`, `cpf`, `endereco`, `telefone`).
- [x] Sistema de cargos da gestão (`Cargo`: nome, setor, descrição, permissões) vinculado a `Usuario`.
- [x] Catálogo e gestão de produtos dividido em **Vestuário** (tamanho, cor, categoria, customização) e **Objeto** (cor, customização).
- [x] Gestão completa de **Eventos**, com vinculação a **Local** (endereço completo e telefone) e atrações musicais (**DJ** com Spotify e Instagram).
- [x] Venda de **Ingressos** associados diretamente ao evento correspondente.
- [x] Sistema de checkout unificado com **Compra**, múltiplos **CompraItem** e suporte a **CompraFormaPagamento**.
- [x] Registro e controle de entrega de produtos com campo **`dataRetirada`**.
- [x] Painel administrativo modular com permissões verificadas em Middleware com base no cargo e setor do usuário.

### 3.2 O que NÃO está no escopo do MVP (Out-of-Scope)
- [ ] Envio por Correios/transportadora (foco exclusivo na retirada física registrada em `dataRetirada`).
- [ ] Integração com gateway externo não-homologado (todas as transações alimentam as tabelas relacionais de compra e pagamento).
- [ ] Aplicativo nativo em lojas de apps (aplicação web responsiva).

---

## 4. Requisitos Funcionais Detalhados

### 4.1 Módulo: Usuários, Cargos e Gestão (RF1, RF2, RF3, RF13)

#### RF01 — Cadastro de Usuário
- **Descrição**: Criação de conta de usuário com todos os atributos da entidade `Usuario`:
  - Nome completo, E-mail (único), CPF (único), Matrícula (única), Endereço, Telefone, Curso e Data de Nascimento (`dtNascimento`).
  - O campo `gestao` inicia como `FALSE` e `idCargo` inicia como `NULL`.

#### RF02 — Gestão de Cargos e Alocação de Membros
- **Descrição**: Criação e edição de registros na tabela `Cargo` (nome, setor, descrição, permissões) e vínculo de um usuário da gestão (`Usuario.idCargo` e `Usuario.gestao = TRUE`).
- **Permissão de Acesso**: Setor de **Gestão de Pessoas**, **Presidência** e **TI**.

#### RF03 — Pesquisa e Listagem de Usuários por Filtros
- **Descrição**: Busca de usuários por termo textual (nome, e-mail, CPF, matrícula, curso) e filtros por cargo ou status de gestão.

#### RF13 — Controle de Permissões via Middleware
- **Descrição**: O sistema intercepta requisições HTTP na camada de **Middleware**, verificando se o `idCargo` do usuário autenticado confere as permissões necessárias para o endpoint solicitado. Caso contrário, retorna HTTP `403 Forbidden`.

---

### 4.2 Módulo: Catálogo de Vestuário e Objetos (RF4, RF5, RF6)

#### RF04 — Cadastro de Vestuário e Objetos
- **Descrição**:
  - **Vestuário**: Cadastro com nome, tamanho (PP, P, M, G, GG, XGG), valor, cor, categoria (Camiseta, Moletom, Short, Regata) e opção de customização (ex: nome/número nas costas).
  - **Objeto**: Cadastro com nome, cor, customização e valor.
- **Permissão de Acesso**: **Comercial (Produto)**, **Presidência** e **TI**.

#### RF05 e RF06 — Listagem e Pesquisa de Produtos com Filtros
- **Descrição**: Exibição da loja virtual para usuários e listagem administrativa com filtros por categoria, tamanho, cor e faixa de valor.

---

### 4.3 Módulo: Eventos, Locais, DJs e Ingressos (RF10, RF11, RF12)

#### RF10.1 — Cadastro de Locais (`Local`)
- **Descrição**: Cadastro de locais de eventos esportivos e festas com nome, rua, número, bairro, cidade, estado e telefone de contato.

#### RF10.2 — Cadastro de Atrações Musicais (`DJ`) e Vínculo a Eventos (`EventoDJ`)
- **Descrição**: Cadastro de DJs com nome, telefone, estilo musical, link do Spotify, perfil do Instagram e e-mail. Vínculo N:M entre `Evento` e `DJ` na tabela `EventoDJ`.
- **Permissão de Acesso**: **Comercial (Marketing/Produto)**, **Presidência** e **TI**.

#### RF10.3 — Cadastro de Eventos e Ingressos (`Evento` e `Ingresso`)
- **Descrição**:
  - Cadastro de eventos com nome, descrição, data (`dataEvento`), horário e vínculo ao `idLocal`.
  - Cadastro de ingressos vinculados ao evento (`idEvento`), com nome do lote (ex: Lote Promocional, 1º Lote), tipo (Geral, VIP, Universitário) e valor.
- **Permissão de Acesso**: **Comercial (Produto)** para festas, **Esportes** para eventos esportivos, **Presidência** e **TI** para ambos.

---

### 4.4 Módulo: Compras, Pagamentos e Retirada (RF7, RF8, RF9)

#### RF07 — Realização de Compra (`Compra` e `CompraItem`)
- **Descrição**: O usuário adiciona itens ao carrinho, que são persistidos na tabela `Compra` (com `dataPedido`, `valorTotal` e `idUsuario`) e detalhados na tabela `CompraItem`.
- **Regras de Negócio**:
  - Um `CompraItem` pode referenciar `idVestuario`, `idObjeto` ou `idIngresso` (com quantidade, valor unitário e descrição).
  - A compra pode ser quitada através de uma ou mais formas de pagamento na tabela `CompraFormaPagamento` (vinculada a `FormaPagamento`).

#### RF07.1 — Controle de Retirada Presencial (`dataRetirada`)
- **Descrição**: Quando o comprador comparece à lojinha da atlética no campus para retirar suas roupas ou objetos comprados, a diretoria registra a entrega preenchendo a coluna `dataRetirada` da tabela `Compra`.
- **Permissão de Acesso**: **Comercial (Produto)**, **Presidência** e **TI**.

#### RF08 e RF09 — Listagem e Pesquisa de Vendas
- **Descrição**: Visualização do histórico pessoal de compras pelo usuário e painel administrativo para a diretoria, com filtros por período de `dataPedido`, status de retirada (`dataRetirada IS NOT NULL` / `IS NULL`) e usuário.

---

### 4.5 Módulo: Relatórios Financeiros e Operacionais (RF14, RF15)

#### RF14 — Relatórios de Vendas e Faturamento
- **Descrição**: Consolidação de valores vendidos a partir da tabela `Compra`, com detalhamento de itens por `CompraItem` e valores pagos por `CompraFormaPagamento`.
- **Permissão de Acesso**: Exclusivo para **Financeiro**, **Presidência** e **TI**.
- **Critérios de Aceitação**:
  - [ ] Filtro por intervalo de `dataPedido`.
  - [ ] Filtro por tipo de produto (Vestuário vs Objeto vs Ingresso).
  - [ ] Filtro por forma de pagamento (`FormaPagamento`).
  - [ ] Exportação dos relatórios para planilha (.csv).

---

## 5. Requisitos Não-Funcionais (RNF)

| Identificador | Requisito | Detalhes Técnicos |
| :--- | :--- | :--- |
| **RNF01** | **Arquitetura Estrita em Camadas** | O backend segue rigorosamente o fluxo: `Routes` $\rightarrow$ `MiddleWare` $\rightarrow$ `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Model` $\rightarrow$ `Banco de Dados`. |
| **RNF02** | **Conformidade Relacional** | O banco de dados PostgreSQL deve implementar fielmente o script DDL `logico_corrigido.sql`, respeitando todas as chaves primárias, estrangeiras e restrições de integridade referencial. |
| **RNF03** | **Segurança & LGPD** | Proteção dos dados cadastrais (`cpf`, `dtNascimento`, `telefone`, `endereco`) de acordo com a LGPD; senhas com hash forte (bcrypt/argon2). |
| **RNF04** | **Responsividade** | Interface web totalmente funcional em navegadores de smartphones para permitir a consulta de compras e registro de `dataRetirada` na lojinha física. |
