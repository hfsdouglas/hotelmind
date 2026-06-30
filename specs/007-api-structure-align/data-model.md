# Data Model: API Package Structural Alignment

**Feature**: 007-api-structure-align
**Date**: 2026-06-30 (v2 — corrected after misreading CLAUDE.md)

No new entities, no schema changes, no migrations. Pure structural migration.

---

## Target Directory Structure

```text
packages/api/src/
├── core/
│   └── repositories/
│       ├── index.ts                          # POPULATED (was empty)
│       ├── users/
│       │   ├── user.repository.ts            # MOVED from (flat) user_repository.ts
│       │   ├── implementation/
│       │   │   └── postgres_user_repository.ts   # MOVED from db/repositories/users/implementation/
│       │   └── in-memory/
│       │       └── in_memory_user_repository.ts  # MOVED from db/repositories/users/in-memory/
│       ├── usuarios/
│       │   ├── usuario.repository.ts         # MOVED from (flat) usuario_repository.ts
│       │   ├── implementation/
│       │   │   └── postgres_usuario_repository.ts
│       │   └── in-memory/
│       │       └── in_memory_usuario_repository.ts
│       ├── hotels/
│       │   ├── hotel.repository.ts           # MOVED from (flat) hotel_repository.ts
│       │   ├── implementation/
│       │   │   └── postgres_hotel_repository.ts
│       │   └── in-memory/
│       │       └── in_memory_hotel_repository.ts
│       ├── grupos/
│       │   ├── grupo.repository.ts           # MOVED from (flat) grupo_repository.ts
│       │   ├── implementation/
│       │   │   └── postgres_grupo_repository.ts
│       │   └── in-memory/
│       │       └── in_memory_grupo_repository.ts
│       ├── rotas/
│       │   ├── rota.repository.ts            # MOVED from (flat) rota_repository.ts
│       │   └── implementation/
│       │       └── postgres_rota_repository.ts
│       ├── administrators/
│       │   ├── administrator.repository.ts   # MOVED from (flat) administrator_repository.ts
│       │   └── implementation/
│       │       └── postgres_administrator_repository.ts
│       └── admin/
│           ├── admin_hotel.repository.ts     # MOVED from (flat) admin_hotel_repository.ts
│           ├── admin_rota.repository.ts      # MOVED from (flat) admin_rota_repository.ts
│           └── implementation/
│               ├── postgres_admin_hotel_repository.ts
│               └── postgres_admin_rota_repository.ts
├── db/
│   └── seeds/                                # UNCHANGED — only seeds remain
├── lib/
│   ├── prisma.ts                             # MOVED from db/client.ts
│   └── bcrypt_password_hasher.ts             # UNCHANGED
└── plugins/
    ├── cookie_plugin.ts                      # RENAMED from fastify-cookie.ts
    ├── cors_plugin.ts                        # RENAMED from fastify-cors.ts
    ├── jwt_plugin.ts                         # RENAMED from fastify-jwt.ts
    ├── swagger_plugin.ts                     # RENAMED from fastify-swagger.ts
    ├── auth_plugin.ts                        # RENAMED from auth-plugin.ts
    ├── admin_auth_plugin.ts                  # RENAMED from admin-auth-plugin.ts
    └── fastify_routes.ts                     # RENAMED from fastify-routes.ts
```

---

## Change Inventory

### Group A: Contract files — flatten → subdirectory (8 files)

| Action | From | To |
|---|---|---|
| Move + rename | `core/repositories/user_repository.ts` | `core/repositories/users/user.repository.ts` |
| Move + rename | `core/repositories/usuario_repository.ts` | `core/repositories/usuarios/usuario.repository.ts` |
| Move + rename | `core/repositories/hotel_repository.ts` | `core/repositories/hotels/hotel.repository.ts` |
| Move + rename | `core/repositories/grupo_repository.ts` | `core/repositories/grupos/grupo.repository.ts` |
| Move + rename | `core/repositories/rota_repository.ts` | `core/repositories/rotas/rota.repository.ts` |
| Move + rename | `core/repositories/administrator_repository.ts` | `core/repositories/administrators/administrator.repository.ts` |
| Move + rename | `core/repositories/admin_hotel_repository.ts` | `core/repositories/admin/admin_hotel.repository.ts` |
| Move + rename | `core/repositories/admin_rota_repository.ts` | `core/repositories/admin/admin_rota.repository.ts` |

### Group B: Implementation files — `db/` → `core/` (8 files)

