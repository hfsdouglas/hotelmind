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
- Follow separation of concerns: components display data; hooks manage state and mutations.

### 3. Forms & Layouts Standard
- For create/edit views, use `CrudFormLayout` (`src/components/forms/CrudFormLayout.tsx`):
  - Enforces centered responsive container width.
  - Keeps back-arrow and title header contained.
  - Owns `<form>` tag and renders exactly ONE `Card` around fields with actions outside.
- Use `CheckboxGrid` for flat checkbox sets or `CheckboxGroupList` for grouped checkboxes.
- Multi-line fields must use `Textarea` primitive (`src/components/ui/textarea.tsx`).

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
