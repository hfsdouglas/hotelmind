# HotelMind

Hotel management system: pnpm monorepo, one service per package.

```text
packages/
  .contracts/   # Shared TypeScript types (consumed by all packages)
  api/          # Fastify backend            → packages/api/CLAUDE.md
  web/          # Hotel operations front-end → packages/web/CLAUDE.md
  admin/        # Platform admin front-end   → packages/admin/CLAUDE.md
```

Shared rules: front-end (web + admin) `.claude/rules/front-end.md`; back-end
(api and future API services) `.claude/rules/back-end.md`.

## Principles

- **TDD is mandatory** in every package: Red → Green → Refactor, tests first.
- **Strict multi-tenancy**: all business data is scoped by hotel. Cross-hotel
  leakage is a critical security bug.
- **Separation of concerns**: domain logic never depends on frameworks or
  transport.

## Shared Contracts (`packages/.contracts`)

- Types and interfaces only: no runtime code, no business logic, no Zod schemas
  (schemas live in each package's `schemas/`).
- When an interface changes, update the contract first, then its consumers.

## Pagination Contract (API ↔ front-ends)

| Param | Type | Default | Notes |
|---|---|---|---|
| `pagina` | number | 1 | 1-indexed |
| `limite` | number | 50 | max 250 (UI options: 50, 100, 250) |
| `busca` | string | — | search term |
| `ordenar_por` | string | — | sort field |
| `direcao` | `asc` \| `desc` | `asc` | sort direction |

Response: `{ data: T[], meta: { pagina, limite, total, ultima_pagina } }`.

## Conventions

- **snake_case** for files, folders, routes, schemas, repositories, use cases
  and services (`create_user_use_case.ts`, `users_routes.ts`), never
  PascalCase/camelCase file names.
- **Biome** (`biome.json`) handles lint and format; run it instead of
  formatting by hand.
- **Dependencies**: root `package.json` only holds shared tooling (Biome,
  TypeScript, Vitest). Runtime deps go in the owning package
  (`pnpm --filter <pkg> add <dep>`).

## Git Commits

- **Always ask before committing**: "Would you like me to create a commit for
  these changes?" Proceed only after explicit approval.
- Conventional Commits: `<type>(<scope>): <description>`, types `feat`, `fix`,
  `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`. Imperative mood, one logical change per commit.
- Use the configured Git identity only: never set `user.name`/`user.email`,
  never `--author`, never AI identities or AI `Co-Authored-By` trailers.
- Run Biome before proposing a commit.
