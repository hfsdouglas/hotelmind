# Quickstart: Validate Logout & Route Navigation

## Prerequisites

- PostgreSQL running, `DATABASE_URL` set in `packages/api/.env`
- API server running: `pnpm --filter api dev`
- Web app running: `pnpm --filter web dev`
- A seeded user in the database

---

## US1 — Server Logout Endpoint

### 1. Automated tests pass

```bash
cd packages/api
pnpm test --run
```

Expected: all tests green, including new logout test cases in `auth_routes.spec.ts`.

### 2. Type check passes

```bash
cd packages/api
npx tsc --noEmit
```

Expected: zero errors.

### 3. Manual: logout clears the cookie

```bash
# Login and capture cookie
curl -s -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelmind.com.br","password":"senha123"}'

# Logout using the cookie
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout

# Verify session is gone
curl -s -b cookies.txt http://localhost:3000/auth/me
```

Expected:
- Logout → 200 `{"message":"Logout realizado com sucesso."}`
- `/auth/me` after logout → 401

### 4. Manual: logout without session returns 401

```bash
curl -s -X POST http://localhost:3000/auth/logout
```

Expected: 401 Unauthorized.

---

## US2 — Frontend Route Renaming

### 5. Login is at `/login`

Open browser to `http://localhost:5173/login`.
Expected: login form is displayed.

### 6. Dashboard is at `/`

Open browser to `http://localhost:5173/` while authenticated.
Expected: dashboard is displayed.

### 7. Unauthenticated access to `/` redirects

Clear all cookies, then navigate to `http://localhost:5173/`.
Expected: redirected to `/login`.

### 8. Already-authenticated user on `/login` redirects

While logged in, navigate to `http://localhost:5173/login`.
Expected: immediately redirected to `/`.

### 9. Old `/dashboard` path returns 404

Navigate to `http://localhost:5173/dashboard`.
Expected: 404 error page.

---

## US3 — Frontend Logout

### 10. Logout button is visible

While authenticated, confirm the logout button (icon) appears in the top
navigation bar next to the notifications bell.

### 11. Logout button redirects to login

Click the logout button.
Expected: redirected to `/login`. Attempting to navigate back to `/` redirects
to `/login` again (session cleared).

### 12. Logout survives server error

With the API server stopped, click the logout button.
Expected: user is still redirected to `/login` (local session cleared) and an
error notification is briefly shown.
