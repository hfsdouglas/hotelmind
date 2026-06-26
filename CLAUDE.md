# HotelMind

Hotel management system built as a monorepo.

## Package Manager

pnpm with workspaces. Workspace packages are declared in the root `package.json`.

## Monorepo Layout

All apps and services live under `packages/`. When creating a new app or service, place it as a new directory under `packages/`.

```
packages/
  api/    # HTTP server / backend API
  web/    # Front-end web application
```

## Tooling

- **Biome** — linting and formatting (config: `biome.json`)
  - 2-space indentation, 80-char line width
  - Single quotes, no semicolons (asNeeded)
