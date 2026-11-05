# Tasks: Gestão de Reservas com Ficha de Hóspedes (FNRH)

**Input**: Design documents from `/specs/025-reservations-management/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/reservas.md](./contracts/reservas.md), [quickstart.md](./quickstart.md)

**Tests**: Testes automatizados incluídos para entidades, use cases, rotas Fastify e componentes/páginas web conforme o padrão de Clean Architecture do projeto.

**Organization**: Tarefas agrupadas por histórias de usuário para permitir entrega incremental, desenvolvimento paralelo e testabilidade independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tarefa paralelizada (arquivos distintos, sem dependência mútua)
- **[Story]**: História de usuário correspondente ([US1], [US2], [US3], [US4], [US5])
- Caminhos absolutos e relativos explícitos para cada arquivo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos TypeScript compartilhados, pacotes auxiliares e infraestrutura de banco de dados

- [X] T001 [P] Criar contratos compartilhados em `packages/.contracts/src/reservas.ts` contendo `Reserva`, `ReservaHospede`, `FichaFnrh`, `DiariaReserva`, `CreateReservaPayload`, `UpdateReservaPayload`, `ReservaListParams`, `ReservaListResponse`, `QuartoDisponivel`, `FnrhPublicaView`, `SaveFichaPayload` e exportar em `packages/.contracts/src/index.ts`.
- [X] T002 [P] Adicionar dependência `@fastify/rate-limit` no backend em `packages/api/package.json` e criar plugin de infraestrutura em `packages/api/src/plugins/rate_limit_plugin.ts`.
- [X] T003 Adicionar modelos `Reserva`, `ReservaHospede` e `ReservaStatusHistorico` no schema Prisma em `packages/api/src/prisma/schema.prisma` e gerar migração em `packages/api/src/prisma/migrations/20261104210000_create_reservas_and_fnrh/migration.sql` incluindo extensão `btree_gist` e exclusion constraint para quartos em períodos sobrepostos.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entidades de domínio, serviços de domínio puro, classes de erro, repositórios e schemas base que suportam todas as histórias de usuário

**⚠️ CRITICAL**: Nenhuma história de usuário pode iniciar antes da conclusão desta fundação

- [X] T004 [P] Criar entidade de domínio `Reserva` em `packages/api/src/core/entities/reserva.ts` e erros de domínio (`ReservaConflitoError`, `ReservaNotFoundError`, `ReservaTransicaoInvalidaError`, `FnrhLinkInvalidoError`) em `packages/api/src/core/errors/reserva_errors.ts`.
- [X] T005 [P] Criar entidade de domínio `ReservaHospede` e enumerações de ficha em `packages/api/src/core/entities/reserva_hospede.ts`.
- [X] T006 [P] Implementar serviço de domínio puro `ReservaStatusService` em `packages/api/src/core/services/reserva_status_service.ts` com validação de transições de status (`a_confirmar`, `confirmada`, `check_in`, `check_out`, `no_show`, `cancelada`).
- [X] T007 [P] Implementar serviço de domínio puro `FnrhValidationService` em `packages/api/src/core/services/fnrh_validation_service.ts` com validação de campos obrigatórios, formato de CPF para brasileiros, passaporte para estrangeiros e regras para menores de idade.
- [X] T008 [P] Definir interfaces `IReservaRepository` e `IReservaHospedeRepository` em `packages/api/src/core/repositories/reservas/reserva_repository.ts` e implementar versões InMemory em `packages/api/src/core/repositories/reservas/in-memory/in_memory_reserva_repository.ts`.
- [X] T009 Implementar repositório Postgres para Reservas e Hóspedes em `packages/api/src/core/repositories/reservas/implementation/postgres_reserva_repository.ts` mapeando violação de exclusion constraint do Postgres para `ReservaConflitoError`.
- [X] T010 [P] Implementar schemas Zod de validação de Reservas e FNRH em `packages/api/src/schemas/reservas/reservas_schema.ts`.
- [X] T011 [P] Implementar cliente HTTP de reservas no frontend em `packages/web/src/api/reservas.service.ts`.
- [X] T012 Atualizar o seed de rotas do sistema em `packages/api/src/db/seeds/routes_seed.ts` adicionando rotas de navegação `/reservas` e `/reservas/nova` no módulo de Reservas.

**Checkpoint**: Fundação pronta e testável. A implementação das histórias de usuário pode prosseguir.

---

## Phase 3: User Story 1 - Cadastrar uma reserva (Priority: P1) 🎯 MVP

**Goal**: Permitir ao atendente cadastrar uma nova reserva informando titular, período (check-in/check-out), quantidade de pessoas, regime de alimentação e suíte (quarto físico), calculando diárias congeladas a partir de tarifas vigentes, bloqueando conflitos de suíte e sugerindo alternativas disponíveis.

**Independent Test**: Acessar `/reservas/nova`, preencher titular, período e pessoas, escolher regime e quarto com tarifa vigente, salvar e verificar a reserva criada com status `a_confirmar`, código único, diárias congeladas calculadas e N posições de hóspedes pendentes. Tentar reservar o mesmo quarto no mesmo período e confirmar o bloqueio de conflito com sugestão de quartos alternativos.

- [X] T013 [P] [US1] Implementar caso de uso `ConsultarDisponibilidadeUseCase` em `packages/api/src/core/usecases/reservas/consultar_disponibilidade_use_case.ts` para buscar quartos livres e com tarifa vigente no regime para o período.
- [X] T014 [US1] Implementar caso de uso `CriarReservaUseCase` em `packages/api/src/core/usecases/reservas/criar_reserva_use_case.ts` (validação de período `check_out > check_in`, capacidade do quarto, checagem prévia de conflito, cálculo congelado via `TarifarioPricingService`, geração de token FNRH único e criação de N posições de hóspede).
- [X] T015 [P] [US1] Criar testes unitários para `CriarReservaUseCase` e `ConsultarDisponibilidadeUseCase` em `packages/api/src/core/usecases/reservas/criar_reserva_use_case.spec.ts`.
- [X] T016 [US1] Implementar rotas HTTP `POST /reservas` e `GET /reservas/disponibilidade` em `packages/api/src/routes/reservas/reservas_routes.ts`.
- [X] T017 [P] [US1] Criar testes de integração para rotas de criação e disponibilidade em `packages/api/src/routes/reservas/reservas_routes.spec.ts`.
- [X] T018 [US1] Desenvolver formulário de cadastro de reserva em `packages/web/src/pages/app/reservas/nova.tsx` com seleção sequencial (período e pessoas -> regime -> quarto disponível -> titular), total calculado e modal com alternativas em caso de conflito.
- [X] T019 [P] [US1] Criar testes de interface para o formulário de cadastro de reserva em `packages/web/src/pages/app/reservas/nova.spec.tsx`.

**Checkpoint**: User Story 1 (MVP) concluída e testável isoladamente.

---

## Phase 4: User Story 2 - Consultar reservas (Priority: P1)

**Goal**: Permitir à recepção listar reservas com paginação e filtros (período, status, suíte, parceiro, busca por código ou nome de titular/hóspede), visualizar o indicador de fichas preenchidas e acessar os detalhes completos da reserva.

**Independent Test**: Acessar `/reservas`, aplicar filtros por período, status ou busca textual, verificar a exibição correta com badge de fichas (ex.: 1/3) e clicar em uma reserva para visualizar a página de detalhe com todas as diárias congeladas e lista de ocupantes.

- [X] T020 [P] [US2] Implementar casos de uso `ListarReservasUseCase` em `packages/api/src/core/usecases/reservas/listar_reservas_use_case.ts` e `BuscarReservaUseCase` em `packages/api/src/core/usecases/reservas/buscar_reserva_use_case.ts`.
- [X] T021 [US2] Implementar rotas HTTP `GET /reservas` e `GET /reservas/:id` em `packages/api/src/routes/reservas/reservas_routes.ts`.
- [X] T022 [P] [US2] Criar testes de use case e rotas para listagem e busca por ID em `packages/api/src/core/usecases/reservas/listar_reservas_use_case.spec.ts`.
- [X] T023 [US2] Desenvolver página de listagem de reservas em `packages/web/src/pages/app/reservas/index.tsx` com paginação, filtros e badge indicador de fichas preenchidas.
- [X] T024 [US2] Desenvolver página de detalhes da reserva em `packages/web/src/pages/app/reservas/[id]/index.tsx` exibindo diárias congeladas, status, dados do quarto, regime e lista de hóspedes.
- [X] T025 [P] [US2] Criar testes de tela para listagem e detalhe de reservas em `packages/web/src/pages/app/reservas/reservas_pages.spec.tsx`.

**Checkpoint**: User Stories 1 e 2 funcionam de forma integrada e independente.

---

## Phase 5: User Story 3 - Enviar link de preenchimento da FNRH ao cliente (Priority: P1)

**Goal**: Gerar token exclusivo não adivinhável por reserva para compor link público, permitir copiar, regenerar e desativar o link no painel interno e disponibilizar página pública mobile-first sem login (`/fnrh/:token`) protegida por rate limit, com formulários FNRH por hóspede, salvamento de rascunhos e envio ao hotel.

**Independent Test**: Copiar link FNRH de uma reserva no detalhe interno, abrir em navegador anônimo com resolução de 375px (mobile-first), preencher dados da ficha de cada hóspede, salvar rascunho, tocar em "Enviar ao hotel" e conferir que a reserva interna passa a exibir o selo "dados enviados pelo cliente" com data e hora.

- [X] T026 [P] [US3] Implementar casos de uso `GerenciarLinkFnrhUseCase`, `BuscarFnrhPublicaUseCase`, `SalvarFichaPublicaUseCase` e `EnviarFnrhUseCase` em `packages/api/src/core/usecases/reservas/`.
- [X] T027 [US3] Implementar rotas HTTP públicas `GET /reservas/publico/:token`, `PUT /reservas/publico/:token/hospedes/:posicao` e `POST /reservas/publico/:token/enviar` com rate limit e rotas autenticadas `POST /reservas/:id/link-fnrh/regenerar` e `POST /reservas/:id/link-fnrh/desativar` em `packages/api/src/routes/reservas/reservas_publicas_routes.ts` e `reservas_routes.ts`.
- [X] T028 [P] [US3] Criar testes de use case e rotas públicas FNRH em `packages/api/src/routes/reservas/reservas_publicas_routes.spec.ts`.
- [X] T029 [US3] Desenvolver componente de ações do link FNRH em `packages/web/src/components/reservas/link_fnrh_card.tsx` com atalho de copiar link, toast de confirmação, botão de regenerar e de desativar.
- [X] T030 [US3] Desenvolver página pública mobile-first da FNRH em `packages/web/src/pages/public/fnrh/index.tsx` (fora do `AppLayout`) contendo cabeçalho resumido da reserva, abas/cards por hóspede com validação de campos, salvamento automático/rascunho e botão "Enviar ao hotel".
- [X] T031 [US3] Registrar a rota pública `/fnrh/:token` em `packages/web/src/routes.tsx`.
- [X] T032 [P] [US3] Criar testes de interface para a página pública mobile-first da FNRH em `packages/web/src/pages/public/fnrh/fnrh_publica_page.spec.tsx`.

**Checkpoint**: Fluxo completo de reserva e preenchimento digital da FNRH pelo cliente finalizado.

---

## Phase 6: User Story 4 - Gerenciar hóspedes e edição da reserva internamente (Priority: P2)

**Goal**: Permitir que a equipe do hotel preencha e edite fichas FNRH diretamente no sistema interno, acompanhe status de cada hóspede, altere o status da reserva respeitando a máquina de transições (com histórico) e edite período/quarto/ocupantes recalculando valores com segurança.

**Independent Test**: Abrir detalhe de uma reserva, editar os dados de um hóspede no modal interno, salvar como preenchida e verificar a atualização do indicador. Alterar o status de `a_confirmar` para `confirmada` e depois `cancelada` verificando o histórico registrado.

- [X] T033 [P] [US4] Implementar casos de uso `SalvarFichaHospedeUseCase`, `AlterarStatusReservaUseCase` e `EditarReservaUseCase` em `packages/api/src/core/usecases/reservas/`.
- [X] T034 [US4] Implementar rotas HTTP `PUT /reservas/:id`, `PATCH /reservas/:id/status` e `PUT /reservas/:id/hospedes/:posicao` em `packages/api/src/routes/reservas/reservas_routes.ts`.
- [X] T035 [P] [US4] Criar testes de use cases para edição de reserva, transição de status e gestão de hóspedes em `packages/api/src/core/usecases/reservas/gerenciar_hospedes_use_case.spec.ts`.
- [X] T036 [US4] Integrar no detalhe da reserva (`[id]/index.tsx`) modal de edição de ficha de hóspede pela equipe e seletor com as transições de status permitidas e confirmação de cancelamento/no-show.
- [X] T037 [P] [US4] Criar testes de interface para o modal de hóspedes e transições de status em `packages/web/src/pages/app/reservas/edicao_hospedes.spec.tsx`.

**Checkpoint**: Gestão operacional interna de hóspedes e status de reserva concluída.

---

## Phase 7: User Story 5 - Indicar parceiro comercial na reserva (Priority: P3)

**Goal**: Permitir a indicação opcional de parceiros comerciais ativos (agências, operadoras, clubes de viagens) no cadastro e edição da reserva, exibir o parceiro vinculado e filtrar reservas por parceiro comercial.

**Independent Test**: Cadastrar uma reserva com parceiro selecionado e outra sem parceiro; verificar a exibição na listagem; filtrar pelo parceiro e checar os resultados retornados.

- [X] T038 [P] [US5] Adicionar validação de parceiro comercial ativo em `CriarReservaUseCase` e `EditarReservaUseCase` em `packages/api/src/core/usecases/reservas/` consultando `IParceiroComercialRepository`.
- [X] T039 [US5] Integrar seletor opcional de parceiro no formulário de reserva em `packages/web/src/pages/app/reservas/nova.tsx`, badge de parceiro na listagem em `index.tsx` e filtro por parceiro comercial.
- [X] T040 [P] [US5] Criar testes automatizados cobrindo reserva com parceiro ativo, parceiro inativo e sem parceiro em `packages/api/src/core/usecases/reservas/parceiro_reserva.spec.ts`.

**Checkpoint**: Todas as 5 histórias de usuário implementadas e integradas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade, validação de segurança, formatação de código e execução de cenários ponta a ponta

- [X] T041 [P] Executar linting e formatação com Biome em todos os arquivos alterados (`pnpm lint`).
- [X] T042 [P] Executar checagem estrita de tipos TypeScript em todo o monorepo (`pnpm typecheck`).
- [X] T043 Executar suite completa de testes automatizados (`pnpm test`).
- [X] T044 Executar validação manual completa dos cenários descritos em `specs/025-reservations-management/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende da Fase 1 — **BLOQUEIA** todas as histórias de usuário.
- **User Story 1 (Phase 3 - P1 🎯 MVP)**: Depende da Fase 2.
- **User Story 2 (Phase 4 - P1)**: Depende da Fase 2 e integra com as entidades criadas na Fase 3.
- **User Story 3 (Phase 5 - P1)**: Depende da Fase 2 e dos dados de reserva da Fase 3.
- **User Story 4 (Phase 6 - P2)**: Depende das Fases 3, 4 e 5.
- **User Story 5 (Phase 7 - P3)**: Depende das Fases 3 e 4.
- **Polish (Phase 8)**: Depende da conclusão das histórias desejadas para o release.

