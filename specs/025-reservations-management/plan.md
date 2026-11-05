# Implementation Plan: Gestão de Reservas com Ficha de Hóspedes (FNRH)

**Branch**: `025-reservations-management` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/025-reservations-management/spec.md`

## Summary

Cadastro e consulta de reservas por suíte (quarto físico), com período, regime de alimentação, tarifas aplicadas (valor congelado), parceiro comercial opcional, bloqueio de conflito com sugestão de suítes alternativas, máquina de status manual e coleta da FNRH por hóspede via página pública mobile-first protegida por token exclusivo.

Abordagem técnica:
1. **Contratos** (`packages/.contracts/src/reservas.ts`): tipos de reserva, hóspede/ficha, listagem, disponibilidade e visão pública — detalhados em [contracts/reservas.md](contracts/reservas.md).
2. **API** (`packages/api`): tabelas `reservas`, `reserva_hospedes`, `reserva_status_historico`; exclusion constraint PostgreSQL contra dupla reserva; reuso de `TarifarioPricingService`; casos de uso por intenção; rotas autenticadas `/reservas` e públicas `/reservas/publico/:token` com rate limit.
3. **Web** (`packages/web`): listagem, formulário sequencial, detalhe/edição com fichas e gestão do link; página pública `/fnrh/:token` fora de `AppLayout`.

## Technical Context

**Language/Version**: TypeScript 5.8 (Node.js 22 / Fastify 5; React 19 / Vite 6)

**Primary Dependencies**: Fastify 5, Prisma 6, Zod, `@fastify/rate-limit` (nova), React Router 7, TanStack Query, react-hook-form, Tailwind CSS 4, Vitest

**Storage**: PostgreSQL via Prisma; extensão `btree_gist` e exclusion constraint em migração SQL manual ([data-model.md](data-model.md))

**Testing**: Vitest — use cases com repositórios InMemory; rotas via Fastify `inject`; repositório Postgres em teste de integração (inclui a constraint de conflito); Testing Library no web; schemas com casos válidos e inválidos

**Target Platform**: Linux/Docker (API); navegadores modernos, página pública utilizável desde 320 px

**Project Type**: Monorepo (web + API) com Clean Architecture

**Performance Goals**: Criação/listagem < 200 ms p95 em hotel com ~10 mil reservas; página pública < 1,5 s em rede móvel

**Constraints**: `snake_case`; Biome (2 espaços, 80 col, aspas simples, sem ponto e vírgula); 404 genérico em links inválidos; nenhum `process.env` fora da infraestrutura; sem restrição extra de acesso à FNRH (clarificação 3)

**Scale/Scope**: 3 tabelas, ~12 casos de uso, 12 endpoints, 3 telas internas, 1 página pública

**Unknowns resolvidos**: ver [research.md](research.md) (R1–R11). Pergunta 5 da clarificação (edição de período/pessoas) não foi respondida; adotado o default da R8, isolado em um único use case.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First**: ✅ Tipos definidos em `.contracts/reservas.ts` (sem runtime nem Zod) antes da implementação; Zod em `schemas/reservas/` derivado dos tipos.
- **II. Clean Architecture**: ✅ `entities → repositories → services/usecases → routes → schemas`; SQL da exclusion constraint e rate limit ficam em infraestrutura.
- **III. SOLID**: ✅ Um use case por intenção; repositórios estreitos injetados por interface (`IReservaRepository`, `IReservaHospedeRepository`, reuso de repositórios de quarto, regime, tarifário e parceiro).
- **IV. Explicit over Implicit**: ✅ `hotel_id` explícito em todos os inputs; erros tipados (`ReservaConflitoError`, `ReservaTransicaoInvalidaError`, `FnrhLinkInvalidoError`); relógio injetado para validade do link; sem `process.env` no domínio.
- **V. Low Coupling**: ✅ Serviços de domínio puros (`ReservaStatusService`, `FnrhValidationService`) sem I/O; reuso de `TarifarioPricingService` por composição.
- **VI. Clean Code / snake_case**: ✅ Arquivos e pastas em snake_case; constantes nomeadas para status e limites de rate limit.
- **VII. Testability**: ✅ Fakes em memória para use cases; teste de integração real para a constraint; rotas por `inject`.

**Post-design re-check**: ✅ Sem violações. Única exceção de camada: a constraint de exclusão vive em SQL de migração (infraestrutura), com o use case fazendo a pré-checagem e traduzindo a violação para erro de domínio.

## Project Structure

### Documentation (this feature)

```text
specs/025-reservations-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/reservas.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code

```text
packages/
├── .contracts/src/reservas.ts            # novo; exportar em index.ts
├── api/src/
│   ├── core/
│   │   ├── entities/{reserva,reserva_hospede}.ts
│   │   ├── errors/reserva_errors.ts
│   │   ├── repositories/reservas/
│   │   │   ├── reserva_repository.ts
│   │   │   └── implementation/{postgres,in_memory}_reserva_repository.ts
│   │   ├── services/
│   │   │   ├── reserva_status_service.ts
│   │   │   ├── fnrh_validation_service.ts
│   │   │   └── reserva_disponibilidade_service.ts
│   │   └── usecases/reservas/
│   │       ├── criar_reserva_use_case.ts
│   │       ├── editar_reserva_use_case.ts
│   │       ├── listar_reservas_use_case.ts
│   │       ├── buscar_reserva_use_case.ts
│   │       ├── alterar_status_reserva_use_case.ts
│   │       ├── consultar_disponibilidade_use_case.ts
│   │       ├── salvar_ficha_hospede_use_case.ts
│   │       ├── gerenciar_link_fnrh_use_case.ts
│   │       ├── buscar_fnrh_publica_use_case.ts
│   │       ├── salvar_ficha_publica_use_case.ts
│   │       └── enviar_fnrh_use_case.ts
│   ├── plugins/rate_limit_plugin.ts
│   ├── prisma/{schema.prisma, migrations/<ts>_create_reservas/}
│   ├── routes/reservas/{reservas_routes,reservas_publicas_routes}.ts
│   ├── schemas/reservas/reservas_schema.ts
│   └── db/seeds/routes_seed.ts           # rotas /reservas, /reservas/nova
└── web/src/
    ├── api/reservas.service.ts
    ├── pages/app/reservas/{index,nova}.tsx, [id]/index.tsx   # listagem, nova, detalhe
    ├── pages/public/fnrh/index.tsx
    ├── components/reservas/              # seletor de suíte, cartão de ficha, status
    └── routes.tsx
```

**Structure Decision**: Segue o padrão da feature 023 (orçamentos): contratos compartilhados, API em Clean Architecture com repositórios Postgres/InMemory, páginas internas em `pages/app/reservas` e página pública em `pages/public`. A listagem existente em `pages/app/reservas/index.tsx` e o calendário (feature 020) devem ser verificados na implementação para integrar ou substituir sem regressão.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada |
|---|---|---|
| Exclusion constraint em SQL manual | Impede dupla reserva concorrente (FR-004a) | Check-then-insert sozinho tem condição de corrida |
| Nova dependência `@fastify/rate-limit` | FR-020 exige limite na rota pública | Sem limite expõe token e dados pessoais a força bruta |
