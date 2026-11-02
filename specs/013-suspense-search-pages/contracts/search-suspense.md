# UI Contract: Search Suspense Pattern

This is a behavioral contract for the independent implementations in `admin` and `web`. It is not a runtime shared package and must not be placed in `packages/.contracts`.

## Boundary contract

Each searchable/filterable result page MUST expose a results-only React Suspense boundary with:

1. A table-shaped skeleton for initial suspension and a refresh indication that does not remove the previous result.
2. A stable accessible results-region name and a non-blocking live status for loading and completion.
3. `aria-busy` while the latest result transition is pending.
4. Controls outside the boundary and usable while results refresh.
5. Existing success, empty, and error content after the suspense state resolves.

## Table skeleton contract

The loading table MUST preserve the loaded table geometry:

1. The table header MUST remain visible and use the same column labels/order.
2. Every skeleton row MUST contain one skeleton cell for every loaded column, including action columns.
3. The table MUST use fixed layout or an equivalent width strategy so every skeleton row has the same column widths.
4. The number of skeleton rows MUST match the page's default/current `limite` (250 for the non-paginated room-category list).

## Query contract

Each page-specific result child MUST:

1. Derive its query key from the current search/filter/sort/pagination URL state.
2. Use the existing page API service and preserve the current response shape.
3. Render the existing table, count, pagination, and action behavior after resolution.
4. Ensure a stale request cannot replace the result for a newer query key.

## Error contract

The local boundary MUST catch a failed result request, clear `aria-busy`/refresh indication, and render the page's existing Portuguese error treatment without moving focus or blocking the search controls. Changing the query key MUST reset the local error boundary so a later request can resolve normally.

## Application parity

`packages/admin` and `packages/web` implement this contract separately because they are independent frontend packages. Their local component names and table prop adapters may differ, but the observable behavior and accessibility requirements must match.
