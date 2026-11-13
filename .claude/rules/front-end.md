---
paths:
  - "packages/web/**"
  - "packages/admin/**"
  - "packages/ui/**"
---

# Front-end Standards (web, admin & ui)

Shared rules for every React front-end package. Package-specific rules live in
each package's `CLAUDE.md`. Paths below are relative to the package root.

## Stack

React + Vite + TypeScript (strict) · Tailwind CSS + shadcn/ui (new-york, Radix)
· Lucide React · clsx · TanStack Query · Axios · React Hook Form + Zod · React
Router · Sonner · Vitest + React Testing Library · MSW · Playwright (E2E).

## Structure

```text
src/
├── pages/            # Route entrypoints + page tests ONLY
│   ├── _layouts/     # Outlet-based shells (app.tsx, login.tsx)
│   ├── app/          # Authenticated pages
│   └── auth/         # Public auth pages
├── components/       # ALL reusable components
│   ├── forms/        # CrudFormLayout
│   ├── data-table/   # List primitives (see DataTable)
│   ├── layout/       # Sidebar, Navbar
│   └── <domain>/     # Domain components
├── hooks/            # Custom hooks (queries, mutations, UI helpers)
├── api/              # Axios client and endpoints
├── contexts/         # AuthContext, ThemeContext, ...
├── schemas/          # Zod form schemas
├── types/            # View models (shared contracts come from packages/.contracts)
├── mocks/            # MSW mocks, one folder per domain
│   ├── <domain>/     # <domain>_handlers.ts
│   ├── handlers.ts   # aggregates every domain's handlers
│   ├── server.ts     # MSW server (Vitest / node)
│   └── browser.ts    # MSW worker (Playwright E2E)
└── tests/
    ├── setup.ts      # Vitest setup
    ├── utils/        # shared test helpers (render_with_providers, ...)
    └── <domain>/     # Playwright E2E specs (*.e2e.ts)
```

**RED FLAG**: never create a `components/` folder inside `src/pages/**`. Forms,
modals, dialogs, sections and widgets go in `src/components/<domain>/`.
`src/pages/**` holds only `index.tsx`, `novo.tsx`, `[id]/editar.tsx` and tests.

## UI

- Primitives (Button, Input, Select, Dialog, Form, Table...) come from
  `@hotelmind/ui` (`packages/ui`), never from a local copy. Never duplicate a
  primitive inside `web` or `admin`; new generic primitives are created in
  `packages/ui` with a story (see `packages/ui/CLAUDE.md`). Domain wording or
  behavior stays in an app wrapper under `components/<domain>/`, configured
  through the primitive's props.
- Reusable compositions with no router/query/API dependency (`SaveButton`,
  `CheckboxGrid`, `FilterPanel`, `ResultCount`, `SuiteSyncLogo`) live in
  `packages/ui/src/patterns/`, never duplicated in `web` and `admin`.
- `cn` comes from `@hotelmind/ui`; do not recreate `lib/utils.ts`.
- Use the shadcn MCP tools to search/scaffold primitives before hand-writing UI.
- Multi-line fields use `Textarea` from `@hotelmind/ui`, never `Input`.
- Tokens: shared tokens and the Tailwind preset live in `packages/ui`; an app
  only adds its own domain tokens (e.g. web's `status-*`, `chart-*`).

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
| `FilterPanel` (`@hotelmind/ui`) | Collapsible secondary filters |
| `ResultCount` (`@hotelmind/ui`) | Result count indicator |

- **Action column**: header is empty (`header: ''`, never `"Ações"`); cell is
  `className="flex items-center justify-end gap-1"`.
- **URL state**: pagination, search and sorting live in URL search params via
  `hooks/use_paginacao.ts` (params follow the root pagination contract). Never
  keep them in `useState`.
- **Suspense**: results are wrapped in `SearchResultsSuspense`. Title, search,
  filters and actions stay outside the boundary. Results use suspense queries;
  param changes run inside `useTransition` (already done by `usePaginacao`) so
  the previous table stays visible. The skeleton matches header, column count
  and current `limite`, with `aria-busy` and `role="status"`.

## Forms (`CrudFormLayout`)

Every create/edit page uses `components/forms/crud_form_layout.tsx`:

- It owns the `<form>`, header (back button + title) and exactly **one**
  `Card`. Extra sections are sibling blocks inside that card, never
  side-by-side cards.
- Action buttons render below the card, right-aligned, fixed widths.
- `CheckboxGrid` (flat sets) and `CheckboxGroupList` (grouped) and `SaveButton`
  come from `@hotelmind/ui`.

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

Stack: Vitest + React Testing Library (unit/integration) · Playwright (E2E) · MSW.

**What to test** (created by the application): components, contexts, hooks and
pages. **Never** test the primitives in `packages/ui` (shadcn/ui vendor code);
`packages/ui` is covered by stories, the axe accessibility spec and specs for
its pure helpers (`cn`, date mask) instead. Domain wrappers around a primitive
(e.g. `WristbandColorPicker`) are app code and are tested.

- Unit specs: `.spec.ts(x)` next to the file under test.
- E2E specs: `src/tests/<domain>/<name>.e2e.ts` (Playwright; `*.e2e.ts` is
  excluded from Vitest).
- Components live in `src/components/<domain>/`, never loose in
  `src/components/`. File names are snake_case.
- Mock HTTP with MSW only (`src/mocks/<domain>/<domain>_handlers.ts`, registered
  in `src/mocks/handlers.ts`); never mock Axios directly. E2E runs the app with
  `VITE_E2E_MOCKS=true`, which starts the MSW worker in the browser.
- Assert observable behavior (`getByRole`, `getByText`), never internal state.

Commands (per package): `pnpm test` (Vitest, single run), `pnpm test:watch`,
`pnpm test:e2e` (Playwright; first run needs `pnpm exec playwright install
chromium`, plus `sudo pnpm exec playwright install-deps chromium` on Linux).

**AI agents**: run only the tests written/changed for the current task (e.g.
`pnpm exec vitest run <path>`), never the whole suite, and never in watch mode.
