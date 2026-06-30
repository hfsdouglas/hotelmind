# Research: API Package Structural Alignment

**Feature**: 007-api-structure-align
**Date**: 2026-06-30 (v2 — corrected after misreading CLAUDE.md)

---

## Correction from v1

v1 of this research incorrectly concluded that:
- `core/repositories/index.ts` should be **deleted** — WRONG: it should be **populated**
- `db/repositories/` should be **kept** — WRONG: it should be **removed entirely**
- Implementations live in `db/repositories/` — WRONG: the target moves all implementations to `core/repositories/<domain>/implementation/`

The CLAUDE.md Project Structure section is the authoritative target. The Repository Organization section (which still referenced `db/repositories/`) was an outdated section that had not been updated to match the new structure diagram.

---

## Finding 1: Repository Migration Map

**Decision**: Move all 13 implementation/fake files from `db/repositories/` to matching paths under `core/repositories/`. Move 8 flat contract files into domain subdirectories. Delete `db/repositories/` entirely.

**Rationale**: CLAUDE.md Project Structure shows `core/repositories/<domain>/` as the single home for each domain's contract, implementation, and in-memory fake. `db/` retains only `seeds/`.

### Contract files — flat → subdirectory

| Current path | New path |
|---|---|
| `core/repositories/user_repository.ts` | `core/repositories/users/user.repository.ts` |
| `core/repositories/usuario_repository.ts` | `core/repositories/usuarios/usuario.repository.ts` |
| `core/repositories/hotel_repository.ts` | `core/repositories/hotels/hotel.repository.ts` |
| `core/repositories/grupo_repository.ts` | `core/repositories/grupos/grupo.repository.ts` |
| `core/repositories/rota_repository.ts` | `core/repositories/rotas/rota.repository.ts` |
| `core/repositories/administrator_repository.ts` | `core/repositories/administrators/administrator.repository.ts` |
| `core/repositories/admin_hotel_repository.ts` | `core/repositories/admin/admin_hotel.repository.ts` |
| `core/repositories/admin_rota_repository.ts` | `core/repositories/admin/admin_rota.repository.ts` |

### Implementation files — `db/` → `core/`

| Current path | New path |
|---|---|
| `db/repositories/users/implementation/postgres_user_repository.ts` | `core/repositories/users/implementation/postgres_user_repository.ts` |
| `db/repositories/usuarios/implementation/postgres_usuario_repository.ts` | `core/repositories/usuarios/implementation/postgres_usuario_repository.ts` |
| `db/repositories/hotels/implementation/postgres_hotel_repository.ts` | `core/repositories/hotels/implementation/postgres_hotel_repository.ts` |
| `db/repositories/grupos/implementation/postgres_grupo_repository.ts` | `core/repositories/grupos/implementation/postgres_grupo_repository.ts` |
| `db/repositories/rotas/implementation/postgres_rota_repository.ts` | `core/repositories/rotas/implementation/postgres_rota_repository.ts` |
| `db/repositories/administrators/implementation/postgres_administrator_repository.ts` | `core/repositories/administrators/implementation/postgres_administrator_repository.ts` |
| `db/repositories/admin/implementation/postgres_admin_hotel_repository.ts` | `core/repositories/admin/implementation/postgres_admin_hotel_repository.ts` |
| `db/repositories/admin/implementation/postgres_admin_rota_repository.ts` | `core/repositories/admin/implementation/postgres_admin_rota_repository.ts` |

### In-memory fakes — `db/` → `core/`

| Current path | New path |
|---|---|
| `db/repositories/users/in-memory/in_memory_user_repository.ts` | `core/repositories/users/in-memory/in_memory_user_repository.ts` |
| `db/repositories/usuarios/in-memory/in_memory_usuario_repository.ts` | `core/repositories/usuarios/in-memory/in_memory_usuario_repository.ts` |
| `db/repositories/hotels/in-memory/in_memory_hotel_repository.ts` | `core/repositories/hotels/in-memory/in_memory_hotel_repository.ts` |
| `db/repositories/grupos/in-memory/in_memory_grupo_repository.ts` | `core/repositories/grupos/in-memory/in_memory_grupo_repository.ts` |

*(Domains without fakes: `rotas`, `administrators`, `admin` — no `in-memory/` folder created)*

### Files to delete after migration

- `db/repositories/index.ts` — replaced by populated `core/repositories/index.ts`
- All source files in `db/repositories/<domain>/` after their contents are moved
- `db/client.ts` — replaced by `lib/prisma.ts`

---

## Finding 2: `core/repositories/index.ts` — Populate, Not Delete

**Decision**: Populate the currently-empty `core/repositories/index.ts` with re-exports of all concrete implementations, mirroring what `db/repositories/index.ts` currently does — and adding the missing domains.

**Current `db/repositories/index.ts` content** (the starting point):
```ts
export { PostgresHotelRepository as HotelRepository } from './hotels/implementation/postgres_hotel_repository'
export { PostgresUserRepository as UserRepository } from './users/implementation/postgres_user_repository'
export { PostgresGrupoRepository as GrupoRepository } from './grupos/implementation/postgres_grupo_repository'
export { PostgresAdministratorRepository as AdministratorRepository } from './administrators/implementation/postgres_administrator_repository'
```

