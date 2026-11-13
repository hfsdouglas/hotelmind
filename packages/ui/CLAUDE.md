# @hotelmind/ui

HotelMind design system: UI primitives, shared design tokens and Tailwind
preset, documented in Storybook. Consumed by `web` and `admin`
(`"@hotelmind/ui": "workspace:*"`). Shared front-end rules:
`.claude/rules/front-end.md`.

## Structure

```text
src/
├── components/<name>/   # Primitives: <name>.tsx + <name>.stories.tsx (snake_case)
├── patterns/<name>/     # Compositions of primitives: .tsx + .stories.tsx + .spec.tsx
├── lib/                 # cn.ts (clsx + tailwind-merge), date_mask.ts (+ specs)
├── styles/              # tokens.css (light/dark) + globals.css (Storybook)
├── tests/               # setup.ts, a11y.spec.tsx (axe over every story)
└── index.ts             # public API: every export is listed explicitly
tailwind.preset.ts       # shared preset (colors, radius, dark mode)
.storybook/              # Storybook config, theme toggle (light/dark)
```

## Rules

- **Only generic primitives.** No business rules, no API calls, no app
  contexts (auth, routes, hotel data), no imports from `web`/`admin`.
- **Import inside the package with relative paths** (`../button/button`,
  `../../lib/cn`), never through `@hotelmind/ui` itself.
- **Every component and pattern ships a story** (`<name>.stories.tsx`) and is exported
  from `src/index.ts`. The axe spec runs over every story, so a story that
  breaks accessibility fails `pnpm test`.
- **Patterns** (`src/patterns/`) are compositions with their own behavior
  (selection, collapse, pluralization...). They keep a `.spec.tsx` next to the
  component, and the same dependency rule applies: no router, query, API,
  auth or app contexts. Anything that needs them stays in the app, bound by a
  thin wrapper (e.g. `paged_data_table` over `DataTable`, `CrudFormLayout`
  with `backTo` over the ui layout's `renderBackLink`).
- **No unit tests per primitive** (shadcn/ui vendor code). Test only what is
  written here: `cn`, `date_mask`, the preset/tokens and the a11y spec.
- **Domain text stays out.** A primitive exposes props (labels, render slots)
  and the app wraps it with its own wording (e.g. web's
  `WristbandColorPicker` over `ColorPicker`).
- **Colors are hexadecimal** (`#RRGGBB` / `#RRGGBBAA`) everywhere: tokens,
  Tailwind and components, never `oklch()`/`hsl()`/`rgb()` (enforced by
  `tokens.spec.ts`).
- **Tokens:** shared tokens live in `src/styles/tokens.css`; the preset
  (`@hotelmind/ui/tailwind.preset`) may only reference variables defined there
  in light and dark (enforced by `tokens.spec.ts`). Domain tokens stay in the
  app that owns them.
- **App wiring:** an app's `tailwind.config.ts` uses `presets: [preset]` and
  includes `../ui/src/**/*.{ts,tsx}` in `content`, otherwise component
  classes are purged from its build.
- **Runtime deps** are declared in this package (`pnpm --filter @hotelmind/ui
  add <dep>`), versions aligned with `web` and `admin`.

## Commands

```bash
pnpm --filter @hotelmind/ui storybook        # dev, port 6006
pnpm --filter @hotelmind/ui build-storybook
pnpm --filter @hotelmind/ui test             # cn, tokens/preset, axe over stories
pnpm --filter @hotelmind/ui typecheck
```