### User Story Dependencies

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational
     │
     ├──────────────────────────┐
     ▼                          ▼
Phase 3: US1 (Cadastrar)   Phase 4: US2 (Consultar)
     │                          │
     ├──────────────┬───────────┤
     ▼              ▼           ▼
Phase 5: US3 (FNRH)   Phase 6: US4 (Gerenciar)
     │                          │
     └──────────────┬───────────┘
                    ▼
              Phase 7: US5 (Parceiro)
                    │
                    ▼
              Phase 8: Polish
```

### Parallel Opportunities

- **Phase 1**: T001 (`.contracts`) e T002 (`rate_limit_plugin`) podem rodar em paralelo antes de T003 (migração Prisma).
- **Phase 2**: T004, T005, T006, T007, T008, T010 e T011 podem rodar em paralelo após T003.
- **Phase 3 (US1)**: Testes unitários T015 e T017 podem ser desenvolvidos em paralelo com componentes de UI T018 e T019.
- **Phase 4 (US2)**: Casos de uso T020 e testes T022 rodam em paralelo com o desenvolvimento de telas T023 e T024.
- **Phase 5 (US3)**: Casos de uso de FNRH T026 e testes T028 rodam em paralelo com o desenvolvimento do componente de link T029 e tela pública mobile-first T030.
- **Phase 6 e 7**: Tarefas de frontend e testes marcados com `[P]` podem ser executados concorrentemente.

---

## Parallel Example: User Story 1 (Cadastro de Reserva)

```bash
# Execução paralela no Backend:
Task: "Implementar caso de uso ConsultarDisponibilidadeUseCase em packages/api/src/core/usecases/reservas/consultar_disponibilidade_use_case.ts"
Task: "Criar testes unitários para CriarReservaUseCase em packages/api/src/core/usecases/reservas/criar_reserva_use_case.spec.ts"

# Execução paralela no Frontend:
Task: "Desenvolver formulário de cadastro de reserva em packages/web/src/pages/app/reservas/nova.tsx"
Task: "Criar testes de interface em packages/web/src/pages/app/reservas/nova.spec.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir **Phase 1 (Setup)** e **Phase 2 (Foundational)**.
2. Implementar **Phase 3 (User Story 1)**.
3. **Parar e Validar**: Testar criação de reserva isoladamente via `/reservas/nova` e chamada HTTP.
4. Entregar o MVP com capacidade de cadastro e congelamento de tarifas.

### Incremental Delivery

1. Adicionar **User Story 2 (Consultar)**: Visibilidade imediata das reservas criadas com filtros de recepção.
2. Adicionar **User Story 3 (Link FNRH público)**: Ativar preenchimento autônomo pelo cliente via mobile.
3. Adicionar **User Story 4 (Gestão interna de hóspedes e status)**: Suporte à operação balcão e ciclo de vida completo.
4. Adicionar **User Story 5 (Parceiros comerciais)**: Vinculação comercial B2B opcional.
5. Rodar **Phase 8 (Polish)** para garantir conformidade de tipagem e linting.
