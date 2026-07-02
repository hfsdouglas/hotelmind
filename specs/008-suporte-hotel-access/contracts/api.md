# API Contracts: Suporte — Admin Access to Hotel Web App

**Feature**: 008-suporte-hotel-access
**Base URL**: `/` (same API as existing endpoints)
**Auth**: `admin_token` cookie via `app.authenticateAdmin` for admin-facing endpoints. The one exception is `GET /admin/hoteis/:id/suporte-acesso` — still admin-authenticated, but it's designed to be opened as a plain browser navigation (`window.open`) rather than called via `fetch`, so the cookie is attached automatically without any CORS involvement.

---

## Shared Contract Changes (`packages/.contracts/src/auth.ts`)

```ts
export interface SuporteSession {
  administrador_nome: string
}

export interface LoginResponse {
  user: AuthUser
  hotel: AuthHotel
  message: string
  rotas: RotaMenu[]
  suporte?: SuporteSession
}
```

`MeResponse` (web API's `/auth/me`) gains the same optional `suporte?: SuporteSession`.

---

## GET /admin/hoteis (updated)

**Auth**: Admin
**Query params** (existing, plus one addition):

| Param | Type | Default | Description |
|---|---|---|---|
| pagina | number | 1 | Current page |
| limite | number | 50 | Results per page (max 250) |
| busca | string | — | Free-text search |
| ordenar_por | string | — | Sort field |
| direcao | `asc`\|`desc` | `asc` | Sort direction |
| status | `S`\|`N` | — | **NEW** — filter by hotel status |

**Response 200** (each hotel now includes `status`):
```json
{
  "data": [
    {
      "id": "uuid",
      "nome_hotel": "Furnaspark Resort",
      "razao_social": "Furnaspark Resort Ltda",
      "nome_fantasia": "Furnaspark Resort",
      "cnpj": "00000000000000",
      "email_comercial": "contato@furnaspark.com.br",
      "telefone_comercial": "11999999999",
      "website": null,
      "status": "S"
    }
  ],
  "meta": { "pagina": 1, "limite": 50, "total": 1, "ultima_pagina": 1 }
}
```

---

## GET /admin/hoteis/:id/usuarios

**Auth**: Admin
**Purpose**: Feed the Suporte user picker (a dialog inside the admin app — not the web app).

**Response 200**:
```json
[
  { "id": "uuid", "nome_completo": "Douglas Faria", "email": "douglas@furnaspark.com.br" }
]
```

**Response 404**:
```json
{ "message": "Hotel não encontrado." }
```

---

## GET /admin/hoteis/:id/suporte-acesso

**Auth**: Admin (cookie, sent automatically as part of the browser navigation that opens this URL)
**Purpose**: One-click, one-request access grant. The admin app opens this URL directly (`window.open`) — it is never called via `fetch`/XHR, and it is not consumed by any page in `packages/web`.

**Query params**:

| Param | Type | Required | Description |
|---|---|---|---|
| usuario_id | string | Yes | The hotel user to impersonate — must belong to the target hotel |

**Response 302** (success): redirects to `WEB_APP_URL` (e.g. `http://localhost:5173/`).

Also sets cookie `token` (httpOnly, `sameSite: lax`, `maxAge: 30 min`) whose JWT payload carries the normal `user` claim plus `suporte: { administratorId, administratorNome }`.

On success, the route emits a structured log line (`administrator_id`, `hotel_id`, `usuario_id`, timestamp) via Fastify's built-in logger as the audit record — there is no database table for this (see data-model.md; `Hotel.status` is the only new database field in this feature).

**Response 404/409** (error): since this URL is opened as a raw browser navigation (not fetched by any app code), errors are rendered as a small self-contained HTML page directly by this endpoint — never JSON. Cases:
- Hotel not found → 404, "Hotel não encontrado."
- Hotel inactive → 409, "Hotel inativo. Não é possível acessar via Suporte."
- User not found in this hotel → 404, "Usuário não encontrado neste hotel."

---

## GET /auth/me (updated)

**Auth**: Web session (`token` cookie)
**Response 200** now optionally includes:
```json
{
  "user": { "...": "..." },
  "hotel": { "...": "..." },
  "rotas": [ "..." ],
  "suporte": { "administrador_nome": "Super Admin" }
}
```

`suporte` is present only when the active session's JWT carries the `suporte` claim (i.e., it originated from `GET /admin/hoteis/:id/suporte-acesso` and hasn't yet expired). This is what lets `packages/web`'s `AuthContext` passively pick up the support-session state on first load after the redirect, with no dedicated page or form (see research.md #2).
