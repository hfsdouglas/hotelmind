# Implementation Plan: Repository Domain Structure & Route Refactoring

**Branch**: `001-api-structure-refactor` | **Date**: 2026-06-28 | **Spec**: [spec.md](./spec.md)

## Summary

Reorganize `packages/api/src/db/repositories/` into domain folders with `implementation/` and `in-memory/` sub-folders, add a central re-export index, and refactor the route layer to use named factory exports, `FastifyTypedInstance`, and `app.authenticate`. No behavioral changes — all existing endpoints continue to work identically.

---

## Technical Context

| Field | Value |
|---|---|
| **Language/Version** | TypeScript 5.x, Node.js 20+ |
| **Primary Dependencies** | Fastify 5.x, fastify-type-provider-zod, Prisma 6.x, pg adapter |
| **Storage** | PostgreSQL via Prisma + `@prisma/adapter-pg` |
| **Testing** | Vitest; in-memory fakes replace Prisma mocks in every test |
| **Target Platform** | Linux server |
| **Project Type** | REST API service within pnpm monorepo |
| **Performance Goals** | N/A — pure refactor, zero behavioral change |
| **Constraints** | All existing endpoints must pass unchanged after refactor |

---

## Constitution Check

Constitution not yet ratified for this project — no gates to evaluate.

---

## Current vs Target Structure

### `db/` layer

```
BEFORE                                   AFTER
─────────────────────────────────────    ────────────────────────────────────────────────
src/
├── lib/
│   └── prisma.ts                        src/db/
│                                        ├── client.ts          ← moved from lib/prisma.ts
└── db/
    └── repositories/                    └── repositories/
        ├── prisma_hotel_repository.ts       ├── index.ts       ← NEW: central re-export
        └── prisma_user_repository.ts        ├── hotels/
                                             │   ├── implementation/
                                             │   │   └── postgres_hotel_repository.ts
                                             │   └── in-memory/
                                             │       └── in_memory_hotel_repository.ts
                                             └── users/
                                                 ├── implementation/
                                                 │   └── postgres_user_repository.ts
                                                 └── in-memory/
                                                     └── in_memory_user_repository.ts
```

### Route layer

```
BEFORE (auth_routes.ts)                  AFTER (auth_routes.ts)
─────────────────────────────────────    ─────────────────────────────────────────────
const auth_routes: FastifyPluginAsyncZod   export function auth_routes(login_use_case: LoginUseCase) {
  = async (app) => { ... }                   return async function (app: FastifyTypedInstance) {
                                               app.get('/auth/me', {
export default auth_routes                       onRequest: [app.authenticate],  // no cast
                                               }, ...)
// Direct instantiation inside handler:          app.post('/auth/login', ..., async (req, reply) => {
new LoginUseCase(                                  const { user, hotel } = await login_use_case.execute(req.body)
  new PrismaUserRepository(db),                 })
  new PrismaHotelRepository(db),             }
  new BcryptPasswordHasher(),            }
)
```

### Bootstrap layer

```
BEFORE (fastify-routes.ts)               AFTER (fastify-routes.ts)
─────────────────────────────────────    ─────────────────────────────────────────────
import auth_routes from '...'            import { UserRepository, HotelRepository } from '@/db/repositories'
                                         import { db } from '@/db/client'
export function setRoutes(app) {         import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
  app.register(auth_routes)             import { LoginUseCase } from '@/core/usecases/login_use_case'
}                                        import { auth_routes } from '@/routes/auth/auth_routes'

                                         export function setRoutes(app: FastifyTypedInstance) {
                                           const login_use_case = new LoginUseCase(
                                             new UserRepository(db),
                                             new HotelRepository(db),
                                             new BcryptPasswordHasher(),
                                           )
                                           app.register(auth_routes(login_use_case))
                                         }
```

### Server bootstrap

```
BEFORE (server.ts)                       AFTER (server.ts)
─────────────────────────────────────    ─────────────────────────────────────────────
setCors(app)                             setCors(app)
setSwagger(app)                          setSwagger(app)
setCookie(app)                           setCookie(app)
setJWT(app)                              setJWT(app)
setRoutes(app)                           app.register(authPlugin)   ← ADD (fixes missing decorator)
                                         setRoutes(app)
```

---

## Key Design Decisions

### 1. Route factory pattern

Route files export a **factory function** that accepts injected use cases and returns a Fastify plugin function:

```ts
// routes/auth/auth_routes.ts
export function auth_routes(login_use_case: LoginUseCase) {
  return async function (app: FastifyTypedInstance) {
    app.get('/auth/me', { onRequest: [app.authenticate] }, ...)
    app.post('/auth/login', ..., async (request, reply) => {
      await login_use_case.execute(request.body)
    })
  }
}
```

