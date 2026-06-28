---
description: "Task list for Logout & Route Navigation"
---

# Tasks: Logout & Route Navigation

**Feature**: `004-logout-route-nav`
**Input**: `specs/004-logout-route-nav/plan.md`, `spec.md`, `research.md`, `contracts/`

**Scope**: 2 packages affected — `packages/api` (3 files) and `packages/web` (7 files, 1 new).
3 user stories with explicit sequential dependencies (US1 → US2 → US3).

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths relative to each package root

---

## Phase 1: Setup

**Purpose**: Confirm baseline is green before touching anything.

- [X] T001 Run `pnpm test --run` and `npx tsc --noEmit` in `packages/api` — confirm
  both pass before any changes

---

## Phase 2: US1 — Server Logout Endpoint (P1)

**Goal**: `POST /auth/logout` exists, requires auth, clears the JWT cookie, returns 200.

**Independent Test**: Run `pnpm test --run` in `packages/api` — new logout test cases pass.
Manually: `curl -X POST /auth/logout` with and without cookie verifies 200/401.

### Implementation for US1

- [X] T002 [US1] Create `packages/api/src/schemas/auth/logout_schema.ts`:
  - Export `logout_response_schema = z.object({ message: z.string() })`

- [X] T003 [US1] Add `POST /auth/logout` handler in
  `packages/api/src/routes/auth/auth_routes.ts`:
  - Place handler after `/auth/login`
  - Requires `onRequest: [app.authenticate]`
  - Clear the `token` cookie using `reply.clearCookie('token', { path: '/' })`
  - Return 200 with `{ message: 'Logout realizado com sucesso.' }`
  - Schema: tags `['Auth']`, summary `'Encerrar sessão'`, response 200 uses
    `logout_response_schema`, 401 uses `login_error_schema`
  - Import `logout_response_schema` from `@/schemas/auth/logout_schema`
  (depends on T002)

- [X] T004 [US1] Add logout test cases in
  `packages/api/src/routes/auth/auth_routes.spec.ts`:
  - Add a `describe('POST /auth/logout', ...)` block after the existing login tests
  - Test 1: authenticated request (inject with valid JWT cookie) → 200 + message
    `'Logout realizado com sucesso.'`
  - Test 2: unauthenticated request (no cookie) → 401
  - Reuse the existing `build_app()` helper and `app.jwt.sign(...)` pattern
  (depends on T003)

- [X] T005 [US1] Run `pnpm test --run` in `packages/api` — all tests pass
  including new logout cases (depends on T004)

**Checkpoint**: `pnpm test --run` green. `curl -X POST /auth/logout` with valid
cookie → 200. Without cookie → 401.

---

## Phase 3: US2 — Frontend Route Renaming (P2)

**Goal**: Dashboard at `/`, login at `/login`. All internal redirects updated.
Authenticated users on `/login` redirected to `/`.

**Independent Test**: Navigate to `/` unauthenticated → redirected to `/login`.
Navigate to `/` authenticated → dashboard shown. Navigate to `/login` authenticated
→ redirected to `/`.

### Implementation for US2

- [X] T006 [US2] Update `packages/web/src/routes.tsx`:
  - Change `LoginLayout` child from `path: '/'` to `path: '/login'`
  - Change `AppLayout` child from `path: '/dashboard'` to `path: '/'`

- [X] T007 [P] [US2] Update `packages/web/src/pages/_layouts/app.tsx`:
  - Change `<Navigate to="/" replace />` → `<Navigate to="/login" replace />`
  (parallel with T008, T009 — different files)

- [X] T008 [P] [US2] Update `packages/web/src/pages/_layouts/login.tsx`:
  - Import `useAuth` from `@/hooks/useAuth` and `Navigate` from `react-router-dom`
  - Add `const { isAuthenticated } = useAuth()` at the top of `LoginLayout`
  - Return `<Navigate to="/" replace />` before the main JSX if `isAuthenticated`
  (parallel with T007, T009)

- [X] T009 [P] [US2] Update `packages/web/src/contexts/AuthContext.tsx`:
  - Change `window.location.replace('/')` → `window.location.replace('/login')`
  in the `handleExpired` function inside `useEffect`
  (parallel with T007, T008)

