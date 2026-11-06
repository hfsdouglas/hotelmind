# Coding Standards & Conventions

## File & Identifier Naming

- **Backend (`packages/api`)**: Strict `snake_case` for all files, folders, route names, schemas, repositories, use cases, and services (`create_user_use_case.ts`, `user_repository.ts`, `users_routes.ts`).
- **Frontend (`packages/web` & `packages/admin`)**:
  - React components: `PascalCase.tsx` (`HotelCard.tsx`, `Sidebar.tsx`) or `kebab-case.tsx` for shared shadcn/ui primitives (`alert-dialog.tsx`, `button.tsx`).
  - Domain components: `snake_case.tsx` or `PascalCase.tsx` (`page_header.tsx`, `reservation_cell.tsx`).
  - Hooks: `camelCase.ts` prefixed with `use` (`usePaginacao.ts`, `useAuth.ts`).
  - Schemas and utilities: `snake_case.ts` (`create_hotel_schema.ts`).
- **Expressive Naming**: Identifiers must clearly express intent. Avoid single-letter variables (`d`, `x`) or vague names (`data`, `item`, `current`) without clear domain context.

## Tooling & Formatting

- **Biome** is the authoritative linter and formatter:
  - 2-space indentation.
  - 80-character line width.
  - Single quotes (`'`).
  - Semicolons as needed (`asNeeded` - no semicolons unless required for syntax disambiguation).

## TypeScript Standards

- Always write in TypeScript strict mode.
- Avoid `any`. Prefer `unknown` or specific domain types/unions.
- Shared contracts between packages must be imported from `@hotelmind/contracts` (in `packages/.contracts`), never duplicated locally.

## DataTable & Action Column Standards

- **No "Ações" Title**: The table column reserved for row action buttons must NEVER display the title `"Ações"` in its header (use `header: ''` or omit).
- **Right-Aligned & Centered**: Action buttons inside the cell must always be aligned to the right and vertically centered (`className="flex items-center justify-end gap-1"`).