**Why**: Routes never instantiate infrastructure. Use cases can be swapped for in-memory versions in tests without touching route code. The curried shape `auth_routes(use_case)` is directly passable to `app.register()`.

### 2. Central repository index re-exports with domain aliases

```ts
// db/repositories/index.ts
export { PostgresHotelRepository as HotelRepository } from './hotels/implementation/postgres_hotel_repository'
export { PostgresUserRepository as UserRepository } from './users/implementation/postgres_user_repository'
```

Consumers (only `fastify-routes.ts` and bootstrap code) import `HotelRepository` — never the concrete class. If a Postgres implementation is replaced (e.g., by a Redis cache), only the `index.ts` alias changes.

### 3. Prisma client moved to `db/client.ts`

`lib/prisma.ts` → `db/client.ts`. All infrastructure code lives under `db/`; `lib/` keeps third-party wrappers that are not strictly Prisma (e.g., `bcrypt_password_hasher.ts`).

> **Note**: `src/prisma/schema.prisma` and its migrations stay in place for this iteration. Moving the schema requires updating all `package.json` scripts and the Prisma adapter config — deferred to a dedicated refactor to minimize risk.

### 4. In-memory fakes implement the full contract

```ts
// db/repositories/hotels/in-memory/in_memory_hotel_repository.ts
export class InMemoryHotelRepository implements IHotelRepository {
  private store = new Map<string, Hotel>()

  async findById(id: string): Promise<Hotel | null> {
    return this.store.get(id) ?? null
  }

  seed(hotel: Hotel) { this.store.set(hotel.id, hotel) }
}
```

Fakes are only used in test files. They expose a `seed()` helper to populate state without a database.

### 5. `app.authenticate` used directly — no cast

`fastify.d.ts` already declares `authenticate` on `FastifyInstance`. Since `FastifyTypedInstance` extends `FastifyInstance`, `app.authenticate` is typed and requires no cast. The old `(app as unknown as FastifyInstance).authenticate` pattern is removed.

---

## Documentation Structure

```
specs/001-api-structure-refactor/
├── plan.md         ← this file
├── quickstart.md   ← validation guide
└── tasks.md        ← generated by /speckit-tasks
```

---

## Implementation Phases

### Phase 1 — Repository Domain Structure

| Step | File | Action |
|------|------|--------|
| 1.1 | `src/db/client.ts` | Create — move content from `lib/prisma.ts` |
| 1.2 | `src/db/repositories/hotels/implementation/postgres_hotel_repository.ts` | Create — copy + rename class from `prisma_hotel_repository.ts`; update import of `db` to `@/db/client` |
| 1.3 | `src/db/repositories/users/implementation/postgres_user_repository.ts` | Create — copy + rename class from `prisma_user_repository.ts`; update import of `db` to `@/db/client` |
| 1.4 | `src/db/repositories/hotels/in-memory/in_memory_hotel_repository.ts` | Create — full `IHotelRepository` implementation with Map store + seed helper |
| 1.5 | `src/db/repositories/users/in-memory/in_memory_user_repository.ts` | Create — full `IUserRepository` implementation with Map store + seed helper |
| 1.6 | `src/db/repositories/index.ts` | Create — re-export both implementations under domain aliases |
| 1.7 | `src/lib/prisma.ts` | Delete after confirming no remaining imports |
| 1.8 | `src/db/repositories/prisma_hotel_repository.ts` | Delete |
| 1.9 | `src/db/repositories/prisma_user_repository.ts` | Delete |

### Phase 2 — Route Refactoring

| Step | File | Action |
|------|------|--------|
| 2.1 | `src/routes/auth/auth_routes.ts` | Refactor — factory export, `FastifyTypedInstance`, `app.authenticate`, no direct repo imports |
| 2.2 | `src/plugins/fastify-routes.ts` | Update — instantiate repos + use case; inject into `auth_routes(login_use_case)` |
| 2.3 | `src/server.ts` | Add `app.register(authPlugin)` before `setRoutes(app)` |

### Phase 3 — Tests

| Step | File | Action |
|------|------|--------|
| 3.1 | `src/core/usecases/login_use_case.spec.ts` | Write — inject `InMemoryUserRepository` + `InMemoryHotelRepository` |
| 3.2 | `src/routes/auth/auth_routes.spec.ts` | Write — Fastify `inject()`, inject in-memory use case or fakes |

---

## Complexity Tracking

No constitution violations. Refactor adds structure without adding layers.
