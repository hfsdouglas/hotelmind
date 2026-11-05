---
name: speckit
description: >-
  Use this skill to guide the end-to-end SpecKit feature development workflow,
  from specification and clarification to planning, task generation,
  implementation, and convergence in HotelMind.
---

# SpecKit Feature Development Workflow

This skill provides an overarching guide to the SpecKit methodology in HotelMind, coordinating the individual `speckit-*` skills.

## The SpecKit Phases

```text
1. Specify → 2. Clarify → 3. Plan → 4. Tasks → 5. Implement → 6. Converge
```

### Phase 1: Feature Specification (`speckit-specify`)
- Capture requirements in `specs/<feature-id>/spec.md`.
- Establish user scenarios, acceptance criteria, and domain scope.
- Maintain consistency with HotelMind monorepo principles.

### Phase 2: Clarification (`speckit-clarify`)
- Identify underspecified areas, edge cases, and architectural boundaries.
- Formulate up to 5 targeted questions to eliminate ambiguity.
- Encode finalized decisions back into `spec.md`.

### Phase 3: Architectural Planning (`speckit-plan`)
- Create `specs/<feature-id>/plan.md`.
- Define technical design, multi-tenant considerations (`hotel_id`), database changes, API routes, and UI components.
- Enforce: Clean Architecture for API, `src/components/` (never `src/pages/**/components`) for frontend.

### Phase 4: Dependency-Ordered Tasks (`speckit-tasks`)
- Break the plan into granular, dependency-ordered tasks in `specs/<feature-id>/tasks.md`.
- Organize tasks by phase: Contracts -> Database -> Backend (TDD) -> Frontend (TDD) -> Verification.

### Phase 5: Implementation Execution (`speckit-implement`)
- Execute tasks incrementally.
- Follow mandatory TDD: Red → Green → Refactor.
- Run tests and Biome linting after completing each task block.

### Phase 6: Convergence Assessment (`speckit-converge`)
- Compare the codebase against `spec.md`, `plan.md`, and `tasks.md`.
- Identify unbuilt acceptance criteria or missing test coverage.
- Append remaining tasks to `tasks.md` until full convergence is achieved.
