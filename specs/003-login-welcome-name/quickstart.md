# Quickstart: Validate Personalized Login Greeting

## Prerequisites

- PostgreSQL running and `DATABASE_URL` set in `packages/api/.env`
- `pnpm install` run at the workspace root
- A seeded user in the database (e.g., `nome_completo: "Admin HotelMind"`)

---

## Validation Steps

### 1. Unit tests pass (no database required)

```bash
cd packages/api
pnpm test --run
```

Expected:
- `user.spec.ts`: getter tests green
- `auth_routes.spec.ts`: message assertion `"Seja bem-vindo, Admin!"` green
- All other tests still green — zero regressions

### 2. Type check passes

```bash
cd packages/api
npx tsc --noEmit
```

Expected: zero errors.

### 3. Greeting in live login response

```bash
curl -s -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelmind.com.br","password":"senha123"}' | jq .message
```

Expected output:
```
"Seja bem-vindo, Admin!"
```

### 4. Single-word name edge case

Create (or seed) a user with `nome_completo = "Maria"` and repeat step 3.

Expected output:
```
"Seja bem-vindo, Maria!"
```

### 5. Error response is unchanged

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelmind.com.br","password":"wrongpassword"}' | jq .message
```

Expected output:
```
"Credenciais inválidas"
```
