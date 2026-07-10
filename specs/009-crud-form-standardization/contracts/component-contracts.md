# Component Contracts

This feature has no HTTP/API contract changes (see `research.md` §6 — creation reuses the existing `POST /grupos` and `PUT /grupos/:id/rotas` endpoints unmodified). The only new "interfaces" are the internal component contracts consumed by every create/edit page within each package. These are documented here because, per `data-model.md`, ~11 pages across two packages depend on getting these shapes right.

## `CrudFormLayout`

```ts
interface CrudFormLayoutProps {
  title: string
  backTo: string
  children: React.ReactNode
  sidebar?: React.ReactNode
}
```

**Contract**:
- Renders a header row (`Button variant="ghost" size="icon"` linking to `backTo`, wrapping `ArrowLeft`, plus an `<h1>` with `title`) and a `Card` below it, both inside one `mx-auto w-full max-w-3xl` wrapper.
- When `sidebar` is provided, the form `Card` and the sidebar `Card` render side-by-side (`lg:flex-row`) *inside the same constrained wrapper* — the wrapper's max-width must accommodate both cards, matching today's combined two-card width.
- Does not know about form state, validation, or submission — purely structural/presentational.
- Consumers keep owning their own `<form onSubmit=...>` and fields as `children`.

## `CheckboxGrid`

```ts
interface CheckboxGridItem {
  id: string
  label: string
}

interface CheckboxGridProps {
  items: CheckboxGridItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  disabled?: boolean
  emptyMessage?: string
}
```

**Contract**:
- Renders `items` in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2`, one labeled `Checkbox` per item.
- Calls `onToggle(item.id)` on click/change of any item; does not mutate `selectedIds` itself (controlled component).
- Renders `emptyMessage` (or a caller-agnostic default) instead of the grid when `items` is empty.
- Has no knowledge of "modules" or grouping — callers that need grouped headings (e.g. access routes by `modulo`) render one heading + one `CheckboxGrid` per group, same as today's per-module loop.

## `Textarea` (web package only)

```ts
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
```

**Contract**: Same API surface as the native `<textarea>`, styled to match `Input`'s existing tokens (border, background, focus-ring, disabled state), forwarding `ref` like every other primitive in `components/ui`.

## Group creation client-side flow

No new HTTP contract; the creation page's mutation orchestration must honor this ordering (already the shape used by the edit page):

```
1. POST /grupos                      (gruposService.create)
     └─ on success →
2. PUT /grupos/:id/rotas             (gruposService.syncRotas, id from step 1's response)
```

Both existing endpoints and their request/response shapes (`CreateGrupoPayload`, `Grupo`, `RotaItem[]`) are unchanged — see `packages/web/src/api/grupos.service.ts`.
