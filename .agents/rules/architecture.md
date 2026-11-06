# Architecture & Boundary Rules

## Monorepo Layout

- Monorepo managed with pnpm workspaces.
- All applications and services live under `packages/`.
  - `packages/api`: Backend Fastify HTTP server.
  - `packages/web`: Frontend hotel operations web app.
  - `packages/admin`: Frontend platform administration panel.
  - `packages/.contracts`: Shared TypeScript types and interfaces.
- **Contract Isolation**: `packages/.contracts` contains ONLY shared TypeScript types and interfaces. No runtime code, no Zod schemas.

## Backend Architecture (`packages/api`)

- **Clean Architecture & Domain Isolation**: Dependencies strictly point inward (`entities` -> `repositories` / `services` contracts -> `usecases` -> `routes`).
- **Framework Independence**: Domain entities and use cases must never import Fastify, Prisma, pg, or HTTP libraries.
- **Thin Routes**: Route handlers only parse/validate HTTP requests via Zod and invoke use cases. Zero business logic or direct database calls in routes.
- **Route Composition Root**: Each route plugin is its own composition root, instantiating the necessary use cases and repository implementations at the top of the route file.

## Frontend Architecture (`packages/web` & `packages/admin`)

- **Component Location Rule (RED FLAG)**: **NEVER** create a `components` directory inside `src/pages/**`.
  - All reusable components, forms, modals, dialogs, sections, and domain widgets MUST reside under `src/components/<domain>/`.
  - `src/pages/**` is strictly reserved for route entrypoints (`index.tsx`, `novo.tsx`, `[id]/editar.tsx`) and page tests.
- **UI Components & Design System (shadcn MCP)**: Use available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles. Ensure all generated UI components follow established HotelMind design patterns and reside strictly under `src/components/`, never in `src/pages/**`.
- **Separation of Concerns**: Components display data. Hooks encapsulate logic and state. Services/api clients handle external HTTP communication.
- **Server State vs Client State**: TanStack Query is the single source of truth for remote server data. Never mirror query results into local `useState` unless editing a detached local copy.
