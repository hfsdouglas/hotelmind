# Implementation Plan: Correct CRUD Form Container, Card, and Action Placement

**Branch**: `main` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-crud-form-layout-refinement/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Correct the shared `CrudFormLayout` component (and every page built on it in `packages/web` and `packages/admin`) introduced by the prior CRUD form standardization feature (`009`): remove the side-by-side "sidebar" card option so every create/edit page renders exactly one card containing all of its content (contextual sections separated by an in-card heading instead of a second card/column); widen the centered container to follow a Bootstrap-style breakpoint scale instead of the current narrow fixed width; and move the primary action button(s) (Save/Create, Cancel) outside and below the card into a right-aligned footer row with a consistent, non-stretched default width. This is a presentation-layer-only correction — no new API calls, no contract changes, no change to validation or submission logic.

## Technical Context

**Language/Version**: TypeScript (strict mode), React (latest), per `packages/web/CLAUDE.md` and `packages/admin/CLAUDE.md`

**Primary Dependencies**: Tailwind CSS, Shadcn/UI (`Card`, `Button`), React Hook Form (unchanged) — no new dependencies

**Storage**: N/A — no schema, endpoint, or contract changes

**Testing**: Vitest + React Testing Library, co-located `.spec.tsx` files, per each package's TDD policy — existing `CrudFormLayout.spec.tsx` in both packages must be updated first (red) before the component changes (green), per TDD

**Target Platform**: Browser SPA, responsive from mobile widths through desktop; two independently deployed front-ends (`packages/web`, `packages/admin`)

**Project Type**: Web application — two front-end packages in a pnpm monorepo (continuation of `009`'s structure)

**Performance Goals**: N/A — pure layout/markup change

**Constraints**: MUST NOT change field validation, submission logic, or API contracts; MUST preserve the existing 3-column `CheckboxGrid` behavior (spec FR-008); MUST apply to every page already migrated to `CrudFormLayout` in `009` (10 pages: `grupos/{novo,editar}`, `usuarios/{novo,editar}` in web; `administradores/{novo,editar}`, `hoteis/{novo,editar}`, `rotas/{nova,editar}` in admin)

**Scale/Scope**: 2 shared component files (`CrudFormLayout.tsx` in each package) + their 2 spec files, plus targeted edits to the 4 pages that used the now-removed `sidebar` prop (`grupos/novo.tsx`, `grupos/[id]/editar.tsx`, `usuarios/novo.tsx`, `usuarios/[id]/editar.tsx`); the other 6 pages only need their action button(s) moved into the new `actions` prop, no structural section changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Same applicability as `009` — the constitution's Clean Architecture/layered principles govern the backend (`packages/api`) and do not apply to this frontend-only presentational correction. Applicable principles only:

- **I. Contract-First Development** — N/A. No `.contracts` types touched; no backend endpoints added or changed. **Pass.**
- **III. SOLID (Single Responsibility)** — `CrudFormLayout` keeps a single job (container + header + one card + actions row); removing the `sidebar` branch actually *reduces* its responsibility surface. **Pass.**
- **IV. Explicit over Implicit** — The new `actions` prop makes the "buttons live outside the card" rule structural (enforced by the component), not a convention pages must remember to follow correctly. **Pass.**
- **V. Low Coupling, High Cohesion** — Change is duplicated identically across `packages/web` and `packages/admin`'s independent `CrudFormLayout` copies, consistent with `009`'s established precedent (no shared frontend package introduced). **Pass.**
- **VI. Clean Code** — No new files beyond updating the two existing components and their specs; page edits stay within each package's existing naming conventions. **Pass.**
- **VII. Testability by Design** — `CrudFormLayout` remains a pure presentational component (props in, JSX out); its existing test files are updated first (TDD) to assert the new single-card/actions-row structure before the implementation changes. **Pass.**

No violations requiring justification. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/010-crud-form-layout-refinement/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/src/
├── components/forms/
│   ├── CrudFormLayout.tsx        # MODIFIED — remove `sidebar`, add `onSubmit` + `actions`, widen container, single Card
│   └── CrudFormLayout.spec.tsx   # MODIFIED FIRST (TDD) — assert single card, actions outside card, no sidebar prop
└── pages/app/
    ├── grupos/
    │   ├── novo.tsx               # MODIFIED — routes section moves inside the single Card; Save moves to `actions`
    │   └── [id]/editar.tsx        # MODIFIED — same treatment
    └── usuarios/
        ├── novo.tsx               # MODIFIED — grupos section moves inside the single Card; Save moves to `actions`
        └── [id]/editar.tsx        # MODIFIED — same treatment

packages/admin/src/
├── components/forms/
│   ├── CrudFormLayout.tsx        # MODIFIED — mirrors web's change
│   └── CrudFormLayout.spec.tsx   # MODIFIED FIRST (TDD)
└── pages/app/
    ├── administradores/{novo,editar}.tsx   # MODIFIED — Save/Cancel move to `actions`
    ├── hoteis/{novo,editar}.tsx             # MODIFIED — Save/Cancel move to `actions`
    └── rotas/{nova,editar}.tsx              # MODIFIED — Save/Cancel move to `actions`
```

**Structure Decision**: Same two-package structure established in `009`. This feature only touches the shared `CrudFormLayout` component (once per package) and the pages that consume it — no new components, no new packages.

## Complexity Tracking

*No Constitution Check violations — table not required.*
