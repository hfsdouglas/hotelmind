# Tasks: Gestão de Parceiros Comerciais no Módulo Comercial

**Input**: Design documents from `/specs/024-commercial-partners/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/commercial_partners.md](./contracts/commercial_partners.md), [quickstart.md](./quickstart.md)

**Tests**: Testes automatizados incluídos para validação de entidades, use cases, rotas HTTP e páginas do frontend conforme diretrizes de Clean Architecture e testabilidade por design.

**Organization**: Tarefas agrupadas por histórias de usuário para entrega independente e validação incremental de cada fatia funcional.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tarefa paralelizada (arquivos distintos, sem dependências concorrentes)
- **[Story]**: História de usuário correspondente ([US1], [US2], [US3], [US4], [US5])
- Caminhos explícitos para cada arquivo no monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos compartilhados e criação do esquema de banco de dados

- [X] T001 [P] Criar contratos universais em `packages/.contracts/src/parceiros_comerciais.ts` com enums `TipoParceiro`, `TipoPessoa`, `ModeloTarifario`, `PoliticaFaturamento`, `StatusParceiro`, `TipoContatoParceiro` e interfaces `ParceiroComercial`, `ParceiroContatoItem`, `CreateParceiroComercialPayload`, `UpdateParceiroComercialPayload`, `UpdateStatusParceiroPayload`, `ParceiroComercialListParams`, `ParceiroComercialListResponse`, e exportar em `packages/.contracts/src/index.ts`.
- [X] T002 Adicionar modelos `ParceiroComercial` (com campos `tipo_parceiro VarChar(30)`, `tipo_pessoa Char(2)`, `razao_social VarChar(150)`, `nome_fantasia VarChar(150)?`, `documento VarChar(20)?`, `estrangeiro Boolean @default(false)`, `logradouro VarChar(120)?`, `numero VarChar(20)?`, `bairro VarChar(60)?`, `cidade VarChar(60)?`, `estado VarChar(2)?`, `cep VarChar(10)?`, `pais VarChar(50) @default("Brasil")`, `modelo_tarifario VarChar(20) @default("comissionada")`, `comissao_padrao Decimal(5,2) @default(0.00)`, `politica_faturamento VarChar(20) @default("prepago")`, `prazo_pagamento_dias Int @default(0)`, `limite_credito Decimal(12,2) @default(0.00)`, `allotment_quartos Int @default(0)`, `status VarChar(20) @default("ativo")`, `motivo_bloqueio Text?`, `observacoes Text?`, constraint `@@unique([hotel_id, documento])`) e `ParceiroContato` (`tipo_contato VarChar(20)`, `nome VarChar(100)`, `email VarChar(150)`, `telefone VarChar(30)`, `cargo VarChar(50)?`) no `packages/api/src/prisma/schema.prisma`.
- [X] T003 Gerar e executar migração Prisma em `packages/api/src/prisma/migrations/20261104200000_create_parceiros_comerciais/migration.sql` com as tabelas `parceiros_comerciais` e `parceiros_contatos`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entidades de domínio, classes de erro, repositórios e serviços base que suportam todas as histórias de usuário

**⚠️ CRITICAL**: Nenhuma história de usuário pode iniciar antes da conclusão desta fundação

- [X] T004 [P] Criar entidade de domínio e validações de negócio em `packages/api/src/core/entities/parceiro_comercial.ts` (validação de `tipo_parceiro`, regras de CPF com módulo 11 para PF, regras de CNPJ com módulo 11 para PJ, comissão entre 0.00% e 100.00%, limites não negativos) e classes de erro específicas (`ParceiroComercialNotFoundError`, `ParceiroComercialConflictError`, `ParceiroComercialValidationError`) em `packages/api/src/core/errors/parceiro_comercial_errors.ts`.
- [X] T005 [P] Definir interface `IParceiroComercialRepository` em `packages/api/src/core/repositories/parceiros_comerciais/parceiro_comercial_repository.ts` e implementar `InMemoryParceiroComercialRepository` para suporte a testes unitários em `packages/api/src/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository.ts`.
- [X] T006 Implementar repositório PostgreSQL Prisma em `packages/api/src/core/repositories/parceiros_comerciais/implementation/postgres_parceiro_comercial_repository.ts` com persistência atômica de dados cadastrais, endereço e contatos.
- [X] T007 [P] Implementar schemas de validação Zod derivados dos contratos em `packages/api/src/schemas/comercial/parceiros_schema.ts`.
- [X] T008 [P] Implementar serviço HTTP de frontend em `packages/web/src/api/parceiros_comerciais.service.ts` com métodos de listagem, consulta por ID, criação, edição, atualização de status e inativação/exclusão.
- [X] T009 Atualizar o seed de rotas do sistema em `packages/api/src/db/seeds/routes_seed.ts` adicionando `/comercial/parceiros/novo` e `/comercial/parceiros` sob o módulo 'Comercial' e mapear o ícone `Handshake` no `ICON_MAP` em `packages/web/src/components/layout/Sidebar.tsx`.

**Checkpoint**: Fundação completa e testada. Implementação das histórias pode prosseguir.

---

## Phase 3: User Story 1 - Cadastro de Novo Parceiro Comercial com Classificação e Endereço (Priority: P1) 🎯 MVP

**Goal**: Permitir que gerentes comerciais ou recepcionistas cadastrem um novo parceiro comercial com sua respectiva classificação (Agente Autônomo, Agência, Operadora, Clube ou Empresa Corporativa), validação formal de CPF/CNPJ, opção estrangeiro e endereço postal completo.

**Independent Test**: Acessar `/comercial/parceiros/novo`, selecionar o tipo de parceiro, preencher Razão Social, documento válido, endereço completo e salvar com sucesso, verificando a persistência no banco e prevenção de duplicidade de documento.

### Tests for User Story 1
- [X] T010 [P] [US1] Criar testes unitários para criação de parceiro comercial e validação de CPF/CNPJ em `packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts`.
- [X] T011 [P] [US1] Criar testes de rota HTTP para `POST /comercial/parceiros` com Fastify `inject` em `packages/api/src/routes/comercial/parceiros_routes.spec.ts`.

### Implementation for User Story 1
- [X] T012 [US1] Implementar caso de uso `CriarParceiroComercialUseCase` em `packages/api/src/core/usecases/parceiros_comerciais/criar_parceiro_comercial_use_case.ts` validando documento único por hotel e tipo de pessoa coerente.
- [X] T013 [US1] Implementar rota HTTP autenticada `POST /comercial/parceiros` em `packages/api/src/routes/comercial/parceiros_routes.ts` e registrar o plugin de rotas em `packages/api/src/plugins/fastify_routes.ts`.
- [X] T014 [US1] Criar componente de formulário base `ParceiroForm` contendo a seção de Tipo de Parceiro (com alternância dinâmica de PF/PJ), identificação fiscal (CPF/CNPJ/Estrangeiro) e seção de Endereço Completo em `packages/web/src/pages/app/comercial/parceiros/components/parceiro_form.tsx`.
- [X] T015 [US1] Desenvolver a página de novo parceiro em `packages/web/src/pages/app/comercial/parceiros/novo.tsx` e mapear a rota `/comercial/parceiros/novo` em `packages/web/src/routes.tsx`.

**Checkpoint**: User Story 1 (MVP) funcional e testável de ponta a ponta.

---

## Phase 4: User Story 2 - Definição de Regras Comerciais, Políticas de Faturamento e Comissões (Priority: P1)

**Goal**: Permitir configuração de modelo tarifário (Tarifa Net, Comissionada, Acordo), taxa de comissão padrão (0.00% a 100.00%), política de faturamento (Voucher, Faturado a prazo, Pré-pago), limite de crédito e cota de allotment.

**Independent Test**: Editar ou criar um parceiro definindo modelo comissionado a 12%, política faturada com limite de R$ 50.000,00 e allotment de 5 quartos, verificando a validação de intervalos e a persistência dos parâmetros.

### Tests for User Story 2
- [X] T016 [P] [US2] Adicionar testes unitários para regras comerciais e validação de limites de crédito e comissão em `packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts`.
- [X] T017 [P] [US2] Adicionar testes de rota HTTP para atualização de regras comerciais via `PUT /comercial/parceiros/:id` em `packages/api/src/routes/comercial/parceiros_routes.spec.ts`.

### Implementation for User Story 2
- [X] T018 [US2] Implementar caso de uso `EditarParceiroComercialUseCase` em `packages/api/src/core/usecases/parceiros_comerciais/editar_parceiro_comercial_use_case.ts` validando regras comerciais e consistência de políticas de crédito.
- [X] T019 [US2] Implementar rota HTTP autenticada `PUT /comercial/parceiros/:id` em `packages/api/src/routes/comercial/parceiros_routes.ts`.
- [X] T020 [US2] Criar seção de Regras Comerciais no formulário em `packages/web/src/pages/app/comercial/parceiros/components/regras_comerciais_form_section.tsx` com seletores de modelo tarifário, política de faturamento, input com máscara de percentual de comissão e limite de crédito.
- [X] T021 [US2] Desenvolver a página de edição de parceiro em `packages/web/src/pages/app/comercial/parceiros/[id]/editar.tsx` e mapear a rota `/comercial/parceiros/:id/editar` em `packages/web/src/routes.tsx`.

**Checkpoint**: User Stories 1 e 2 funcionam de forma integrada e independente.

---

## Phase 5: User Story 3 - Registro de Órgãos Reguladores e Credenciamento Turístico (Priority: P2)

**Goal**: Registrar e validar números de credenciamento oficial em órgãos do turismo (CADASTUR, código IATA/IATAN e Embratur) para fins de conformidade e auditoria de acordos.

**Independent Test**: Preencher códigos de CADASTUR e IATA em uma agência de viagens, salvar e confirmar que os códigos são preservados, exibidos na ficha e pesquisáveis na listagem.

### Tests for User Story 3
- [X] T022 [P] [US3] Criar testes unitários para persistência e validação de dados regulatórios em `packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts`.

### Implementation for User Story 3
- [X] T023 [US3] Atualizar schemas Zod e use cases garantindo sanitização e formatação dos campos `cadastur`, `codigo_iata` e `registro_embratur` em `packages/api/src/schemas/comercial/parceiros_schema.ts` e `packages/api/src/core/entities/parceiro_comercial.ts`.
- [X] T024 [US3] Adicionar bloco de Órgãos Reguladores na seção de identificação do componente `ParceiroForm` em `packages/web/src/pages/app/comercial/parceiros/components/parceiro_form.tsx`.

**Checkpoint**: Registros regulatórios operacionais e vinculados ao parceiro.

---

## Phase 6: User Story 4 - Gestão Distinta de Contatos Comerciais e Financeiros (Priority: P2)

**Goal**: Registrar contatos estruturados segregando a área Comercial (vendas e reservas) da área Financeira (faturamento e cobrança) para cada parceiro comercial.

**Independent Test**: Adicionar um contato comercial e um financeiro com nome, e-mail, telefone e cargo no mesmo parceiro, verificando sua exibição correta e capacidade de edição individual.

### Tests for User Story 4
- [X] T025 [P] [US4] Criar testes unitários para inclusão, remoção e substituição atômica de contatos vinculados ao parceiro em `packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts`.

### Implementation for User Story 4
- [X] T026 [US4] Implementar persistência relacional de contatos vinculados (`ParceiroContato`) no `PostgresParceiroComercialRepository` e no `InMemoryParceiroComercialRepository`.
- [X] T027 [US4] Desenvolver componente de contatos segregados em `packages/web/src/pages/app/comercial/parceiros/components/contatos_form_section.tsx` permitindo adicionar, editar e remover múltiplos contatos comerciais e financeiros com validação de e-mail e telefone.
- [X] T028 [US4] Integrar `ContatosFormSection` no formulário principal `ParceiroForm` em `packages/web/src/pages/app/comercial/parceiros/components/parceiro_form.tsx`.

**Checkpoint**: Gestão de contatos segregados operacional e integrada.

---

## Phase 7: User Story 5 - Consulta, Filtros, Busca e Gestão de Status dos Parceiros (Priority: P3)

**Goal**: Permitir consulta unificada com paginação, busca textual dinâmica (Razão Social, Nome Fantasia, Documento, CADASTUR), filtros por Tipo e Status, alteração de status (`ativo`, `inativo`, `bloqueado` com motivo) e inativação segura.

**Independent Test**: Acessar `/comercial/parceiros`, filtrar por tipo "Clube de Turismo / Férias", realizar busca por nome/CNPJ, alterar status para "Bloqueado" informando o motivo e verificar o badge visual correspondente.

### Tests for User Story 7
- [X] T029 [P] [US5] Criar testes unitários para os casos de uso de listagem com filtros, busca por ID, alteração de status e exclusão/inativação em `packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts`.
- [X] T030 [P] [US5] Criar testes de integração de rotas para `GET /comercial/parceiros`, `GET /comercial/parceiros/:id`, `PATCH /comercial/parceiros/:id/status` e `DELETE /comercial/parceiros/:id` em `packages/api/src/routes/comercial/parceiros_routes.spec.ts`.

### Implementation for User Story 7
- [X] T031 [P] [US5] Implementar caso de uso `ListarParceirosComerciaisUseCase` em `packages/api/src/core/usecases/parceiros_comerciais/listar_parceiros_comerciais_use_case.ts` com suporte a paginação, busca dinâmica e filtros.
- [X] T032 [P] [US5] Implementar casos de uso `BuscarParceiroComercialUseCase`, `AtualizarStatusParceiroUseCase` e `ExcluirParceiroComercialUseCase` em `packages/api/src/core/usecases/parceiros_comerciais/`.
- [X] T033 [US5] Implementar rotas HTTP `GET /comercial/parceiros`, `GET /comercial/parceiros/:id`, `PATCH /comercial/parceiros/:id/status` e `DELETE /comercial/parceiros/:id` em `packages/api/src/routes/comercial/parceiros_routes.ts`.
- [X] T034 [US5] Desenvolver a página de listagem de parceiros comerciais em `packages/web/src/pages/app/comercial/parceiros/index.tsx` contendo barra de busca, filtros por tipo e status, paginação, badges estilizados e ações rápidas.
- [X] T035 [P] [US5] Implementar diálogo de confirmação e justificativa para alteração de status e bloqueio em `packages/web/src/pages/app/comercial/parceiros/components/modal_status_parceiro.tsx`.
- [X] T036 [US5] Mapear a rota `/comercial/parceiros` em `packages/web/src/routes.tsx`.
- [X] T037 [P] [US5] Criar testes automatizados da página de listagem e de transições de status em `packages/web/src/pages/app/comercial/parceiros/parceiros_pages.spec.tsx`.

**Checkpoint**: Todas as 5 histórias de usuário implementadas e validadas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de conformidade com a Constituição do projeto, checagem de tipos, linting e validação ponta a ponta

- [X] T038 [P] Executar checagem e formatação via Biome (`pnpm biome check packages/.contracts packages/api packages/web`).
- [X] T039 [P] Executar verificação estrita de tipagem TypeScript no monorepo (`pnpm --filter .contracts build && pnpm --filter api typecheck && pnpm --filter web typecheck`).
- [X] T040 Executar todos os testes automatizados da suíte (`pnpm --filter api test && pnpm --filter web test`) e validar os cenários descritos em `specs/024-commercial-partners/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências prévias — inicia imediatamente com contratos universais e migração de banco de dados.
- **Foundational (Phase 2)**: Depende da conclusão da Phase 1 — BLOQUEIA a implementação de todas as histórias de usuário.
- **User Stories (Phases 3-7)**: Todas dependem da Phase 2:
  - **US1 (Phase 3)**: Pode iniciar assim que a Phase 2 for concluída. É o MVP da funcionalidade.
  - **US2 (Phase 4)**: Estende US1 com regras comerciais detalhadas e edição.
  - **US3 (Phase 5)**: Depende do formulário base de US1 para exibição dos órgãos reguladores.
  - **US4 (Phase 6)**: Adiciona a sub-tabela e gestão de contatos ao formulário de US1/US2.
  - **US5 (Phase 7)**: Lista e administra os parceiros cadastrados pelas histórias anteriores.
