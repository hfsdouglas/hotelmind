# Hotel Management System (HotelMind)

HotelMind is a hotel management system built as a monorepo with a microservices architecture.

## Monorepo Layout

Packages live under `packages/`. Each package represents an autonomous service or application:

```text
packages/
  .contracts/    # Shared TypeScript interfaces and types
  api/           # HTTP server / backend API
  web/           # Hotel operations web application
  admin/         # Platform administration panel
```

### Package Responsibilities & References

When working inside a specific package, consult its local authoritative guide:

- **[`packages/api/CLAUDE.md`](packages/api/CLAUDE.md)**: Fastify HTTP server, Clean Architecture, Prisma, PostgreSQL, Zod schemas, multi-tenant isolation (`hotel_id`), and TDD with in-memory fakes.
- **[`packages/admin/CLAUDE.md`](packages/admin/CLAUDE.md)**: Platform administrative panel, multi-hotel awareness, platform vs hotel scope, `CrudFormLayout`, and TanStack Query.
- **[`packages/web/CLAUDE.md`](packages/web/CLAUDE.md)**: Hotel operations web frontend, `src/components/` structure, `SearchResultsSuspense`, `usePaginacao`, and dynamic sidebar.
- **`packages/.contracts/`**: Shared TypeScript contracts consumed across packages.

### Shared Contracts (`packages/.contracts`)

- **Types only**: Interfaces and types shared across packages.
- **No runtime implementations**: Never place business logic, services, or runtime code here.
- **No Zod schemas**: Validation schemas live inside each consuming service's `schemas/` directory.
- Update contracts first when an interface changes, then update consumers.

## Dependency Management (pnpm)

- Root `package.json` manages workspace declarations and shared development tooling (Biome, TypeScript, Vitest).
- Package-specific runtime dependencies must be installed within their respective package directory (or via `pnpm --filter <pkg> add <dep>`).
- Always check workspace layout and dependency ownership before installing new libraries.

## Global Naming Conventions

Use **snake_case** for repository files, folders, route names, schemas, repositories, use cases, and services.

| Good | Bad |
|---|---|
| `create_user_use_case.ts` | `CreateUserUseCase.ts` |
| `user_repository.ts` | `userRepo.ts` |
| `auth_service.ts` | `AuthService.ts` |
| `users_routes.ts` | `usersRoutes.ts` |
| `create_user_schema.ts` | `createUserSchema.ts` |

## Code Quality & Tooling

- **Biome** is used for linting and formatting across the monorepo (`biome.json`):
  - 2-space indentation, 80-character line width.
  - Single quotes (`'`).
  - Semicolons as needed (`asNeeded`).

## General Development Principles

- **Test-Driven Development (TDD)**: Mandatory across all packages. Write tests before writing production code (Red → Green → Refactor).
- **Strict Multi-Tenancy**: Data is strictly scoped per hotel. Cross-hotel data leakage is a critical security vulnerability.
- **Separation of Concerns**: Domain logic remains independent from frameworks and transport layers.

## Git Commit Policy

### Mandatory Approval
Before creating, suggesting, or executing any git commit, always ask for explicit user approval:

> Would you like me to create a commit for these changes?

Only proceed after receiving clear affirmative confirmation from the user.

### Commit Message Standard
All commit messages must follow the Conventional Commits specification:

```text
<type>(<scope>): <description>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

### Commit Identity
Always use the repository's configured Git identity:
- Never manually set `user.name` or `user.email`.
- Never use AI-related identities ("Claude", "bot", "assistant") or `Co-Authored-By` trailers with AI identifiers.
- Never use `--author`.
- Source of truth: `git config user.name` / `git config user.email` (fallback to global).

### Commit Quality
- Atomic commits focused on a single logical change.
- Imperative mood, concise summary.
- Verify tests and linting before proposing a commit.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/025-reservations-management/plan.md
<!-- SPECKIT END -->
