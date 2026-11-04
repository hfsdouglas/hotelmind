# Implementation Plan: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

**Branch**: `023-reservation-quotes` | **Date**: 2026-11-04 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/023-reservation-quotes/spec.md)

**Input**: Feature specification from `/specs/023-reservation-quotes/spec.md`

## Summary

Implementar no módulo de reservas a funcionalidade completa de orçamentos (cotações) desvinculados de reservas confirmadas, com cadastro de primeiro contato (leads), compartilhamento por link público e ações fictícias de comunicação:
1. **Contratos Compartilhados (`packages/.contracts`)**:
   - Definição dos tipos `Lead`, `CreateLeadPayload`, `UpdateLeadPayload` e `LeadListResponse` em `leads.ts`.
   - Definição dos tipos `Orcamento`, `OrcamentoPublicoVisualizacao`, `CreateOrcamentoPayload`, `UpdateOrcamentoPayload` e `OrcamentoListResponse` em `orcamentos.ts`.
2. **Backend API (`packages/api`)**:
   - Modelagem Prisma com criação das tabelas `leads` e `orcamentos` (com índices e token público único).
   - Entidades de domínio `Lead` e `Orcamento` em `core/entities/`.
   - Repositórios com interface e implementações Postgres e InMemory para `Lead` e `Orcamento`.
   - Casos de uso de CRUD para Leads e Orçamentos, cálculo de tarifas sem bloqueio de disponibilidade física de quartos e recuperação de orçamento público por token.
   - Rotas Fastify em `/leads`, `/orcamentos` e rota pública desprotegida em `/orcamentos/publico/:token`.
   - Registro das novas rotas de navegação no seed do sistema (`routes_seed.ts`).
3. **Frontend Web (`packages/web`)**:
   - Telas de gestão no painel interno:
     - Listagem de orçamentos (`/reservas/orcamentos`) com busca e atalhos rápidos.
     - Formulário sequencial de novo orçamento (`/reservas/orcamentos/novo`): Passo 1 Período e Hóspedes -> Passo 2 Regime de Alimentação e Carregamento de Suítes com Tarifário -> Passo 3 Categoria e Lead.
     - Edição de orçamento (`/reservas/orcamentos/:id/editar`) com botões de ação: "Copiar link", botão fictício "Enviar por E-mail" e botão fictício "Enviar WhatsApp".
   - Página pública do lead (`/orcamento/:token`):
     - Rota autônoma fora de `AppLayout`.
     - Layout mobile-first, limpo e adaptativo para smartphones.
     - Destaque do regime de refeições com sua cor institucional, resumo de diárias e botão fictício "Reservar".

## Technical Context

**Language/Version**: TypeScript 5.8 (Node.js 22 LTS / Fastify 5 no backend; React 19 / Vite 6 no frontend)

**Primary Dependencies**: Fastify 5, Prisma 6, Zod, React 19, React Router 7, Tailwind CSS 4, Lucide React, TanStack Query, Vitest

**Storage**: PostgreSQL com Prisma ORM (tabelas `leads` e `orcamentos` com foreign keys e índice único em `token_publico`)

**Testing**: Vitest (`packages/api` e `packages/web`), repositórios InMemory para testes unitários de use cases, Fastify `inject` para rotas e Testing Library para componentes/páginas

**Target Platform**: Servidor Linux / Docker (API) e navegadores web modernos com ênfase em dispositivos móveis (Web)

**Project Type**: Monorepo com microsserviços e Clean Architecture

**Performance Goals**: Tempo de resposta de criação e cálculo de orçamento < 80ms na API; carregamento da página pública mobile < 1.5s em redes móveis

**Constraints**: Clean Architecture estrita (Domain -> Repositories -> Use Cases -> Routes -> Schemas); `snake_case` compulsório; Biome para linting e formatação; isolamento estrito de inventário de reservas confirmadas

