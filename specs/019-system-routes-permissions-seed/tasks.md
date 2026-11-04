---
description: "Task list for system routes catalog and idempotent permissions seed"
---

# Tasks: Catálogo e Sincronização Idempotente de Rotas e Permissões do Sistema

**Input**: Design documents from `/specs/019-system-routes-permissions-seed/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup & Route Catalog

- [X] T001 Definir o tipo `RouteSeedItem` e a constante oficial `BASE_ROUTES` em `packages/api/src/db/seeds/routes_seed.ts`.
- [X] T002 Configurar o script `db:seed:routes` no `package.json` da raiz e de `packages/api`.

## Phase 2: User Story 1 - Sincronização Idempotente de Rotas

- [X] T003 Implementar a função `seedRoutes` em `packages/api/src/db/seeds/routes_seed.ts` para criar ou atualizar cada rota de `BASE_ROUTES`.
- [X] T004 Implementar a rotina de desativação lógica (`ativo = false`) para rotas obsoletas que não constam em `BASE_ROUTES`.
- [X] T005 Adicionar suporte a execução direta do arquivo via CLI (`is_direct_run`).

## Phase 3: User Story 2 & 3 - Vínculos com Hotéis e Grupos e Testes

- [X] T006 Implementar a sincronização em lote com hotéis (`client.rotaHotel.createMany`) com `skipDuplicates: true`.
- [X] T007 Implementar a concessão automática de permissões para grupos com nome "Administrador" (`client.grupoRota.createMany`).
- [X] T008 Integrar a invocação de `seedRoutes` no seed geral `packages/api/src/db/seeds/index.ts`.
- [X] T009 [P] Criar testes unitários em `packages/api/src/db/seeds/routes_seed.spec.ts` validando a integridade de `BASE_ROUTES`, a unicidade dos caminhos e a idempotência da função.
- [X] T010 [P] Executar testes automatizados da suíte via `quickstart.md`.
