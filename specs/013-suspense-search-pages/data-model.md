# Data Model: Suspense em Páginas de Pesquisa

This feature introduces no persisted entities or API payload changes. The model below describes the UI state and component contract used by each frontend application.

## Search Results Boundary

Represents the results-only region of a searchable or filterable list.

| Field | Type | Required | Description |
|---|---|---:|---|
| `label` | string | yes | Accessible name for the results region, localized to the page. |
| `columnCount` | number | yes | Number of visible table columns, including action columns where applicable. |
| `rowCount` | number | no | Number of skeleton rows; defaults to a small stable count. |
| `isPending` | boolean | no | Whether a transition is refreshing an already revealed result set. |
| `children` | React node | yes | Result content that may suspend while its query resolves. |

### States

- **Initial loading**: the result child suspends and the boundary renders the table-shaped skeleton.
- **Refreshing**: prior results remain visible, the results region is marked busy, and a non-blocking loading status is announced.
- **Ready**: the resolved result content is visible and the busy state/status is cleared.
- **Empty**: the table's existing empty message is visible; no skeleton remains.
- **Error**: the existing page error treatment is visible; no skeleton remains and the page is not blocked.

## Search Transition

Represents a URL/query-key change caused by search, filter, sorting, or pagination.

| Field | Type | Description |
|---|---|---|
| `previousResult` | result payload | The last successfully resolved payload kept visible during a transition. |
| `nextQueryKey` | query key | The key derived from the latest URL/search controls. |
| `isPending` | boolean | Whether React is currently transitioning to the next result. |
| `statusMessage` | string | Accessible live message for loading or completion. |

### Transition rules

1. Every new interaction supersedes any older pending interaction.
2. The latest URL parameters determine the next query key and final visible result.
3. The transition must not clear controls or move focus.
4. Completion clears `isPending` and the live status, regardless of success, empty result, or handled error.

## Page Inventory

The UI state applies to these existing routes:

- `admin`: `/hoteis`, `/rotas`, `/administradores`, `/suporte`.
- `web`: `/grupos`, `/usuarios`, `/categorias_quartos`, `/quartos`.
