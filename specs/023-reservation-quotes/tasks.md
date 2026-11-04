# Tasks: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

**Input**: Design documents from `/specs/023-reservation-quotes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/orcamentos_leads.md](./contracts/orcamentos_leads.md), [quickstart.md](./quickstart.md)

**Tests**: Testes automatizados incluídos para validação de use cases, rotas da API e páginas do frontend conforme especificação técnica.

**Organization**: Tarefas agrupadas por histórias de usuário para entrega independente e testabilidade contínua.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tarefa paralelizada (arquivos distintos, sem dependência mútua)
- **[Story]**: História de usuário correspondente ([US1], [US2], [US3], [US4])
- Caminhos absolutos e relativos explícitos para cada arquivo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos compartilhados e infraestrutura de banco de dados

- [X] T001 [P] Criar contratos de Lead em `packages/.contracts/src/leads.ts` com interfaces `Lead`, `CreateLeadPayload`, `UpdateLeadPayload` e `LeadListResponse`.
- [X] T002 [P] Criar contratos de Orçamento em `packages/.contracts/src/orcamentos.ts` com interfaces `Orcamento`, `OrcamentoPublicoVisualizacao`, `CreateOrcamentoPayload`, `UpdateOrcamentoPayload`, `OrcamentoListResponse` e exportar ambos em `packages/.contracts/src/index.ts`.
- [X] T003 Adicionar modelos `Lead` (`nome VarChar(150)`, `telefone VarChar(30)`, `email VarChar(150)`) e `Orcamento` (`token_publico VarChar(64) unique`, `check_in/out VarChar(10)`, `quantidade_adultos Int >= 1`, `detalhamento_noites Json`) no schema Prisma em `packages/api/src/prisma/schema.prisma` e gerar migração em `packages/api/src/prisma/migrations/20261104193000_create_leads_and_orcamentos/migration.sql`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entidades de domínio, classes de erro, repositórios e serviços base que suportam todas as histórias

**⚠️ CRITICAL**: Nenhuma história de usuário deve iniciar antes da conclusão desta fundação

- [X] T004 [P] Criar entidade de domínio e validações de Lead em `packages/api/src/core/entities/lead.ts` e erros em `packages/api/src/core/errors/lead_errors.ts`.
- [X] T005 [P] Criar entidade de domínio e validações de Orçamento em `packages/api/src/core/entities/orcamento.ts` e erros em `packages/api/src/core/errors/orcamento_errors.ts`.
- [X] T006 [P] Definir interface `ILeadRepository` em `packages/api/src/core/repositories/leads/lead_repository.ts` e implementar `InMemoryLeadRepository` em `packages/api/src/core/repositories/leads/in-memory/in_memory_lead_repository.ts`.
- [X] T007 Implementar repositório Postgres para Leads em `packages/api/src/core/repositories/leads/implementation/postgres_lead_repository.ts`.
- [X] T008 [P] Definir interface `IOrcamentoRepository` em `packages/api/src/core/repositories/orcamentos/orcamento_repository.ts` e implementar `InMemoryOrcamentoRepository` em `packages/api/src/core/repositories/orcamentos/in-memory/in_memory_orcamento_repository.ts`.
- [X] T009 Implementar repositório Postgres para Orçamentos em `packages/api/src/core/repositories/orcamentos/implementation/postgres_orcamento_repository.ts`.
- [X] T010 [P] Implementar schemas de validação Zod para Leads em `packages/api/src/schemas/leads/leads_schema.ts` e para Orçamentos em `packages/api/src/schemas/orcamentos/orcamentos_schema.ts`.
- [X] T011 [P] Implementar serviços HTTP de frontend para Leads em `packages/web/src/api/leads.service.ts` e para Orçamentos em `packages/web/src/api/orcamentos.service.ts`.
- [X] T012 Atualizar o seed de rotas do sistema em `packages/api/src/db/seeds/routes_seed.ts` adicionando `/reservas/orcamentos` e `/reservas/orcamentos/novo` sob o módulo 'Reservas'.

**Checkpoint**: Fundação completa e testada. Implementação das histórias pode prosseguir.

---

## Phase 3: User Story 1 - Criação e Cálculo de Orçamento com Seleção Inicial de Período, Regime e Vínculo de Lead (Priority: P1) 🎯 MVP

**Goal**: Permitir que atendentes criem orçamentos vinculados a leads, informando primeiramente o período e ocupantes, selecionando em seguida o regime de alimentação para carregar as suítes/categorias com tarifários vigentes, calculando diárias sem validação de disponibilidade física de quartos.

**Independent Test**: Acessar `/reservas/orcamentos/novo`, definir período (check-in/out) e hóspedes, escolher regime de alimentação, selecionar uma das suítes carregadas pelo tarifário, preencher o lead e salvar. Conferir a persistência e cálculo do total.

- [X] T013 [P] [US1] Implementar caso de uso `CriarLeadUseCase` em `packages/api/src/core/usecases/leads/criar_lead_use_case.ts`.
- [X] T014 [US1] Implementar caso de uso `CriarOrcamentoUseCase` em `packages/api/src/core/usecases/orcamentos/criar_orcamento_use_case.ts` calculando diárias com base no regime e categoria sem validação de disponibilidade física de quartos e gerando token público seguro.
- [X] T015 [P] [US1] Criar testes unitários para criação de orçamento e lead em `packages/api/src/core/usecases/orcamentos/orcamentos_use_cases.spec.ts`.
- [X] T016 [US1] Implementar rotas HTTP `POST /leads` em `packages/api/src/routes/leads/leads_routes.ts` e `POST /orcamentos` em `packages/api/src/routes/orcamentos/orcamentos_routes.ts` com registro em `packages/api/src/plugins/fastify_routes.ts`.
- [X] T017 [US1] Desenvolver a página de criação de orçamento com fluxo sequencial orientado (1º Período/Hóspedes/Pets -> 2º Regime de Alimentação e Carregamento de Suítes com Tarifário -> 3º Seleção de Categoria e Dados do Lead) em `packages/web/src/pages/app/reservas/orcamentos/novo.tsx`.
- [X] T018 [US1] Mapear a rota `/reservas/orcamentos/novo` em `packages/web/src/routes.tsx`.

**Checkpoint**: User Story 1 (MVP) funcional e testável de ponta a ponta.

---

## Phase 4: User Story 2 - Visualização Pública do Orçamento pelo Lead em Dispositivos Móveis (Priority: P1)

**Goal**: Disponibilizar página pública, sem necessidade de autenticação e com foco estrito em mobile-first, onde o lead acessa sua proposta via token único com botão fictício "Reservar".

**Independent Test**: Abrir link `/orcamento/:token` em janela anônima no celular ou DevTools responsivo, validar renderização mobile-first e clicar em "Reservar" visualizando o feedback informativo.

- [X] T019 [P] [US2] Implementar caso de uso `BuscarOrcamentoPublicoUseCase` em `packages/api/src/core/usecases/orcamentos/buscar_orcamento_publico_use_case.ts` retornando dados formatados para a visualização pública (`OrcamentoPublicoVisualizacao`).
- [X] T020 [US2] Implementar rota HTTP pública sem autenticação `GET /orcamentos/publico/:token` em `packages/api/src/routes/orcamentos/orcamentos_routes.ts`.
- [X] T021 [P] [US2] Criar testes de rota para a visualização pública em `packages/api/src/routes/orcamentos/orcamentos_routes.spec.ts`.
- [X] T022 [US2] Desenvolver a página pública do orçamento mobile-first em `packages/web/src/pages/public/orcamento/index.tsx` exibindo informações do hotel, período, hóspedes, destaque do regime com cor personalizada e botão fictício "Reservar".
- [X] T023 [P] [US2] Implementar componente de diálogo informativo para a ação fictícia de reserva em `packages/web/src/components/orcamentos/modal_reservar_info.tsx`.
- [X] T024 [US2] Registrar a rota pública `/orcamento/:token` em `packages/web/src/routes.tsx` (fora do `AppLayout`).
- [X] T025 [P] [US2] Criar testes automatizados da página pública mobile-first em `packages/web/src/pages/public/orcamento/orcamento_publico_page.spec.tsx`.

**Checkpoint**: User Stories 1 e 2 funcionam de forma independente e integrada.

---

## Phase 5: User Story 3 - Painel de Gestão, Edição e Exclusão de Orçamentos (Priority: P2)

**Goal**: Permitir que operadores consultem a lista de orçamentos com filtros e busca, editem propostas em negociação e excluam cotações canceladas com diálogo de confirmação.

**Independent Test**: Acessar `/reservas/orcamentos`, filtrar por lead, abrir tela de edição, alterar ocupantes ou notas, salvar e excluir um orçamento confirmando a exclusão.

- [X] T026 [P] [US3] Implementar casos de uso `ListarOrcamentosUseCase`, `BuscarOrcamentoUseCase`, `EditarOrcamentoUseCase` e `ExcluirOrcamentoUseCase` em `packages/api/src/core/usecases/orcamentos/`.
- [X] T027 [US3] Implementar rotas `GET /orcamentos`, `GET /orcamentos/:id`, `PUT /orcamentos/:id` e `DELETE /orcamentos/:id` em `packages/api/src/routes/orcamentos/orcamentos_routes.ts`.
- [X] T028 [US3] Desenvolver a página de listagem de orçamentos com busca, filtros por status/regime e paginação em `packages/web/src/pages/app/reservas/orcamentos/index.tsx`.
- [X] T029 [US3] Desenvolver a página de edição de orçamento em `packages/web/src/pages/app/reservas/orcamentos/[id]/editar.tsx`.
- [X] T030 [US3] Mapear as rotas `/reservas/orcamentos` e `/reservas/orcamentos/:id/editar` em `packages/web/src/routes.tsx`.
- [X] T031 [P] [US3] Criar testes automatizados das páginas administrativas em `packages/web/src/pages/app/reservas/orcamentos/orcamentos_pages.spec.tsx`.

**Checkpoint**: Gestão completa de ciclo de vida de orçamentos operacional.

---

## Phase 6: User Story 4 - Ações Rápidas de Compartilhamento e Simulação de Disparo (Priority: P2)

**Goal**: Fornecer na tela do orçamento atalhos com 1 clique para copiar o link público com toast e botões fictícios para simulação de envio por e-mail e WhatsApp.

**Independent Test**: Na página de edição/detalhes do orçamento, clicar em "Copiar link de visualização" (verificar clipboard e toast), clicar em "Enviar por E-mail" e "Enviar WhatsApp" (verificar notificações informativas simuladas).

- [X] T032 [P] [US4] Implementar o componente `OrcamentoAcoesCompartilhamento` em `packages/web/src/components/orcamentos/orcamento_acoes_compartilhamento.tsx` contendo o botão "Copiar link", botão fictício "Enviar por E-mail" e botão fictício "Enviar WhatsApp".
- [X] T033 [US4] Integrar o componente `OrcamentoAcoesCompartilhamento` na página de edição (`[id]/editar.tsx`) e na tabela de listagem (`index.tsx`) em `packages/web/src/pages/app/reservas/orcamentos/`.
- [X] T034 [P] [US4] Criar testes unitários para cópia de link na área de transferência e acionamento das ações simuladas em `packages/web/src/components/orcamentos/orcamento_acoes_compartilhamento.spec.tsx`.

**Checkpoint**: Todas as 4 histórias de usuário estão integradas e testadas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade, linting, tipagem e validação final ponta a ponta

- [X] T035 [P] Executar linting e formatação com Biome em todos os arquivos alterados (`pnpm lint`).
- [X] T036 [P] Executar checagem estrita de tipos TypeScript em todo o monorepo (`pnpm typecheck`).
- [X] T037 Executar o roteiro completo de testes e validação descrito em `specs/023-reservation-quotes/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - inicia imediatamente.
- **Foundational (Phase 2)**: Depende da conclusão da Phase 1 - BLOQUEIA todas as histórias de usuário.
- **User Stories (Phases 3-6)**: Todas dependem da Phase 2.
  - **US1 (Phase 3)**: Pode iniciar logo após Phase 2. Não possui dependência de outras histórias.
  - **US2 (Phase 4)**: Depende do token gerado em US1, mas a API pública e a página mobile podem ser desenvolvidas em paralelo com base nos contratos.
  - **US3 (Phase 5)**: Depende de US1 para listagem/edição dos dados criados.
  - **US4 (Phase 6)**: Integra nas interfaces de US3 e utiliza a URL pública de US2.
- **Polish (Phase 7)**: Depende da conclusão de todas as histórias.

### Parallel Opportunities

- Tarefas T001 e T002 (Contratos de Leads e Orçamentos) podem ser feitas em paralelo.
- Tarefas T004, T005, T006, T008, T010 e T011 na Phase 2 podem ser executadas em paralelo por atuarem em arquivos desacoplados.
- Testes unitários marcados com [P] podem ser implementados e validados paralelamente.

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Concluir Phase 3 (US1 - Criação sequencial de orçamento e lead).
3. Concluir Phase 4 (US2 - Visualização pública mobile-first).
4. **Validar MVP**: Emitir orçamento no painel e abrir o link no celular do lead.

### Entrega Incremental

1. Entregar US3 (Gestão/Edição/Exclusão no painel).
2. Entregar US4 (Ações rápidas de cópia de link, e-mail simulado e WhatsApp).
3. Executar Phase 7 (Polish e validação com `quickstart.md`).
