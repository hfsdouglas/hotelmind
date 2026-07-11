# Phase 0 Research: Correct CRUD Form Container, Card, and Action Placement

No `NEEDS CLARIFICATION` markers remain — this is a scoped correction of an existing component (`CrudFormLayout`, introduced in `009`) whose current implementation and consumers are fully known. The decisions below cover the concrete *how* behind each corrected behavior.

## 1. Container width scale

- **Decision**: Replace the current `max-w-3xl` / `max-w-5xl` (sidebar-conditional) container with a single responsive width ladder using Tailwind's default breakpoint prefixes, targeting Bootstrap's classic container max-widths at each step: `w-full px-4 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]` (all combined with `mx-auto`).
- **Rationale**: Bootstrap's container breakpoints (`sm`/`md`/`lg`/`xl`/`xxl`) and Tailwind's default breakpoints (`sm`/`md`/`lg`/`xl`/`2xl`) both have five steps, so each Tailwind prefix maps 1:1 to the corresponding Bootstrap container width even though the two frameworks' pixel *trigger* points differ slightly (Bootstrap's `sm` triggers at 576px vs. Tailwind's 640px, etc.) — an acceptable approximation since the spec's Assumptions describe this as "sizing inspiration," not literal Bootstrap adoption. Neither `packages/web/tailwind.config.ts` nor `packages/admin/tailwind.config.ts` currently overrides `theme.container` or `theme.screens` (confirmed unchanged since `009`), so this is implemented as plain utility classes on `CrudFormLayout`'s root wrapper, with no global Tailwind config change (avoids the same blast-radius concern already noted in `009`'s research).
- **Alternatives considered**:
  - Enable Tailwind's `container` plugin/theme key with Bootstrap-matching values — rejected again, same reasoning as `009`: it applies a global `.container` utility class affecting more than form pages.
  - A single fixed width (e.g. `max-w-4xl`) — rejected: doesn't scale by viewport the way Bootstrap containers do, and doesn't address "the container widens more on wider screens" implied by the feedback.

## 2. Single card, no sidebar

- **Decision**: Remove the `sidebar` prop from `CrudFormLayout` entirely. The component renders exactly one `Card` wrapping `children`. Pages that previously split content into a primary-fields card and a sidebar card now render both sections as sibling blocks inside the same `children`, each preceded by its own heading (e.g. `<h2>`), reusing the visual weight already used for `CardTitle`/module headings.
- **Rationale**: Directly satisfies FR-001/FR-002. Because `CrudFormLayout` will no longer accept a second content slot, it becomes structurally impossible for a future page to reintroduce the two-card layout by accident — the correction is enforced by the component's API, not just convention (Constitution Principle IV, Explicit over Implicit).
- **Alternatives considered**:
  - Keep `sidebar` but stack it below `children` inside the same `Card` — rejected: still implies a separate, arguably still "columnar" content region; simpler and clearer to remove the extra slot and let pages express multi-section content directly, matching how the spec describes "separated by context... the way it is now" (i.e., heading-based, not container-based, separation).

## 3. Actions outside the card, right-aligned, consistent width

- **Decision**: `CrudFormLayout` takes over ownership of the `<form>` element via two new required props, `onSubmit` and `actions`. It renders `<form onSubmit={onSubmit}><Card>...{children}...</Card><div className="mt-6 flex justify-end gap-3 [&>button]:min-w-[140px]">{actions}</div></form>`. Pages stop rendering their own `<form>` tag and their own trailing `<Button type="submit">`; they instead pass the button(s) via `actions`.
- **Rationale**: Satisfies FR-004/FR-005/FR-006. Making `CrudFormLayout` own the `<form>` tag guarantees the actions row is a sibling of the `Card`, not a descendant of it — impossible to place a button back inside the card by mistake. The `[&>button]:min-w-[140px]` arbitrary-variant selector applies one consistent, non-stretched width to every direct-child button without needing every page author to remember to add a width class, and without changing the shared `Button` primitive's default size (which is used in many non-form-footer contexts app-wide and must not change).
- **Alternatives considered**:
  - Add a new `size="formAction"` variant to the shared `Button` component (`components/ui/button.tsx`) — rejected: would require every call site to opt in correctly, is easy to forget, and mixes a layout-positioning concern into a primitive meant to stay presentation-agnostic about its container.
  - Keep pages owning `<form>` and just move the button markup below the `Card` manually per page — rejected: relies on every page author doing it correctly and consistently; doesn't structurally prevent regression the way giving `CrudFormLayout` ownership of `<form>` does.
  - Use CSS Grid/flex `justify-content: flex-end` only, without a `min-width` — rejected: doesn't address "apply a default width for the buttons," which explicitly asks for consistent sizing, not just right alignment.

## 4. Scope of the correction

- **Decision**: Apply the `CrudFormLayout` API change to all 10 pages already migrated in `009`. Of those, only the 4 pages that used `sidebar` (`grupos/novo`, `grupos/[id]/editar`, `usuarios/novo`, `usuarios/[id]/editar`) need their contextual section restructured into an in-card section; the other 6 (`administradores`, `hoteis`, `rotas` × novo/editar) only need their existing single-section content and action button(s) adapted to the new `children`/`actions` split.
- **Rationale**: Matches FR-007 exactly ("every create and edit form previously migrated to the shared CRUD form layout"). No new pages are in scope.
- **Alternatives considered**: None — the spec is explicit about scope.
