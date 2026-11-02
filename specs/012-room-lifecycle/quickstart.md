# Quickstart — Room Lifecycle

## Apply the database changes

From the repository root:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

The seed recreates the development hotel, the `Quartos` module routes, four suite categories and 38 rooms.

## Run services

```bash
pnpm --filter api dev
pnpm --filter web dev
```

## Manual acceptance flow

1. Open the categories page and confirm active categories are listed.
2. Edit a category name and confirm the list reflects the new value.
3. Inactivate a category; confirm it remains available under the inactive filter and no delete action is offered.
4. Open the rooms page, search by room number, category name and bed type, and use the overlaid “Mais filtros” dropdown to select all, active and inactive rooms.
5. Confirm the room search is at least 360px wide on desktop, adapts to narrow screens, and its button displays `Pesquisar` with the search icon. Change the room page limit through exactly 25, 50, 100 and 250, navigate between pages, and confirm search, category and status selections remain applied; selecting a new limit starts at page 1.
6. Open “Mais filtros”, click outside it and press Escape; confirm the overlay closes without adding an in-flow card or shifting the table.
7. Edit a room description, guest limit and bed configuration; confirm the values persist.
8. Inactivate and reactivate a room through the edit form.
9. Try a room identification containing letters or punctuation; both the web form and API must reject it.
10. On the categories page, change status using the direct select and confirm no “Mais filtros” panel is displayed.
11. Confirm the seed contains categories `Suítes Luxo`, `Suítes Super Luxo`, `Suítes Master` and `Suíte Presidencial`, with 38 numeric room identifications linked to the expected category.

## Automated validation

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter web build
```

The API tests must cover numeric identification, status transitions, tenant scoping, duplicate identification/name conflicts and the no-delete surface. Web tests must cover form validation, status filters and edit submission.
