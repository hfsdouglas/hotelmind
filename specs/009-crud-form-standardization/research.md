# Phase 0 Research: Standardize CRUD Form Layout

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature's technology choices are fully determined by the existing `web` and `admin` package stacks. The research below documents the concrete decisions made for the ambiguous *how* behind the spec's *what*.

## 1. Centered container width

- **Decision**: Use a plain Tailwind utility wrapper (`mx-auto w-full max-w-3xl`) rather than enabling Tailwind's `container` plugin/theme key.
- **Rationale**: Neither `packages/web/tailwind.config.ts` nor `packages/admin/tailwind.config.ts` currently configures `theme.container`. Introducing the plugin would apply a global `.container` class with breakpoint-based padding that affects more than form pages. A local `max-w-3xl mx-auto` on a new `CrudFormLayout` wrapper achieves the "Bootstrap container" visual effect (fixed max width, centered, gutters) without a global config change or side effects on unrelated pages. `max-w-3xl` (48rem/768px) comfortably fits the widest existing form (user creation, ~8 fields) plus its card padding while still reading as "centered" on large monitors.
- **Alternatives considered**:
  - Enable Tailwind `container` theme config — rejected, global blast radius beyond this feature's scope.
  - Hardcode pixel widths per page — rejected, inconsistent and harder to maintain than one shared wrapper.

## 2. Header alignment within the container

- **Decision**: The header row (back button + `<h1>`) is rendered *inside* the same `mx-auto max-w-3xl` wrapper as the card, as a sibling block above it, using the existing `flex items-center gap-4` row — unchanged in appearance, just reparented into the constrained wrapper.
- **Rationale**: Spec FR-002 requires the header to respect the container width but stay left-aligned "the way it is now" — i.e. no new centering/typography change, only width containment. Keeping the exact existing header markup and only changing its parent's width satisfies this with minimal diff.
- **Alternatives considered**: Centering the header text — rejected, explicitly out of scope per the spec's wording ("aligned to the left, the way it is now").

## 3. Responsive 3-column checkbox grid

- **Decision**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2` on the options list; module/category grouping (used by access routes) keeps its existing heading above each module's grid.
- **Rationale**: Matches Tailwind's standard mobile-first breakpoint escalation already used elsewhere in both packages (e.g. `usuarios/novo.tsx`'s `grid grid-cols-2`). Three columns only apply at `lg` (1024px+) so labels never get so cramped they wrap awkwardly on tablet widths; two columns cover the mid-range; one column covers phones. Satisfies spec FR-004 (graceful degradation, no horizontal scroll).
- **Alternatives considered**: CSS multi-column (`columns-3`) — rejected, multi-column layout reflows checkboxes in reading order that breaks visual grouping by module and complicates keyboard/tab order.

## 4. Reusable layout components vs. per-page duplication

- **Decision**: Extract two small presentational components per package — `CrudFormLayout` (container + header + card slot) and `CheckboxGrid` (the responsive grid) — instead of copy-pasting the same Tailwind class strings across all ten pages.
- **Rationale**: The same header/container/card markup and the same checkbox-grid markup would otherwise be duplicated across 10+ pages in two packages; that's a genuine repeated structural pattern (not a premature abstraction), and each package's own `CLAUDE.md` explicitly calls for extracting reused rendering into components. Components stay presentational (props in, JSX out) so they add no business logic and remain trivially testable.
- **Alternatives considered**: A shared frontend package under `packages/` — rejected; the monorepo is explicitly service-oriented ("Services communicate over the network rather than sharing in-process code"), and both `web` and `admin` already duplicate their entire `components/ui` directory rather than sharing one, so a new shared UI package would be inconsistent with established precedent and out of scope for this feature.

## 5. Group description field as Textarea

- **Decision**: Add a shadcn-style `Textarea` primitive to `packages/web/src/components/ui/textarea.tsx`, mirroring the existing `Input` primitive's structure (forwardRef, `cn()`-merged className, same border/focus-ring tokens).
- **Rationale**: No `Textarea` component exists yet in either package. The group description is the only multi-line field in scope for this feature (per spec), so it's added only to `web`, where the group form lives — not speculatively to `admin`.
- **Alternatives considered**: Using a plain `<textarea>` with ad hoc classes inline — rejected, breaks the existing pattern where every form control is a shared, styled primitive (`Input`, `Select`, `Checkbox`).

## 6. Assigning access routes at group creation time

- **Decision**: On the group creation form, reuse the existing two-call sequence already proven on the edit form: `gruposService.create(data)` → on success, `gruposService.syncRotas(newGroup.id, selectedRouteIds)`. No new backend endpoint.
- **Rationale**: `POST /grupos` already returns the created `Grupo` (including its `id`), and `PUT /grupos/:id/rotas` already accepts a full route-id set — exactly the API the edit page uses for `syncRotas`. Chaining them client-side after creation satisfies FR-006/FR-007 without any backend or contract change, keeping this a pure front-end feature per the Constraints in Technical Context.
- **Alternatives considered**: Adding a `rota_ids` field to the `POST /grupos` payload so creation and route assignment happen in one request — rejected as out of scope: it would require an API/contract change, and the spec's Assumptions explicitly scope this as reusing "the same routes data ... already used on the group edit form," i.e. the existing sync endpoint.
