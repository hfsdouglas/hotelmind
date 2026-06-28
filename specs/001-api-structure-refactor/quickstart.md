# Quickstart: Validate Repository Structure & Route Refactoring

## Prerequisites

- PostgreSQL running and `DATABASE_URL` set in `packages/api/.env`
- `pnpm install` run at the workspace root

## Validation Steps

### 1. Type check passes

```bash
cd packages/api
pnpm tsc --noEmit
```

Expected: zero errors.

### 2. Tests pass

```bash
cd packages/api
pnpm test
```

Expected: `login_use_case.spec.ts` and `auth_routes.spec.ts` both green; no Prisma connection required.

### 3. Server starts

```bash
cd packages/api
pnpm dev
```

Expected: `Hotel server is running on host 0.0.0.0 and port ...`
No errors about missing `authenticate` decorator.

### 4. Auth endpoints respond correctly

**Login (valid credentials):**
```bash
curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@hotel.com","password":"secret123"}' | jq .
```
Expected: `200` with `user`, `hotel`, and `message` fields. Cookie `token` set.

**Login (wrong credentials):**
```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"wrong@hotel.com","password":"bad"}' | jq .
```
Expected: `401` with `{ "message": "Credenciais inválidas" }`.

**Session check (authenticated):**
```bash
curl -s -b /tmp/cookies.txt http://localhost:3000/auth/me | jq .
```
Expected: `200` with `{ "ok": true }`.

**Session check (unauthenticated):**
```bash
curl -s http://localhost:3000/auth/me | jq .
```
Expected: `401` with `{ "message": "Token não fornecido!" }`.

### 5. Swagger UI still loads

Open `http://localhost:3000/docs` in a browser.
Expected: All existing routes appear with their schemas intact.

### 6. No old import paths remain

```bash
grep -r "prisma_hotel_repository\|prisma_user_repository\|lib/prisma" packages/api/src --include="*.ts"
```

Expected: zero matches.
