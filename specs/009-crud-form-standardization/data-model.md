# Phase 1 Data Model: Standardize CRUD Form Layout

This feature introduces no new persisted entities, database fields, or contract types. `Grupo` and `RotaItem` (from `@hotelmind/contracts` and `grupos.service.ts` respectively) are consumed exactly as they exist today. What follows is the UI-level shape introduced by the new shared components — presentational props and transient client state, not domain data.

## Shared Component Props

### `CrudFormLayout`

Wraps every create/edit page's header + centered container + card.

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Page heading text (e.g. "Novo grupo") |
| `backTo` | `string` | Route path for the back-arrow link (e.g. `/grupos`) |
| `children` | `React.ReactNode` | The form card's content (fields) |
| `sidebar` | `React.ReactNode` (optional) | Secondary card content rendered alongside the form (e.g. the access-routes or grupos selector), preserving today's `lg:flex-row` two-card layout inside the same constrained container |

### `CheckboxGrid`

Renders one group of checkbox options in the responsive 3-column layout.

| Prop | Type | Notes |
|---|---|---|
| `items` | `{ id: string; label: string }[]` | Options to render |
| `selectedIds` | `Set<string>` | Currently checked option ids |
| `onToggle` | `(id: string) => void` | Invoked when an option is checked/unchecked |
| `disabled` | `boolean` (optional) | Mirrors existing disable-while-submitting behavior |
| `emptyMessage` | `string` (optional) | Shown when `items` is empty (existing "Nenhuma rota disponível." / similar) |

Pages that group options by category (access routes grouped by `modulo`) render one heading + one `CheckboxGrid` per group, unchanged from today's per-module loop — only the inner list markup moves into `CheckboxGrid`.

### `Textarea` (web only)

Shadcn-style primitive mirroring `Input`'s API: forwards `ref`, spreads native `<textarea>` props, applies the same border/focus-ring/background tokens as `Input`. No custom props beyond standard HTML textarea attributes.

## Transient Client State: Group Creation with Routes

The group creation form gains the same local selection state the edit form already has:

| State | Type | Lifecycle |
|---|---|---|
| `selectedRouteIds` | `Set<string>` | Local `useState`, starts empty, updated via `CheckboxGrid`'s `onToggle` |

Submission flow (client-side only, no new endpoint):

1. `gruposService.create(formData)` → resolves with the created `Grupo` (has `id`).
2. On success, `gruposService.syncRotas(grupo.id, Array.from(selectedRouteIds))`.
3. On both succeeding: toast success, invalidate `['grupos']` query, navigate to `/grupos`.
4. If step 1 fails: existing error handling (409 → "already exists" toast) applies unchanged; step 2 never runs.
5. If step 1 succeeds but step 2 fails: toast an error indicating the group was created but routes failed to sync (mirrors the existing edit-page pattern of a separate `syncRotasMutation` error toast), so the user isn't left without feedback per each package's error-handling standard.
