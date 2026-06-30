# Hotel WEB app

This is the frontend application for this monorepo, built with React, Vite, and TypeScript. This document is the authoritative guide for contributors and AI agents working in this package. It defines architectural decisions, coding standards, and interaction patterns that must be followed to ensure consistency, scalability, and long-term maintainability across the UI layer.

## Monorepo Context

**Read the root `CLAUDE.md` before doing anything else.**

This package is one service in a pnpm workspace monorepo. The root `CLAUDE.md` defines:

- Where to install dependencies (workspace root vs package-level)
- Tooling conventions (Biome, commit policy, workspace layout)
- Rules for shared utilities and cross-package code

Never install a dependency, create a shared abstraction, or move code between packages without first consulting the root `CLAUDE.md`.

## Purpose

This document defines the architecture, coding standards, quality guidelines, and development practices for the project.

Every implementation must follow these principles:

* Clarity over performance.
* Simplicity over abstraction.
* Consistency over personal preference.
* Long-term maintainability over development speed.

When making technical decisions, always prioritize code that is readable, predictable, and easy to maintain.

---

# Tech Stack

## Core

* React (Latest)
* Vite
* TypeScript (Strict Mode)

## UI

* Shadcn/UI
* Tailwind CSS
* Lucide React
* clsx

## Data & State Management

* TanStack Query
* Axios
* React Hook Form
* Zod
* React Context

## Routing

* React Router

## Utilities

* date-fns
* Sonner

## Testing

* Vitest
* React Testing Library

## Mocking

* Mock Service Worker (MSW)

---

# Project Structure

```text
src/
├── pages/
│   ├── _layouts/   ← route layout wrappers (Outlet-based)
│   │   ├── app.tsx     ← protected app shell (Sidebar + TopNavbar)
│   │   └── login.tsx   ← public auth wrapper (centered)
│   ├── app/        ← protected pages (require auth)
│   │   └── dashboard.tsx
│   ├── auth/       ← public pages
│   │   └── login.tsx
│   └── error-404.tsx
├── components/
├── hooks/
├── api/
├── types/
├── contexts/
├── config/
├── lib/
├── routes.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Responsibilities

### /pages

Responsible for application pages and layout wrappers.

- `_layouts/` — layout components registered as route elements; render `<Outlet />` for child pages. Each layout owns its shell (Sidebar, Navbar) and any mount-time side effects (e.g. session verification).
- `app/` — pages that require authentication; always nested inside `_layouts/app.tsx`.
- `auth/` — public pages (login, password reset); always nested inside `_layouts/login.tsx`.
- `error-*.tsx` — error pages at the root of `pages/`.

Pages should:

* Compose components.
* Orchestrate screen flows.
* Avoid complex business logic.

### /components

Responsible for reusable UI components.

Components must have a single responsibility.

### /hooks

Responsible for reusable logic.

Hooks should never render UI.

### /api

Responsible for external API communication.

All HTTP requests must go through this layer.

### /types

Global types and application contracts.

### /contexts

Shared state using React Context.

### /config

Global application configuration.

### /lib

Shared utilities, helpers, and abstractions.

---

# Components

Components should have only one responsibility.

When a component starts to:

* Fetch data.
* Handle business rules.
* Manage multiple states.
* Render complex interfaces.

It is a strong indicator that it should be split into smaller components.

## Rule

The parent component coordinates.

Child components execute specific responsibilities.

### Example

Bad:

```tsx
UserPage.tsx
```

Responsible for:

* Fetching users.
* Creating users.
* Updating users.
* Filtering users.
* Rendering tables.
* Rendering modals.

Good:

```tsx
UserPage
 ├── UserTable
 ├── UserFilters
 ├── UserModal
 └── useUsers
