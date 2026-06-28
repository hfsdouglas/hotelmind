# Research: Personalized Login Greeting

**Feature**: `003-login-welcome-name`

No external unknowns required investigation. All decisions were derivable from
the existing codebase and the project constitution.

---

## Decision 1: First-Name Extraction Placement

**Decision**: Implement as `get first_name(): string` on the `User` domain entity.

**Rationale**: Name decomposition (first word of full name) is a domain rule
about how a `User` presents its own identity. Entities are the correct home for
such derivations. The route needs no string-manipulation knowledge.

**Alternatives considered**:
- Inline extraction in route — rejected (business logic leak into presentation layer)
- New field on DB model — rejected (derivable from existing `nome_completo`; no
  migration, no storage cost)
- Extraction inside the use case result — rejected (over-engineering; the entity
  already carries the value)

---

## Decision 2: Greeting Message Format

**Decision**: `"Seja bem-vindo, {first_name}!"` composed in the route handler.

**Rationale**: The exact wording of an HTTP response string is a presentation
concern. The route is the boundary between domain and HTTP; it is responsible for
shaping the response body.

**Alternatives considered**:
- Use case returning a pre-formatted `welcome_message` — rejected (couples
  business orchestration to presentation wording; use case has no HTTP knowledge)

---

## Decision 3: Empty Name Fallback

**Decision**: `get first_name()` returns the trimmed, space-split first segment
of `nome_completo`. If `nome_completo` is blank, the getter returns `''`. The
route checks `user.first_name` and falls back to `"Bem-vindo!"` on empty string.

**Rationale**: The getter's contract is "give me the first name"; the route's
contract is "give the user a greeting." Keeping the fallback in the route means
the getter remains a pure, predictable property.

---

## Decision 4: No Schema Change

**Decision**: `login_response_schema` stays as `message: z.string()`.

**Rationale**: The schema validates shape, not content. Hardcoding a greeting
regex would couple the schema to an ephemeral presentation detail. The existing
`z.string()` is correct and sufficient.
