# Implementation Plan: Seleção Multi-Categoria, Estadia Mínima e Máscara Monetária nos Tarifários

**Branch**: `029-rate-plan-categories-min-stay` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/029-rate-plan-categories-min-stay/spec.md`

## Summary

Expandir o módulo de tarifários do HotelMind para suportar a seleção de múltiplas categorias de acomodações em uma etapa dedicada (Passo 2) com cards padronizados da área de reservas/orçamentos, estipular quantidade mínima de diárias (`minimo_diarias`) com validação comercial no motor de reservas/orçamentos, e implementar máscara monetária em Real brasileiro (`R$ 0,00`) no campo de valor da diária.

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode), Node.js v26+, React 19

**Primary Dependencies**: Fastify, Prisma ORM, PostgreSQL, Zod, TanStack Query, Radix UI, Lucide React, Sonner

**Storage**: PostgreSQL (`tarifarios`, `tarifarios_datas`, `tarifarios_categorias_quartos`)

**Testing**: Vitest, React Testing Library, In-Memory Fakes, Fastify `app.inject()`, MSW

**Target Platform**: Web application (Desktop e Mobile)

**Project Type**: Full-stack Monorepo (`packages/.contracts`, `packages/api`, `packages/web`)

**Performance Goals**: Renderização ágil de seleção de cards (<50ms), consulta de períodos de tarifários multi-categoria em <100ms

**Constraints**: Isolamento estrito multi-inquilino (`hotel_id`), validação sem sobreposição de tarifas ativas para a mesma categoria e canal

**Scale/Scope**: Operação em hotéis independentes e redes com dezenas de categorias e centenas de quartos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Contract-First Development**:
  - `packages/.contracts/src/tarifarios.ts` é atualizado primeiro com as novas tipagens (`categoria_quarto_ids`, `minimo_diarias`).
  - Zod schemas em `packages/api` e `packages/web` derivam dos tipos do contrato. Zero Zod em `.contracts`.
- [x] **Principle II: Clean Architecture & Strict Layer Boundaries**:
  - Entidade `Tarifario` pura em `packages/api/src/core/entities/tarifario.ts`.
  - Casos de uso (`criar_tarifario_use_case`, `editar_tarifario_use_case`, `listar_tarifarios_use_case`) recebem repositório injetado.
  - Rotas Fastify apenas validam com Zod e chamam os casos de uso.
- [x] **Principle III: SOLID Principles**:
  - Interfaces segregadas e inversão de dependência em repositórios.
- [x] **Principle IV: Explicit over Implicit**:
  - `hotel_id` obtido estritamente via autenticação JWT (`request.user.hotelId`), nunca do body/query do cliente.
- [x] **Principle V: Low Coupling, High Cohesion**:
  - Lógica de cálculo e precificação isolada em `TarifarioPricingService`.
- [x] **Principle VI: Clean Code**:
  - Todos os arquivos, variáveis e rotas em `snake_case`. Nomes descritivos e semânticos.
- [x] **Principle VII: Testability by Design**:
  - Repositório in-memory atualizado para testes unitários dos casos de uso sem banco de dados.

## Project Structure

### Documentation (this feature)

```text
specs/029-rate-plan-categories-min-stay/
├── plan.md              # Este plano
├── research.md          # Pesquisa arquitetural e decisões de design
├── data-model.md        # Modelagem de dados e diagramas relacionais
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/           # Especificação dos contratos TypeScript
└── tasks.md             # Tarefas ordenadas para execução
```

### Source Code

```text
packages/.contracts/src/
└── tarifarios.ts        # Interfaces e DTOs compartilhados

packages/api/
├── prisma/
│   └── schema.prisma    # Modelo TarifarioCategoriaQuarto e campo minimo_diarias
└── src/
    ├── core/
    │   ├── entities/tarifario.ts
    │   ├── repositories/tarifarios/
    │   │   ├── in-memory/in_memory_tarifario_repository.ts
    │   │   └── implementation/postgres_tarifario_repository.ts
    │   ├── services/tarifario_pricing_service.ts
    │   └── usecases/tarifarios/
    └── routes/tarifarios/

packages/web/
└── src/
    ├── api/tarifarios.service.ts
    ├── schemas/tarifarios/tarifario_schema.ts
    ├── hooks/
    │   ├── use_currency_mask.ts
    │   └── use_tarifarios.ts
    ├── components/tarifarios/
    │   ├── tarifario_category_cards.tsx
    │   ├── tarifario_form.tsx
    │   └── tarifario_period_summary.tsx
    └── pages/app/tarifarios/
        ├── index.tsx
        ├── novo.tsx
        └── [id]/editar.tsx
```

**Structure Decision**: Padrão Monorepo Clean Architecture com contratos compartilhados em `.contracts`, API em `packages/api` e interface do operador em `packages/web`.

## Complexity Tracking

Não há violações constitucionais identificadas.
