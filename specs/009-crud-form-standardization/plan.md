# Implementation Plan: Standardize CRUD Form Layout

**Branch**: `main` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-crud-form-standardization/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Standardize the visual layout of every create/edit form across the `web` and `admin` front-end applications: each form's inputs are centered on the page in a fixed-width container and wrapped in a single `Card`, with the header (back button + title) constrained to that same container width and left-aligned. Checkbox lists (access routes, group/role assignments) render in a responsive 3-column grid. The Group form's description field becomes a `Textarea`, and the Group creation form gains the access-routes selector already present on the Group edit form, saving the selected routes as part of the creation flow. The standard is captured as reusable presentational components in each package and documented in both packages' `CLAUDE.md` files. No backend, contract, or validation-logic changes are required — this is a presentation-layer refactor that reuses existing API endpoints and existing `Grupo`/`RotaItem` contract types as-is.

## Technical Context

**Language/Version**: TypeScript (strict mode), React (latest), per `packages/web/CLAUDE.md` and `packages/admin/CLAUDE.md`

**Primary Dependencies**: React Hook Form + Zod (forms/validation), Shadcn/UI + Tailwind CSS (presentation), TanStack Query (server state / mutations), React Router (navigation), Lucide React (icons) — all already installed, no new runtime dependencies

**Storage**: N/A — no schema or persistence changes; reuses existing `/grupos`, `/grupos/:id/rotas`, `/usuarios` endpoints unchanged

**Testing**: Vitest + React Testing Library, co-located `.spec.tsx` files, MSW for API mocking — per each package's TDD (Red→Green→Refactor) policy

**Target Platform**: Browser SPA, responsive from mobile widths up through desktop; two independently deployed front-ends (`packages/web`, `packages/admin`)

**Project Type**: Web application — two front-end packages in a pnpm monorepo (no shared frontend package; each duplicates its own `components/ui` per existing precedent)

**Performance Goals**: N/A — pure layout/markup change; no new network calls beyond the existing create + sync-routes sequence already used on the edit flow

**Constraints**: MUST NOT change existing field validation, submission logic, or API contracts (spec FR-011); MUST reuse existing `gruposService.create` + `gruposService.syncRotas` calls for the creation flow (no new backend endpoint); MUST follow existing Tailwind design tokens (`card`, `border`, spacing scale) already defined in each package's `tailwind.config.ts`

**Scale/Scope**: 10 existing create/edit pages across both packages (web: `grupos/novo`, `grupos/[id]/editar`, `usuarios/novo`, `usuarios/[id]/editar`; admin: `administradores/novo`, `administradores/editar`, `hoteis/novo`, `hoteis/editar`, `rotas/nova`, `rotas/editar`), plus one standalone checkbox-list screen (`admin/hoteis/rotas.tsx`) that falls under the same checkbox-grid rule

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`.specify/memory/constitution.md`) defines backend Clean Architecture layering (routes/use_cases/repositories/services) that does not apply to this frontend-only presentational feature. Applicable principles only:

- **I. Contract-First Development** — N/A for this feature. No `.contracts` types are added or changed; the feature reuses existing `Grupo` and `RotaItem` shapes as-is. **Pass.**
- **III. SOLID (Single Responsibility / Interface Segregation)** — The new shared layout primitives (`CrudFormLayout`, `CheckboxGrid`) each do exactly one presentational job and take narrow, explicit props (no page-specific logic leaks into them). **Pass.**
- **IV. Explicit over Implicit** — Shared components receive all data (routes, selection state, callbacks) as explicit props; no hidden globals or implicit defaults. **Pass.**
- **V. Low Coupling, High Cohesion** — `CrudFormLayout`/`CheckboxGrid` are duplicated per-package (not shared in-process across `web`/`admin`), consistent with the existing precedent that each package owns its own `components/ui` set and the monorepo's "no shared in-process frontend code" boundary. **Pass.**
- **VI. Clean Code / Naming** — New shadcn-style primitives (`Textarea`) follow the existing lowercase-dash file convention already used for `card.tsx`/`checkbox.tsx`; new composed layout components follow the existing PascalCase convention already used for `Sidebar.tsx`/`TopNavbar.tsx`/`SupportBanner.tsx`. **Pass** (documented here to resolve the apparent tension between the root `CLAUDE.md`'s blanket snake_case rule, aimed at backend files/routes/use-cases, and each package's own `CLAUDE.md`, which explicitly prescribes PascalCase for React components — the package-level convention governs component files).
- **VII. Testability by Design** — New shared components are pure/presentational (props in, JSX out) and are covered by their own `.spec.tsx`; page-level tests continue to exercise forms via React Testing Library queries, not implementation details. **Pass.**

No violations requiring justification. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/009-crud-form-standardization/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/web/src/
├── components/
│   ├── ui/
│   │   └── textarea.tsx              # NEW — shadcn-style Textarea primitive
│   └── forms/                        # NEW directory
│       ├── CrudFormLayout.tsx        # NEW — centered container + left-aligned header + Card wrapper
│       └── CheckboxGrid.tsx          # NEW — responsive 3-column checkbox grid (optionally grouped by module)
├── pages/app/
│   ├── grupos/
│   │   ├── novo.tsx                  # MODIFIED — new layout + access-routes selector added
│   │   └── [id]/editar.tsx           # MODIFIED — new layout + description as Textarea
│   └── usuarios/
│       ├── novo.tsx                  # MODIFIED — new layout + CheckboxGrid for grupos
│       └── [id]/editar.tsx           # MODIFIED — new layout + CheckboxGrid for grupos
└── api/grupos.service.ts             # UNCHANGED — create() + syncRotas() reused as-is for creation flow

packages/admin/src/
├── components/
│   └── forms/                        # NEW directory (mirrors web/, package stays independent)
│       ├── CrudFormLayout.tsx        # NEW
│       └── CheckboxGrid.tsx          # NEW
└── pages/app/
    ├── administradores/{novo,editar}.tsx   # MODIFIED — new layout
    ├── hoteis/{novo,editar}.tsx             # MODIFIED — new layout
    ├── hoteis/rotas.tsx                     # MODIFIED — CheckboxGrid for the routes list
    └── rotas/{nova,editar}.tsx              # MODIFIED — new layout (single "Ativo" checkbox unaffected by the grid rule)

packages/web/CLAUDE.md      # MODIFIED — document the CRUD form layout standard
packages/admin/CLAUDE.md    # MODIFIED — document the CRUD form layout standard
```

**Structure Decision**: Two independent front-end packages (`packages/web`, `packages/admin`), each gets its own `components/forms/` with a `CrudFormLayout` and `CheckboxGrid` component, following the monorepo's existing pattern of package-local `components/ui` duplication rather than a shared frontend package. `packages/web` additionally gets a `Textarea` UI primitive for the group description field. All ten existing create/edit pages (plus the `admin/hoteis/rotas.tsx` route-assignment screen) are updated to consume these shared components instead of hand-rolled markup.

## Complexity Tracking

*No Constitution Check violations — table not required.*
