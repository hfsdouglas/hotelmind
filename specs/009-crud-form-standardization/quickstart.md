# Quickstart: Validate CRUD Form Layout Standardization

Manual/end-to-end validation guide for this feature. Assumes implementation of the components described in `data-model.md` / `contracts/component-contracts.md` is complete.

## Prerequisites

```bash
pnpm install
```

Both apps can run against MSW mocks (per each package's "Mocking & Offline Development" standard), so a live API is not required for visual validation.

## 1. Automated checks (run first)

```bash
pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test
pnpm --filter admin lint && pnpm --filter admin typecheck && pnpm --filter admin test
```

Expected: all pass, including new `.spec.tsx` coverage for `CrudFormLayout`, `CheckboxGrid`, and (web) `Textarea`, plus updated specs for every modified page.

## 2. Web app — visual/manual validation

```bash
pnpm --filter web dev
```

Log in and check, at both a desktop width (≥1280px) and a narrow/mobile width (≤480px):

- **Groups → New / Edit** (`/grupos/novo`, `/grupos/:id/editar`):
  - Form fields sit inside one card, centered on the page with visible side margins on wide screens.
  - Header (back arrow + "Novo grupo"/"Editar grupo") lines up with the left edge of the card below it — not with the page's outer edge.
  - "Descrição" is a multi-line textarea; typing several lines keeps all of them visible.
  - **New (creation) form only**: an "Rotas de acesso" section is present, listing routes grouped by module, each group's options in 3 columns on desktop, collapsing to fewer columns on mobile.
  - Select a few routes, fill required fields, submit → toast success → group appears in the list already carrying the selected routes (open it in Edit to confirm the checkboxes are pre-checked).
  - Submit the creation form with zero routes selected → group is still created successfully.

- **Users → New / Edit** (`/usuarios/novo`, `/usuarios/:id/editar`):
  - Same centered/card/header rules as above.
  - "Grupos de acesso" checkbox list renders in 3 columns on desktop.

## 3. Admin app — visual/manual validation

```bash
pnpm --filter admin dev
```

Check the same centered/card/header layout on:

- **Administradores → Novo / Editar**
- **Hotéis → Novo / Editar**
- **Rotas → Nova / Editar** (single "Ativo" checkbox — layout applies, 3-column grid rule does not since there's no list)
- **Hotéis → Rotas** (route-assignment screen) — checkbox list renders in 3 columns on desktop.

## 4. Regression check

For at least one form per package, run through full submit-with-validation-errors and submit-success paths to confirm no field validation, error messaging, or toast behavior changed — only layout/markup (per spec FR-011).

## Expected Outcome

All items in `specs/009-crud-form-standardization/spec.md` → Success Criteria (SC-001 through SC-006) are observably true across both applications.
