# Implementation Plan: Catálogo e Sincronização Idempotente de Rotas e Permissões do Sistema

**Branch**: `019-system-routes-permissions-seed` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/019-system-routes-permissions-seed/spec.md)

**Input**: Feature specification from `/specs/019-system-routes-permissions-seed/spec.md`

## Summary

Implementar a infraestrutura de sincronização de rotas e permissões de acesso do sistema:
1. Catálogo canônico `BASE_ROUTES` em `packages/api/src/db/seeds/routes_seed.ts` cobrindo Dashboard, Quartos, Categorias, Tarifários, Usuários e Grupos.
2. Função idempotente `seedRoutes(client?: DB)` para criar ou atualizar rotas oficiais, desativar rotas legadas (`ativo = false`) e vincular rotas a todos os hotéis (`RotaHotel`) e grupos administrativos (`GrupoRota`).
3. Adição dos scripts `pnpm db:seed:routes` na raiz do monorepo e no pacote `packages/api`.
4. Cobertura completa de testes automatizados unitários e de integração em `routes_seed.spec.ts`.

## Technical Context

**Language/Version**: TypeScript 5.8 (Node.js 22 LTS)

**Primary Dependencies**: Prisma Client 6, Fastify 5, tsx, Vitest

**Storage**: PostgreSQL via Prisma ORM (modelos `Rota`, `Hotel`, `RotaHotel`, `Grupo`, `GrupoRota`)

**Testing**: Vitest (`packages/api`) com mocks de Prisma Client

**Target Platform**: Servidor backend Node.js e pipelines de CI/CD

**Project Type**: Backend CLI / Script de infraestrutura em microsserviço

**Performance Goals**: Sincronização completa de catálogo e hotéis em < 5 segundos

**Constraints**: `snake_case` compulsório; Biome para linting; garantia absoluta de idempotência sem deleções físicas

**Scale/Scope**: `routes_seed.ts`, `routes_seed.spec.ts`, `index.ts` (seed principal), `package.json`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Segue o schema e modelo relacional mapeado em `packages/api/src/prisma/schema.prisma`.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Script de seed localizado estritamente na camada de infraestrutura/banco (`db/seeds/`).
- **III. SOLID Principles**: ✅ Pass — `seedRoutes` possui responsabilidade única e aceita injeção de dependência do cliente Prisma (`DB`).
- **IV. Explicit over Implicit**: ✅ Pass — Operações de upsert e vinculação com `skipDuplicates: true` explícitos.
- **V. Low Coupling, High Cohesion**: ✅ Pass — Pode ser executado isoladamente sem depender de seeds de outros agregados.
- **VI. Clean Code**: ✅ Pass — Constantes declarativas em `BASE_ROUTES` com tipagem estrita `RouteSeedItem`.
- **VII. Testability by Design**: ✅ Pass — `seedRoutes` aceita cliente Prisma mockado em testes unitários.

## Project Structure

### Documentation (this feature)

```text
specs/019-system-routes-permissions-seed/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Checklist de validação
└── tasks.md             # Phase 2 output
```

### Source Code

```text
packages/api/src/db/seeds/
├── index.ts
├── routes_seed.ts
└── routes_seed.spec.ts
```
