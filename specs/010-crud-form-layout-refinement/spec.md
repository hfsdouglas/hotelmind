# Feature Specification: Correct CRUD Form Container, Card, and Action Placement

**Feature Branch**: `010-crud-form-layout-refinement`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "[Image #1] Margin is too exagerated, the card is too small. You should inspire in bootstrap container - look for the docs to apply the correct margin. I didnt ask for TWO CARDS - IT MEANS YOU CANT USE TWO COLUMNS. The screen must have one card occuping the center and those cards mush be separeted by context - the way it is now. The save button must be out of the cards and be localized at the end of the form aligned at the right side - apply a default width for the buttons that will be localized out of the forms."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One card per form, no side-by-side columns (Priority: P1)

As a staff member opening any create or edit form (e.g., editing a group and its access routes), I see a single card containing all of that form's content — the primary fields and any related contextual section (like access routes) — instead of two separate cards sitting side by side in columns.

**Why this priority**: This directly corrects a misapplication of the prior CRUD form layout work: the current two-card, two-column layout was never requested and contradicts the "one card" requirement from the original standardization effort. It is the most visible and most-called-out problem in the feedback.

**Independent Test**: Open the group edit form (which has both group fields and an access-routes section) and confirm the page shows exactly one card element containing both the fields and the routes section, with no second card rendered alongside it.

**Acceptance Scenarios**:

1. **Given** I open a create or edit form that has both primary fields and a related contextual section (e.g., group fields + access routes, or user fields + group assignment), **When** the page renders, **Then** I see exactly one card on the page containing all of that content.
2. **Given** the single card contains multiple contextual sections, **When** I scroll through the card, **Then** each section is visually separated by a heading/label identifying its context (e.g., "Dados do grupo", "Rotas de acesso"), the same way individual route groups are already separated by module heading today.
3. **Given** I resize the browser to a narrower width, **When** the page re-renders, **Then** the single card continues to stack its sections vertically without introducing a second card or a multi-column split.

---

### User Story 2 - Container width matches Bootstrap-style proportions (Priority: P1)

As a staff member viewing any create or edit form on a standard desktop screen, I see the card occupying a proportionate, comfortably wide central column — not a narrow card surrounded by excessive empty margin on either side.

**Why this priority**: Equally central to the feedback — the current container is visibly too narrow relative to the screen, making the form look small and the margins look exaggerated. This is a foundational sizing correction that every form depends on.

**Independent Test**: Open any create/edit form at a common desktop width (e.g., 1440px) and confirm the card's width and side margins are proportionate to standard container conventions (comparable to Bootstrap's container breakpoint scale), not the narrow, heavily-margined width currently shown.

**Acceptance Scenarios**:

1. **Given** I open a create or edit form on a desktop-width screen, **When** the page renders, **Then** the container's width is proportionate to the viewport following a breakpoint-based scale (wider container on wider screens, up to a reasonable maximum), rather than a single narrow fixed width with large unused side margins.
2. **Given** I resize the browser across common breakpoints (small, medium, large, extra-large desktop), **When** the page re-renders at each width, **Then** the container width increases in reasonable steps as the viewport grows, consistent with standard container conventions.

---

### User Story 3 - Form actions live outside the card, right-aligned, consistent width (Priority: P2)

As a staff member filling out a create or edit form, I find the Save/Create button below the card (not embedded as the last stretched item inside it), aligned to the right side of the container, with a consistent, non-full-width size matching other action buttons across the app.

**Why this priority**: A clear, explicit correction from the feedback, but it is a self-contained placement/sizing change that doesn't block or depend on the card/container corrections in User Story 1 and 2 — it can be verified independently once those are in place.

**Independent Test**: Open any create/edit form and confirm the primary action button (Save/Create) is not inside the card's content area, is positioned after/below the card, is right-aligned within the container, and does not stretch to the container's full width.

**Acceptance Scenarios**:

