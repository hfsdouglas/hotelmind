---
name: frontend-development
description: >-
  Use this skill when developing, refactoring, or testing frontend pages,
  components, layouts, forms, and TanStack Query hooks in packages/web or
  packages/admin.
---

# Frontend Development Procedure

Step-by-step workflow for developing user interface features in `packages/web` and `packages/admin`.

## Prerequisites & Rules

- **Component Location Rule (RED FLAG)**: **NEVER** create a `components` directory inside `src/pages/**`.
  - All reusable components, forms, modals, dialogs, sections, and domain widgets MUST reside under `src/components/<modulo>/`.
  - `src/pages/**` is strictly reserved for page route entrypoints (`index.tsx`, `novo.tsx`, `[id]/editar.tsx`) and page tests.
- **UI Components & Design System (shadcn MCP)**: Use available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles. Ensure all generated UI components follow established HotelMind design patterns and reside strictly under `src/components/`, never in `src/pages/**`.
- **Theme & Semantic Color Tokens (Roomio Theme)**:
  - Global CSS: `src/index.css`.
  - Color space: OKLCH with class-based dark mode (`.dark` on `document.documentElement`).
  - Base radius: `--radius: 0.5rem` (8px), with `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), and `--radius-xl` (12px).
  - Context & hook: `ThemeContext` (`src/contexts/ThemeContext.tsx`) and `useTheme` (`src/hooks/useTheme.ts`), persisted in `localStorage` under key `'theme'`. Sonner toaster is synced via `theme={theme}` in `App.tsx`.
  - Extended Primary Scale (depth/sidebar): `--primary-deep`, `--primary-deeper`, `--primary-darkest`, `--primary-shadow`, `--primary-void`.
  - Semantic Status Tokens:
    - `--destructive`: Ações destrutivas, erros e alertas.
    - `--success`: Badges de status positivo e confirmações operacionais.
    - `--warning`: Chamadas de atenção e avisos operacionais.
    - `--info`: Indicadores e resumos informativos.
  - Hospitality Room Status Tokens:
    - `--status-available`: Quarto vago / disponível para reserva.
    - `--status-blocked`: Quarto bloqueado administrativamente.
    - `--status-maintenance`: Quarto sob intervenção de manutenção.
    - `--status-cleaning`: Governança / Quarto em higienização.
    - `--status-occupied`: Quarto com hóspede / hospedagem ativa.
  - Secondary Palette: Cool Slate-Blue (`--secondary`) para ações secundárias, badges neutros e contêineres sutis.
  - Page Titles: Always set page title using `usePageTitle('Título')` (which automatically appends ` | HotelMind` or ` | HotelMind Admin`).
  - Never hardcode fixed hex or utility colors for thematic elements and status indicators.
- **Server State**: Always use TanStack Query for remote data fetching and mutations. Never duplicate query data into local state.
- **TDD**: Write tests before implementation (`.spec.tsx`).

## Step-by-Step Workflow

### 1. Types & Contracts
- Import shared types from `@hotelmind/contracts` (in `packages/.contracts`) where available.
- Place package-specific UI view models or filter interfaces in `src/types/`.

### 2. Component Design & Placement
- Determine the component category:
  - Primitives: `src/components/ui/` (shadcn/ui).
  - Shared layouts/forms: `src/components/forms/`, `src/components/data-table/`.
  - Domain components: `src/components/<domain>/` (e.g. `src/components/reservas/`, `src/components/hoteis/`).
- Use available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles.
- Follow separation of concerns: components display data; hooks manage state and mutations.

### 3. Forms & Layouts Standard
- For create/edit views, use `CrudFormLayout` (`src/components/forms/CrudFormLayout.tsx`):
  - Enforces centered responsive container width.
  - Keeps back-arrow and title header contained.
  - Owns `<form>` tag and renders exactly ONE `Card` around fields with actions outside.
  - Multi-step structured forms must use continuous numbered sections with icons (e.g. `Passo 1: ...`, `Passo 2: ...`) inside the single card.
- Use `CheckboxGrid` for flat checkbox sets or `CheckboxGroupList` for grouped checkboxes.
- Multi-line fields must use `Textarea` primitive (`src/components/ui/textarea.tsx`).
- For color selection, use simplified `ColorPicker` (`src/components/ui/color_picker.tsx`) with hex input and preset swatches.

### 4. Searchable Lists Standard
- For pages with search/filter/pagination, wrap table results in `SearchResultsSuspense`:
  - Keep page title, search bar, and action buttons outside the suspense boundary.
  - Skeleton rows match loaded column count and current `limite`.
  - Use `usePaginacao` to manage URL query params (`pagina`, `limite`, `busca`, `ordenar_por`, `direcao`).
  - Search and filter updates run in a React transition (`useTransition`).
  - Table action columns must omit the header title `"Ações"` (use `header: ''`) and action buttons must always be aligned to the right and vertically centered (`className="flex items-center justify-end gap-1"`).

### 5. Writing Tests (TDD)
- Create `.spec.tsx` co-located with the page or component.
- Use Vitest and React Testing Library.
- Mock network interactions using MSW handlers in `src/mocks/handlers/`.
- Test user interactions (clicking buttons, filling inputs, verifying feedback toasts via Sonner).

### 6. Verification & Quality Gate
- Run tests: `pnpm --filter <web|admin> test`.
- Run Biome check: `pnpm exec biome check packages/<web|admin>`.
