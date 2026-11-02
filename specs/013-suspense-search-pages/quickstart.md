# Quickstart: Validate Search Suspense

## Prerequisites

- Install workspace dependencies with `pnpm install` from the repository root.
- Ensure the API/mock handlers required by the target page are available.

## Static validation

Run both frontend typechecks and builds:

```bash
pnpm --filter admin typecheck
pnpm --filter web typecheck
pnpm --filter admin build
pnpm --filter web build
```

Expected result: both applications compile without TypeScript or Vite errors.

## Focused tests

Run the existing frontend test suites:

```bash
pnpm --filter admin test -- --run
pnpm --filter web test
```

Add or update focused tests for the local suspense boundary, skeleton, live status, and each page's result transition before running the full suites.

## Manual acceptance matrix

For each route below:

1. Load the page and confirm the initial result region can show the table-shaped skeleton.
2. Submit a search or change a filter/sort/page parameter.
3. Confirm previous rows remain visible, the result region indicates busy state, and controls remain usable.
4. Confirm a skeleton-shaped refresh indication is present without moving focus.
5. Confirm assistive status announces loading and completion through a polite live status.
6. Confirm success, empty, and handled-error states clear the busy/skeleton state and reset the local error boundary on a new query.

## Automated boundary checks

The local boundary tests must cover:

- initial Suspense fallback with the configured column count;
- previous result/control availability while `is_pending` is true;
- `aria-busy`, `role="status"`, polite loading/completion text, and no focus movement;
- error fallback and recovery after `reset_key` changes.

| Application | Routes |
|---|---|
| `admin` | `/hoteis`, `/rotas`, `/administradores`, `/suporte` |
| `web` | `/grupos`, `/usuarios`, `/categorias_quartos`, `/quartos` |

## Regression checks

- Existing query parameters still control search, filtering, sorting, and pagination.
- Existing row actions and navigation still work.
- No login, dashboard, edit, create, or modal-only page is changed to use this pattern unless it becomes a searchable result page later.
