# Feature Specification: Personalized Login Greeting

**Feature Branch**: `003-login-welcome-name`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Devolver o primeiro nome do usuário na mensagem de login. Ex: 'Seja bem-vindo, $fulano!'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalized Greeting on Login (Priority: P1)

When a user successfully authenticates, the system returns a welcome message
that addresses them by their first name instead of a generic greeting.

**Why this priority**: The personalized greeting is the entire scope of this
feature. There is only one user story.

**Independent Test**: Perform a successful login with a user whose full name is
"Admin HotelMind" and verify that the response body contains the message
"Seja bem-vindo, Admin!".

**Acceptance Scenarios**:

1. **Given** a user whose full name is "Admin HotelMind", **When** they
   authenticate successfully, **Then** the response message is
   `"Seja bem-vindo, Admin!"`.

2. **Given** a user whose full name is "Maria" (single word), **When** they
   authenticate successfully, **Then** the response message is
   `"Seja bem-vindo, Maria!"`.

3. **Given** a user who provides an incorrect password, **When** the login
   fails, **Then** the response still returns the existing error message —
   the personalized greeting is not included in error responses.

---

### Edge Cases

- What happens when the user's full name has leading or trailing spaces?
  The first name is taken after trimming whitespace.
- What happens when the user's full name is a single word with no spaces?
  The entire name is used as the first name.
- What if the stored name is empty? This is a data integrity issue — the
  system must not crash; fall back to the generic greeting `"Bem-vindo!"`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The successful login response MUST include a personalized
  greeting in the format `"Seja bem-vindo, {first_name}!"`.
- **FR-002**: The first name MUST be derived by taking all characters in
  the user's registered full name up to (but not including) the first space,
  after trimming any leading or trailing whitespace.
- **FR-003**: If the user's full name contains no spaces, the entire name
  MUST be used as the first name.
- **FR-004**: If the user's full name is blank or empty, the greeting MUST
  fall back to `"Bem-vindo!"` without the name.
- **FR-005**: Error responses (invalid credentials, unknown email) MUST NOT
  include any greeting message — the existing behavior is unchanged.

### Key Entities

- **User**: Contains a `nome_completo` field from which the first name is
  derived at login time. No new fields are introduced.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful login responses include a message matching
  `"Seja bem-vindo, {first_name}!"` where `{first_name}` is the first word
  of the user's full name.
- **SC-002**: Users with single-word names receive a greeting that uses their
  full name — no truncation or empty placeholder occurs.
- **SC-003**: Failed login responses are unaffected — 0% of error responses
  include a greeting message.
- **SC-004**: The automated test suite for the login endpoint covers the
  personalized greeting assertion and passes on every run.

## Assumptions

- The first name is always derived at response-time from the stored `nome_completo`
  — no separate "first name" field is added to the database.
- Name capitalization is preserved exactly as stored (no automatic title-casing).
- The feature scope is limited to the login endpoint response body; no other
  endpoints or notification flows are affected.
- All users already have a non-null `nome_completo` value by application invariant;
  the empty-name fallback (FR-004) is a defensive measure, not an expected case.
