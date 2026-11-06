# Hotel Admin Panel

Administrative web application for the HotelMind platform, built with React, Vite, and TypeScript. Used by platform operators to manage hotels, subscriptions, global configurations, and multi-tenant operations.

---

## Technology Stack

### Core
- React, Vite, TypeScript (Strict Mode).

### UI & Styling
- Tailwind CSS, shadcn/ui, Lucide React, clsx.

### Data Fetching & State Management
- TanStack Query (Single source of truth for remote server state).
- Axios (HTTP client).
- React Hook Form & Zod (Form state and client-side schema validation).
- React Context (Session, active hotel scope, and global UI preferences).

### Routing & Feedback
- React Router (Route management).
- Sonner (Toast notifications).

### Testing & Mocking
- Vitest & React Testing Library (TDD).
- Mock Service Worker (MSW) (HTTP API mocking).

---

## Multi-Tenant Awareness & Administrative Scopes

Even though operators have platform-wide visibility, multi-tenancy remains strict:
- **Explicit Tenant Context**: Always make hotel context explicit in variables, query keys, and props (`hotelId`, `selectedHotelId`, `hotelFilter`). Avoid ambiguous identifiers (`id`, `current`).
- **Platform Scope**: Actions affecting the whole platform (subscriptions, global configurations, platform metrics).
- **Hotel Scope**: Actions scoped to a specific hotel (viewing hotel users, reviewing hotel settings, troubleshooting tenant data). Always indicate the active scope clearly in the UI.

---

## Project Structure & Component Location Rule

```text
src/
├── pages/
│   ├── _layouts/          # Route layout shells (Outlet-based: app.tsx, login.tsx)
│   ├── app/               # Protected administrative pages (dashboard, hoteis, usuarios)
│   ├── auth/              # Public authentication pages
│   └── error-404.tsx      # Fallback error page
├── components/            # ALL reusable UI and domain components
│   ├── ui/                # Base primitives (shadcn/ui)
│   ├── forms/             # Form layouts (CrudFormLayout, CheckboxGrid, CheckboxGroupList)
│   ├── data-table/        # SearchResultsSuspense, data tables, search bars
│   └── <domain>/          # Domain widgets (e.g. hoteis/, usuarios/, assinaturas/)
├── hooks/                 # Reusable custom hooks (TanStack Query, UI helpers)
├── api/                   # HTTP client endpoints
├── contexts/              # Global React contexts (AuthContext, AdminScopeContext)
├── types/                 # Application TypeScript contracts and view models
└── mocks/                 # MSW handlers and mock servers
```

### Component Location Rule (RED FLAG)
- **NEVER** create a `components` directory inside `src/pages/**`.
- All reusable components, forms, modals, dialogs, sections, and domain components MUST be placed under `src/components/` (e.g. `src/components/hoteis/`, `src/components/usuarios/`).
- `src/pages/**` is strictly reserved for route entrypoints (`index.tsx`, `novo.tsx`, `[id]/editar.tsx`) and page tests.

---

## UI Components & Design System (shadcn MCP)

- Use the available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles.
- Ensure all generated UI components follow the established HotelMind design patterns and reside strictly under `src/components/`, never in `src/pages/**`.

---

## Form Standard (`CrudFormLayout`)

Every create and edit page MUST use `CrudFormLayout` (`src/components/forms/CrudFormLayout.tsx`):
- Centers the form in a responsive container with breakpoint-scaled max-width.
- Contains the back button and title header within the same aligned width.
- Owns the `<form>` element, rendering exactly **one** `Card` around form fields.
- Renders the action buttons row outside and below the card, right-aligned with fixed button widths.
- Never split form content into multiple side-by-side cards. Multiple contextual sections are rendered as sibling blocks within the same card.
- Use `CheckboxGrid` for flat checkbox sets; use `CheckboxGroupList` for grouped checkboxes (e.g. routes grouped by module).

```tsx
<CrudFormLayout
  title="Novo Hotel"
  backTo="/hoteis"
  onSubmit={form.handleSubmit(onSubmit)}
  actions={
    <>
      <Button type="submit">Criar hotel</Button>
      <Button type="button" variant="outline" onClick={() => navigate('/hoteis')}>Cancelar</Button>
    </>
  }
>
  <Form {...form}>
    {/* Form field blocks */}
  </Form>
</CrudFormLayout>
```

---

## DataTable & List Page Standards

### Table Action Column Standard
- **No "Ações" Title**: The table column reserved for row action buttons must NEVER display the title `"Ações"` in its header (use an empty string or omit header title).
- **Right-Aligned & Centered**: Action buttons inside the cell must always be aligned to the right and vertically centered (e.g. `className="flex items-center justify-end gap-1"`).

---

## Searchable List Suspense Standard

Every page that searches or filters tabular results must wrap the list in `SearchResultsSuspense` (`src/components/data-table/search_results_suspense.tsx`):
- Title, search input, filter toggles, and action buttons remain outside the suspense boundary.
- Result table child uses suspense-compatible TanStack Query hooks.
- Search, filter, sorting, and pagination state changes must run inside a React transition (`useTransition`) so the previous table remains visible while new data resolves.
- The skeleton fallback matches the loaded table header, column count, and current `limite`.
- Includes `aria-busy` and `role="status"` announcements for accessibility.

---

## State Management & Server State

- **Server State vs Client State**: TanStack Query is the single source of truth for remote data. Never mirror query results into local `useState`.
- **Custom Hooks**: Extract data fetching and mutation logic into custom hooks (`useHotels`, `useSubscriptions`). Hooks encapsulate business workflows; components focus purely on presentation.
- **Feedback**: Provide immediate feedback on async actions using `Sonner` toasts (`toast.success`, `toast.error`).

---

## Testing (Mandatory TDD)

HotelMind follows strict Test-Driven Development (Red → Green → Refactor).

- **Scope**: Write `.spec.tsx` tests for pages (`src/pages/`), contexts (`src/contexts/`), and reusable components (`src/components/`).
- **MSW**: Mock external API calls via Mock Service Worker (`src/mocks/handlers/`).
- **Behavior-Driven**: Test observable user interactions and rendered output (`screen.getByRole`, `screen.getByText`). Do not test internal component state.
