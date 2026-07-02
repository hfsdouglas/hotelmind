# Data Model: Suporte — Admin Access to Hotel Web App

**Feature**: 008-suporte-hotel-access
**Date**: 2026-07-01 (revised twice same day — see research.md #1/#7: no exchange step, and no new DB table beyond `Hotel.status`)

---

## Prisma Schema Changes

**`Hotel.status` is the only new database field this feature introduces.**

```prisma
model Hotel {
  id                 String          @id @default(uuid())
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt
  nome_hotel         String          @db.VarChar(100)
  razao_social       String          @db.VarChar(100)
  nome_fantasia      String          @db.VarChar(100)
  cnpj               String          @unique @db.VarChar(14)
  email_comercial    String          @unique @db.VarChar(255)
  telefone_comercial String          @db.VarChar(11)
  website            String?
  status             String          @default("S") @db.Char(1)   // NEW — 'S' ativo / 'N' inativo

  enderecos          HotelEndereco[]
  users              User[]
  grupos             Grupo[]
  rotas_hoteis       RotaHotel[]

  @@map("hoteis")
}
```

No other model changes. There is no `SuporteAcesso` table, entity, or repository — the audit trail is a structured log line instead (see research.md #7), so there is nothing to persist beyond the hotel's own status.

---

## Domain Entity Changes (`core/entities`)

`Hotel` entity gains a `status: string` field (analogous to `Administrator.status`) — no new getters required beyond what callers need (`status === 'S'`).

No new entity is added for Suporte.

---

## Repository Changes

`IHotelRepository`: `CreateHotelData`/`UpdateHotelData` both get an optional `status?: string`; `list`'s pagination filtering gains an optional `status` param, consistent with how `Grupo` listing already filters by status. No new repository file.

`IUserRepository`: unchanged — the admin user-picker reuses `list(hotelId, pagination)` as-is.

`IRouteRepository`: unchanged — the redirect endpoint reuses `findByUsuario(hotelId, grupoIds)`, the same path the normal login use case already uses.

---

## Use Case (`core/usecases/suporte`)

### `CriarSuporteAcessoUseCase`

Pure validation + data assembly — no persistence. Depends only on `IHotelRepository`, `IUserRepository`, and `IRouteRepository`.

Input: `{ hotelId, usuarioId }`
Behavior:
1. Load hotel by id — throw `HotelNotFoundError` if missing.
2. Reject if `hotel.status !== 'S'` — throw `HotelInactiveError`.
3. Load user by id **scoped to `hotelId`** (`IUserRepository.findById(id, hotelId)`) — throw `UserNotFoundError` if missing or belongs to a different hotel.
4. Compute `rotas` via `IRouteRepository.findByUsuario(hotelId, grupoIds)`.
5. Return `{ user, hotel, rotas }` — everything the route needs to sign the JWT, set the cookie, redirect, and emit the audit log line.

The route itself (not the use case) is responsible for logging the audit event via `request.log.info(...)` after the use case succeeds — logging is a framework/infrastructure concern, so it stays out of the use case per the layering rules (`core/usecases` must not know about Fastify).

Tested with in-memory fakes for all three repositories — no real DB, no clock/expiry logic at all now.

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
  suporte?: SuporteSession   // NEW — present only for a Suporte-originated session
}
```

`GET /auth/me`'s response gains the same optional `suporte?: SuporteSession` field, so a page refresh mid-support-session still reflects it, and so `AuthContext`'s passive bootstrap (research.md #2) can populate it on first load after the redirect. This field is carried entirely inside the JWT claim — no database read is needed to reconstruct it.

`Hotel`'s new `status` field and the admin-only user-picker payload (`{ id, nome_completo, email }[]`) stay local to `packages/admin`'s service layer — not shared across packages, consistent with `Hotel`'s full shape never having been centralized in `.contracts`.