**Scale/Scope**: Contratos compartilhados, backend API completo (entidades, repositórios, casos de uso, migrações, rotas), páginas de gestão no frontend, página pública mobile-first e cobertura de testes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Contratos `leads.ts` e `orcamentos.ts` foram modelados e definidos em `specs/023-reservation-quotes/contracts/orcamentos_leads.md` antes da implementação do código.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Camadas rigorosamente separadas: `entities/` -> `repositories/` -> `usecases/` -> `routes/` -> `schemas/`.
- **III. SOLID Principles**: ✅ Pass — Cada caso de uso atende a uma intenção única do usuário; repositórios injetados via interfaces abstratas (`ILeadRepository`, `IOrcamentoRepository`).
- **IV. Explicit over Implicit**: ✅ Pass — Identificadores de hotel e parâmetros passados explicitamente; erros tipados (`LeadNotFoundError`, `OrcamentoNotFoundError`, `OrcamentoValidationError`).
- **V. Low Coupling, High Cohesion**: ✅ Pass — Orçamentos desacoplados do motor de alocação de quartos físicos de reservas confirmadas; página pública independente de sessão de usuário.
- **VI. Clean Code**: ✅ Pass — Nomenclatura em `snake_case` para todos os arquivos e diretórios; padrões e formatação Biome (2 espaços, 80 colunas, aspas simples).
- **VII. Testability by Design**: ✅ Pass — Casos de uso testáveis isoladamente com implementações in-memory; rotas testadas com Fastify `inject`.

## Project Structure

### Documentation (this feature)

```text
specs/023-reservation-quotes/
├── plan.md              # Este arquivo
├── research.md          # Pesquisa arquitetural e decisões de design (Fase 0)
├── data-model.md        # Entidades, contratos e modelo Prisma (Fase 1)
├── quickstart.md        # Guia de validação e roteiro de testes (Fase 1)
├── checklists/
│   └── requirements.md  # Checklist de validação da especificação
└── contracts/
    └── orcamentos_leads.md # Contratos de endpoints e tipos compartilhados
```

### Source Code (repository root)

```text
packages/
├── .contracts/src/
│   ├── leads.ts
│   ├── orcamentos.ts
│   └── index.ts
├── api/src/
│   ├── core/
│   │   ├── entities/
│   │   │   ├── lead.ts
│   │   │   └── orcamento.ts
│   │   ├── errors/
│   │   │   ├── lead_errors.ts
│   │   │   └── orcamento_errors.ts
│   │   ├── repositories/
│   │   │   ├── leads/
│   │   │   │   ├── lead_repository.ts
│   │   │   │   ├── implementation/postgres_lead_repository.ts
│   │   │   │   └── in-memory/in_memory_lead_repository.ts
│   │   │   └── orcamentos/
│   │   │       ├── orcamento_repository.ts
│   │   │       ├── implementation/postgres_orcamento_repository.ts
│   │   │       └── in-memory/in_memory_orcamento_repository.ts
│   │   └── usecases/
│   │       ├── leads/
│   │       │   ├── criar_lead_use_case.ts
│   │       │   ├── buscar_lead_use_case.ts
│   │       │   └── listar_leads_use_case.ts
│   │       └── orcamentos/
│   │           ├── criar_orcamento_use_case.ts
│   │           ├── editar_orcamento_use_case.ts
│   │           ├── excluir_orcamento_use_case.ts
│   │           ├── buscar_orcamento_use_case.ts
│   │           ├── listar_orcamentos_use_case.ts
│   │           └── buscar_orcamento_publico_use_case.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/20261104193000_create_leads_and_orcamentos/
│   ├── routes/
│   │   ├── leads/leads_routes.ts
│   │   └── orcamentos/orcamentos_routes.ts
│   ├── schemas/
│   │   ├── leads/leads_schema.ts
│   │   └── orcamentos/orcamentos_schema.ts
│   └── db/seeds/routes_seed.ts
└── web/src/
    ├── api/
    │   ├── leads.service.ts
    │   └── orcamentos.service.ts
    ├── pages/
    │   ├── app/reservas/orcamentos/
    │   │   ├── index.tsx
    │   │   ├── novo.tsx
    │   │   └── [id]/editar.tsx
    │   └── public/orcamento/
    │       └── index.tsx
    ├── routes.tsx
    └── components/
```

**Structure Decision**: Monorepo orientado a Clean Architecture distribuído entre `packages/.contracts` (tipos universais), `packages/api` (entidades, casos de uso, repositórios Postgres/InMemory, schemas e rotas Fastify) e `packages/web` (páginas administrativas em `pages/app/reservas/orcamentos` e página pública mobile-first em `pages/public/orcamento`).

## Complexity Tracking

*Nenhuma violação aos princípios da constituição encontrada. Todas as diretrizes de Clean Architecture, SOLID e tipagem compartilhada foram estritamente preservadas.*
