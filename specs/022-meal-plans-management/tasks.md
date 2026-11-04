---
description: "Task list for meal plans management and mandatory association with rate plans"
---

# Tasks: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

**Input**: Design documents from `/specs/022-meal-plans-management/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Shared Contracts & Database Migrations

- [X] T001 Definir os contratos `RegimeAlimentacao` em `packages/.contracts/src/regimes_alimentacao.ts` e exportar em `packages/.contracts/src/index.ts`.
- [X] T002 Atualizar `Tarifario` em `packages/.contracts/src/tarifarios.ts` adicionando `regime_alimentacao_id: string` obrigatório e relação `regime_alimentacao?: RegimeAlimentacao`.
- [X] T003 Criar modelo `RegimeAlimentacao` no Prisma schema e gerar migrações de criação e vinculação obrigatória em `tarifarios`.

## Phase 2: Backend API Domain & Use Cases

- [X] T004 Criar entidade `RegimeAlimentacao`, validações e erros de domínio em `packages/api/src/core/entities/regime_alimentacao.ts` e `errors/`.
- [X] T005 Implementar interface de repositório `IRegimeAlimentacaoRepository` e implementações (Postgres e In-Memory).
- [X] T006 Implementar casos de uso de CRUD: `CriarRegimeAlimentacaoUseCase`, `EditarRegimeAlimentacaoUseCase`, `BuscarRegimeAlimentacaoUseCase`, `ListarRegimesAlimentacaoUseCase`, `AtivarRegimeAlimentacaoUseCase` e `DesativarRegimeAlimentacaoUseCase`.
- [X] T007 Atualizar `CriarTarifarioUseCase` e `EditarTarifarioUseCase` para validar e persistir `regime_alimentacao_id`.
- [X] T008 [P] Criar testes unitários para casos de uso em `packages/api/src/core/usecases/regimes_alimentacao/regimes_alimentacao_use_cases.spec.ts`.

## Phase 3: Backend Routes & Seed Synchronization

- [X] T009 Implementar rotas Fastify em `packages/api/src/routes/regimes_alimentacao/regimes_alimentacao_routes.ts` com validação de schemas Zod.
- [X] T010 Atualizar o seed de rotas `routes_seed.ts` incluindo as rotas de Regimes de Alimentação e a criação dos 4 regimes base para cada hotel.
- [X] T011 [P] Criar testes de rotas da API com Fastify inject em `packages/api/src/routes/regimes_alimentacao/regimes_alimentacao_routes.spec.ts`.

## Phase 4: Frontend Primitives & Meal Plans Pages

- [X] T012 Implementar componente `SaveButton` em `packages/web` e `packages/admin` e integrá-lo ao `CrudFormLayout`.
- [X] T013 Implementar componente `ColorPicker` em `packages/web/src/components/ui/color_picker.tsx`.
- [X] T014 Implementar `regimesAlimentacaoService` em `packages/web/src/api/regimes_alimentacao.service.ts`.
- [X] T015 Desenvolver as páginas de listagem (`index.tsx`), criação (`novo.tsx`) e edição (`editar.tsx`) em `packages/web/src/pages/app/regimes_alimentacao/`.

## Phase 5: Rate Plans Integration & End-to-End Validation

- [X] T016 Atualizar `TarifarioForm` em `packages/web/src/components/tarifarios/tarifario_form.tsx` para exigir a seleção de regime de alimentação.
- [X] T017 Exibir badge com o nome e a cor do regime de alimentação na listagem de tarifários (`packages/web/src/pages/app/tarifarios/index.tsx`).
- [X] T018 Mapear as rotas em `packages/web/src/routes.tsx`.
- [X] T019 [P] Criar testes automatizados de frontend em `packages/web/src/pages/app/regimes_alimentacao/regimes_alimentacao_pages.spec.tsx`.
- [X] T020 [P] Executar testes automatizados da suíte completa via `quickstart.md`.
