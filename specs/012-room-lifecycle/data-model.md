# Data Model — Room Lifecycle

## CategoriaQuarto

Existing aggregate root, scoped by `hotel_id`.

| Field | Type | Rule |
|---|---|---|
| `id` | UUID | immutable identifier |
| `hotel_id` | UUID | tenant scope |
| `nome` | varchar(100) | unique per hotel |
| `status` | `S`/`N` | active/inactive; default `S` |
| timestamps | datetime | managed by Prisma |

Category updates may change `nome` and `status`. There is no delete operation. Name conflicts remain rejected per hotel.

## Quarto

Existing aggregate root, scoped by `hotel_id`.

| Field | Type | Rule |
|---|---|---|
| `id` | UUID | immutable identifier |
| `hotel_id` | UUID | tenant scope |
| `categoria_id` | UUID | required category relation |
| `identificacao` | varchar(30) | required text matching `^\\d+$`, unique per hotel |
| `descricao` | text nullable | optional room description |
| `limite_hospedes` | positive integer | maximum guests |
| `status` | `S`/`N` | active/inactive; default `S` |
| timestamps | datetime | managed by Prisma |

Room updates may change category, identification, description, guest limit, bed configuration and status. The category must be active when creating or changing a room category. A room that is inactivated remains queryable when the inactive filter is selected.

Room list search is partial and case-insensitive across `identificacao`, `categoria.nome` and `camas.tipo`. Pagination is applied after the combined tenant, status, category and search predicates.

## Room list query state

| Field | Type | Rule |
|---|---|---|
| `pagina` | positive integer | 1-based; changing filters or `limite` resets it to 1 |
| `limite` | enum integer | exactly 25, 50, 100 or 250; default and minimum are 25 |
| `busca` | text | optional; partial case-insensitive match across identification, category or bed type |
| `categoria_id` | UUID | optional category filter |
| `status` | `S`/`N` | optional status filter; omitted means all statuses |

The room search input is at least 360px wide on desktop and fluid on narrow viewports. The “Mais filtros” control is an overlay; outside-pointer and Escape interactions close it without inserting a card into the page flow.

The room-list search action is a labeled control: it displays `Pesquisar` together with the search icon and exposes the same meaning through its accessible name.

## ConfiguracaoCama

Child collection of `Quarto`.

| Field | Type | Rule |
|---|---|---|
| `tipo` | enum string | one of the shared `TIPOS_CAMA` values |
| `quantidade` | positive integer | one row per type within a room |

Updating a room replaces its submitted bed configuration in one transaction. Physical deletion is not exposed for either aggregate; cascading child replacement is an internal persistence operation of the room update.

## State transitions

```text
active (S) <----> inactive (N)
```

The transition is reversible through the normal update flow. No transition performs a physical delete.

## Seed integrity

Each seeded room stores the ID returned from its corresponding `CategoriaQuarto` creation. The expected relation counts are 16 rooms in Suítes Luxo, 16 in Suítes Super Luxo, 5 in Suítes Master and 1 in Suíte Presidencial.
