# Quickstart & Validation Guide: Suporte — Admin Access to Hotel Web App

**Feature**: 008-suporte-hotel-access
**Date**: 2026-07-01 (revised twice same day — access is a single redirect with no exchange step, and audit is log-based with no new table beyond `Hotel.status`)

---

## Prerequisites

- PostgreSQL running, `DATABASE_URL` configured
- `pnpm install` run at the workspace root
- API running: `cd packages/api && pnpm dev` (port 3000)
- Admin running: `cd packages/admin && pnpm dev` (port 5174)
- Web running: `cd packages/web && pnpm dev` (port 5173)

---

## Setup: Database

```bash
cd packages/api
pnpm prisma migrate dev --name add_hotel_status
pnpm prisma db seed   # existing hotels get status='S' via the column default
```

**Verification after migration**:
```sql
SELECT status FROM hoteis;   -- every row should read 'S'
```

No other schema changes — there is no audit table to verify here.

---

## Scenario 1: Suporte list shows only active hotels (US1)

```bash
# Login as admin
curl -s -c cookies.txt -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelmind.com.br","password":"admin123"}'

# Deactivate one hotel directly for the test (or via the admin edit form's new status Select)
curl -s -b cookies.txt -X PUT http://localhost:3000/admin/hoteis/<HOTEL_ID> \
  -H "Content-Type: application/json" -d '{"status":"N"}'

# List only active hotels
curl -s -b cookies.txt "http://localhost:3000/admin/hoteis?status=S"
```

**Expect**: the deactivated hotel is absent from the response's `data` array.

In the browser: open `http://localhost:5174/suporte` — the same hotel must not appear in the list.

---

## Scenario 2: Admin accesses a hotel as a chosen user, in one click (US2)

```bash
HOTEL_ID=<an active hotel id>

# List that hotel's users (picker source, used by the admin app's dialog)
curl -s -b cookies.txt "http://localhost:3000/admin/hoteis/$HOTEL_ID/usuarios"

USER_ID=<one of the returned ids>

# This is the single request the admin app opens via window.open() — follow the redirect to see where it lands
curl -s -i -b cookies.txt -L "http://localhost:3000/admin/hoteis/$HOTEL_ID/suporte-acesso?usuario_id=$USER_ID"
```

**Expect**:
- Without `-L`: a `302` response, a `Location: http://localhost:5173/` header, and a `Set-Cookie: token=...` header.
- The `token` cookie's JWT payload (decode it, or just trust `/auth/me` below) carries a `suporte` claim.

```bash
# Simulate landing on the web app with that cookie — this is what AuthContext's
# passive bootstrap effect calls automatically on mount when localStorage is empty
curl -s -b cookies.txt http://localhost:3000/auth/me
```

**Expect**: `200` with a body containing `"suporte": { "administrador_nome": "..." }`.

In the browser: click "Acessar" on a hotel row in `http://localhost:5174/suporte`, pick a user, confirm — a new tab opens, briefly hits the API, and lands on `localhost:5173` already signed in as that user (no visible intermediate page), with a visible support-mode banner. Refresh that tab: the banner must still be present (verifies the bootstrap effect re-derives `suporte` from `/auth/me` on every fresh mount, not just the first one).

---

## Scenario 3: Zero-user hotel is blocked (FR-011)

```bash
# A hotel with no users:
curl -s -b cookies.txt "http://localhost:3000/admin/hoteis/<HOTEL_SEM_USUARIOS>/usuarios"
# Expect: []
```

In the browser: the "Access" dialog for such a hotel must show "Este hotel não possui usuários" and keep the confirm action (and therefore the `window.open` call) disabled — the admin app should never even attempt to open the access URL without a selected, valid user.

---

## Scenario 4: Inactive hotel and cross-hotel user are rejected

```bash
# Hotel deactivated in Scenario 1:
curl -s -i -b cookies.txt "http://localhost:3000/admin/hoteis/<INACTIVE_HOTEL_ID>/suporte-acesso?usuario_id=<any-user-id>"
# Expect: 409, HTML body (not JSON) explaining the hotel is inactive — no redirect, no cookie set

# A user_id that belongs to a different hotel than :id:
curl -s -i -b cookies.txt "http://localhost:3000/admin/hoteis/$HOTEL_ID/suporte-acesso?usuario_id=<user-from-another-hotel>"
# Expect: 404, HTML body — no redirect, no cookie set
```

---

## Scenario 5: Audit trail (FR-007, SC-002)

There is no database table to query — the audit trail is a structured log line. Check the API dev server's stdout for a line emitted after each successful redirect in Scenario 2, e.g.:

```json
{"level":30,"msg":"Suporte access granted","administrator_id":"...","hotel_id":"...","usuario_id":"...","time":...}
```

**Expect**: one such log line per successful access from Scenario 2, and **no** log line for the rejected attempts in Scenario 4 (the log is only emitted after all validation passes).
