# Feature Specification: API Package Structural Alignment

**Feature Branch**: `007-api-structure-align`

**Created**: 2026-06-30

**Status**: Draft (v2 — corrected after misreading CLAUDE.md)

**Input**: User description: "There were significant changes to the project structure. You are responsible for moving files and refactoring wherever necessary." (with reference to `packages/api/CLAUDE.md`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer locates any repository artifact in one place (Priority: P1)

A developer looking for the Postgres implementation of the hotel repository, the in-memory fake for testing, or the interface contract goes to one place: `src/core/repositories/hotels/`. Everything related to the hotels repository domain is co-located in that directory. The developer never needs to look in `src/db/repositories/`.

**Why this priority**: The fundamental structural error is that contracts live in `core/repositories/` as flat files while implementations live in `db/repositories/`. The CLAUDE.md now defines a single home for each domain: a subdirectory under `core/repositories/` containing the contract, implementation, and in-memory fake together. Without this, developers must mentally track two separate trees.

**Independent Test**: A developer can navigate to `src/core/repositories/grupos/` and find the Grupo contract file, the Postgres implementation, and the in-memory fake — without opening `src/db/`.

**Acceptance Scenarios**:

1. **Given** the current structure has contracts flat in `core/repositories/` and implementations in `db/repositories/<domain>/`, **When** the alignment is complete, **Then** each domain has a subdirectory under `core/repositories/<domain>/` containing its contract file, `implementation/` subfolder, and `in-memory/` subfolder (where applicable).
2. **Given** `db/repositories/` exists with 8 domain subdirectories, **When** the alignment is complete, **Then** `db/` contains only `seeds/` — no `repositories/` subdirectory.
3. **Given** `core/repositories/index.ts` is currently empty, **When** the alignment is complete, **Then** it re-exports every concrete implementation under a domain alias (e.g., `HotelRepository`, `GrupoRepository`).

---

### User Story 2 - Developer imports repository by domain alias, not concrete class (Priority: P2)

A route that needs to instantiate a hotel repository imports from `@/core/repositories` (the index) and gets `HotelRepository` back — a concrete class with the right implementation, without needing to know the file path.

**Why this priority**: The `db/repositories/index.ts` provided this abstraction before; after the move, `core/repositories/index.ts` takes over this role. Without a populated index, every consumer must know the concrete class path.

**Independent Test**: A route file can add `import { HotelRepository } from '@/core/repositories'` and use it directly without importing the concrete Postgres class by its full path.

**Acceptance Scenarios**:

1. **Given** `core/repositories/index.ts` exports all concrete implementations, **When** a route imports `{ HotelRepository }` from `@/core/repositories`, **Then** it receives the Postgres-backed class without needing to reference the implementation folder.
2. **Given** route files currently import concrete classes from `@/db/repositories/<domain>/implementation/...`, **When** the alignment is complete, **Then** those routes import from `@/core/repositories` (the index) or from the domain subdirectory.

---

### User Story 3 - Developer finds the Prisma client singleton in `lib/` (Priority: P3)

A developer looking for the database connection setup finds it at `src/lib/prisma.ts`, alongside other infrastructure wrappers like `bcrypt_password_hasher.ts`. The `src/db/` directory no longer contains any connection or ORM configuration.

**Why this priority**: `src/db/client.ts` is a naming misfit — `db/` should be data-access logic (seeds), not infrastructure configuration. Moving it to `lib/` matches CLAUDE.md and makes the purpose of each directory self-evident.

**Independent Test**: A project-wide search for `db/client` returns zero results; a search for `lib/prisma` returns all expected import sites.

**Acceptance Scenarios**:

1. **Given** `src/db/client.ts` exists, **When** alignment is complete, **Then** the file exists at `src/lib/prisma.ts` with identical content and `src/db/client.ts` is deleted.
2. **Given** 17 files import from `@/db/client`, **When** alignment is complete, **Then** all 17 import `@/lib/prisma` and zero files reference `@/db/client`.

---

### User Story 4 - Developer reads the plugins directory and understands each file's purpose (Priority: P4)

Every file in `src/plugins/` uses `snake_case` naming with a suffix that describes what kind of file it is. No file is prefixed with the framework name. A developer new to the project reads `cookie_plugin.ts`, `jwt_plugin.ts`, `auth_plugin.ts` and immediately understands what each configures.

**Why this priority**: Plugin filenames are currently a mix of kebab-case, framework-prefixed names, and inconsistent conventions. This is a lower-priority cosmetic fix but is required for full CLAUDE.md compliance.

**Independent Test**: `ls src/plugins/` returns only snake_case filenames; zero files contain a hyphen.

**Acceptance Scenarios**:

1. **Given** plugin files with names like `fastify-cookie.ts`, `auth-plugin.ts`, `admin-auth-plugin.ts`, **When** alignment is complete, **Then** every file in `src/plugins/` uses snake_case: `cookie_plugin.ts`, `auth_plugin.ts`, `admin_auth_plugin.ts`, etc.
2. **Given** `server.ts` and two spec files import the old plugin names, **When** alignment is complete, **Then** all imports reference the new snake_case names.

---

### Edge Cases

- What happens to the cross-repository import? `usuario_repository.ts` imports `PaginationInput` and `PaginatedResult` from `grupo_repository.ts`. When both move to subdirectories and are renamed, this cross-contract import must also be updated.
- What happens to the `db/repositories/index.ts`? After all implementations move to `core/repositories/`, this file is deleted; `core/repositories/index.ts` takes over its role.
- What happens to tests that import in-memory fakes from `@/db/repositories/...`? Four spec files import in-memory fakes using the old path; all must be updated to the new `core/repositories/` path.
- What if a domain has no in-memory fake? (e.g., `rotas`, `administrators`, `admin`) The `in-memory/` subdirectory is not created for those domains — only directories that exist today are moved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every domain MUST have a subdirectory under `core/repositories/<domain>/` containing: the contract file (interface), an `implementation/` subfolder with the Postgres class, and an `in-memory/` subfolder with the test fake (where one currently exists).
- **FR-002**: `core/repositories/index.ts` MUST be populated to re-export every concrete implementation under a stable domain alias (e.g., `HotelRepository`, `GrupoRepository`).
- **FR-003**: `db/repositories/` MUST be removed entirely; `db/` MUST contain only `seeds/` after the migration.
- **FR-004**: `src/db/client.ts` MUST be moved to `src/lib/prisma.ts`; the old path MUST NOT exist after the migration.
- **FR-005**: All 17 files that import from `@/db/client` MUST be updated to import from `@/lib/prisma`.
- **FR-006**: All import sites referencing `@/db/repositories` (route files, spec files, use case specs) MUST be updated to reference `@/core/repositories`.
- **FR-007**: All import sites referencing flat contract files (e.g., `@/core/repositories/grupo_repository`) MUST be updated to reference the new subdirectory path (e.g., `@/core/repositories/grupos/grupo.repository`).
- **FR-008**: Every file in `src/plugins/` MUST use snake_case naming; the 7 currently non-conforming files MUST be renamed and their import sites updated.
- **FR-009**: All automated tests MUST pass without modification after every change; broken imports are not acceptable.
- **FR-010**: No runtime behavior, API contract, or business logic MUST change as a result of this migration.

### Key Entities

- **Repository domain subdirectory**: A folder under `core/repositories/<domain>/` that co-locates the contract, implementation, and in-memory fake for one aggregate root.
- **Contract file**: The TypeScript interface file within `core/repositories/<domain>/<domain>.repository.ts`. Contains no implementation code.
- **Central re-export index**: `core/repositories/index.ts`. Maps concrete implementation classes to domain aliases. Updated from an empty file to a populated re-export module.
- **Plugin file**: A Fastify integration file under `src/plugins/`, renamed to `snake_case` with a descriptive suffix.
- **Prisma singleton**: The configured database client, relocated from `src/db/client.ts` to `src/lib/prisma.ts`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `find src/db -type f | grep -v seeds` returns zero results — no non-seed files remain under `db/`.
- **SC-002**: `grep -r "@/db/client" src` returns zero results — all Prisma singleton imports use the new path.
- **SC-003**: `grep -r "@/db/repositories" src` returns zero results — all repository imports use `core/repositories`.
- **SC-004**: `ls src/plugins/ | grep -` returns zero results — no hyphenated plugin filenames remain.
- **SC-005**: The full test suite passes with zero failures after the migration.
- **SC-006**: TypeScript compilation (`tsc --noEmit`) completes with zero errors after the migration.

## Assumptions

- The CLAUDE.md for `packages/api` reflects the **target** structure; the codebase must be updated to match it.
- Contract files in domain subdirectories use the naming pattern `<domain>.repository.ts` (dot notation, as shown in the CLAUDE.md Project Structure section), not `<domain>_repository.ts`.
- Domains without in-memory fakes today (`rotas`, `administrators`, `admin`) will not have an `in-memory/` subfolder created — only existing fakes are moved.
- The `user`/`usuario` naming split (two separate repository contracts for auth vs. user management) is intentional and both are kept; they become `core/repositories/users/user.repository.ts` and `core/repositories/usuarios/usuario.repository.ts`.
- No new features, entities, or database migrations are in scope.
- The existing `PaginationInput`/`PaginatedResult` types shared between `grupo_repository` and `usuario_repository` will remain in the grupos domain contract file after the move; the cross-import path will be updated accordingly.
