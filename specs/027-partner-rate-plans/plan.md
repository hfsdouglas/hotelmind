# Implementation Plan: Tarifários Vinculados a Parceiros Comerciais

**Branch**: `027-partner-rate-plans` | **Date**: 2026-11-06 | **Spec**: [specs/027-partner-rate-plans/spec.md](spec.md)

**Input**: Feature specification from `specs/027-partner-rate-plans/spec.md`

## Summary

Implementar a vinculação opcional de tarifários a parceiros comerciais (`parceiro_id`), restringindo a apresentação e o cálculo de suítes e tarifas em orçamentos e reservas quando um parceiro comercial for indicado. Adicionalmente, reestruturar a arquitetura de seeds em módulos separados por contexto (isolando o seed de rotas de produção dos seeds de teste/desenvolvimento) e semear pelo menos 5 parceiros comerciais com perfis comerciais distintos.

## Technical Context

**Language/Version**: TypeScript 5.5+ / Node.js 20+

**Primary Dependencies**: Fastify, Prisma ORM, React 18, TanStack Query v5, React Hook Form, Zod, Tailwind CSS, Lucide React, Sonner

**Storage**: PostgreSQL (Prisma schema: `tarifarios`, `orcamentos`, `reservas`, `parceiros`, `quartos`, `categorias_quartos`)

**Testing**: Vitest (Unit e Use Cases com repositórios In-Memory, Integration de Rotas com `app.inject()`, Frontend com Vitest e Testing Library)

**Target Platform**: Web application (Desktop/Mobile responsive) + REST API backend

**Project Type**: Monorepo Full-Stack (`packages/.contracts`, `packages/api`, `packages/web`, `packages/admin`)

**Performance Goals**: Tempo de resposta de cotação e filtragem de suítes em tela < 500ms; execução de seeds de teste < 5s

**Constraints**:
- Strict multi-tenancy: todas as operações filtradas estritamente por `hotel_id` do token autenticado
- Isolamento de seed de produção: `routes_seed.ts` não pode conter nem disparar dados mock de teste
- Regra de localização de componentes: zero diretórios `components/` dentro de `src/pages/**` (apenas em `src/components/**`)

**Scale/Scope**: Múltiplos parceiros por hotel; tarifários sazonais e por categoria de acomodação; orçamentos e reservas sincronizados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|---|---|---|
| **I. Contract-First Development** | DTOs e entidades adicionados primeiro em `packages/.contracts/src/` (`tarifarios.ts`, `orcamentos.ts`, `reservas.ts`) sem Zod ou runtime code. | ✅ APROVADO |
| **II. Clean Architecture & Strict Boundaries** | Entidades puras em `core/entities`, repositórios abstratos com implementações Prisma e fakes In-Memory, Use Cases unitários desacoplados de HTTP, rotas como composition roots. | ✅ APROVADO |
| **III. SOLID Principles** | Cada use case com responsabilidade única; inversão de dependência em construtores; repositórios substituíveis por fakes em testes. | ✅ APROVADO |
| **IV. Explicit over Implicit** | Sem mágicas ou side effects ocultos; `hotel_id` e `parceiro_id` injetados explicitamente; erros de negócio lançados tipados (`TarifarioSemCoberturaError`, etc.). | ✅ APROVADO |
| **V. Low Coupling, High Cohesion** | Camadas não vazam abstrações; Prisma nunca mockado diretamente; contratos compartilhados via pacote dedicado. | ✅ APROVADO |
| **VI. Clean Code** | Código autoexplicativo, nomenclatura em português (`snake_case`) nos modelos e banco, nomes de métodos semânticos. | ✅ APROVADO |
| **VII. Testability by Design** | Testes TDD em use cases com In-Memory repos, rotas testadas via Fastify inject, páginas web com MSW. | ✅ APROVADO |
| **Frontend Component Location Rule** | Novos componentes de tarifário, orçamento e reserva alocados estritamente sob `packages/web/src/components/**`. Zero pastas `components/` sob `pages/`. | ✅ APROVADO |

## Project Structure

### Documentation (this feature)

```text
specs/027-partner-rate-plans/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── tarifarios.contract.ts
│   ├── orcamentos.contract.ts
│   └── reservas.contract.ts
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
packages/
├── .contracts/
│   └── src/
│       ├── tarifarios.ts            # Atualizar com parceiro_id opcional
│       ├── orcamentos.ts            # Atualizar com parceiro_id opcional
│       ├── reservas.ts              # Garantir compatibilidade de consulta de disponibilidade
│       └── index.ts                 # Re-export central
│
├── api/
│   ├── src/
│   │   ├── prisma/
│   │   │   └── schema.prisma        # parceiro_id em Tarifario e Orcamento
│   │   ├── db/seeds/
│   │   │   ├── producao/
│   │   │   │   └── rotas_seed.ts    # Seed de produção de rotas e permissões
│   │   │   ├── desenvolvimento/
│   │   │   │   ├── hotel_seed.ts
│   │   │   │   ├── acomodacoes_seed.ts
│   │   │   │   ├── parceiros_seed.ts # 5+ parceiros comerciais de teste
│   │   │   │   └── tarifarios_seed.ts
│   │   │   ├── routes_seed.ts       # Re-export retrocompatível
│   │   │   └── index.ts             # Orquestrador de seeds de desenvolvimento
│   │   ├── core/
│   │   │   ├── entities/
│   │   │   │   ├── tarifario.ts
│   │   │   │   └── orcamento.ts
│   │   │   ├── repositories/
│   │   │   │   ├── tarifarios/
│   │   │   │   ├── orcamentos/
│   │   │   │   └── reservas/
│   │   │   ├── services/
│   │   │   │   └── tarifario_pricing_service.ts
│   │   │   └── usecases/
│   │   │       ├── tarifarios/
│   │   │       ├── orcamentos/
│   │   │       └── reservas/
│   │   ├── schemas/
│   │   │   ├── tarifarios/
│   │   │   ├── orcamentos/
│   │   │   └── reservas/
│   │   └── routes/
│   │       ├── tarifarios/
│   │       ├── orcamentos/
│   │       └── reservas/
│
└── web/
    └── src/
        ├── components/
        │   ├── tarifarios/
        │   │   └── tarifario_form.tsx # Seleção de parceiro comercial
        │   ├── orcamentos/
        │   └── reservas/
        ├── schemas/
        │   ├── tarifarios/
        │   ├── orcamentos/
        │   └── reservas/
        ├── api/
        │   ├── tarifarios.service.ts
        │   ├── orcamentos.service.ts
        │   └── reservas.service.ts
        └── pages/
            └── app/
                ├── tarifarios/
                └── reservas/
                    ├── orcamentos/
                    │   ├── novo.tsx
                    │   └── [id]/editar.tsx
                    ├── nova.tsx
                    └── [id]/editar.tsx
```

**Structure Decision**: Monorepo com divisão de responsabilidades estrita. Contratos em `packages/.contracts`, backend em `packages/api`, frontend operacional em `packages/web`. Seeds refatorados para garantir isolamento limpo entre o ambiente de produção (`producao/rotas_seed.ts`) e o ambiente de desenvolvimento/testes (`desenvolvimento/*`).

## Complexity Tracking

*Nenhuma violação aos princípios constitucionais. Todos os portões foram validados e aprovados.*
