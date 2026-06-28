# Quickstart: Validate Route DI Ownership Refactor

## Prerequisites

- PostgreSQL running and `DATABASE_URL` set in `packages/api/.env`
- `pnpm install` run at the workspace root

## Validation Steps

### 1. Type check passes

```bash
cd packages/api
npx tsc --noEmit
```

Expected: zero errors.

### 2. Tests pass without a database

```bash
cd packages/api
pnpm test --run
```

Expected: both `login_use_case.spec.ts` and `auth_routes.spec.ts` green.
No `pg` connection error. No `DATABASE_URL` required.

### 3. `fastify-routes.ts` has no domain imports

```bash
grep -E "UseCase|Repository|Hasher|@/core|@/db/repositories|@/lib" \
  packages/api/src/plugins/fastify-routes.ts
```

Expected: zero matches.

### 4. `auth_routes.ts` is a plain plugin (not a factory)

```bash
grep "export function auth_routes\|export async function auth_routes" \
  packages/api/src/routes/auth/auth_routes.ts
```

Expected: matches `export async function auth_routes(app: FastifyTypedInstance)`.

```bash
grep "return async function\|return function" \
  packages/api/src/routes/auth/auth_routes.ts
```

Expected: zero matches (no factory wrapper).

### 5. Server starts and endpoints respond correctly

See `specs/001-api-structure-refactor/quickstart.md` sections 3–6 for the full
curl validation sequence. All four scenarios (login OK, login fail, /me auth,
/me unauth) must return the same status codes as before this refactor.