```

---

# Separation of Concerns

Fundamental rule:

> Components display data. Hooks execute logic. Services communicate with APIs.

## Components

Responsible for presentation.

## Hooks

Responsible for reusable behavior.

## Services

Responsible for external communication.

---

# TypeScript

The project must use TypeScript in strict mode.

## Rules

Avoid:

```ts
any
```

Prefer:

```ts
unknown
```

or explicit types.

Always define clear contracts for:

* APIs
* Forms
* Contexts
* Components

---

# State Management

Before creating global state, ask:

> Does this data really need to be shared?

## Preferred Order

### 1. Local State

```tsx
useState
```

### 2. Props

When possible.

### 3. Context API

When multiple components require the same state.

### 4. Global State

Only when truly necessary.

Examples:

* User session
* Theme
* Global preferences

Not everything belongs in a global store.

---

# Server State vs Client State

A fundamental rule:

> Server State is not Client State.

Data fetched from APIs should remain managed by TanStack Query whenever possible.

Avoid duplicating server data into local state without a clear reason.

Bad:

```tsx
const { data: users } = useQuery(...)
const [localUsers, setLocalUsers] = useState(users)
```

This creates unnecessary synchronization problems.

Prefer:

```tsx
const { data: users } = useQuery(...)
```

Use local state only for UI-specific concerns such as:

* Modal visibility
* Selected items
* Filters
* Form inputs
* Temporary interactions

TanStack Query should remain the source of truth for remote data.

---

# Custom Hooks

Whenever logic begins to be reused in multiple places, it should be extracted into a custom hook.

## Characteristics of a Good Hook

* Single responsibility.
* Clear naming.
* Simple API.
* Low coupling.

Examples:

```tsx
useUsers()
useAuth()
usePagination()
```

Avoid overly generic hooks.

Bad:

```tsx
useApp()
```

Good:

```tsx
useUsers()
useProducts()
useAuth()
```

---

# Data Fetching

Use TanStack Query for:

* Caching
* Retries
* Cache invalidation
* Loading states
* Data synchronization

## Rules

Avoid using:

```tsx
useEffect + useState
```

for remote data fetching when TanStack Query already solves the problem.

Prefer:

```tsx
useQuery()
useMutation()
```

---

# Forms

Mandatory tools:

* React Hook Form
* Zod

## Validation

All validation should be centralized through schemas.

Example:

```ts
const schema = z.object({
  name: z.string().min(3),
})
```

Avoid spreading validation logic throughout components.

---

# Performance

Do not optimize prematurely.

Avoid excessive use of:

* useMemo
* useCallback
* memo

These tools exist to solve specific performance problems.

They should not be used by default.

## Rule

Measure first.

Optimize later.

---

# Naming

Names should clearly express intent.

Bad:

```ts
const d = []
const x = true
```

Good:

```ts
const users = []
const isAuthenticated = true
```

If a name requires a comment to be understood, it is probably wrong.

---

# Error Handling

Every asynchronous operation must handle:

* Loading
* Success
* Error

Avoid:

```tsx
const users = await getUsers()
```

without failure handling.

Prefer:

```tsx
if (isLoading) {
  return <Loading />
}

