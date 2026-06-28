# Feature Specification: Logout & Route Navigation

**Feature Branch**: `004-logout-route-nav`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Criar rota de logout no servidor. Implementar a requisição de logout no front-end. O dashboard deve passar a ser a rota raiz do servidor '/', e o login deve passar a usar a rota '/login'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Server Logout Endpoint (Priority: P1)

The server exposes a dedicated logout endpoint that, when called by an
authenticated user, invalidates their session by clearing the authentication
cookie. After a successful logout, the server responds confirming the session
was terminated.

**Why this priority**: The server endpoint is the foundation that all other
logout behavior depends on. It can be delivered and validated independently
of any frontend changes.

**Independent Test**: Send an authenticated `POST /auth/logout` request and
verify the response clears the authentication cookie and returns a success
confirmation. Then send `GET /auth/me` with the cleared cookie and confirm
it returns 401.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a valid session cookie, **When** they
   call `POST /auth/logout`, **Then** the server responds with 200, the
   authentication cookie is cleared (expired), and the user is no longer
   authenticated.

2. **Given** an unauthenticated request (no cookie), **When** `POST /auth/logout`
   is called, **Then** the server returns 401 — logout requires an active
   session.

---

### User Story 2 - Frontend Route Renaming (Priority: P2)

The application reorganizes its navigation routes: the dashboard becomes the
root path (`/`) and the login page moves to `/login`. Any existing internal
links or redirects that pointed to the old paths are updated accordingly,
including the redirect that fires when a session expires.

**Why this priority**: Route renaming must happen before the frontend logout is
wired up, because after logout the user must be redirected to `/login`. Doing
the renaming first prevents broken redirects.

**Independent Test**: Navigate to `/` while unauthenticated and confirm the
dashboard is not accessible (redirected to `/login`). Navigate to `/login`
and confirm the login form appears.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to `/`, **Then**
   they are redirected to `/login`.

2. **Given** an authenticated user, **When** they navigate to `/`, **Then**
   the dashboard is displayed.

3. **Given** a session that expires mid-use, **When** the expiry is detected,
   **Then** the user is redirected to `/login` (not `/`).

4. **Given** a user who navigates to `/login` while already authenticated,
   **Then** they are redirected to `/` (dashboard).

---

### User Story 3 - Frontend Logout Action (Priority: P3)

Authenticated users can log out from the application by clicking a logout
button in the navigation interface. Clicking the button calls the server
logout endpoint, clears the local session, and redirects the user to the
login page.

**Why this priority**: Depends on both US1 (server endpoint) and US2
(correct `/login` route). Can be delivered after both are complete.

**Independent Test**: While authenticated, click the logout button. Confirm
the user is redirected to `/login` and cannot access protected pages without
logging in again.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing any protected page, **When** they
   click the logout button, **Then** the server logout endpoint is called,
   the local session is cleared, and the user is redirected to `/login`.

2. **Given** a logout attempt where the server call fails, **When** the
   request errors, **Then** the local session is still cleared, the user is
   redirected to `/login`, and a brief error notification is shown.

3. **Given** a logged-out user, **When** they attempt to navigate back to `/`,
   **Then** they are redirected to `/login`.

---

### Edge Cases

- What if the user clicks logout and the server is unreachable? The local
  session must still be cleared — the user must never be stuck in a
  half-authenticated state.
- What if the user navigates directly to `/dashboard` after the route rename?
  The old path no longer exists; a 404 page is shown.
- What if a user is already on `/login` and is authenticated? They are
  redirected to `/` (dashboard) to prevent duplicate login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The server MUST expose a `POST /auth/logout` endpoint that
  requires authentication and clears the session cookie on success.
- **FR-002**: The `POST /auth/logout` endpoint MUST return 401 when called
  without a valid session.
- **FR-003**: After a successful logout, `GET /auth/me` MUST return 401 —
  the session cookie must be fully invalidated.
- **FR-004**: The frontend dashboard MUST be accessible at the root path `/`.
- **FR-005**: The frontend login page MUST be accessible at the path `/login`.
- **FR-006**: All internal redirects that previously pointed to `/` for the
  login page MUST be updated to point to `/login`.
- **FR-007**: The frontend MUST provide a logout control accessible from
  every authenticated page.
- **FR-008**: Activating the logout control MUST call `POST /auth/logout`,
  clear the local session, and navigate the user to `/login` — even if the
  server call fails.
- **FR-009**: Authenticated users who navigate to `/login` MUST be
  automatically redirected to `/`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `POST /auth/logout` with a valid session cookie returns 200 and
  the cookie is cleared — verified in 100% of automated test runs.
- **SC-002**: `GET /auth/me` after logout returns 401 — verified in 100% of
  automated test runs.
- **SC-003**: Navigating to `/` as an authenticated user shows the dashboard;
  as an unauthenticated user it redirects to `/login` — both branches covered
  by automated tests.
- **SC-004**: Clicking the logout button always navigates the user to `/login`,
  regardless of server availability — verified by simulating a server error.
- **SC-005**: Zero broken internal links or redirects pointing to the old
  `/dashboard` path after the route rename.

## Assumptions

- The authentication cookie is HTTP-only; clearing it server-side (by setting
  it to an expired value) is the authoritative session invalidation mechanism.
- The frontend already has an `AuthContext` with a `clearSession()` method —
  the logout action reuses it rather than introducing a new state mechanism.
- The logout button is placed in the existing top navigation bar or sidebar,
  not as a standalone page.
- The `/dashboard` path is not redirected — it simply ceases to exist and
  returns a 404 after the route rename.
- No server-side session store exists (stateless JWT); the logout effect is
  achieved solely by clearing the cookie, making the token inaccessible to the
  browser.
