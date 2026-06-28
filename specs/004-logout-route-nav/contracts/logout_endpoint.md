# Contract: POST /auth/logout

**Endpoint**: `POST /auth/logout`
**Authentication**: Required (valid session cookie)

---

## Request

No request body.

Cookie `token` must be present and valid (same guard as `GET /auth/me`).

---

## Response — 200 OK

```
{
  "message": string   // "Logout realizado com sucesso."
}

Set-Cookie: token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

The `Set-Cookie` response header instructs the browser to delete the `token`
cookie. After this response, `GET /auth/me` returns 401.

---

## Response — 401 Unauthorized

```
{
  "message": string   // "Unauthorized"
}
```

Returned when no valid session cookie is present.

---

## Route Changes

| Path | Before | After |
|------|--------|-------|
| `POST /auth/login` | Login | Login (unchanged) |
| `GET /auth/me` | Session check | Session check (unchanged) |
| `POST /auth/logout` | *(did not exist)* | **NEW** — session termination |

---

## Frontend Navigation Contract

| Old path | New path | Notes |
|----------|----------|-------|
| `/` | `/login` | Login page |
| `/dashboard` | `/` | Dashboard (root) |
| *(none)* | Redirect `/login` → `/` | For already-authenticated users |
