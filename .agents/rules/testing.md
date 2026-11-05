# Testing & Quality Rules

## Mandatory TDD Methodology

HotelMind follows strict Test-Driven Development (TDD). **Tests must be written before implementation code.**

### Cycle: Red → Green → Refactor

1. **Red**: Write a failing test describing the required domain behavior or interface specification.
2. **Green**: Write the minimal implementation code to satisfy the test.
3. **Refactor**: Clean up and optimize the implementation while keeping all tests passing.

## Backend Testing (`packages/api`)

- **Colocation**: Test files use `.spec.ts` and sit alongside the source file (`create_user_use_case.spec.ts` next to `create_user_use_case.ts`).
- **Layers Requiring Tests**:
  - `core/entities`: Unit tests validating domain logic and invariants (no framework dependencies).
  - `core/usecases`: Unit tests injecting **in-memory repository fakes** from `core/repositories/<domain>/in-memory/`. Never mock Prisma directly.
  - `routes`: Integration tests executing Fastify's `app.inject` without binding to a physical network socket.
- **In-Memory Fakes**: Every in-memory fake must implement the domain repository contract faithfully.

## Frontend Testing (`packages/web` & `packages/admin`)

- **Scope**: Write tests (`.spec.tsx` / `.spec.ts`) for pages (`src/pages/`), contexts (`src/contexts/`), and reusable components (`src/components/`).
- **Tools**: Vitest, React Testing Library, and Mock Service Worker (MSW) for isolating API requests.
- **Behavior-Driven**: Test observable user behavior (e.g. `screen.getByText`, accessible roles), not private component state or internal implementation details.