**Target `core/repositories/index.ts`** (all domains, updated paths):
```ts
export { PostgresUserRepository as UserRepository } from './users/implementation/postgres_user_repository'
export { PostgresUsuarioRepository as UsuarioRepository } from './usuarios/implementation/postgres_usuario_repository'
export { PostgresHotelRepository as HotelRepository } from './hotels/implementation/postgres_hotel_repository'
export { PostgresGrupoRepository as GrupoRepository } from './grupos/implementation/postgres_grupo_repository'
export { PostgresRotaRepository as RotaRepository } from './rotas/implementation/postgres_rota_repository'
export { PostgresAdministratorRepository as AdministratorRepository } from './administrators/implementation/postgres_administrator_repository'
export { PostgresAdminHotelRepository as AdminHotelRepository } from './admin/implementation/postgres_admin_hotel_repository'
export { PostgresAdminRotaRepository as AdminRotaRepository } from './admin/implementation/postgres_admin_rota_repository'
```

---

## Finding 3: Import Sites for `@/db/repositories`

**All 17 files that currently import from `@/db/repositories`** and their required changes:

| File | Current import | Change needed |
|---|---|---|
| `routes/auth/auth_routes.ts` | `@/db/repositories` (index) | → `@/core/repositories` |
| `routes/auth/auth_routes.ts` | `@/db/repositories/rotas/implementation/...` | → `@/core/repositories/rotas/implementation/...` |
| `routes/grupos/grupos_routes.ts` | `@/db/repositories/grupos/implementation/...` | → `@/core/repositories/grupos/implementation/...` |
| `routes/rotas/rotas_routes.ts` | `@/db/repositories/rotas/implementation/...` | → `@/core/repositories/rotas/implementation/...` |
| `routes/usuarios/usuarios_routes.ts` | `@/db/repositories/usuarios/implementation/...` | → `@/core/repositories/usuarios/implementation/...` |
| `routes/admin/admin_auth_routes.ts` | `@/db/repositories/administrators/implementation/...` | → `@/core/repositories/administrators/implementation/...` |
| `routes/admin/admin_administradores_routes.ts` | `@/db/repositories/administrators/implementation/...` | → `@/core/repositories/administrators/implementation/...` |
| `routes/admin/admin_hoteis_routes.ts` | `@/db/repositories/admin/implementation/...` (×2) | → `@/core/repositories/admin/implementation/...` |
| `routes/admin/admin_rotas_routes.ts` | `@/db/repositories/admin/implementation/...` | → `@/core/repositories/admin/implementation/...` |
| `routes/auth/auth_routes.spec.ts` | `@/db/repositories/users/in-memory/...` | → `@/core/repositories/users/in-memory/...` |
| `routes/auth/auth_routes.spec.ts` | `@/db/repositories/hotels/in-memory/...` | → `@/core/repositories/hotels/in-memory/...` |
| `routes/grupos/grupos_routes.spec.ts` | `@/db/repositories/grupos/in-memory/...` | → `@/core/repositories/grupos/in-memory/...` |
| `usecases/login_use_case.spec.ts` | `@/db/repositories/users/in-memory/...` | → `@/core/repositories/users/in-memory/...` |
| `usecases/login_use_case.spec.ts` | `@/db/repositories/hotels/in-memory/...` | → `@/core/repositories/hotels/in-memory/...` |
| `usecases/grupos/create_grupo_use_case.spec.ts` | `@/db/repositories/grupos/in-memory/...` | → `@/core/repositories/grupos/in-memory/...` |
| `usecases/grupos/delete_grupo_use_case.spec.ts` | `@/db/repositories/grupos/in-memory/...` | → `@/core/repositories/grupos/in-memory/...` |

---

## Finding 4: Import Sites for `@/core/repositories` Flat Contracts

When the 8 flat contract files move into domain subdirectories, 30+ import sites change their path. Key changes:

| Current import | New import |
|---|---|
| `@/core/repositories/grupo_repository` | `@/core/repositories/grupos/grupo.repository` |
| `@/core/repositories/usuario_repository` | `@/core/repositories/usuarios/usuario.repository` |
| `@/core/repositories/hotel_repository` | `@/core/repositories/hotels/hotel.repository` |
| `@/core/repositories/user_repository` | `@/core/repositories/users/user.repository` |
| `@/core/repositories/rota_repository` | `@/core/repositories/rotas/rota.repository` |
| `@/core/repositories/administrator_repository` | `@/core/repositories/administrators/administrator.repository` |
| `@/core/repositories/admin_hotel_repository` | `@/core/repositories/admin/admin_hotel.repository` |
| `@/core/repositories/admin_rota_repository` | `@/core/repositories/admin/admin_rota.repository` |

**Special case**: `usuario.repository.ts` imports `PaginationInput`/`PaginatedResult` from `grupo_repository`. After both move, this becomes an import from `@/core/repositories/grupos/grupo.repository`.

---

## Finding 5: Database Client — `db/client.ts` → `lib/prisma.ts`

Same as v1. 17 files import `@/db/client` and need updating to `@/lib/prisma`. See research v1 Finding 1 for the full list.

---

## Finding 6: Plugin Renames

Same as v1 Finding 2. 7 files renamed, 4 import sites updated:

| Current | New |
|---|---|
| `fastify-cookie.ts` | `cookie_plugin.ts` |
| `fastify-cors.ts` | `cors_plugin.ts` |
| `fastify-jwt.ts` | `jwt_plugin.ts` |
| `fastify-swagger.ts` | `swagger_plugin.ts` |
| `auth-plugin.ts` | `auth_plugin.ts` |
| `admin-auth-plugin.ts` | `admin_auth_plugin.ts` |
| `fastify-routes.ts` | `fastify_routes.ts` |

---

## Out-of-Scope Items

1. `user`/`usuario` naming unification — both contracts serve different purposes (auth vs. CRUD management); both kept
2. Admin repository placement — `admin/` contains both hotel and rota admin repos; splitting them is a future concern
3. Populating missing in-memory fakes for `rotas`, `administrators`, `admin` — not in scope