**Checkpoint**: Browser — `/` unauthenticated → redirects to `/login`. `/` authenticated
→ dashboard. `/login` authenticated → redirects to `/`. Old `/dashboard` → 404.

---

## Phase 4: US3 — Frontend Logout Action (P3)

**Goal**: Authenticated users can click a logout button in the top nav to end their
session and be redirected to `/login`.

**Independent Test**: Click logout button while authenticated → redirected to `/login`.
Navigating back to `/` redirects to `/login` (session cleared).

### Implementation for US3

- [X] T010 [US3] Add `logout` method in `packages/web/src/api/auth.service.ts`:
  - `logout: () => api.post<{ message: string }>('/auth/logout').then(res => res.data)`

- [X] T011 [US3] Create `packages/web/src/hooks/useLogout.ts`:
  - Import `useNavigate` from `react-router-dom`
  - Import `useAuth` from `@/hooks/useAuth`
  - Import `authService` from `@/api/auth.service`
  - Import `toast` from `sonner`
  - Export `function useLogout()` returning an async `logout` function that:
    1. Calls `authService.logout()` — catches errors and shows `toast.error(...)` on failure
    2. Always calls `clearSession()` from `useAuth` regardless of server response
    3. Always calls `navigate('/login', { replace: true })`
  (depends on T010)

- [X] T012 [US3] Add logout button in `packages/web/src/components/layout/TopNavbar.tsx`:
  - Import `LogOut` from `lucide-react`
  - Import `useLogout` from `@/hooks/useLogout`
  - Add `const { logout } = useLogout()` inside the component
  - Add a `<Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">`
    with `<LogOut className="h-5 w-5" />` inside, placed after `<NotificationsDropdown />`
  (depends on T011)

**Checkpoint**: Logout button visible in top nav. Clicking it → `/login`. Server
error scenario → still redirects to `/login` with error toast.

---

## Phase 5: Polish & Validation

- [X] T013 Run `npx tsc --noEmit` in both `packages/api` and `packages/web` — zero
  type errors across the monorepo

- [X] T014 [P] Run `pnpm test --run` in `packages/api` — confirm all tests still pass
  after all changes

---

## Dependencies & Execution Order

| Task | Depends on | Notes |
|------|-----------|-------|
| T001 | — | Baseline |
| T002 | T001 | Schema before route |
| T003 | T002 | Route after schema |
| T004 | T003 | Tests after route |
| T005 | T004 | Validation |
| T006 | T005 | US2 starts after US1 green |
| T007 | T006 | After routes renamed |
| T008 | T006 | Parallel with T007, T009 |
| T009 | T006 | Parallel with T007, T008 |
| T010 | T007, T008, T009 | US3 starts after US2 complete |
| T011 | T010 | Hook after service |
| T012 | T011 | Component after hook |
| T013 | T012 | Final type check |
| T014 | T012 | Final test run |

**Story ordering**: US1 → US2 → US3. Each story independently testable before moving to the next.

### Parallel Opportunities

```
# Within US2 (all touch different files):
T007  packages/web/src/pages/_layouts/app.tsx
T008  packages/web/src/pages/_layouts/login.tsx
T009  packages/web/src/contexts/AuthContext.tsx
```

---

## Implementation Strategy

### MVP (US1 only — server endpoint)

1. T001: baseline
2. T002 → T003 → T004 → T005: server logout
3. **STOP and VALIDATE**: API tests green, curl works

### Full Delivery

1. US1 (T001–T005) → API logout endpoint ✅
2. US2 (T006–T009) → Frontend routes renamed ✅
3. US3 (T010–T012) → Logout button wired ✅
4. Polish (T013–T014) → Type check + tests ✅

---

## Notes

- No UseCase for logout — stateless JWT, cookie clearing is HTTP concern (see research.md)
- US2 tasks T007, T008, T009 are fully parallel — different files, same dependency (T006)
- `reply.clearCookie('token', { path: '/' })` requires `@fastify/cookie` (already registered)
- `clearSession()` comes from `useAuth()` hook, not directly from `AuthContext`
- After US2, the `auth:session-expired` event in `AuthContext` redirects to `/login` (not `/`)