if (error) {
  return <ErrorMessage />
}
```

Users should never be left without feedback.

---

# User Feedback

Always communicate important actions.

Use Sonner for:

* Success messages
* Error messages
* Warnings
* Confirmations

Example:

```ts
toast.success("User created successfully")
toast.error("Failed to create user")
```

---

# Testing

This is a TDD (Test-Driven Development) application. **Tests are written before the implementation, without exception.**

## Workflow — Red → Green → Refactor

1. **Red** — write a failing test that describes the expected behavior
2. **Green** — write the minimum implementation to make the test pass
3. **Refactor** — clean up the code without breaking the test

Never write a component, hook, or service before its test exists.

## Recommended Tools

* Vitest
* React Testing Library
* Mock Service Worker (MSW) — for isolating API calls in tests

## Guidelines

Prioritize behavior testing. Do not test implementation details.

Avoid:

```ts
expect(component.state.count).toBe(1)
```

Prefer:

```ts
expect(screen.getByText("User created")).toBeInTheDocument()
```

Test files must be co-located with the source file and use the `.spec.tsx` (or `.spec.ts`) suffix.

---

# Accessibility

Accessibility is part of the definition of done.

Every component must be usable via keyboard.

## Always

* Use semantic HTML.
* Associate labels with inputs.
* Ensure visible focus states.
* Use ARIA attributes when necessary.

Accessibility should never be treated as a future enhancement.

---

# Security

Never trust data coming from the frontend.

Even when validation exists in React:

* Validate again on the backend.
* Sanitize user-generated content.
* Never store secrets in the frontend.
* Never expose credentials, private keys, or sensitive tokens.

---

# Mocking & Offline Development

The application must be able to operate independently of the backend during development.

Benefits include:

* Parallel frontend and backend development.
* Independent UI testing.
* Easier demonstrations.
* Complex scenario simulation.
* Better developer experience.

## Official Tool

Use Mock Service Worker (MSW).

### Benefits

* Intercepts HTTP requests.
* Simulates real network behavior.
* Requires no component modifications.
* Easy to enable or disable.
* Integrates well with React, Vitest, and Storybook.

## Required Scenarios

Whenever possible, provide mocks for:

### Success

```json
{
  "id": 1,
  "name": "John Doe"
}
```

### Error

```json
{
  "message": "Internal Server Error"
}
```

### Empty State

```json
[]
```

### Loading State

Simulate network latency to validate loading experiences.

## Suggested Structure

```text
src/
├── mocks/
│   ├── handlers/
│   ├── browser.ts
│   └── server.ts
```

## Rule

The UI should never depend on backend availability to be developed.

---

# Code Quality

Every commit must pass:

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run typecheck
```

## Tests

```bash
npm run test
```

No code should be merged without passing the basic quality checks.

---

# Import Conventions

Prefer absolute imports configured through aliases.

Good:

```ts
import { Button } from "@/components/ui/button"
```

Avoid:

```ts
import { Button } from "../../../components/ui/button"
```

---

# File Naming Conventions

Components:

```text
UserCard.tsx
UserTable.tsx
```

Hooks:

```text
useUsers.ts
useAuth.ts
```

Services:

```text
users.service.ts
auth.service.ts
```

Schemas:

```text
user.schema.ts
auth.schema.ts
```

---

# Most Important Rule

Whenever you write code, ask yourself:

> Can a developer who has never seen this project understand what I built in less than five minutes?

If the answer is no, simplify it.

Simple code almost always beats clever code.

---

## DataTable Components

Reusable data-table components live in `src/components/data-table/`:

| File | Purpose |
|---|---|
| `data_table.tsx` | Generic sortable table with configurable columns |
| `data_table_pagination.tsx` | First/prev/next/last controls + items-per-page selector |
| `search_bar.tsx` | Search input + submit button |
| `filter_panel.tsx` | Collapsible filter area (hidden by default) |
| `result_count.tsx` | Displays total result count |

Use these components on every list page. Never build one-off table UIs.

---

## Pagination Query Params (`usePaginacao`)

The hook `usePaginacao` (in `src/hooks/usePaginacao.ts`) manages URL query params for all list pages:

- `?pagina=` — current page (default 1)
- `?limite=` — items per page (default 50; options 50/100/250)
- `?busca=` — search text
- `?ordenar_por=` — sort field
- `?direcao=` — sort direction (`asc`/`desc`)

All list pages MUST use `usePaginacao` to read/write these params. Never use local state for pagination.

---

## Dynamic Sidebar

`Sidebar.tsx` renders navigation from `session.rotas` (set at login). It must never use a hardcoded `navigation` array.

- Routes are grouped by `modulo`, sorted by `ordem`
- Icons are resolved from the `ICON_MAP` in `Sidebar.tsx` using the `icone` field from the route
- To add a new icon, add it to `ICON_MAP` — do not add hardcoded nav entries

When a user logs in, `useLogin` stores `rotas` in the session via `AuthContext.setSession`. The sidebar derives navigation from `session.rotas ?? []`.
