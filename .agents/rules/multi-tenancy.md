# Multi-Tenancy & Data Isolation Rules

## Fundamental Invariant

HotelMind is a multi-tenant platform where each hotel is an isolated tenant. Cross-hotel data leakage is considered a critical security vulnerability.

## Backend Rules (`packages/api`)

1. **Mandatory `hotel_id`**: Every business entity, database model, and database query MUST include and filter by `hotel_id`.
2. **Untrusted Client Inputs**: `hotel_id` is NEVER accepted from the client request body or query parameters for tenant-scoped operations.
3. **Derivation from JWT**: `hotel_id` is exclusively derived from the authenticated user's JWT token payload via `request.user.hotelId` in the route layer.
4. **Parameter Passing**:
   ```text
   Route handler (reads request.user.hotelId)
     ↓ passes hotelId
   Use Case (receives { hotelId, ...input })
     ↓ passes hotelId
   Repository implementation (applies where: { hotel_id: hotelId })
   ```

## Frontend Awareness (`packages/web` & `packages/admin`)

1. **Explicit Context**: Tenant identity must remain explicit in variables, props, and query keys (`hotelId`, `selectedHotelId`, `hotelFilter`). Avoid ambiguous identifiers like `id` or `current`.
2. **Administrative Scoping (`packages/admin`)**:
   - Clearly separate **Platform Scope** (cross-hotel administration, subscriptions, global settings) from **Hotel Scope** (operations scoped to a specific hotel).
   - Display the active scope visibly in the user interface.
