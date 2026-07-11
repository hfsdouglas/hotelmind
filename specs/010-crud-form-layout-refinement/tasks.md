# Tasks: Correct CRUD Form Container, Card, and Action Placement

**Input**: Design documents from `/specs/010-crud-form-layout-refinement/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md, quickstart.md

**Tests**: Included. Both `packages/web/CLAUDE.md` and `packages/admin/CLAUDE.md` mandate TDD for components — `CrudFormLayout` already has a `.spec.tsx` in each package (from `009`), so those existing spec files must be updated first (red) before the component implementation changes (green).

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story. Because `CrudFormLayout`'s prop API changes in a breaking way (the `sidebar` prop is removed; `onSubmit`/`actions` become required), every page that consumes it must be migrated in the same wave as the Foundational component change — the app will not typecheck otherwise. Page-level tasks are still assigned to the story whose requirement most specifically drove that file's change (see per-task notes).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Maps task to spec.md user story (US1–US3)

## Path Conventions

Two independent front-end packages, per plan.md's Structure Decision:
- `packages/web/src/...` — hotel-facing app
- `packages/admin/src/...` — platform admin app

---

## Phase 1: Setup

- [X] T001 Confirm no new dependencies are required — `Card`, `Button`, and Tailwind CSS are already present in both `packages/web/package.json` and `packages/admin/package.json` (per research.md); no installs needed before starting

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Correct the shared `CrudFormLayout` component in both packages per `contracts/component-contracts.md`'s v2 contract

**⚠️ CRITICAL**: No page migration can compile until this phase is complete — every page currently passes the now-removed `sidebar` prop or lacks the now-required `onSubmit`/`actions` props

- [X] T002 [P] Update `packages/web/src/components/forms/CrudFormLayout.spec.tsx` FIRST (red): remove the old `sidebar` assertions; add assertions that (a) exactly one `Card`/card-styled element renders, (b) the rendered `<form>` invokes the `onSubmit` prop on submit, (c) `actions` content renders after/outside the card within the same `<form>`, and (d) the container wrapper carries the new breakpoint-based max-width classes (`sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]`)
- [X] T003 Implement `packages/web/src/components/forms/CrudFormLayout.tsx` to satisfy T002: remove the `sidebar` prop; add required `onSubmit: (e: FormEvent<HTMLFormElement>) => void` and `actions: ReactNode` props; render one `<form onSubmit={onSubmit}>` wrapping exactly one `Card` (containing `children`) followed by a `flex justify-end gap-3 [&>button]:min-w-[140px]` row rendering `actions`; replace the old `max-w-3xl`/`max-w-5xl` container classes with the new breakpoint scale (depends on T002)
- [X] T004 [P] Update `packages/admin/src/components/forms/CrudFormLayout.spec.tsx` FIRST (red) — same assertions as T002
- [X] T005 Implement `packages/admin/src/components/forms/CrudFormLayout.tsx` to satisfy T004, mirroring T003's structure exactly (depends on T004)

**Checkpoint**: `CrudFormLayout` v2 lands in both packages. Every consuming page now fails to typecheck until migrated in Phase 3/5 below (expected and addressed there).

---

## Phase 3: User Story 1 - One card per form, no side-by-side columns (Priority: P1)

**Goal**: The 4 pages that previously used the `sidebar` prop render exactly one card, with the former sidebar content as a second in-card section separated by a heading.

**Independent Test**: Open each page below and confirm exactly one card element is present, with "Rotas de acesso"/"Grupos de acesso" appearing as a heading + section below "Dados do grupo"/"Dados do usuário" inside that same card.

**Note**: Since `CrudFormLayout` no longer owns a native `<form>` slot for pages to nest their own `<form>` in, migrating these pages also necessarily moves their submit button into the new `actions` prop (User Story 3's concern) — unavoidable in the same edit. This is called out per task; User Story 3's own phase (Phase 5) covers the remaining pages that never had a sidebar.

### Implementation for User Story 1

- [X] T006 [P] [US1] Migrate `packages/web/src/pages/app/grupos/novo.tsx`: remove the page's own `<form>` tag and pass `handleSubmit(d => mutation.mutate(d))` via `CrudFormLayout`'s `onSubmit`; move the "Rotas de acesso" sidebar `Card` (module-grouped `CheckboxGrid` sections) into `children` as a second in-card section below the "Dados do grupo" fields, under its own heading; move the `<Button type="submit">` into `actions` (also satisfies US3 for this file)
- [X] T007 [P] [US1] Migrate `packages/web/src/pages/app/grupos/[id]/editar.tsx`: same treatment as T006
- [X] T008 [P] [US1] Migrate `packages/web/src/pages/app/usuarios/novo.tsx`: same treatment as T006, with the "Grupos de acesso" sidebar `Card` becoming the second in-card section
- [X] T009 [P] [US1] Migrate `packages/web/src/pages/app/usuarios/[id]/editar.tsx`: same treatment as T008

**Unplanned fix discovered here**: moving the routes/groups `CheckboxGrid` from outside any `<form>` (old `sidebar`) to inside `CrudFormLayout`'s new `<form>` element exposed a latent jsdom gap — Radix Checkbox's bubble input calls `useSize()`, which unconditionally constructs a `ResizeObserver` on mount; jsdom doesn't implement it. Added a no-op `ResizeObserverStub` to `packages/web/src/test/setup.ts` (and proactively to `packages/admin/src/test/setup.ts`, since Phase 4's admin pages have the same pattern), mirroring the existing `matchMedia` stub already there.

**Checkpoint**: All 4 previously two-card pages render exactly one card with two clearly separated in-card sections. User Story 1 is independently demoable.

---

## Phase 4: User Story 3 - Actions outside the card, right-aligned, consistent width (Priority: P2)

**Goal**: The 6 remaining migrated pages (which never had a `sidebar`, only a single section) move their action button(s) out of the card into `CrudFormLayout`'s `actions` prop.

**Independent Test**: Open each page below and confirm its Save/Create (and Cancel, where present) button(s) render below the card, right-aligned, at a consistent non-stretched width — not inside the card's field markup.

### Implementation for User Story 3

- [X] T010 [P] [US3] Migrate `packages/admin/src/pages/app/administradores/novo.tsx`: remove the page's own native `<form>` tag (keep `<Form {...form}>` — react-hook-form's `FormProvider`, not an HTML element — wrapping only the `FormField`s, passed as `children`); pass `form.handleSubmit(d => mutate(d))` via `onSubmit`; move the `<div className="flex gap-2 pt-2">` button row (Criar + Cancelar) into `actions`
- [X] T011 [P] [US3] Migrate `packages/admin/src/pages/app/administradores/editar.tsx`: same treatment as T010
- [X] T012 [P] [US3] Migrate `packages/admin/src/pages/app/hoteis/novo.tsx`: same treatment as T010
- [X] T013 [P] [US3] Migrate `packages/admin/src/pages/app/hoteis/editar.tsx`: same treatment as T010
- [X] T014 [P] [US3] Migrate `packages/admin/src/pages/app/rotas/nova.tsx`: same treatment as T010
- [X] T015 [P] [US3] Migrate `packages/admin/src/pages/app/rotas/editar.tsx`: same treatment as T010

**Checkpoint**: All 10 pages (4 from Phase 3 + 6 here) compile against the `CrudFormLayout` v2 API. Every action button renders outside its card, right-aligned, at a consistent width. User Story 3 is independently demoable, and both packages typecheck cleanly again.

---

## Phase 5: User Story 2 - Container width matches Bootstrap-style proportions (Priority: P1)

**Goal**: Confirm the corrected container width scaling (implemented once, in `CrudFormLayout`, during Phase 2) reads correctly in the browser across every migrated page.

**Independent Test**: At a desktop width (e.g. 1440px), the card's width-to-margin proportion visibly matches the Bootstrap-style scale from research.md §1, not the narrow heavily-margined layout from before.

**Note**: This story's actual implementation is entirely delivered by T003/T005 in Phase 2 — there is no page-specific code change for it. It is verified last, once every page has been migrated (Phases 3–4), so the check is meaningful across the full set of forms rather than a partial one.

### Verification for User Story 2

- [X] T016 [US2] Visually verify the container width scaling in-browser across a representative sample of migrated pages (`grupos/novo`, `usuarios/[id]/editar` in web; `hoteis/novo`, `administradores/[id]/editar` in admin) at the `sm`/`md`/`lg`/`xl`/`2xl` breakpoints, confirming the card width and side margins track the target widths from research.md §1 (~540/720/960/1140/1320px) instead of the previous narrow fixed width (depends on T006–T015 being complete so every sampled page is on the new API) — verified live via headless-Chromium screenshots at 700/900/1100/1300/1440px on `grupos/editar` (web) and `hoteis/novo` (admin): single card, actions row outside the card right-aligned at a consistent width, width/margins scaling smoothly across all widths

**Checkpoint**: User Story 2 confirmed across the app. All three user stories are now independently demoable and collectively complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T017 [P] Update the "CRUD Form Layout" section of `packages/web/CLAUDE.md` to reflect `CrudFormLayout`'s corrected API (no `sidebar`; required `onSubmit`/`actions`; one card; actions row outside the card with a consistent button width)
- [X] T018 [P] Update the "CRUD Form Layout" section of `packages/admin/CLAUDE.md` with the same correction
- [X] T019 Run `pnpm --filter web typecheck` and `pnpm --filter web test`; fix any failures introduced by Phases 2–4 — clean, 62/62 tests pass
- [X] T020 [P] Run `pnpm --filter admin typecheck` and `pnpm --filter admin test`; fix any failures introduced by Phases 2–4 — clean, 81/81 tests pass
- [X] T021 Execute the manual validation steps in `specs/010-crud-form-layout-refinement/quickstart.md` across both apps, confirming spec.md Success Criteria SC-001 through SC-004 (depends on T019, T020) — done as part of T016's live browser verification against the real API/DB (both dev servers, real login, real data); all four success criteria observed directly in the screenshots

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS every page migration (T006–T015) since the component's prop API changes
- **User Story 1 (Phase 3)**: Depends on Foundational (T003/T005) — independent of User Story 3's pages (different files), but both must land before User Story 2 can be meaningfully verified
- **User Story 3 (Phase 4)**: Depends on Foundational (T003/T005) — independent of Phase 3's pages (different files)
- **User Story 2 (Phase 5)**: Depends on Phase 3 AND Phase 4 being complete (needs the full page set migrated to verify container width consistently) — this is why it runs after Phase 4 despite being P1 priority; it has no implementation of its own, only verification
- **Polish (Phase 6)**: Depends on all user stories being complete

### Parallel Opportunities

- T002 and T004 (Foundational tests): `[P]` — different packages, but each blocks its own package's T003/T005 respectively
- T006–T009 (US1): all `[P]` — 4 different web page files, no cross-dependencies
- T010–T015 (US3): all `[P]` — 6 different admin page files, no cross-dependencies
- T006–T009 and T010–T015 can also run in parallel with each other (disjoint file sets, both only depend on Phase 2)
- T017–T018 (doc updates): `[P]` — different files
- T019–T020 (typecheck/test runs): `[P]` — different packages

---

## Parallel Example: Phases 3 + 4 together

```bash
# Once Phase 2 (T002-T005) is done, every page migration can be dispatched together:
Task: "Migrate packages/web/src/pages/app/grupos/novo.tsx to CrudFormLayout v2"
Task: "Migrate packages/web/src/pages/app/grupos/[id]/editar.tsx to CrudFormLayout v2"
Task: "Migrate packages/web/src/pages/app/usuarios/novo.tsx to CrudFormLayout v2"
Task: "Migrate packages/web/src/pages/app/usuarios/[id]/editar.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/administradores/novo.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/administradores/editar.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/hoteis/novo.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/hoteis/editar.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/rotas/nova.tsx to CrudFormLayout v2"
Task: "Migrate packages/admin/src/pages/app/rotas/editar.tsx to CrudFormLayout v2"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`CrudFormLayout` v2 in both packages)
3. Complete Phase 3: User Story 1 — the 4 two-card pages become single-card
4. **STOP and VALIDATE**: the four highest-visibility pages (the ones the original screenshot feedback was about) now match the request
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → corrected shared component ready
2. US1 → the 4 sidebar pages fixed (MVP for the most visible complaint)
3. US3 → the remaining 6 admin pages get their actions moved out; whole app typechecks again
4. US2 → container width confirmed across the complete, now-consistent set of forms
5. Polish → docs updated in both `CLAUDE.md` files, full lint/typecheck/test pass, quickstart validation

---

## Notes

- `[P]` tasks touch different files and have no unmet dependencies at the point they're started
- `[Story]` label maps each task to its spec.md user story for traceability
- No backend, contract, or validation-logic changes anywhere in this task list (per spec's Constraints) — every task is presentation-layer only
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