1. **Given** I open a create or edit form, **When** the page renders, **Then** the Save/Create button appears outside and below the card, not inside the card's content area.
2. **Given** the form's action button(s) are outside the card, **When** the page renders, **Then** they are aligned to the right edge of the container.
3. **Given** a form has more than one action button outside the card (e.g., Cancel and Save), **When** they render, **Then** each button uses the same default width instead of stretching to fill available space.

---

### Edge Cases

- What happens on a form that has no secondary contextual section (e.g., a simple "Nova Rota" form with just fields)? It still renders inside a single card with the corrected container width, and its action button still moves outside the card per User Story 3.
- What happens on a form that already has both a Cancel and a Save button outside the card (some admin forms)? Both move to the same right-aligned row and adopt the same consistent default width; their existing relative order is preserved.
- What happens at very narrow (mobile) widths where two right-aligned buttons might not fit side by side? The action row must remain usable — buttons may wrap or stack while staying right-aligned/full available width is not reintroduced.
- What happens to the checkbox 3-column grid behavior already in place for contextual sections like access routes? It is preserved unchanged; only the surrounding container/card/button placement changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every create and edit form MUST render its entire content — primary fields plus any related contextual section (e.g., access routes, group/role assignment) — inside exactly one card. Rendering primary fields and a contextual section as two separate, side-by-side cards or columns is prohibited.
- **FR-002**: When a single card contains more than one contextual section, each section MUST be visually separated by a heading/label identifying its context, consistent with the existing module-grouping pattern used within access-routes checklists.
- **FR-003**: The centered container's maximum width MUST scale across viewport breakpoints following a Bootstrap-style container scale (progressively wider at each of small/medium/large/extra-large/extra-extra-large breakpoints, e.g. approximately 540px/720px/960px/1140px/1320px), replacing the current single narrow fixed width.
- **FR-004**: The primary form action button(s) (Save, Create, and any accompanying Cancel) MUST be positioned outside and below the card, not inside the card's content area.
- **FR-005**: Action buttons positioned outside the card MUST be right-aligned within the container.
- **FR-006**: Action buttons positioned outside the card MUST share one consistent default width rather than stretching to fill the available container width.
- **FR-007**: These corrections MUST be applied to every create and edit form previously migrated to the shared CRUD form layout (all such forms in both the web and admin applications).
- **FR-008**: The existing 3-column responsive checkbox grid behavior within contextual sections MUST be preserved unchanged by this correction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing create/edit forms render exactly one visible card per page, with zero forms showing a second, side-by-side card or column.
- **SC-002**: At a standard desktop width (1440px), the card's width-to-margin proportion visibly matches a Bootstrap-style container scale rather than the narrow, heavily-margined layout previously shown, verified across all forms.
- **SC-003**: 100% of create/edit forms show their primary action button(s) outside the card, right-aligned, at a consistent non-stretched width.
- **SC-004**: No existing form functionality (field validation, submission, access-routes assignment, checkbox 3-column grid) regresses as a result of this correction.

## Assumptions

- "Bootstrap container" refers to Bootstrap's standard container breakpoint width scale (approximately 540px at ≥576px viewports, 720px at ≥768px, 960px at ≥992px, 1140px at ≥1200px, and 1320px at ≥1400px) used as sizing inspiration, not adoption of the Bootstrap framework itself — consistent with how "container" was already interpreted in the prior CRUD form standardization work.
- "Separated by context — the way it is now" refers to the existing pattern of grouping checkbox options under a module heading (e.g., "Dashboard", "Reservas"); that same heading-based separation is reused for section-level context within the single merged card (e.g., a "Rotas de acesso" heading above the routes section, following the "Dados do grupo" fields).
- The contextual section that previously lived in a separate sidebar card (e.g., access routes, group assignment) is moved to render below the primary fields within the same card, in the same reading order it appeared before.
- "Default width for buttons" means adopting one standard, non-stretched button width for the action-row buttons outside the card (e.g., matching the width already used for similarly-sized buttons elsewhere in the app), rather than introducing a new bespoke size.
- This correction supersedes the "sidebar" card option introduced in the prior CRUD form standardization feature; the sidebar layout pattern is removed from the shared form layout component in favor of a single-card, single-column layout with in-card sections.
