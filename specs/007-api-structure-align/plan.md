# Implementation Plan: API Package Structural Alignment

**Branch**: `007-api-structure-align` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Note**: v2 — corrected after misreading CLAUDE.md in v1. The key correction: ALL repository implementations move from `db/repositories/` INTO `core/repositories/<domain>/`; `db/` retains only `seeds/`; `core/repositories/index.ts` is populated (not deleted).

## Summary

Align `packages/api/src` with the structure documented in `packages/api/CLAUDE.md`. Three work areas:

1. **Repository migration** (largest): Move all `db/repositories/` content into `core/repositories/` as domain subdirectories. Each domain gets `core/repositories/<domain>/` containing the contract file, `implementation/`, and `in-memory/` (where applicable). Populate `core/repositories/index.ts`. Delete `db/repositories/`.
2. **Prisma singleton move**: `db/client.ts` → `lib/prisma.ts`. Update 17 import sites.
3. **Plugin renames**: 7 plugin files renamed from kebab-case to `snake_case`. Update 4 import sites.

Zero behavior changes. Zero new features. All tests must remain green throughout.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+)

**Primary Dependencies**: Fastify, Prisma, Zod, `@prisma/adapter-pg`

**Storage**: PostgreSQL via Prisma ORM

**Testing**: Vitest (`.spec.ts` files co-located with source)

**Target Platform**: Linux server (pnpm workspace monorepo)

**Project Type**: HTTP web service (backend API)

**Performance Goals**: No change — structural refactor only

**Constraints**: All existing tests must remain green; no functional regression; TypeScript must compile with zero errors

**Scale/Scope**: ~85 source files; 8 contract moves; 12 implementation/fake moves; 17 client import sites; 7 plugin renames; ~30 contract import path updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies | Status |
|---|---|---|
| I. Contract-First Development | No new contracts | ✅ Pass — no new interfaces added; existing contracts moved only |
| II. Clean Architecture & Strict Layer Boundaries | Yes — primary goal | ✅ Pass — moves enforce the documented boundary: `core/repositories/` owns everything repository-related |
| III. SOLID Principles | Yes | ✅ Pass — co-locating contracts with implementations doesn't violate any SOLID rule; DI is unchanged |
| IV. Explicit over Implicit | Yes | ✅ Pass — renaming plugins and populating the index makes dependencies explicit |
| V. Low Coupling, High Cohesion | Yes | ✅ Pass — `db/` shrinks to only seeds; `core/repositories/` becomes the single cohesive home |
| VI. Clean Code | Yes | ✅ Pass — snake_case plugin renames directly serve this principle |
| VII. Testability by Design | Yes | ✅ Pass — in-memory fakes move with their domains; test infrastructure is preserved |

**Post-Phase 1 re-check**: All principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-api-structure-align/
├── plan.md              # This file
├── research.md          # Phase 0 output — full change inventory
├── data-model.md        # Phase 1 output — target directory tree and change tables
├── quickstart.md        # Phase 1 output — 10-step validation guide
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code — Target State

```text
packages/api/src/
├── core/
│   └── repositories/
│       ├── index.ts                          # POPULATED — 8 re-exports
│       ├── users/
│       │   ├── user.repository.ts            # Moved from flat user_repository.ts
│       │   ├── implementation/postgres_user_repository.ts
│       │   └── in-memory/in_memory_user_repository.ts
│       ├── usuarios/
│       │   ├── usuario.repository.ts
│       │   ├── implementation/postgres_usuario_repository.ts
│       │   └── in-memory/in_memory_usuario_repository.ts
│       ├── hotels/
│       │   ├── hotel.repository.ts
│       │   ├── implementation/postgres_hotel_repository.ts
│       │   └── in-memory/in_memory_hotel_repository.ts
│       ├── grupos/
│       │   ├── grupo.repository.ts
│       │   ├── implementation/postgres_grupo_repository.ts
│       │   └── in-memory/in_memory_grupo_repository.ts
│       ├── rotas/
│       │   ├── rota.repository.ts
│       │   └── implementation/postgres_rota_repository.ts
│       ├── administrators/
│       │   ├── administrator.repository.ts
│       │   └── implementation/postgres_administrator_repository.ts
│       └── admin/
│           ├── admin_hotel.repository.ts
│           ├── admin_rota.repository.ts
│           └── implementation/
│               ├── postgres_admin_hotel_repository.ts
│               └── postgres_admin_rota_repository.ts
├── db/
│   └── seeds/index.ts                        # UNCHANGED
├── lib/
│   ├── prisma.ts                             # MOVED from db/client.ts
│   └── bcrypt_password_hasher.ts             # UNCHANGED
└── plugins/
    ├── cookie_plugin.ts                      # Renamed from fastify-cookie.ts
    ├── cors_plugin.ts
    ├── jwt_plugin.ts
    ├── swagger_plugin.ts
    ├── auth_plugin.ts
    ├── admin_auth_plugin.ts
    └── fastify_routes.ts
```

**Structure Decision**: Single-package scope. All changes are within `packages/api/src/`. No new top-level directories.
