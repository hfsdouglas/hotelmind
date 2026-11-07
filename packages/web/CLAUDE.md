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

## UI Components & Design System (shadcn MCP)

- Use the available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles.
- Ensure all generated UI components follow the established HotelMind design patterns and reside strictly under `src/components/`, never in `src/pages/**`.

---

## Design System & Theme Tokens (Roomio Theme)

The application utilizes an OKLCH perceptual color space design system compatible with Tailwind CSS and shadcn/ui (new-york style with Radix UI primitives).

### Theme Configuration & Lifecycle
- **Global CSS Configuration**: `src/index.css`.
- **Color Space**: OKLCH (perceptually uniform across light and dark modes).
- **Dark Mode Strategy**: Class-based via `.dark` on `document.documentElement`.
- **Base Border Radius**: `--radius: 0.5rem` (8px), with `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), and `--radius-xl` (12px).
- **Context & Persistence**: `src/contexts/ThemeContext.tsx` with hook `src/hooks/useTheme.ts`, persisted in `localStorage` under key `'theme'` (defaults to system preference or `'light'`).
- **Toaster Integration**: `App.tsx` synchronizes Sonner's `theme` prop (`theme={theme}`) with the active theme.

### Core Semantic Tokens

| Semantic Token | CSS Variable | Light Mode (`:root`) | Dark Mode (`.dark`) | Description & Application |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--background` | `oklch(0.96 0.003 250)` | `oklch(0.18 0.03 250)` | General application background |
| **Foreground** | `--foreground` | `oklch(0.15 0.01 250)` | `oklch(0.95 0.01 240)` | Primary body text |
| **Card** | `--card` | `oklch(0.99 0.001 250)` | `oklch(0.22 0.04 250)` | Elevated surfaces for cards and containers |
| **Card Foreground** | `--card-foreground` | `oklch(0.15 0.01 250)` | `oklch(0.95 0.01 240)` | Text inside cards |
| **Popover** | `--popover` | `oklch(0.99 0.001 250)` | `oklch(0.22 0.04 250)` | Modals, tooltips, and floating menus |
| **Popover Foreground** | `--popover-foreground` | `oklch(0.15 0.01 250)` | `oklch(0.95 0.01 240)` | Text inside popovers |
| **Primary** | `--primary` | `oklch(0.4 0.16 255)` | `oklch(0.56 0.17 255)` | Royal Blue - Primary buttons, headers, selections |
| **Primary Foreground** | `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Contrast text on primary surfaces (White) |
| **Secondary** | `--secondary` | `oklch(0.91 0.025 250)` | `oklch(0.28 0.05 250)` | Cool Slate-Blue - Secondary actions, badges, subtle containers |
| **Secondary Foreground** | `--secondary-foreground` | `oklch(0.25 0.06 255)` | `oklch(0.93 0.015 250)` | Contrast text on secondary surfaces |
| **Tertiary** | `--tertiary` | `oklch(0.55 0.12 180)` | `oklch(0.6 0.16 180)` | Complementary Turquoise |
| **Tertiary Foreground** | `--tertiary-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Text on tertiary surfaces |
| **Muted** | `--muted` | `oklch(0.935 0.008 250)` | `oklch(0.25 0.04 250)` | Subtle neutral background (e.g. table headers, skeletons) |
| **Muted Foreground** | `--muted-foreground` | `oklch(0.48 0.025 250)` | `oklch(0.7 0.02 240)` | Captions, helpers, and secondary text |
| **Accent** | `--accent` | `oklch(0.93 0.02 255)` | `oklch(0.28 0.06 255)` | Interactive highlights and hover states |
| **Accent Foreground** | `--accent-foreground` | `oklch(0.22 0.06 255)` | `oklch(0.93 0.02 255)` | Contrast text on accent surfaces |
| **Destructive** | `--destructive` | `oklch(0.55 0.22 25)` | `oklch(0.58 0.2 25)` | Destructive actions, alerts, and errors |
| **Destructive Foreground** | `--destructive-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Text on destructive surfaces |
| **Success** | `--success` | `oklch(0.52 0.16 148)` | `oklch(0.65 0.17 148)` | Positive status badges and confirmations |
| **Warning** | `--warning` | `oklch(0.68 0.16 65)` | `oklch(0.72 0.15 68)` | Attention callouts and operational warnings |
| **Info** | `--info` | `oklch(0.55 0.15 235)` | `oklch(0.64 0.15 235)` | Informational indicators |
| **Border** | `--border` | `oklch(0.88 0.01 250)` | `oklch(0.32 0.06 250)` | Structural borders and dividers |
| **Input** | `--input` | `oklch(0.88 0.01 250)` | `oklch(0.35 0.07 250)` | Form input borders and background |
| **Ring** | `--ring` | `oklch(0.4 0.16 255)` | `oklch(0.56 0.17 255)` | Accessible focus rings (`focus-visible`) |

### Extended Primary Scale (Navbar, Sidebar & Depth)

| Token Semântico | Variável CSS | Modo Claro (`:root`) | Modo Escuro (`.dark`) | Utilização Típica |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Deep** | `--primary-deep` | `oklch(0.32 0.14 255)` | `oklch(0.28 0.1 255)` | Fundo principal da Sidebar |
| **Primary Deeper** | `--primary-deeper` | `oklch(0.25 0.12 255)` | `oklch(0.22 0.08 255)` | Card do Perfil e itens de menu ativos |
| **Primary Darkest** | `--primary-darkest` | `oklch(0.18 0.1 255)` | `oklch(0.18 0.06 255)` | Submenus da Sidebar e hovers internos |
| **Primary Shadow** | `--primary-shadow` | `oklch(0.12 0.08 255)` | `oklch(0.15 0.05 255)` | Sombreamentos ou separadores escuros |
| **Primary Void** | `--primary-void` | `oklch(0.08 0.06 255)` | `oklch(0.12 0.04 255)` | Base mais escura de profundidade |

### Analytics & Chart Tokens (`--chart-*`)

| Gráfico | Variável CSS | Modo Claro (`:root`) | Modo Escuro (`.dark`) | Identificação Visual |
| :--- | :--- | :--- | :--- | :--- |
| **Chart 1** | `--chart-1` | `oklch(0.4 0.16 255)` | `oklch(0.55 0.18 255)` | Azul Royal (cor principal da marca) |
| **Chart 2** | `--chart-2` | `oklch(0.65 0.15 80)` | `oklch(0.7 0.16 80)` | Dourado vibrante |
| **Chart 3** | `--chart-3` | `oklch(0.55 0.12 180)` | `oklch(0.6 0.16 180)` | Turquesa / Ciano |
| **Chart 4** | `--chart-4` | `oklch(0.6 0.1 280)` | `oklch(0.65 0.14 280)` | Roxo suave / luminoso |
| **Chart 5** | `--chart-5` | `oklch(0.5 0.08 150)` | `oklch(0.58 0.13 150)` | Verde azulado |

### Room Status Semantic Tokens (`--status-*`)

Used in hospitality schedules, calendar status pills, and room state badges:

| Status | Variável CSS | Modo Claro (`:root`) | Modo Escuro (`.dark`) | Significado |
| :--- | :--- | :--- | :--- | :--- |
| **Disponível** | `--status-available` | `oklch(0.65 0.18 145)` | `oklch(0.7 0.18 145)` | Quarto vago / disponível para reserva |
| **Bloqueado** | `--status-blocked` | `oklch(0.55 0.22 25)` | `oklch(0.6 0.2 25)` | Quarto bloqueado administrativamente |
| **Manutenção** | `--status-maintenance` | `oklch(0.65 0.18 55)` | `oklch(0.7 0.18 55)` | Quarto sob intervenção de manutenção |
| **Limpeza** | `--status-cleaning` | `oklch(0.6 0.15 230)` | `oklch(0.65 0.15 230)` | Governança / Quarto em higienização |
| **Ocupado** | `--status-occupied` | `oklch(0.55 0.18 300)` | `oklch(0.65 0.18 300)` | Quarto com hóspede / hospedagem ativa |

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
