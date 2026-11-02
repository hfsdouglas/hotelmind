# Research: Suspense em Páginas de Pesquisa

**Feature**: [spec.md](./spec.md)
**Date**: 2026-11-02

## Decision 1: Use React Suspense at the results boundary

- **Decision**: Add a results-only boundary built with React `Suspense` in each application. The page shell keeps the title, search controls, filters, pagination controls, and result context outside the boundary.
- **Rationale**: React 19 is already the project runtime, the user explicitly requires React suspense tools, and a results-only boundary matches the clarified UX without blocking the page.
- **Alternatives considered**:
  - Keep only the existing `isLoading` branch in `DataTable`: rejected because it does not establish a React Suspense boundary or a project-wide standard.
  - Wrap the whole route in `Suspense`: rejected because it would hide or block controls during result refreshes.

## Decision 2: Use TanStack Query suspense queries for result content

- **Decision**: Move each page's result query into a result-content child rendered inside the boundary and use TanStack Query's suspense-compatible query API. Query-key changes are initiated in a React transition so already revealed results remain visible while the next result is pending.
- **Rationale**: This combines a real React suspension point with the clarified requirement to preserve prior results during navigation/search transitions. The query remains owned by the page and its API service, preserving the existing data flow.
- **Alternatives considered**:
  - Use ordinary queries with `placeholderData`/`keepPreviousData` and only inspect `isFetching`: rejected as the sole mechanism because the requirement explicitly calls for a suspense component and it would make the boundary inert for result loading.
  - Suspend the entire page on every query-key change: rejected because controls must remain usable.

## Decision 3: Keep app implementations separate but behaviorally equivalent

- **Decision**: Implement equivalent suspense, skeleton, and accessibility components under `packages/admin/src/components` and `packages/web/src/components`, with a matching documented contract rather than introducing a new shared UI package.
- **Rationale**: The clarification selected independent implementations, and the repository currently treats `admin` and `web` as independent frontend packages. This avoids cross-package runtime coupling while keeping behavior testable in each app.
- **Alternatives considered**:
  - Add shared runtime UI code to `packages/.contracts`: rejected because that package is type-only by constitution.
  - Create a new shared UI package: rejected as unnecessary scope for two small equivalent components and contrary to the clarified decision.

## Decision 4: Standardize skeleton and live status behavior

- **Decision**: Provide a table-shaped skeleton that accepts the visible column count and renders stable placeholder rows. During a refresh, expose `aria-busy` on the results region and a non-blocking live status announcing loading and completion without moving focus.
- **Rationale**: The existing result surfaces are tables, skeletons preserve layout, and the clarified accessibility decision requires status communication without focus movement.
- **Alternatives considered**:
  - Use a centered spinner only: rejected because it does not preserve table structure.
  - Move focus to the loading indicator: rejected because it disrupts keyboard navigation.

## Repository findings

- Both frontend packages use React 19, TypeScript strict mode, Vite, TanStack Query 5, React Router, Tailwind CSS, Vitest, and React Testing Library.
- All eight in-scope pages already use a `DataTable` with an `isLoading` branch, but neither application has a Suspense boundary or a reusable skeleton component.
- The two `DataTable` components have different public props (`rows`/`label` in `admin`, `data`/`header` in `web`), so the plan keeps application-local implementations and adapts each page without changing its existing table contract.
- No data model, API endpoint, shared contract, or database migration is needed; this is a frontend loading-state and project-standard change.
