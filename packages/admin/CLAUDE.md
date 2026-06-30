# Hotel Admin App

This is the administrative frontend application for this monorepo, built with React, Vite, and TypeScript. This application is used exclusively by the platform owner and internal operators to manage all hotels within the ecosystem.

This document is the authoritative guide for contributors and AI agents working in this package. It defines architectural decisions, coding standards, and interaction patterns that must be followed to ensure consistency, scalability, and long-term maintainability across the administration layer.

## Monorepo Context

**Read the root `CLAUDE.md` before doing anything else.**

This package is one service in a pnpm workspace monorepo. The root `CLAUDE.md` defines:

* Where to install dependencies (workspace root vs package-level)
* Tooling conventions (Biome, commit policy, workspace layout)
* Rules for shared utilities and cross-package code

Never install a dependency, create a shared abstraction, or move code between packages without first consulting the root `CLAUDE.md`.

## Purpose

This application is the central administration panel for the HotelMind ecosystem.

Unlike the hotel-facing application, this system is used by the software owner and internal staff to oversee and manage the entire platform.

Typical responsibilities include:

* Managing hotels
* Managing subscriptions and plans
* Managing platform-wide configurations
* Managing users across hotels
* Monitoring platform usage
* Reviewing operational data
* Supporting customer operations
* Managing tenant lifecycle

This document defines the architecture, coding standards, quality guidelines, and development practices for the project.

Every implementation must follow these principles:

* Clarity over performance.
* Simplicity over abstraction.
* Consistency over personal preference.
* Long-term maintainability over development speed.

When making technical decisions, always prioritize code that is readable, predictable, and easy to maintain.

---

# Multi-Tenant Awareness

Although this application has platform-wide visibility, the system itself remains multi-tenant.

A hotel is always considered a tenant.

## Rule

Whenever data is displayed, queried, filtered, created, updated, or deleted, the tenant context must remain explicit.

The administration interface may access multiple hotels simultaneously, but tenant boundaries must never become implicit.

Examples:

Good:

```ts
hotelId
selectedHotelId
hotelFilter
```

Avoid:

```ts
id
tenant
current
```

without clear context.

## Administrative Scope

The administrator can operate in two modes:

### Platform Scope

Actions affecting the entire platform.

Examples:

* Subscription management
* Global settings
* Feature flags
* Platform metrics

### Hotel Scope

Actions affecting a specific hotel.

Examples:

* Viewing hotel users
* Reviewing hotel settings
* Managing hotel data
* Troubleshooting tenant issues

The current scope should always be visually explicit in the UI.

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
│   ├── _layouts/
│   │   ├── app.tsx
│   │   └── login.tsx
│   ├── app/
│   │   ├── dashboard.tsx
│   │   ├── hotels/
│   │   ├── subscriptions/
│   │   ├── users/
│   │   ├── settings/
│   │   └── reports/
│   ├── auth/
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

* `_layouts/` — layout components registered as route elements; render `<Outlet />` for child pages. Each layout owns its shell (Sidebar, Navbar) and any mount-time side effects (e.g. session verification).
* `app/` — protected administrative pages.
* `auth/` — authentication pages.
* `error-*.tsx` — error pages.

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

Good:

```tsx
HotelsPage
 ├── HotelFilters
 ├── HotelTable
 ├── HotelDetailsModal
 └── useHotels
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

Examples:

* Authenticated admin session
* Selected hotel context
* Feature permissions
* Global filters

### 4. Global State

Only when truly necessary.

---

# Server State vs Client State

A fundamental rule:

> Server State is not Client State.

Data fetched from APIs should remain managed by TanStack Query whenever possible.

Avoid duplicating server data into local state without a clear reason.

Prefer:

```tsx
const { data: hotels } = useQuery(...)
```

TanStack Query should remain the source of truth for remote data.

---

# Custom Hooks

Whenever logic begins to be reused in multiple places, it should be extracted into a custom hook.

Examples:

```tsx
useHotels()
useSubscriptions()
usePlatformMetrics()
useAdminAuth()
```

Avoid overly generic hooks.

---

# Data Fetching

Use TanStack Query for:

* Caching
* Retries
* Cache invalidation
* Loading states
* Data synchronization

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

Examples:

```ts
const createHotelSchema = z.object({
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

## Rule

Measure first.

Optimize later.

---

# Naming

Names should clearly express intent.

Good:

```ts
const hotels = []
const selectedHotelId = ""
const isPlatformAdmin = true
```

Bad:

```ts
const data = []
const current = ""
const admin = true
```

---

# Error Handling

Every asynchronous operation must handle:

* Loading
* Success
* Error

Users should never be left without feedback.

---

# User Feedback

Always communicate important actions.

Use Sonner for:

* Success messages
* Error messages
* Warnings
* Confirmations

Examples:

```ts
toast.success("Hotel created successfully")
toast.error("Failed to update subscription")
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

Test files must be co-located with the source file and use the `.spec.tsx` (or `.spec.ts`) suffix.

---

# Accessibility

Accessibility is part of the definition of done.

Every component must be usable via keyboard.

Always:

* Use semantic HTML.
* Associate labels with inputs.
* Ensure visible focus states.
* Use ARIA attributes when necessary.

---

# Security

Never trust data coming from the frontend.

Even when validation exists in React:

* Validate again on the backend.
* Sanitize user-generated content.
* Never store secrets in the frontend.
* Never expose credentials, private keys, or sensitive tokens.

## Administrative Access

This application exposes privileged operations.

Extra care must be taken when implementing:

* Hotel impersonation
* Subscription management
* Platform configuration
* Feature flag administration
* User management

Administrative actions must always be explicit and auditable.

---

# Mocking & Offline Development

The application must be able to operate independently of the backend during development.

## Official Tool

Use Mock Service Worker (MSW).

## Required Scenarios

Provide mocks whenever possible for:

### Success

### Error

### Empty State

### Loading State

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
import { HotelTable } from "@/components/hotels/hotel-table"
```

Avoid:

```ts
import { HotelTable } from "../../../components/hotels/hotel-table"
```

---

# File Naming Conventions

Components:

```text
HotelCard.tsx
HotelTable.tsx
SubscriptionTable.tsx
```

Hooks:

```text
useHotels.ts
useSubscriptions.ts
usePlatformMetrics.ts
```

Services:

```text
hotels.service.ts
subscriptions.service.ts
```

Schemas:

```text
hotel.schema.ts
subscription.schema.ts
```

---

# Most Important Rule

Whenever you write code, ask yourself:

> Can a developer who has never seen this project understand what I built in less than five minutes?

If the answer is no, simplify it.

Simple code almost always beats clever code.
