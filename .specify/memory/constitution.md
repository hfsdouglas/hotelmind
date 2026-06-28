<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A — initial constitution; all placeholder tokens replaced

Added sections:
  - Core Principles (7 principles)
  - Layer Responsibility Boundaries
  - Development Workflow
  - Governance

Removed sections: N/A

Templates reviewed:
  - .specify/templates/plan-template.md  ✅ compatible — Constitution Check gate
    already present as a dynamic placeholder filled by /speckit-plan
  - .specify/templates/spec-template.md  ✅ compatible — requirements and
    constraints sections align with principle-driven FRs
  - .specify/templates/tasks-template.md ✅ compatible — foundational phase maps
    to infrastructure layer; story phases map to use-case / route layers
  - .specify/templates/commands/         ✅ N/A — directory does not exist

Follow-up TODOs: None — all placeholders resolved.
-->

# HotelMind Constitution

## Core Principles

### I. Contract-First Development

All shared interfaces MUST be defined in `packages/.contracts` before any
implementation begins. Services MUST NOT duplicate type definitions; all
consumers MUST import from `.contracts`.

When a contract changes, `.contracts` MUST be updated first; all downstream
consumers MUST be updated in the same commit or an immediately following one.
Runtime Zod schemas live inside each service's own `schemas/` directory and
MUST be derived from the shared contract types — never defined independently.

**Rationale**: Enforces a single source of truth for inter-service boundaries,
prevents drift between services, and makes breaking changes explicit at compile
time rather than at runtime.

### II. Clean Architecture & Strict Layer Boundaries

Every service MUST be organized into these layers. Outer layers depend inward;
inner layers MUST NOT import from outer layers.

```
Infrastructure → Routes → Use Cases → Domain (Repos + Services) → Schemas / Contracts
```

- **Routes** (`routes/`): Parse and validate HTTP input/output only.
  MUST NOT contain business logic. MUST delegate all work to a use case.
- **Use Cases** (`use_cases/`): Orchestrate domain operations for exactly one
  user intent. MUST NOT access infrastructure or HTTP concerns directly.
- **Repositories** (`repositories/`): Abstract all data-access behind an
  interface. MUST NOT contain business logic. One repository per aggregate root.
- **Services** (`services/`): Encapsulate domain logic that spans multiple
  entities but is not persistence-related. MUST NOT call repositories from
  outside their own bounded context.
- **Schemas** (`schemas/`): Define and enforce validation rules (Zod).
  MUST NOT contain business logic or side effects.
- **Infrastructure** (`infrastructure/`): Database clients, queue adapters,
  HTTP clients, and framework plugins. MUST NOT bleed into domain layers.

**Rationale**: Isolating layers means a database swap affects only
infrastructure; a business rule change affects only use cases and domain.
Change blast radius is predictable and contained.

### III. SOLID Principles

Every module, class, and function MUST conform to all five rules:

- **S — Single Responsibility**: One reason to change. A route handler changes
  only when the HTTP contract changes; a use case changes only when its
  business rule changes. If a module has two reasons to change, split it.
- **O — Open/Closed**: Extend behavior through composition and dependency
  injection. Stable abstractions MUST NOT be modified to accommodate new
  variants — add a new implementation instead.
- **L — Liskov Substitution**: Any implementation of a repository or service
  interface MUST be substitutable for another without altering program
  correctness. Implementations MUST honor the interface contract fully.
- **I — Interface Segregation**: Interfaces MUST be narrow and caller-specific.
  A repository MUST NOT expose methods irrelevant to its consumers.
  Prefer many small interfaces over one large one.
- **D — Dependency Inversion**: All cross-layer dependencies MUST point at
  abstractions (interfaces/types), never at concrete implementations.
  Use cases MUST receive repositories as injected interfaces.

**Rationale**: SOLID rules are the mechanical enforcement of Clean
Architecture. A violation is an early signal of boundary erosion.

### IV. Explicit over Implicit

Behavior MUST be visible at the call site. Implicit side effects, hidden
control flow, and magic defaults are prohibited.

- Function signatures MUST declare every dependency as a parameter or injected
  interface. Module-level singletons accessed inside functions are prohibited.
- Configuration MUST be passed explicitly. `process.env` MUST NOT be read
  inside domain, use-case, or schema code — only at the infrastructure boundary.
- Errors MUST be thrown or returned explicitly. Silent fallbacks are prohibited
  unless accompanied by a rationale comment.
- Type assertions (`as T`) are prohibited except at verified system boundaries
  (e.g., parsing external JSON). Use proper type narrowing everywhere else.

