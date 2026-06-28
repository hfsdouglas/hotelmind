# Implementation Plan: Logout & Route Navigation

**Branch**: `004-logout-route-nav` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-logout-route-nav/spec.md`

## Summary

Three independent but sequentially-dependent stories:

1. **US1 (P1)**: Add `POST /auth/logout` to the API — requires auth, clears the
   JWT cookie, returns 200. No domain logic; cookie management is a pure HTTP
   concern so no UseCase is introduced.

2. **US2 (P2)**: Rename frontend routes — dashboard moves to `/`, login to
   `/login`. Update every existing redirect that points to `/` for the login
   page (`AppLayout`, `AuthContext` session-expiry handler). Add authenticated-
   user guard to `LoginLayout` (redirects to `/`).

3. **US3 (P3)**: Wire frontend logout — `logout` method in `authService`,
   `useLogout` hook (calls API → clears session → navigates to `/login`),
   logout button in `TopNavbar`.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js 20 (API), browser (Web)

**Primary Dependencies**:
- API: Fastify 5.x, Zod, Vitest — no new packages
- Web: React, React Router, Axios, TanStack Query — no new packages

**Storage**: No database changes. Cookie cleared server-side (set to expired).

**Testing**:
- API: Vitest (`auth_routes.spec.ts` extended)
- Web: manual validation via browser (no automated web tests in scope)

**Target Platform**: Linux server (API) + browser SPA (web)

**Project Type**: Monorepo — API microservice + React SPA

**Performance Goals**: N/A — trivial HTTP operation and route config

**Constraints**:
- Zero new dependencies in either package
- No database migrations
- Stateless JWT — logout effect achieved solely by cookie expiry

**Scale/Scope**: 7 files changed, 2 files created

## Constitution Check

| Gate | Scope | Status | Notes |
|------|-------|--------|-------|
| I. Contract-First | API | ✅ PASS | New response schema in `schemas/auth/` before route implementation |
| I. Contract-First | Web | ✅ PASS | `authService` is the HTTP boundary; `useLogout` consumes it |
| II. Clean Architecture | API | ✅ PASS | No UseCase for logout — justified: cookie clearing is a pure HTTP/infrastructure concern with zero domain logic (stateless JWT). Route handles it directly |
| II. Clean Architecture | Web | ✅ PASS | `authService` → HTTP, `useLogout` hook → orchestration, `TopNavbar` → presentation |
| III. SOLID | API | ✅ PASS | Route stays thin; schema isolates contract |
| IV. Explicit over Implicit | API | ✅ PASS | Cookie cleared with explicit `maxAge: 0` |
| V. Low Coupling | Web | ✅ PASS | `useLogout` depends on `authService` and `AuthContext` via hook interfaces |
| VI. Clean Code | Both | ✅ PASS | No file exceeds its single responsibility |
| VII. Testability | API | ✅ PASS | Logout route tested in `auth_routes.spec.ts` |

**Complexity Tracking**:

| Decision | Why |
|----------|-----|
| No `LogoutUseCase` | Stateless JWT: no domain state to mutate. Cookie clearing is an HTTP transport concern. Creating an empty use case would be ceremony without value — a violation of SOLID-S. |

## Project Structure

### Documentation (this feature)

```text
specs/004-logout-route-nav/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── logout_endpoint.md
└── tasks.md             ← /speckit-tasks output (not yet created)
```

### Source Code (affected files)

```text
packages/api/src/
├── schemas/auth/
│   └── logout_schema.ts           # NEW — response schema
└── routes/auth/
    ├── auth_routes.ts              # add POST /auth/logout handler
    └── auth_routes.spec.ts        # add logout test cases

packages/web/src/
├── routes.tsx                     # "/" → login, "/dashboard" → "/"
├── pages/_layouts/
│   ├── app.tsx                    # <Navigate to="/login"> (was "/")
│   └── login.tsx                  # add authenticated-user redirect to "/"
├── contexts/
│   └── AuthContext.tsx            # replace('/' → '/login') in expiry handler
├── api/
│   └── auth.service.ts            # add logout() method
├── hooks/
│   └── useLogout.ts               # NEW — logout orchestration hook
└── components/layout/
    └── TopNavbar.tsx              # add logout button
```

## Design Decisions

### 1. No `LogoutUseCase` in the API

**Decision**: The `POST /auth/logout` route clears the cookie directly without
delegating to a use case.

**Rationale**: The JWT is stateless — there is no server-side session store to
invalidate. "Logout" means: set the auth cookie to an expired value so the
browser discards it. This is a pure HTTP transport operation. A use case MUST
NOT import HTTP concerns and there is no domain logic to test independently.
Creating an empty use case would violate SOLID-S.

### 2. Cookie clearing approach

**Decision**: Set cookie with `maxAge: 0` and `expires: new Date(0)` using the
same attributes (httpOnly, sameSite, path) as the login cookie.

**Rationale**: Cookie attributes must match exactly for the browser to treat the
new Set-Cookie header as a replacement. Mismatched attributes create a second
cookie instead of clearing the first.

### 3. `useLogout` always clears local session

**Decision**: `useLogout` calls `authService.logout()` and always calls
`clearSession()` and navigates to `/login`, regardless of server response.

**Rationale**: FR-008 — the user must never be stuck in a half-authenticated
state. A server error must not prevent logout.

### 4. Logout button placement

**Decision**: Add a logout icon button to the right side of `TopNavbar`, next
to the existing notifications dropdown.

**Rationale**: `TopNavbar` is rendered on every protected page via `AppLayout`.
It is the natural home for session-level controls. No new layout components needed.

### 5. Login layout authenticated redirect

**Decision**: `LoginLayout` checks `isAuthenticated` and redirects authenticated
users to `/`.

**Rationale**: FR-009. Without this guard, a logged-in user who navigates to
`/login` would see the login form unexpectedly.
