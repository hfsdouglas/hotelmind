---
description: "Task list for 006-permissoes-grupos feature implementation"
---

# Tasks: Gestão de Permissões por Grupos

**Input**: Design documents from `specs/006-permissoes-grupos/`

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US4)
- No test tasks — tests are co-located `.spec.ts` files created alongside each use case/route

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add missing UI components required by all listing pages.

- [x] T001 Add shadcn/ui components `checkbox`, `select`, `badge`, `alert-dialog` to `packages/web` using `pnpm dlx shadcn@latest add checkbox select badge alert-dialog` (required by grupos/usuarios pages)

**Checkpoint**: shadcn components available at `packages/web/src/components/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, shared contracts, and seed data. MUST complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until T002–T009 are complete.

- [x] T002 Update `packages/api/src/prisma/schema.prisma`: add `Grupo`, `Rota`, `RotaHotel`, `GrupoRota` models; add `grupos_ids String? @db.Text` field to `User`; add reverse relations (`grupos`, `rotas`) to `Hotel`
- [x] T003 Run `prisma migrate dev --name add_grupos_rotas_permissions` inside `packages/api` to apply schema changes
- [x] T004 [P] Create `packages/.contracts/src/rotas.ts` exporting `RotaMenu` interface `{ modulo, recurso, rota, icone?, ordem }`
- [x] T005 [P] Create `packages/.contracts/src/grupos.ts` exporting `Grupo`, `PaginacaoMeta`, and `PaginatedResponse<T>` interfaces
- [x] T006 [P] Create `packages/.contracts/src/usuarios.ts` exporting `Usuario` interface (all user fields except `senha`)
- [x] T007 Update `packages/.contracts/src/auth.ts`: add `rotas: RotaMenu[]` to `LoginResponse`; add `grupos_ids?: string | null` to `AuthUser`
- [x] T008 Update `packages/.contracts/src/index.ts` to export `rotas`, `grupos`, and `usuarios` modules
- [x] T009 Update `packages/api/src/db/seeds/index.ts`: drop all existing data then create 9 base routes, hotel, rotas_hoteis, grupo Administrador, grupos_rotas, admin user with grupos_ids

**Checkpoint**: Foundation ready — run `pnpm prisma db seed` in `packages/api` to verify seed executes without errors; all user story phases can now begin.

---

## Phase 3: User Story 1 — Administrador gerencia grupos de acesso (Priority: P1) 🎯 MVP

**Goal**: Full CRUD for hotel groups in backend and frontend, with route assignment in the edit form.

**Independent Test**: Create a group via `POST /grupos`, list it via `GET /grupos`, edit its routes, then attempt and confirm blocked deletion when a user is linked. Verify grupos listing page renders with search, filter, pagination.

### Backend — Grupos

- [ ] T010 [P] [US1] Create `packages/api/src/core/entities/grupo.ts` with `Grupo` class (fields: `id`, `hotel_id`, `grupo`, `descricao`, `status`, `created_at`, `updated_at`; getter `is_ativo: boolean`)
- [ ] T011 [P] [US1] Create `packages/api/src/core/entities/grupo.spec.ts` testing `Grupo` entity construction and `is_ativo` getter
- [ ] T012 [P] [US1] Create `packages/api/src/core/errors/grupo_not_found_error.ts` and `packages/api/src/core/errors/grupo_conflict_error.ts`
- [ ] T013 [US1] Create `packages/api/src/core/repositories/grupo_repository.ts` defining `IGrupoRepository` with methods: `list`, `create`, `findById`, `update`, `delete`, `hasLinkedUsers`, `listRoutes`, `syncRoutes`
- [ ] T014 [P] [US1] Create `packages/api/src/db/repositories/grupos/in-memory/in_memory_grupo_repository.ts` implementing `IGrupoRepository`
- [ ] T015 [P] [US1] Create `packages/api/src/schemas/grupos/list_grupos_schema.ts` (query params: pagina, limite, busca, ordenar_por, direcao, status; response: PaginatedResponse with Grupo array and meta)
- [ ] T016 [P] [US1] Create `packages/api/src/schemas/grupos/create_grupo_schema.ts` (body: grupo required, descricao optional, status default 'S', rota_ids optional array)
- [ ] T017 [P] [US1] Create `packages/api/src/schemas/grupos/get_grupo_schema.ts` (params: id; response: Grupo with rotas array)
- [ ] T018 [P] [US1] Create `packages/api/src/schemas/grupos/update_grupo_schema.ts` (body: all optional; params: id)
- [ ] T019 [US1] Create `packages/api/src/core/usecases/grupos/list_grupos_use_case.ts` + `list_grupos_use_case.spec.ts` using in-memory repo
- [ ] T020 [P] [US1] Create `packages/api/src/core/usecases/grupos/create_grupo_use_case.ts` + `create_grupo_use_case.spec.ts` (validates uniqueness by hotel_id + grupo name; throws `GrupoConflictError` on duplicate)
- [ ] T021 [P] [US1] Create `packages/api/src/core/usecases/grupos/get_grupo_use_case.ts` + `get_grupo_use_case.spec.ts` (returns group with linked routes; throws `GrupoNotFoundError`)
- [ ] T022 [P] [US1] Create `packages/api/src/core/usecases/grupos/update_grupo_use_case.ts` + `update_grupo_use_case.spec.ts` (syncs routes via `syncRoutes`: delete all then insert new ones in a transaction)
- [ ] T023 [US1] Create `packages/api/src/core/usecases/grupos/delete_grupo_use_case.ts` + `delete_grupo_use_case.spec.ts` (calls `hasLinkedUsers`; throws 409-mapped error if true)
- [ ] T024 [US1] Create `packages/api/src/db/repositories/grupos/implementation/postgres_grupo_repository.ts` implementing all `IGrupoRepository` methods using Prisma; `hasLinkedUsers` queries `User` where `hotel_id = hotelId AND (grupos_ids = id OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%')`; `syncRoutes` uses `prisma.$transaction`
- [ ] T025 [US1] Update `packages/api/src/db/repositories/index.ts` to export `PostgresGrupoRepository as GrupoRepository`
- [ ] T026 [US1] Create `packages/api/src/routes/grupos/grupos_routes.ts` with `GET /grupos`, `POST /grupos`, `GET /grupos/:id`, `PUT /grupos/:id`, `DELETE /grupos/:id`; each route instantiates its own use cases; DELETE returns 409 on `GrupoConflictError`
- [ ] T027 [US1] Create `packages/api/src/routes/grupos/grupos_routes.spec.ts` using Fastify `inject` with in-memory repo; cover: list pagination, create conflict, get not found, update routes sync, delete blocked by user
- [ ] T028 [US1] Register `grupos_routes` in `packages/api/src/plugins/fastify-routes.ts`

### Frontend — Shared Components (parallel with backend)

- [ ] T029 [P] [US1] Create `packages/web/src/hooks/usePaginacao.ts`: reads/writes `pagina`, `limite`, `busca`, `ordenar_por`, `direcao` to URL search params via `useSearchParams`; exposes typed `params` object and `setParams(partial)` function
- [ ] T030 [P] [US1] Create `packages/web/src/components/data-table/DataTable.tsx`: generic `DataTable<T>` with `columns: ColumnDef<T>[]`, `data: T[]`, `onSort?: (field, dir) => void`, `sortField?`, `sortDirection?`; renders `<table>` with sortable headers (↑↓ arrows on active column); no internal sort state
- [ ] T031 [P] [US1] Create `packages/web/src/components/data-table/DataTablePagination.tsx`: props `meta: PaginacaoMeta`, `onPageChange`, `onLimitChange`; buttons `|<` `<` `>` `>|`; select 50/100/250; displays "Página X de Y"
- [ ] T032 [P] [US1] Create `packages/web/src/components/data-table/SearchBar.tsx`: props `value`, `onChange`, `onSearch`, `placeholder?`; input + "Pesquisar" button; Enter key triggers `onSearch`
- [ ] T033 [P] [US1] Create `packages/web/src/components/data-table/FilterPanel.tsx`: collapsible via internal `isOpen` state (hidden by default); "Mais filtros" button with animated ChevronDown; renders `children` below search bar when open
- [ ] T034 [P] [US1] Create `packages/web/src/components/data-table/ResultCount.tsx`: props `total: number`; renders "X resultado(s) encontrado(s)"

### Frontend — Grupos Pages

- [ ] T035 [P] [US1] Create `packages/web/src/api/grupos.service.ts` with `listGrupos`, `createGrupo`, `getGrupo`, `updateGrupo`, `deleteGrupo` functions using `axios`
- [ ] T036 [P] [US1] Create `packages/web/src/api/rotas.service.ts` with `listRotas` function
- [ ] T037 [US1] Create `packages/web/src/pages/app/grupos/index.tsx`: uses `usePaginacao`, `useQuery` (re-fetches on param change); renders `SearchBar`, `FilterPanel` (status S/N checkbox), `ResultCount`, `DataTable` (columns: Grupo, Descrição, Status badge, Ações), `DataTablePagination`; delete triggers `AlertDialog` confirmation then `useMutation`; toast on success/error
- [ ] T038 [P] [US1] Create `packages/web/src/pages/app/grupos/novo.tsx`: React Hook Form + Zod schema (grupo required, descricao, status); `useMutation` for `POST /grupos`; redirect to `/grupos` with toast on success
- [ ] T039 [US1] Create `packages/web/src/pages/app/grupos/[id]/editar.tsx`: `useQuery` loads group (GET /grupos/:id); `useQuery` loads hotel routes (GET /rotas); routes rendered grouped by `modulo` with `Checkbox` per route; controlled selection state; `useMutation` for `PUT /grupos/:id`; uses `useParams` for `:id`
- [ ] T040 [US1] Update `packages/web/src/routes.tsx`: add routes `/grupos` (index), `/grupos/novo`, `/grupos/:id/editar` nested inside `AppLayout`

**Checkpoint**: US1 fully functional — create/list/edit/delete grupos in browser; routes assignable via checkboxes; delete blocked with alert when user is linked.

---

## Phase 4: User Story 2 — Administrador gerencia usuários do hotel (Priority: P2)

**Goal**: Full CRUD for hotel users (no delete), with group multiselect assignment.

**Independent Test**: Create a user via `POST /usuarios` with grupos_ids, list via `GET /usuarios`, edit grupos, verify no DELETE endpoint exists. Verify usuarios listing renders with search and pagination.

### Backend — Usuários

- [ ] T041 [P] [US2] Create `packages/api/src/core/errors/usuario_not_found_error.ts`
- [ ] T042 [US2] Create `packages/api/src/core/repositories/usuario_repository.ts` defining `IUsuarioRepository` (independent of `IUserRepository`) with methods: `list`, `create`, `findById`, `update`; no `delete`, no `findByEmail`
- [ ] T043 [P] [US2] Create `packages/api/src/db/repositories/usuarios/in-memory/in_memory_usuario_repository.ts` implementing `IUsuarioRepository`
- [ ] T044 [P] [US2] Create `packages/api/src/schemas/usuarios/list_usuarios_schema.ts` (query params: pagina, limite, busca, ordenar_por, direcao; response: PaginatedResponse with Usuario array and meta)
- [ ] T045 [P] [US2] Create `packages/api/src/schemas/usuarios/create_usuario_schema.ts` (body: all required user fields + senha + optional rg + optional grupos_ids; response: Usuario without senha)
- [ ] T046 [P] [US2] Create `packages/api/src/schemas/usuarios/get_usuario_schema.ts` (params: id; response: Usuario without senha)
- [ ] T047 [P] [US2] Create `packages/api/src/schemas/usuarios/update_usuario_schema.ts` (body: all optional; never includes senha in response)
- [ ] T048 [US2] Create `packages/api/src/core/usecases/usuarios/list_usuarios_use_case.ts` + `.spec.ts` using in-memory repo
- [ ] T049 [P] [US2] Create `packages/api/src/core/usecases/usuarios/create_usuario_use_case.ts` + `.spec.ts` (hashes senha with `BcryptPasswordHasher`; throws 409 on duplicate email/cpf/celular)
- [ ] T050 [P] [US2] Create `packages/api/src/core/usecases/usuarios/get_usuario_use_case.ts` + `.spec.ts` (throws `UsuarioNotFoundError`)
- [ ] T051 [P] [US2] Create `packages/api/src/core/usecases/usuarios/update_usuario_use_case.ts` + `.spec.ts` (never returns or updates `senha`)
- [ ] T052 [US2] Create `packages/api/src/db/repositories/usuarios/implementation/postgres_usuario_repository.ts`; `list` uses Prisma `where: { hotel_id: hotelId }` + `OR` clause on nome_completo/email/cpf for `busca`; `create` uses `db.user.create`; never selects `senha` in responses
- [ ] T053 [US2] Update `packages/api/src/db/repositories/index.ts` to export `PostgresUsuarioRepository as UsuarioRepository`
- [ ] T054 [US2] Create `packages/api/src/routes/usuarios/usuarios_routes.ts` with `GET /usuarios`, `POST /usuarios`, `GET /usuarios/:id`, `PUT /usuarios/:id`; no DELETE handler; instantiates own use cases
- [ ] T055 [US2] Create `packages/api/src/routes/usuarios/usuarios_routes.spec.ts` via Fastify inject; cover: list pagination/search, create duplicate conflict, get not found, update grupos_ids
- [ ] T056 [US2] Register `usuarios_routes` in `packages/api/src/plugins/fastify-routes.ts`

### Frontend — Usuários Pages

- [ ] T057 [P] [US2] Create `packages/web/src/api/usuarios.service.ts` with `listUsuarios`, `createUsuario`, `getUsuario`, `updateUsuario` functions
- [ ] T058 [US2] Create `packages/web/src/pages/app/usuarios/index.tsx`: uses `usePaginacao` + `useQuery`; renders `SearchBar`, `ResultCount`, `DataTable` (columns: Nome, E-mail, CPF, Grupos, Ações), `DataTablePagination`; no delete button; Ações only shows Edit link
- [ ] T059 [P] [US2] Create `packages/web/src/pages/app/usuarios/novo.tsx`: React Hook Form + Zod; fields: nome_completo, email, senha, nascimento, genero, celular, cpf, rg (optional); grupos multiselect using `Select` or checkboxes loaded from `useQuery` (`GET /grupos?status=S&limite=250`); `useMutation` `POST /usuarios`; redirect to `/usuarios` on success
- [ ] T060 [US2] Create `packages/web/src/pages/app/usuarios/[id]/editar.tsx`: loads user via `useQuery` (`GET /usuarios/:id`); loads grupos via `useQuery`; same form as novo but senha is optional (only sent if filled); `useMutation` `PUT /usuarios/:id`
- [ ] T061 [US2] Update `packages/web/src/routes.tsx`: add routes `/usuarios` (index), `/usuarios/novo`, `/usuarios/:id/editar` nested inside `AppLayout`

**Checkpoint**: US2 fully functional — create/list/edit users with group assignment; no delete option visible anywhere in UI or API.

---

## Phase 5: User Story 3 — Menu lateral dinâmico no login (Priority: P3)

**Goal**: Login response includes user's accessible routes; Sidebar renders dynamically from session.

**Independent Test**: Login with `admin@hotelmind.com.br` and verify response JSON contains `rotas` array with 9 items. Verify Sidebar displays only those modules/resources. Create a second user with only Reservas group and verify their Sidebar shows only Reservas module.

### Backend — Rota Repository + Login Update

- [ ] T062 [P] [US3] Create `packages/api/src/core/entities/rota.ts` with `Rota` class (fields: `id`, `modulo`, `recurso`, `rota`, `icone`, `ordem`, `ativo`)
- [ ] T063 [US3] Create `packages/api/src/core/repositories/rota_repository.ts` defining `IRotaRepository` with `findByHotel(hotelId): Promise<Rota[]>` and `findByUsuario(hotelId, grupoIds: string[]): Promise<Rota[]>`
- [ ] T064 [P] [US3] Create `packages/api/src/db/repositories/rotas/in-memory/in_memory_rota_repository.ts` implementing `IRotaRepository`
- [ ] T065 [US3] Create `packages/api/src/db/repositories/rotas/implementation/postgres_rota_repository.ts`; `findByHotel` queries `rotas_hoteis WHERE hotel_id = hotelId AND rota.ativo = true` ordered by `ordem`; `findByUsuario` joins `rotas_hoteis` ∩ `grupos_rotas WHERE grupo_id IN grupoIds` with `ativo = true` deduped and ordered by `ordem`
- [ ] T066 [US3] Update `packages/api/src/db/repositories/index.ts` to export `PostgresRotaRepository as RotaRepository`
- [ ] T067 [US3] Create `packages/api/src/routes/rotas/rotas_routes.ts` with `GET /rotas` (auth required); uses `RotaRepository(db).findByHotel(request.user.hotelId)` directly (no use case needed for this read-only query)
- [ ] T068 [US3] Create `packages/api/src/routes/rotas/rotas_routes.spec.ts` via Fastify inject; cover: returns empty array when no routes configured, returns filtered routes for hotel
- [ ] T069 [US3] Register `rotas_routes` in `packages/api/src/plugins/fastify-routes.ts`
- [ ] T070 [US3] Update `packages/api/src/core/usecases/login_use_case.ts`: add `IRotaRepository` as fourth constructor param; parse `user.grupos_ids` (split by comma, filter empty); call `rota_repository.findByUsuario(hotel.id, grupoIds)`; add `rotas: Rota[]` to `LoginOutput`
- [ ] T071 [US3] Update `packages/api/src/core/usecases/login_use_case.spec.ts`: add test for user with grupos_ids returning correct routes; add test for user without grupos_ids returning empty routes array
- [ ] T072 [US3] Update `packages/api/src/schemas/auth/login_schema.ts`: extend `login_response_schema` to include `rotas: z.array(rotaMenuSchema)` where `rotaMenuSchema` matches `RotaMenu` contract
- [ ] T073 [US3] Update `packages/api/src/routes/auth/auth_routes.ts`: instantiate `RotaRepository(db)` in route DI; pass to `LoginUseCase`; include `rotas` in response body mapped from `LoginOutput.rotas`

### Frontend — Auth Context + Sidebar

- [ ] T074 [US3] Update `packages/web/src/contexts/AuthContext.tsx`: add `rotas: RotaMenu[]` to `AuthSession` type; ensure `setSession` persists `rotas` to localStorage; `clearSession` clears it
- [ ] T075 [US3] Update `packages/web/src/hooks/useLogin.ts`: destructure `rotas` from `onSuccess` response; pass `{ user, hotel, rotas }` to `setSession`
- [ ] T076 [US3] Update `packages/web/src/components/layout/Sidebar.tsx`: remove static `const navigation: NavEntry[]`; import `useAuth`; create `ICON_MAP: Record<string, ElementType>` with entries for `LayoutDashboard`, `CalendarDays`, `BedDouble`, `Users`, `Shield`, `LayoutGrid` (fallback); transform `session.rotas` into `NavEntry[]` by grouping by `modulo` (reduce), attaching icon from `ICON_MAP[iconeName] ?? LayoutGrid`, sorting entries by first route `ordem`; resources within each module sorted by `ordem`

**Checkpoint**: US3 fully functional — after login, Sidebar shows only modules/resources the user's groups permit; different users see different menus.

---

## Phase 6: User Story 4 — Pesquisa, paginação e filtros nas listagens (Priority: P4)

**Goal**: URL preserves search state; pagination controls work correctly; filter panel collapses/expands; column sorting works.

**Independent Test**: Navigate to `/grupos`, search "admin", verify URL updates to `?busca=admin`; copy URL, open new tab, verify same results load; change limit to 100, verify URL updates; click column header, verify sort direction toggles.

- [ ] T077 [P] [US4] Verify grupos listing (`packages/web/src/pages/app/grupos/index.tsx`): confirm that `usePaginacao` correctly initialises from URL on mount, that `DataTable` sort headers update URL via `setParams`, and that `FilterPanel` status filter is included in the query sent to `GET /grupos`
- [ ] T078 [P] [US4] Verify usuarios listing (`packages/web/src/pages/app/usuarios/index.tsx`): confirm that `busca` searches across nome_completo, email, and cpf fields (backend `WHERE` clause), and that pagination meta values match the actual dataset size
- [ ] T079 [US4] Run full quickstart.md validation: execute all 4 scenario sections; confirm seed DB, all curl commands succeed with documented responses, browser navigation preserves URL state, dynamic menu reflects group permissions

**Checkpoint**: All 4 user stories independently functional and verified end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and final quality check.

- [ ] T080 [P] Update `packages/api/CLAUDE.md`: add "## Pagination Standard" section documenting query params (pagina, limite, busca, ordenar_por, direcao) and `meta` shape; add rule "DELETE of resources with dependencies MUST return 409 with descriptive message"; add "`grupos_ids` is a comma-separated string of group UUIDs stored on the User model"; add "Portuguese is used ONLY for Prisma field names and table names (via `@@map`)"
- [ ] T081 [P] Update `packages/web/CLAUDE.md`: add "## DataTable Components" section listing components in `src/components/data-table/`; document `usePaginacao` hook API; add rule "Sidebar menu MUST always be dynamic, loaded from `session.rotas` — never static"
- [ ] T082 [P] Run `pnpm lint` and `pnpm typecheck` in both `packages/api` and `packages/web`; fix any errors before marking complete
- [ ] T083 Run `pnpm test` in `packages/api` to confirm all spec files pass (entities, use cases, routes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001 not blocking T002–T009 but shadcn needed before frontend)
- **US1 (Phase 3)**: Depends on Phase 2 (T002–T009 complete)
- **US2 (Phase 4)**: Depends on Phase 2; US1 backend not required but groups must exist in DB for groups multiselect
- **US3 (Phase 5)**: Depends on Phase 2 + seeds (T009); can run in parallel with US1 and US2
- **US4 (Phase 6)**: Depends on US1 + US2 + US3 all complete
- **Polish (Phase 7)**: Depends on US4 complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — independent of US2/US3
- **US2 (P2)**: Starts after Phase 2 — needs grupos to exist in DB for multiselect (T009)
- **US3 (P3)**: Starts after Phase 2 — independent of US1/US2 but login update needs `RotaRepository`
- **US4 (P4)**: Verification story — needs US1 + US2 frontend complete

### Within Each User Story

- Repository interface (T013, T042, T063) must exist before use cases
- In-memory repo (T014, T043, T064) enables use case specs
- Use cases before route handler
- Postgres repo before route can be wired in routes.ts
- Frontend service before page components
- All [P] tasks in the same phase can be dispatched together

### Critical Path

```
T002 → T003 → [T004–T009 parallel]
    → T013 → [T014–T023 parallel] → T024 → T025 → T026 → T027 → T028 → T040
    → T063 → T070 → T072 → T073 → T074 → T075 → T076
```

---

## Parallel Opportunities

### Phase 2 — Foundational

```
Parallel batch after T003:
  T004  Create packages/.contracts/src/rotas.ts
  T005  Create packages/.contracts/src/grupos.ts
  T006  Create packages/.contracts/src/usuarios.ts
```

### Phase 3 — US1

```
Parallel batch after T013 (IGrupoRepository defined):
  T014  in_memory_grupo_repository.ts
  T015  list_grupos_schema.ts
  T016  create_grupo_schema.ts
  T017  get_grupo_schema.ts
  T018  update_grupo_schema.ts
  T020  create_grupo_use_case.ts + spec
  T021  get_grupo_use_case.ts + spec
  T022  update_grupo_use_case.ts + spec

Parallel batch (frontend, no backend dependency):
  T029  usePaginacao.ts
  T030  DataTable.tsx
  T031  DataTablePagination.tsx
  T032  SearchBar.tsx
  T033  FilterPanel.tsx
  T034  ResultCount.tsx
  T035  grupos.service.ts
  T036  rotas.service.ts
```

### Phase 4 — US2

```
Parallel batch after T042 (IUsuarioRepository defined):
  T043  in_memory_usuario_repository.ts
  T044  list_usuarios_schema.ts
  T045  create_usuario_schema.ts
  T046  get_usuario_schema.ts
  T047  update_usuario_schema.ts
  T049  create_usuario_use_case.ts + spec
  T050  get_usuario_use_case.ts + spec
  T051  update_usuario_use_case.ts + spec
  T057  usuarios.service.ts (frontend)
  T059  usuarios/novo.tsx (frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T009)
3. Complete Phase 3: US1 (T010–T040)
4. **STOP and VALIDATE**: Test grupos CRUD end-to-end via browser and API
5. Ready to demo admin managing access groups

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test grupos CRUD independently → Demo (MVP!)
3. US2 → Test usuarios CRUD independently → Demo
4. US3 → Test dynamic menu independently → Demo
5. US4 → Final verification → Ship

---

## Notes

- [P] tasks operate on different files with no dependency on incomplete tasks in the same phase
- [Story] label maps each task to its user story for traceability
- Tests are co-located `.spec.ts` files, not separate test phases
- All use case tests use in-memory repository implementations — never mock Prisma
- All route tests use Fastify `inject` — never start a real server
- `hotel_id` is always derived from `request.user.hotelId` (JWT) — never from request body
- Portuguese ONLY in Prisma field names and `@@map()` table names; all TypeScript identifiers in English
