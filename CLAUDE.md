# Hotel Management System

A hotel management system built as a monorepo with a microservices architecture.

## Package Manager

pnpm with workspaces. Workspace packages are declared in the root `package.json`.

## Monorepo Layout

All apps and services live under `packages/`. When creating a new app or service, place it as a new directory under `packages/`.

```
packages/
  api/    # HTTP server / backend API (gateway or primary service)
  web/    # Front-end web application
```

## Architecture

The system is designed around microservices. Each service is an independent package under `packages/` with its own responsibilities and deployment lifecycle. Services communicate over the network rather than sharing in-process code.

When adding a new service, create it as a new package under `packages/` and treat it as an autonomous unit.

## Tooling

- **Biome** — linting and formatting (config: `biome.json`)
  - 2-space indentation, 80-char line width
  - Single quotes, no semicolons (asNeeded)