**Rationale**: Implicit behavior hides bugs, makes testing unreliable, and
obscures the true dependencies of a module.

### V. Low Coupling, High Cohesion

Modules MUST do one thing well and know as little as possible about their
collaborators.

- A use case MUST depend on repository and service interfaces, not on
  concrete implementations.
- Cross-service communication MUST go through the network (HTTP or message
  queue). Shared in-process imports across service packages are prohibited.
- A module MUST NOT import from a sibling layer at the same abstraction level
  unless they share the same bounded context.
- Circular dependencies are prohibited. Their presence signals a missing
  abstraction or a misplaced responsibility.

**Rationale**: Low coupling makes services independently deployable; high
cohesion makes modules independently understandable and testable.

### VI. Clean Code

All code MUST be written so the next reader never needs to guess intent.

- Names MUST describe what a thing IS or DOES at the level of its abstraction.
  `create_reservation_use_case.ts` is correct; `handler2.ts` is not.
- Functions MUST do one thing. If a function needs inline comments to describe
  what its sections do, it MUST be split into smaller named functions.
- Comments MUST explain WHY, never WHAT. A comment that restates the code is
  noise and MUST be removed.
- Magic literals are prohibited; extract them as named constants.
- All files, folders, route names, schemas, repositories, use cases, and
  services MUST use `snake_case`. No exceptions.

**Rationale**: Code is read far more often than it is written. Legibility
reduces defect rate and onboarding time.

### VII. Testability by Design

Every module MUST be written so it can be tested without standing up the full
service. This is a structural requirement, not a retrospective concern.

- Use cases MUST accept repository and service interfaces so they can be
  exercised with in-memory fakes — no real database required.
- Infrastructure adapters MUST be tested against real external systems in
  integration tests, never with mocks that hide real behavior.
- Schemas MUST be tested with both valid and invalid inputs.
- Route handlers MUST be tested via HTTP injection (e.g., Fastify `inject`),
  not by calling use cases directly.

**Rationale**: If a module is hard to test, it has incorrect dependencies.
Testability is a structural proxy for correctness of design.

## Layer Responsibility Boundaries

| Layer | Owns | MUST NOT |
|---|---|---|
| `routes/` | HTTP parse, schema validation, call one use case, serialize response | Contain business logic, access DB, call other routes |
| `use_cases/` | Orchestrate exactly one user intent via repositories + services | Call HTTP clients, access DB directly, import from `routes/` |
| `repositories/` | Translate between domain entities and persistence | Contain business logic, call repositories from other bounded contexts |
| `services/` | Domain logic spanning multiple entities, no I/O | Perform I/O, know about HTTP layer, import from `routes/` |
| `schemas/` | Declare and validate data shapes (Zod) | Execute side effects, reference repositories or use cases |
| `infrastructure/` | DB drivers, queue adapters, HTTP clients, framework plugins | Contain domain logic, import from `use_cases/` or `services/` |
| `.contracts` | Shared TypeScript interfaces and types | Contain Zod schemas, runtime code, or any implementation |

## Development Workflow

1. **Define the contract first**: Update or create the interface in
   `packages/.contracts` before writing any implementation.
2. **Write the schema**: Define the Zod validation schema inside the consuming
   service's `schemas/` directory, derived from the contract type.
3. **Implement inward-out**: Repository → Service (if needed) → Use Case →
   Route. Each layer is independently testable before the next is wired.
4. **Validate the boundary**: Before merging, confirm no layer imports from a
   layer it should not know about. Use static analysis or a manual checklist.
5. **Constitution Check gate**: Every implementation plan MUST include an
   explicit gate confirming compliance with these principles before Phase 1
   design begins, and again after design is complete.

## Governance

This constitution supersedes all other development practices within the
HotelMind repository. Any practice contradicting a principle here is invalid
until the constitution is amended.

**Amendment procedure**:
1. Propose the change with a written rationale and a migration plan.
2. Obtain explicit approval from the project lead.
3. Update this file with a new version and today's date as `LAST_AMENDED_DATE`.
4. Propagate changes to all dependent templates and update the Sync Impact
   Report at the top of this file.

**Compliance review**: All PRs and implementation plans MUST include a
"Constitution Check" gate that lists which principles apply and confirms
compliance. Complexity violations MUST be justified in the plan's Complexity
Tracking table before merging.

**Versioning policy**:
- MAJOR: Principle removed, renamed, or redefined in a backward-incompatible way.
- MINOR: New principle or mandatory section added, or material guidance expanded.
- PATCH: Clarification, wording improvement, or non-semantic refinement.

**Version**: 1.0.0 | **Ratified**: 2026-06-28 | **Last Amended**: 2026-06-28
