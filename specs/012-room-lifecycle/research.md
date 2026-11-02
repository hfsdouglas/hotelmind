# Research — Room Lifecycle

## Decision 1: Update and inactivation use `PUT`, without `DELETE`

- **Decision**: expose `PUT /categorias_quartos/:id` and `PUT /quartos/:id`; the payload accepts the editable fields, including `status: S|N`.
- **Rationale**: the API already uses `PUT` for editable resources, and the domain rule is a reversible state transition rather than deletion.
- **Alternatives considered**: `PATCH` endpoints and dedicated `/inativar` actions. They would add a second HTTP convention or duplicate the update flow without improving the business model.

## Decision 2: Status is persisted as `S`/`N`

- **Decision**: keep the existing category representation and add the same `status CHAR(1)` field to rooms, defaulting to `S`.
- **Rationale**: it is already used by categories, groups, users and administrators, so filters and UI badges remain consistent.
- **Alternatives considered**: a boolean or a separate lifecycle enum. Both would create an unnecessary representation difference in this module.

## Decision 3: Identification is numeric text

- **Decision**: store `identificacao` as text and validate `^\\d+$` in the shared request contract, API Zod schema and web form Zod schema.
- **Rationale**: room identifiers are labels, not numbers; text preserves leading zeroes while the regex rejects letters, signs, spaces and decimals.
- **Alternatives considered**: integer storage, which would lose formatting, and UI-only validation, which would leave non-web clients unprotected.

## Decision 4: Description is optional room metadata

- **Decision**: add nullable `descricao` text to `Quarto`; create and update accept it, and list/detail responses return it.
- **Rationale**: the requested textarea is descriptive metadata and should not be required to create a room.

## Decision 5: Filter status according to page context

- **Decision**: add `status=all|S|N` to the room-page “Mais filtros” dropdown and use a direct status Select on the category page. Translate `all` to an omitted API parameter.
- **Rationale**: room filters need the existing additional-filter affordance without changing table layout, while categories need only one simple status filter.

## Decision 6: Room listing uses shared pagination and search conventions

- **Decision**: use the existing `usePaginacao`, `SearchBar`, `DataTablePagination` and `ResultCount` components. Send `pagina`, `limite`, `busca`, `categoria_id` and `status` together in the query.
- **Rationale**: this preserves URL state and behavior already used by groups and users, including page reset when a filter changes.
- **Search semantics**: a partial, case-insensitive search matches room identification, related category name or any related bed type.
- **Alternatives considered**: loading all rooms and filtering in the browser, which breaks pagination and scales poorly.

## Decision 7: Overlay filters use shadcn Popover

- **Decision**: use the shadcn/Radix Popover primitive for room “Mais filtros”, positioned over the page content. Categories render status Select directly and do not render FilterPanel.
- **Rationale**: the current FilterPanel renders an in-flow card, which changes the table layout; Popover preserves the surrounding context.
- **Alternatives considered**: keeping the card and changing CSS only, which retains the structural shift and does not express overlay behavior.

## Decision 8: Table actions are icon-only and right-aligned

- **Decision**: add a final actions column with an icon-only edit button, accessible name/tooltip and right-aligned container.
- **Rationale**: it matches the existing table conventions while satisfying the compact action requirement.

## Decision 9: Seed deterministic suite inventory and relations

- **Decision**: create four categories and 38 rooms in the existing development seed, using deterministic number ranges, four representative bed/capacity configurations and the category ID returned by each category creation.
- **Rationale**: the current seed starts from a clean database, so deterministic recreation makes manual verification repeatable.
- **Operational note**: `clean()` must delete rooms and categories before the hotel. The seed is intentionally reset-based, not additive; rerunning it recreates one complete development dataset.

## Decision 10: Use existing shadcn UI primitives

- **Decision**: edit pages and filters use the existing shadcn `Select`, `Textarea`, `Card`, `Button`, `Badge`, `AlertDialog`, `Form` and `Input` components. No native `<select>` is introduced.
- **Rationale**: it follows the established web design system and avoids the transparent dropdown regression already fixed in the shared Select styling.

## Decision 11: Room pagination has a bounded, shared limit set

- **Decision**: use 25 as the API and web default/minimum, and expose only `25`, `50`, `100` and `250` in the room list limit selector. Changing the limit resets the current page to 1.
- **Rationale**: the requested minimum avoids overly small result sets while the fixed set keeps URL/API behavior predictable and consistent between the client and server.
- **Alternatives considered**: arbitrary limits or retaining a default of 50, which would allow unsupported values and violate the requested minimum.

## Decision 12: Filter overlay closes on outside interaction

- **Decision**: the room “Mais filtros” control uses the shared shadcn Popover behavior with outside-pointer and Escape dismissal. The content remains positioned as an overlay and does not participate in normal page flow.
- **Rationale**: users can return to the table context without an extra close action, and the page layout remains stable while filters are open.
- **Alternatives considered**: an in-flow card or a manually positioned panel without dismissal handling, both of which either shift the table or leave the dropdown open unexpectedly.

## Decision 13: Search width is responsive

- **Decision**: the room search control has a 360px minimum width on desktop and uses the available width on narrow viewports.
- **Rationale**: the search must accommodate identification, category and bed terms without making the filter action unusable on smaller screens.
- **Alternatives considered**: a fixed width at every breakpoint, which would cause horizontal overflow on mobile, or the existing content-sized input, which is too small for the requested workflow.

## Decision 14: Search action has visible text and icon

- **Decision**: render the room-list search action with the visible label `Pesquisar` and the search icon in the same shadcn Button, while preserving an equivalent accessible name.
- **Rationale**: the text makes the action explicit and reduces ambiguity for users who do not identify icon-only controls.
- **Alternatives considered**: an icon-only button or placeholder-only affordance, which provide less discoverability and do not satisfy the requested interaction contract.