- **Polish (Phase 8)**: Depende da conclusão de todas as histórias implementadas.

### Parallel Opportunities

- **Phase 1**: T001 pode ser iniciado em paralelo com o rascunho de T002.
- **Phase 2**: T004 (Entidades/Erros), T005 (Interface/InMemory), T007 (Zod Schemas) e T008 (Web Service) podem ser desenvolvidos em paralelo por arquivos distintos.
- **Phase 3 (US1)**: Testes unitários (T010) e testes de rotas (T011) podem ser criados em paralelo com o use case (T012) e formulário web (T014).
- **Phase 4 (US2)**: Testes (T016 e T017) podem ser escritos em paralelo com o use case de edição (T018) e componente de regras (T020).
- **Phase 7 (US5)**: Use cases de busca/status (T031, T032), rotas (T033) e modal de status (T035) podem ser desenvolvidos em paralelo.
- **Phase 8**: T038 (Biome) e T039 (Typecheck) rodam de forma concorrente.

---

## Parallel Example: User Story 1 (MVP)

```bash
# Execução paralela dos testes unitários e de rotas:
Task T010: "Testes unitários de CriarParceiroComercialUseCase em packages/api/src/core/usecases/parceiros_comerciais/parceiros_comerciais_use_cases.spec.ts"
Task T011: "Testes de rota POST /comercial/parceiros em packages/api/src/routes/comercial/parceiros_routes.spec.ts"

# Execução paralela do formulário web e use case backend:
Task T012: "Implementar CriarParceiroComercialUseCase em packages/api/src/core/usecases/parceiros_comerciais/criar_parceiro_comercial_use_case.ts"
Task T014: "Criar componente ParceiroForm em packages/web/src/pages/app/comercial/parceiros/components/parceiro_form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir **Phase 1: Setup** (Contratos `.contracts`, schema Prisma e migração).
2. Concluir **Phase 2: Foundational** (Entidades de domínio, repositórios Postgres e InMemory, schemas Zod e serviço Web).
3. Concluir **Phase 3: User Story 1** (Criação de parceiro com classificação PF/PJ e endereço).
4. **Validar MVP**: Testar o cadastro de um agente autônomo (PF com CPF) e uma agência de turismo (PJ com CNPJ).

### Incremental Delivery

1. **Incremento 1 (MVP)**: Setup + Foundation + US1 (Cadastro e validação de documentos com endereço).
2. **Incremento 2**: US2 (Parametrização de comissões, regras de crédito, allotment e tela de edição).
3. **Incremento 3**: US3 + US4 (Credenciamento CADASTUR/IATA e segregação de contatos comerciais vs financeiros).
4. **Incremento 4**: US5 (Painel de listagem, busca dinâmica, filtros avançados e gestão de status).
5. **Incremento 5**: Polish (Biome, Typecheck, Quickstart end-to-end).
