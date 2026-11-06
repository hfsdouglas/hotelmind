# Hotel Web Application

Frontend web application for the HotelMind platform, built with React, Vite, and TypeScript. Used by hotel operators and staff to run day-to-day hospitality operations (reservations, room catalogs, pricing, quotes, guests, and check-in/out).

---

## Technology Stack

### Core
- React, Vite, TypeScript (Strict Mode).

### UI & Styling
- Tailwind CSS, shadcn/ui, Lucide React, clsx.

### Data Fetching & State Management
- TanStack Query (Single source of truth for remote server state).
- Axios (HTTP client configured with interceptors).
- React Hook Form & Zod (Form management and validation schemas).
- React Context (Authentication session and operational context).

### Routing & Feedback
- React Router (Route management).
- Sonner (Toast notifications).

### Testing & Mocking
- Vitest & React Testing Library (TDD).
- Mock Service Worker (MSW) (API isolation in tests).

---

## Project Structure & Component Location Rule

```text
src/
├── pages/
│   ├── _layouts/          # Route shells (app.tsx with Sidebar/Navbar; login.tsx)
│   ├── app/               # Authenticated operational pages (reservas, orcamentos, etc.)
│   ├── auth/              # Public authentication pages (login, recuperar-senha)
│   └── error-404.tsx      # Fallback 404 page
├── components/            # ALL reusable UI and domain components
│   ├── ui/                # Base primitives (shadcn/ui)
│   ├── forms/             # Form layouts (CrudFormLayout, CheckboxGrid, CheckboxGroupList)
│   ├── data-table/        # SearchResultsSuspense, data_table, pagination, search_bar
│   └── <domain>/          # Domain widgets (reservas/, orcamentos/, tarifarios/, etc.)
├── hooks/                 # Custom React hooks (usePaginacao, useLogin, domain hooks)
├── api/                   # HTTP client and endpoints
├── contexts/              # Global React contexts (AuthContext)
├── types/                 # Application contracts and types
└── mocks/                 # MSW handlers and mock service configuration
```

### Component Location Rule (RED FLAG)
- **NEVER** create a `components` directory inside `src/pages/**`.
- All reusable components, forms, modals, dialogs, sections, and domain widgets MUST be placed under `src/components/` (e.g. `src/components/reservas/`, `src/components/orcamentos/`).
- `src/pages/**` is strictly reserved for route entrypoints (`index.tsx`, `novo.tsx`, `[id]/editar.tsx`) and page tests.

---

## DataTable & List Page Standards

### DataTable Shared Primitives (`src/components/data-table/`)
All list pages must use the standardized data-table components rather than building one-off table markup:
- `data_table.tsx`: Sortable data table with configured columns.
- `data_table_pagination.tsx`: Pagination controls and items-per-page selector.
- `search_bar.tsx`: Standardized search input with debouncing/submit.
- `filter_panel.tsx`: Collapsible secondary filters panel.
- `result_count.tsx`: Current result count indicator.

### Table Action Column Standard
- **No "Ações" Title**: The table column reserved for row action buttons must NEVER display the title `"Ações"` in its header (use `header: ''`).
- **Right-Aligned & Centered**: Action buttons inside the cell must always be aligned to the right and vertically centered (e.g. `className="flex items-center justify-end gap-1"`).

### URL Query State (`usePaginacao`)
All list pages MUST manage pagination, search, and sorting via URL search params using `usePaginacao` (`src/hooks/usePaginacao.ts`):
- `?pagina=`: Current page number (1-indexed, default 1).
- `?limite=`: Items per page (default 50; options 50, 100, 250).
- `?busca=`: Search string.
- `?ordenar_por=`: Field name to sort by.
- `?direcao=`: Sort direction (`asc` or `desc`).
- Never use local `useState` for pagination parameters.

### Searchable List Suspense Standard
Every list page must wrap table results in `SearchResultsSuspense` (`src/components/data-table/search_results_suspense.tsx`):
- Page headers, action buttons, and search inputs remain outside the boundary.
- Result table child uses suspense-compatible TanStack Query queries.
- Param updates are wrapped in `useTransition` so the previous table remains visible while new data loads.
- Skeleton rows maintain exact column alignment and match the current `limite`.
- Accessibility: Includes `aria-busy` and `role="status"`.

---

## Form Standards (`CrudFormLayout`)

Every create and edit page MUST use `CrudFormLayout` (`src/components/forms/CrudFormLayout.tsx`):
- Centers the form in a responsive container with breakpoint-scaled max-width.
- Contains the back button and title header within the same aligned width.
- Owns the `<form>` element, rendering exactly **one** `Card` around form fields.
- Renders the action buttons row outside and below the card, right-aligned with fixed button widths.
- Never split form content into multiple side-by-side cards. Render multiple contextual sections as sibling blocks within the same card.
- Use `CheckboxGrid` for flat checkbox sets; use `CheckboxGroupList` for grouped checkboxes.
- Multi-line fields MUST use the `Textarea` primitive (`src/components/ui/textarea.tsx`), not `Input`.

---

## Dynamic Sidebar & Navigation

`Sidebar.tsx` renders navigation dynamically from `session.rotas` stored during login:
- Routes are grouped by `modulo` and sorted by `ordem`.
- Icons are resolved dynamically via `ICON_MAP` in `Sidebar.tsx` using the `icone` field from each route.
- Never hardcode navigation items directly into `Sidebar.tsx`.

---

## State Management & Server State

- **Server State vs Client State**: TanStack Query is the single source of truth for remote data. Never duplicate server data into local component state.
- **Local State**: Reserve `useState` strictly for ephemeral UI state (dialog visibility, drawer state, field focus).
- **Feedback**: Provide immediate feedback on asynchronous mutations using `Sonner` toasts (`toast.success`, `toast.error`).

---

## Testing (Mandatory TDD)

HotelMind follows strict Test-Driven Development (Red → Green → Refactor).

- **Scope**: Write `.spec.tsx` tests for pages (`src/pages/`), contexts (`src/contexts/`), and reusable components (`src/components/`).
- **MSW**: Mock external API calls via Mock Service Worker (`src/mocks/handlers/`).
- **Behavior-Driven**: Test observable user interactions and rendered output (`screen.getByRole`, `screen.getByText`). Do not test internal component state.
