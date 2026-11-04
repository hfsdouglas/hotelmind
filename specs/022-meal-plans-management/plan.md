# Implementation Plan: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

**Branch**: `022-meal-plans-management` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/022-meal-plans-management/spec.md)

**Input**: Feature specification from `/specs/022-meal-plans-management/spec.md`

## Summary

Implementar o módulo completo de Regimes de Alimentação e sua integração mandatória com o módulo de Tarifários:
1. **Contratos compartilhados**: Nova entidade `RegimeAlimentacao` em `packages/.contracts` e adição de `regime_alimentacao_id` obrigatório em `Tarifario`.
2. **Backend API**:
   - Entidade de domínio `RegimeAlimentacao`, validações e erros de conflito/não encontrado.
   - Repositório `IRegimeAlimentacaoRepository` e implementações (PostgreSQL e InMemory).
   - Casos de uso de CRUD (criar, editar, buscar, listar, ativar, desativar).
   - Atualização de `CriarTarifarioUseCase` e `EditarTarifarioUseCase` para exigir `regime_alimentacao_id`.
   - Modelagem Prisma com migrações em 3 etapas (criar tabela, adicionar coluna opcional, migrar e tornar obrigatória).
   - Rotas Fastify em `/regimes_alimentacao` com validação Zod.
   - Sincronização do seed de rotas e criação dos 4 regimes base (Café da Manhã, Meia Pensão, Pensão Completa, All Inclusive).
3. **Frontend Web & Admin**:
   - Componentes padronizados: `SaveButton` (com ícone de disquete e spinner de loading) e `ColorPicker` (com 8 presets e hex livre).
   - Páginas de consulta, inclusão e edição de Regimes de Alimentação (`/regimes_alimentacao`).
   - Atualização do formulário de tarifários (`TarifarioForm`) com seleção obrigatória de regime de alimentação.
   - Exibição de badge com a cor do regime na listagem de tarifários.

## Technical Context

**Language/Version**: TypeScript 5.8 (Node.js 22 LTS / Fastify 5 no backend; React 19 / Vite 6 no frontend)

**Primary Dependencies**: Fastify 5, Prisma 6, Zod, React 19, Tailwind CSS 4, Lucide React, TanStack Query, Vitest + Testing Library

**Storage**: PostgreSQL com Prisma ORM (tabela `regimes_alimentacao` com constraint unique em `[hotel_id, nome]` e FK em `tarifarios.regime_alimentacao_id`)

**Testing**: Vitest (`packages/api` e `packages/web`), cobertura com mocks in-memory e testes de integração de rota com Fastify `inject`

**Target Platform**: Servidor Linux / Docker (API) e navegadores web modernos (Web/Admin)

**Project Type**: Monorepo com microsserviços e Clean Architecture

**Performance Goals**: Tempo de resposta de criação e consulta de regimes < 50ms na API; renderização do color picker e listagem sem engasgos

**Constraints**: Clean Architecture estrita (Domain -> Repositories -> Use Cases -> Routes -> Schemas); `snake_case` compulsório; Biome para linting e formatação

**Scale/Scope**: Contratos compartilhados, backend API completo (entidades, repositórios, casos de uso, migrações, rotas), páginas do frontend e testes unitários

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — `packages/.contracts/src/regimes_alimentacao.ts` e `packages/.contracts/src/tarifarios.ts` foram definidos primeiro.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Estrutura em camadas: `entities/` -> `repositories/` -> `usecases/` -> `routes/` -> `schemas/`.
- **III. SOLID Principles**: ✅ Pass — Responsabilidade única para cada caso de uso; `IRegimeAlimentacaoRepository` injetado via dependência; schemas Zod isolados.
- **IV. Explicit over Implicit**: ✅ Pass — Dependências e IDs de hotel passados explicitamente nos casos de uso; erros tipados (`RegimeAlimentacaoConflictError`, `RegimeAlimentacaoNotFoundError`).
- **V. Low Coupling, High Cohesion**: ✅ Pass — Módulos desacoplados comunicando via interfaces e chaves de identificação.
- **VI. Clean Code**: ✅ Pass — Padrão `snake_case` em 100% dos arquivos e identificadores; formatação Biome (2 espaços, 80 colunas, aspas simples).
- **VII. Testability by Design**: ✅ Pass — Casos de uso testados com `InMemoryRegimeAlimentacaoRepository`; rotas testadas com Fastify `inject`; componentes testados com Testing Library.

## Project Structure

### Documentation (this feature)

```text
specs/022-meal-plans-management/
├── plan.md              # Este arquivo
├── checklists/
│   └── requirements.md  # Checklist de validação da especificação
└── spec.md              # Especificação de requisitos funcionais
```

### Source Code

```text
packages/
├── .contracts/src/
│   ├── regimes_alimentacao.ts
│   └── tarifarios.ts
├── api/src/
│   ├── core/
│   │   ├── entities/regime_alimentacao.ts
│   │   ├── errors/regime_alimentacao_errors.ts
│   │   ├── repositories/regimes_alimentacao/
│   │   └── usecases/regimes_alimentacao/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── routes/regimes_alimentacao/
│   └── schemas/regimes_alimentacao/
└── web/src/
    ├── api/regimes_alimentacao.service.ts
    ├── components/
    │   ├── forms/save_button.tsx
    │   └── ui/color_picker.tsx
    ├── pages/app/regimes_alimentacao/
    └── schemas/regime_alimentacao.schema.ts
```