| Action | From | To |
|---|---|---|
| Move | `db/repositories/users/implementation/postgres_user_repository.ts` | `core/repositories/users/implementation/postgres_user_repository.ts` |
| Move | `db/repositories/usuarios/implementation/postgres_usuario_repository.ts` | `core/repositories/usuarios/implementation/postgres_usuario_repository.ts` |
| Move | `db/repositories/hotels/implementation/postgres_hotel_repository.ts` | `core/repositories/hotels/implementation/postgres_hotel_repository.ts` |
| Move | `db/repositories/grupos/implementation/postgres_grupo_repository.ts` | `core/repositories/grupos/implementation/postgres_grupo_repository.ts` |
| Move | `db/repositories/rotas/implementation/postgres_rota_repository.ts` | `core/repositories/rotas/implementation/postgres_rota_repository.ts` |
| Move | `db/repositories/administrators/implementation/postgres_administrator_repository.ts` | `core/repositories/administrators/implementation/postgres_administrator_repository.ts` |
| Move | `db/repositories/admin/implementation/postgres_admin_hotel_repository.ts` | `core/repositories/admin/implementation/postgres_admin_hotel_repository.ts` |
| Move | `db/repositories/admin/implementation/postgres_admin_rota_repository.ts` | `core/repositories/admin/implementation/postgres_admin_rota_repository.ts` |

### Group C: In-memory fakes — `db/` → `core/` (4 files)

| Action | From | To |
|---|---|---|
| Move | `db/repositories/users/in-memory/in_memory_user_repository.ts` | `core/repositories/users/in-memory/in_memory_user_repository.ts` |
| Move | `db/repositories/usuarios/in-memory/in_memory_usuario_repository.ts` | `core/repositories/usuarios/in-memory/in_memory_usuario_repository.ts` |
| Move | `db/repositories/hotels/in-memory/in_memory_hotel_repository.ts` | `core/repositories/hotels/in-memory/in_memory_hotel_repository.ts` |
| Move | `db/repositories/grupos/in-memory/in_memory_grupo_repository.ts` | `core/repositories/grupos/in-memory/in_memory_grupo_repository.ts` |

### Group D: Prisma singleton move (1 file)

| Action | From | To |
|---|---|---|
| Move | `db/client.ts` | `lib/prisma.ts` |

### Group E: Plugin renames (7 files)

| Action | From | To |
|---|---|---|
| Rename | `plugins/fastify-cookie.ts` | `plugins/cookie_plugin.ts` |
| Rename | `plugins/fastify-cors.ts` | `plugins/cors_plugin.ts` |
| Rename | `plugins/fastify-jwt.ts` | `plugins/jwt_plugin.ts` |
| Rename | `plugins/fastify-swagger.ts` | `plugins/swagger_plugin.ts` |
| Rename | `plugins/auth-plugin.ts` | `plugins/auth_plugin.ts` |
| Rename | `plugins/admin-auth-plugin.ts` | `plugins/admin_auth_plugin.ts` |
| Rename | `plugins/fastify-routes.ts` | `plugins/fastify_routes.ts` |

### Group F: Files to update (content changes — imports only)

| File | Changes |
|---|---|
| `core/repositories/index.ts` | Populate with 8 re-exports (was empty) |
| `server.ts` | 5 plugin import paths updated |
| `plugins/jwt_plugin.ts` (after rename) | 2 internal plugin import paths updated |
| `routes/auth/auth_routes.spec.ts` | `auth-plugin` → `auth_plugin`; 2 in-memory repo paths |
| `routes/grupos/grupos_routes.spec.ts` | `auth-plugin` → `auth_plugin`; 1 in-memory repo path |
| `usecases/login_use_case.spec.ts` | 2 in-memory repo paths |
| `usecases/grupos/create_grupo_use_case.spec.ts` | 1 in-memory repo path |
| `usecases/grupos/delete_grupo_use_case.spec.ts` | 1 in-memory repo path |
| `routes/auth/auth_routes.ts` | `@/db/repositories` index + 1 implementation path + `@/db/client` |
| `routes/grupos/grupos_routes.ts` | 1 implementation path + `@/db/client` |
| `routes/rotas/rotas_routes.ts` | 1 implementation path + `@/db/client` |
| `routes/usuarios/usuarios_routes.ts` | 1 implementation path + `@/db/client` |
| `routes/admin/admin_auth_routes.ts` | 1 implementation path + `@/db/client` |
| `routes/admin/admin_administradores_routes.ts` | 1 implementation path + `@/db/client` |
| `routes/admin/admin_hoteis_routes.ts` | 2 implementation paths + `@/db/client` |
| `routes/admin/admin_rotas_routes.ts` | 1 implementation path + `@/db/client` |
| `db/seeds/index.ts` | `@/db/client` → `@/lib/prisma` |
| All use case files importing `@/core/repositories/<flat>` | Contract path updated to subdirectory form |
| All implementation files importing `@/core/repositories/<flat>` | Contract path updated (+ `@/db/client` where applicable) |
| All in-memory fake files importing `@/core/repositories/<flat>` | Contract path updated |

### Group G: Files to delete

- `db/repositories/index.ts`
- `db/client.ts`
- All 8 flat contract files under `core/repositories/` (after moves in Group A)
- All source files moved in Groups B and C (at old `db/repositories/` locations)

---

## Invariants

- No TypeScript type signatures change
- No runtime behavior changes
- No database migrations
- No API contract changes (routes, request/response shapes unchanged)
- All exported class and interface names retain their names; only file paths change
