# Phase 1 Data Model: Correct CRUD Form Container, Card, and Action Placement

This feature introduces no new persisted entities, database fields, or contract types — it corrects the presentational shape of an existing shared component. What follows is the updated component prop contract superseding the one recorded in `specs/009-crud-form-standardization/data-model.md`.

## `CrudFormLayout` (revised)

| Prop | Type | Change from `009` | Notes |
|---|---|---|---|
| `title` | `string` | unchanged | Page heading text |
| `backTo` | `string` | unchanged | Route path for the back-arrow link |
| `onSubmit` | `(event: FormEvent<HTMLFormElement>) => void` | **new, required** | `CrudFormLayout` now owns the `<form>` element |
| `children` | `React.ReactNode` | unchanged type, new meaning | All of the form's content — primary fields plus any contextual section(s) — rendered inside the single `Card`. Pages with multiple sections render each as a sibling block with its own heading. |
| `actions` | `React.ReactNode` | **new, required** | Action button(s) (e.g. Save, Cancel), rendered outside the `Card` in a right-aligned footer row. Each direct-child button receives a consistent minimum width. |
| `cardTitle` | `string` (optional) | unchanged | Optional heading rendered at the top of the card (existing `CardHeader`/`CardTitle` behavior), used for the first/primary section when a page has more than one |
| ~~`sidebar`~~ | — | **removed** | The side-by-side second-card layout is no longer supported |

### Removed capability

`sidebar?: React.ReactNode` is deleted from the props interface. Any page still passing it will fail to compile (TypeScript catches every remaining call site), which is the intended enforcement mechanism for FR-001.

## Page-level section model (pages with more than one context)

For the 4 pages that previously used `sidebar` (`grupos/novo`, `grupos/[id]/editar`, `usuarios/novo`, `usuarios/[id]/editar`), `children` now contains two sibling sections instead of a `Card` + a separate sidebar `Card`:

```
children:
  <section>                 ← primary fields (e.g. "Dados do grupo")
    <h2>{sectionTitle}</h2>
    ...fields...
  </section>
  <section>                 ← contextual data (e.g. "Rotas de acesso")
    <h2>{sectionTitle}</h2>
    ...CheckboxGrid group(s), grouped by module as before...
  </section>
```

No new component is introduced for "section" — a plain block with a heading is sufficient, matching the existing module-heading convention already used inside `CheckboxGrid` groupings (`data-model.md` from `009`, unchanged).

## Action button model

`actions` receives the page's existing `Button` element(s) unchanged in their own props (`type="submit"`, `disabled`, label) — only their *position* (moved out of `children`, into `actions`) and their *width* (no longer implicitly stretched by the removed `flex flex-col` form wrapper; constrained to a consistent minimum width by `CrudFormLayout`'s actions-row wrapper) change.
