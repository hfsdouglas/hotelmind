# Quickstart: Validate CRUD Form Container/Card/Action Correction

Manual/end-to-end validation guide for this feature. Assumes the `CrudFormLayout` changes described in `data-model.md` / `contracts/component-contracts.md` are implemented across all 10 pages.

## Prerequisites

```bash
pnpm install
```

## 1. Automated checks (run first)

```bash
pnpm --filter web typecheck && pnpm --filter web test
pnpm --filter admin typecheck && pnpm --filter admin test
```

Expected: all pass, including updated `CrudFormLayout.spec.tsx` in both packages (single-card assertion, actions rendered outside the card, no `sidebar` prop) and updated specs for every page whose markup changed.

## 2. Web app — visual/manual validation

```bash
pnpm --filter web dev
```

At a desktop width (≥1280px):

- **Groups → New / Edit** (`/grupos/novo`, `/grupos/:id/editar`):
  - Exactly one card is visible on the page — no second card or side-by-side column.
  - The card occupies a visibly wider, more proportionate column than before (compare against the Bootstrap container scale in `research.md` §1), with reasonable side margins, not the previous narrow card with exaggerated whitespace.
  - "Rotas de acesso" appears as a second section inside the same card, below "Dados do grupo", separated by a heading — still grouped by module with the existing 3-column checkbox grid.
  - The Save/"Criar grupo" button is **not** inside the card — it appears below the card, aligned to the right edge of the container, at a compact (not stretched) width.

- **Users → New / Edit** (`/usuarios/novo`, `/usuarios/:id/editar`): same checks — one card, "Grupos de acesso" as an in-card section, action button outside the card and right-aligned.

At a mobile width (≤480px): confirm the single card and its sections still stack cleanly, and the action button row remains usable (no overflow) while staying right-aligned or full-width-stacked as appropriate.

## 3. Admin app — visual/manual validation

```bash
pnpm --filter admin dev
```

Check the same "one card, actions outside and right-aligned, consistent button width" rules on:

- **Administradores → Novo / Editar** (Criar/Salvar + Cancelar both outside the card, same width, right-aligned)
- **Hotéis → Novo / Editar**
- **Rotas → Nova / Editar**

## 4. Regression check

For at least one form per package, submit with validation errors and then with valid data, confirming no field validation, error messaging, toast behavior, or (for groups) routes-assignment behavior changed — only container width, card count, and action button placement/width (per spec FR-008 and the Constraints in `plan.md`).

## Expected Outcome

`specs/010-crud-form-layout-refinement/spec.md` → Success Criteria SC-001 through SC-004 are observably true across both applications.
