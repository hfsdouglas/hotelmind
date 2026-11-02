# Implementation Plan: Cadastro de Categorias e Quartos

**Branch**: `main` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-room-catalog/spec.md`

## Summary

Implementar o cadastro de categorias de quarto e o cadastro de quartos vinculados a uma categoria, incluindo a composição de camas e o limite de hóspedes. A solução adicionará entidades persistidas no contexto do hotel, contratos compartilhados, casos de uso e rotas protegidas na API, além de telas web para listar e criar categorias e quartos. O cadastro de quarto será salvo de forma consistente junto com suas configurações de camas.

## Technical Context

**Language/Version**: TypeScript strict; Node.js 20+; React 19

**Primary Dependencies**: Fastify, Zod, Prisma, PostgreSQL, React Router, TanStack Query, React Hook Form, Vitest e React Testing Library; nenhuma dependência nova

**Storage**: PostgreSQL via Prisma; novas tabelas para categorias, quartos e configurações de camas

**Testing**: Vitest; testes unitários de entidades, casos de uso e schemas; testes de rotas via `app.inject`; testes de páginas e componentes com React Testing Library

**Target Platform**: API HTTP protegida pela autenticação existente e SPA web responsiva em navegadores modernos

**Project Type**: Monorepo com serviço web/API e aplicação web administrativa

**Performance Goals**: Listagens e confirmações devem responder dentro do padrão atual da aplicação; o usuário deve perceber a atualização do cadastro imediatamente após uma operação bem-sucedida

**Constraints**: Respeitar Clean Architecture, contratos em `packages/.contracts`, nomes snake_case, autenticação por hotel e consistência transacional do quarto com suas camas; não incluir edição ou exclusão nesta entrega

**Scale/Scope**: Um agregado de categoria/quarto no `packages/api`, dois contratos compartilhados, quatro operações de consulta/criação e quatro páginas/fluxos web em `packages/web`, com testes co-localizados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: PASS — tipos de categoria, quarto e cama primeiro em `packages/.contracts`; schemas da API derivados desses contratos.
- **II. Clean Architecture & Strict Layer Boundaries**: PASS — rotas validam/serializam, casos de uso orquestram, repositórios persistem e Prisma fica na infraestrutura.
- **III. SOLID**: PASS — casos de uso separados por intenção e dependências injetadas por interfaces de repositório.
- **IV. Explicit over Implicit**: PASS — hotel, categoria e configurações são dados explícitos; validações e erros são declarados.
- **V. Low Coupling, High Cohesion**: PASS — API e web comunicam-se pelos contratos e HTTP, sem atravessar camadas.
- **VI. Clean Code**: PASS — novos arquivos e símbolos seguem snake_case e responsabilidades únicas.
- **VII. Testability by Design**: PASS — repositórios terão contratos/fakes, schemas terão testes e rotas serão verificadas por injeção HTTP.

Nenhuma violação constitucional exige justificativa.

### Post-Design Re-check

- **I, II, III, IV, V, VI e VII**: PASS — os artefatos de pesquisa, modelo, contratos e quickstart mantêm contratos compartilhados antes da implementação, isolamento por hotel, transação no agregado de quarto, camadas explícitas, nomes snake_case e estratégias de teste para cada fronteira.
- Não foram introduzidas dependências novas, acesso direto ao banco em rotas ou tipos compartilhados fora de `packages/.contracts`.

## Project Structure

### Documentation (this feature)

```text
specs/011-room-catalog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── categorias_quartos.md
│   └── quartos.md
└── tasks.md                 # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
packages/.contracts/src/
├── categorias_quartos.ts
├── quartos.ts
└── index.ts

packages/api/src/
├── core/entities/
│   ├── categoria_quarto.ts
│   ├── quarto.ts
│   └── configuracao_cama.ts
├── core/errors/
│   ├── categoria_quarto_errors.ts
│   └── quarto_errors.ts
├── core/repositories/
│   ├── categorias_quartos/categoria_quarto.repository.ts
│   └── quartos/quarto.repository.ts
├── core/usecases/
│   ├── categorias_quartos/criar_categoria_quarto_use_case.ts
│   ├── categorias_quartos/listar_categorias_quarto_use_case.ts
│   ├── quartos/criar_quarto_use_case.ts
│   └── quartos/listar_quartos_use_case.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/<timestamp>_add_room_catalog/migration.sql
├── routes/
│   ├── categorias_quartos/categorias_quartos_routes.ts
│   └── quartos/quartos_routes.ts
└── schemas/
    ├── categorias_quartos/categorias_quartos_schema.ts
    └── quartos/quartos_schema.ts

packages/web/src/
├── api/
│   ├── categorias_quartos.service.ts
│   └── quartos.service.ts
├── pages/app/
│   ├── categorias_quartos/index.tsx
│   ├── categorias_quartos/novo.tsx
│   ├── quartos/index.tsx
│   └── quartos/novo.tsx
└── routes.tsx
```

**Structure Decision**: Manter a divisão existente entre `packages/.contracts`, `packages/api` e `packages/web`. O backend seguirá o padrão de grupos (contrato → schema → repositório → caso de uso → rota), enquanto o frontend seguirá o padrão de listagem/formulário usado por grupos e usuários.

## Complexity Tracking

*No Constitution Check violations — table not required.*
