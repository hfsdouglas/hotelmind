# Research: Logout & Route Navigation

**Feature**: `004-logout-route-nav`

All decisions were derivable from the existing codebase without external
research. No NEEDS CLARIFICATION markers were present in the spec.

---

## Decision 1: No UseCase for Logout

**Decision**: `POST /auth/logout` is handled entirely within the route handler.

**Rationale**: The system uses stateless JWTs. There is no server-side session
store. "Logout" is purely: respond with a `Set-Cookie` header that sets the
cookie's `maxAge` to 0 and `expires` to a past date — causing the browser to
delete it. This is a transport/HTTP concern. A use case that contained only
`reply.clearCookie(...)` would import Fastify reply objects (an HTTP concern),
violating the Clean Architecture boundary. Zero domain logic is involved.

**Alternatives considered**:
- `LogoutUseCase` — rejected: would be empty or would import infrastructure.
  Neither is acceptable per constitution §II and SOLID-S.

---

## Decision 2: Cookie Clearing Mechanism

**Decision**: Clear the `token` cookie by re-setting it with `maxAge: 0` and
`expires: new Date(0)`, matching all attributes of the original login cookie
(`httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure` from env).

**Rationale**: A `Set-Cookie` header only replaces an existing cookie if the
`name`, `path`, `domain`, and `secure` attributes all match. Fastify's
`reply.clearCookie('token', { path: '/' })` handles this correctly. Using
`clearCookie` (the idiomatic Fastify API) is preferred over manually setting
`maxAge: 0`.

**Alternatives considered**:
- Blacklisting the JWT server-side — rejected: requires a stateful store (Redis
  or DB). No such infrastructure exists and the feature does not justify it.

---

## Decision 3: Frontend Redirects After Route Rename

**Decision**: Three places need updating when `"/"` changes from login → dashboard:

| File | Change |
|------|--------|
| `routes.tsx` | `path: '/'` → LoginLayout children; `path: '/login'` |
| `routes.tsx` | `path: '/dashboard'` → AppLayout children → `path: '/'` |
| `pages/_layouts/app.tsx` | `<Navigate to="/">` → `<Navigate to="/login">` |
| `contexts/AuthContext.tsx` | `window.location.replace('/')` → `replace('/login')` |
| `pages/_layouts/login.tsx` | Add `isAuthenticated` guard → `<Navigate to="/">` |

**Alternatives considered**:
- Adding a catch-all redirect from `/dashboard` to `/` — rejected: the spec
  says the old path simply becomes a 404, which is the correct behavior.

---

## Decision 4: `useLogout` Failure Handling

**Decision**: On API error, `useLogout` still calls `clearSession()` and
navigates to `/login`. A toast error notification is shown to inform the user.

**Rationale**: FR-008. If the server is unreachable, the cookie may still exist
in the browser, but the user's local session must be cleared. The user can
always log in again — being stuck logged in when they intended to log out is
worse than any data inconsistency from a failed server-side cookie clear.

---

## Decision 5: Logout Button in TopNavbar

**Decision**: Add a `LogOut` icon button (Lucide `LogOut` icon) to the right
of the notifications dropdown in `TopNavbar`.

**Rationale**: `TopNavbar` is the only persistent UI element visible on every
authenticated page. No new component is needed — a `Button` with `variant="ghost"`
matches the existing menu button style. `useLogout` is called `onClick`.
