# API Package

Fastify HTTP server for HotelMind. Shared back-end rules (architecture,
structure, Fastify, database, pagination, schemas, testing):
`.claude/rules/back-end.md`.

## Overview

**HotelMind API** is the single backend for both front-ends: `web` (hotel
staff) and `admin` (platform operators). It exposes REST endpoints with
cookie/JWT authentication and Swagger docs, persists to PostgreSQL through
Prisma, and keeps each hotel's data isolated. Domains (`src/routes/`):

- **Auth and access**: `auth` (hotel and admin login), `users`, `groups`,
  `routes` (navigation/permission catalog), `admin` (administrators).
- **Platform**: `hotels` (admin management and per-hotel configuration),
  `suporte` (support access).
- **Reservations**: `reservas` (including public FNRH forms), `orcamentos`
  (quotes, with public view), `leads`.
- **Inventory and pricing**: `quartos`, `categorias_quartos`,
  `regimes_alimentacao`, `tarifarios`.
- **Commercial**: `comercial` (business partners).

Port comes from the `PORT` env var (the front-ends default to `http://localhost:3000`).

## Package-specific

- **Multi-tenancy (`hotel_id`)**: every business table/model has a `hotel_id`
  column. `hotel_id` is **never** accepted from the body or query string; it
  comes only from the JWT (`request.user.hotelId`). Every query that reads,
  creates, updates or deletes business records filters or sets `hotel_id`.
  Cross-hotel leakage is a critical bug. Route tests must include a
  cross-hotel isolation case.

- **`grupos_ids` pattern**: the `User` model stores access group IDs as a
  comma-separated string in `grupos_ids` (`String? @db.Text`), with no pivot
  table. Membership queries must match all four positions:
  `grupos_ids = id OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%'`.
