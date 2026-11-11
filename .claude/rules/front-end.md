---
paths:
  - "packages/web/**"
  - "packages/admin/**"
---

# Front-end Standards (web & admin)

Shared rules for every React front-end package. Package-specific rules live in
each package's `CLAUDE.md`. Paths below are relative to the package root.

## Stack

React + Vite + TypeScript (strict) · Tailwind CSS + shadcn/ui (new-york, Radix)
· Lucide React · clsx · TanStack Query · Axios · React Hook Form + Zod · React
Router · Sonner · Vitest + React Testing Library · MSW.

## Structure

```text
src/
├── pages/            # Route entrypoints + page tests ONLY
│   ├── _layouts/     # Outlet-based shells (app.tsx, login.tsx)
│   ├── app/          # Authenticated pages
│   └── auth/         # Public auth pages
├── components/       # ALL reusable components
│   ├── ui/           # shadcn/ui primitives
│   ├── forms/        # CrudFormLayout, CheckboxGrid, CheckboxGroupList, save_button
│   ├── data-table/   # List primitives (see DataTable)
│   ├── layout/       # Sidebar, Navbar
│   └── <domain>/     # Domain components
├── hooks/            # Custom hooks (queries, mutations, UI helpers)
├── api/              # Axios client and endpoints
├── contexts/         # AuthContext, ThemeContext, ...
├── schemas/          # Zod form schemas
├── types/            # View models (shared contracts come from packages/.contracts)
└── mocks/handlers/   # MSW handlers
```

**RED FLAG**: never create a `components/` folder inside `src/pages/**`. Forms,
modals, dialogs, sections and widgets go in `src/components/<domain>/`.
`src/pages/**` holds only `index.tsx`, `novo.tsx`, `[id]/editar.tsx` and tests.

## UI

- Use the shadcn MCP tools to search/scaffold primitives before hand-writing UI.
- Multi-line fields use `components/ui/textarea.tsx`, never `Input`.

## DataTable & List Pages

Build list pages only with `components/data-table/` primitives, never one-off
table markup:

| File | Purpose |
|---|---|
| `list_page_layout.tsx` | Page shell: title, action, search bar, filters, content |
| `search_results_suspense.tsx` | Suspense boundary + skeleton for results |
| `paged_data_table.tsx` | Suspense query + `data_table` + pagination |
| `data_table.tsx` | Sortable table |
| `data_table_pagination.tsx` | Page controls + `limite` selector (50/100/250) |
| `search_bar.tsx` | Search input |
| `filter_panel.tsx` | Collapsible secondary filters |
| `result_count.tsx` | Result count indicator |

- **Action column**: header is empty (`header: ''`, never `"Ações"`); cell is
  `className="flex items-center justify-end gap-1"`.
- **URL state**: pagination, search and sorting live in URL search params via
  `hooks/usePaginacao.ts` (params follow the root pagination contract). Never
  keep them in `useState`.
- **Suspense**: results are wrapped in `SearchResultsSuspense`. Title, search,
  filters and actions stay outside the boundary. Results use suspense queries;
  param changes run inside `useTransition` (already done by `usePaginacao`) so
  the previous table stays visible. The skeleton matches header, column count
  and current `limite`, with `aria-busy` and `role="status"`.

## Forms (`CrudFormLayout`)

Every create/edit page uses `components/forms/CrudFormLayout.tsx`:

- It owns the `<form>`, header (back button + title) and exactly **one**
  `Card`. Extra sections are sibling blocks inside that card, never
  side-by-side cards.
- Action buttons render below the card, right-aligned, fixed widths.
- `CheckboxGrid` for flat checkbox sets; `CheckboxGroupList` for grouped ones.

```tsx
<CrudFormLayout
  title="Novo Hotel"
  backTo="/hoteis"
  onSubmit={form.handleSubmit(onSubmit)}
  actions={
    <>
      <Button type="submit">Criar hotel</Button>
      <Button type="button" variant="outline" onClick={() => navigate('/hoteis')}>
        Cancelar
      </Button>
    </>
  }
>
  <Form {...form}>{/* field blocks */}</Form>
</CrudFormLayout>
```

## State

- TanStack Query is the single source of truth for server data. Never mirror
  query results into `useState`; `useState` is only for ephemeral UI state.
- Data fetching/mutations live in custom hooks in `src/hooks/`; components stay
  presentational.
- Give feedback on every mutation with Sonner (`toast.success`, `toast.error`).

## Testing

- `.spec.tsx` next to pages, contexts and components.
- Mock HTTP with MSW (`src/mocks/handlers/`); never mock Axios directly.
- Assert observable behavior (`getByRole`, `getByText`), never internal state.
