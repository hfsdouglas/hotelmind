# Feature Specification: Standardize CRUD Form Layout

**Feature Branch**: `009-crud-form-standardization`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "It should update the forms in front-end application. The default form for all CRUDs in the apps must be central (like a container in bootstrap), all the inputs must be inside a card. When using checkboxes, they must be organized in 3 columns (like the access routes, for example). The header part of the form, where its localized the arrow to get back and the page title should respect the container width, but aligned to the left (the way it is now, but respecting the new container). The description input in the group CRUD must be a textarea. The access routes must be available at the creation form (its only available in the edit form). You must applicate the same rules to the users form. It would be a good practice to register this requirements in the CLAUDE.md's web and admin packages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent centered layout on every CRUD form (Priority: P1)

As a staff member managing any record (groups, users, hotels, administrators, routes) in either front-end application, when I open a create or edit form, I see the form centered on the page inside a single card, so every screen in the system feels visually consistent regardless of which entity I'm managing.

**Why this priority**: This is the foundational visual standard the rest of the feature builds on. Without it, the applications continue to show inconsistent, differently-aligned forms, which is the core problem being solved.

**Independent Test**: Open any existing create/edit form in the web and admin apps and verify the form content is centered in a bounded-width container with all inputs contained inside one card. Delivers value on its own by making every existing form visually consistent.

**Acceptance Scenarios**:

1. **Given** I navigate to any create or edit page in the web or admin app, **When** the page loads, **Then** the form's inputs appear inside a single card that is horizontally centered within a fixed-width container, with empty margins on either side on wide screens.
2. **Given** I am viewing a form's header (back button and page title), **When** the page renders, **Then** the header is constrained to the same container width as the form card below it and remains left-aligned within that container.
3. **Given** I resize the browser to a narrow (mobile-width) viewport, **When** the form is displayed, **Then** the container and card resize to fit the viewport without introducing horizontal scrolling.

---

### User Story 2 - Checkbox options arranged in three columns (Priority: P2)

As a staff member configuring access permissions or assigning options via checkboxes (such as access routes for a group, or groups for a user), when I view a form section containing a list of checkboxes, I see them arranged in three columns, so I can scan and select many options quickly without excessive scrolling.

**Why this priority**: Improves usability for the forms with the largest option lists (access routes, group assignment), but the applications remain functional with the current single-column layout while this is being rolled out, so it is secondary to the base layout standard.

**Independent Test**: Open the group edit form (which lists access routes) and the user create/edit forms (which list groups) and verify checkbox options render in a 3-column grid on desktop widths. Delivers value independently by making large option lists faster to scan.

**Acceptance Scenarios**:

1. **Given** a form section presents a list of checkbox options, **When** the section renders on a desktop-width screen, **Then** the options are laid out in a 3-column grid.
2. **Given** a checkbox list has only one or two options, **When** it renders, **Then** those options still appear in the 3-column grid structure without visual distortion.
3. **Given** a checkbox list is displayed on a narrow (mobile-width) viewport, **When** the page renders, **Then** the number of columns reduces so option labels remain fully readable without horizontal scrolling.

---

### User Story 3 - Assign access routes while creating a group (Priority: P3)

As a staff member creating a new group, I can select which access routes the group should have directly on the creation form, so the group has the correct permissions as soon as it is created, without a separate follow-up edit step.

**Why this priority**: Closes a functional gap (today route selection only exists on the edit screen), improving the group-setup workflow. It depends on the layout work in P1/P2 to present the routes selector consistently, so it is sequenced after them.

**Independent Test**: Open the group creation form and verify an access routes selector is present, and that selecting routes and submitting the form creates the group with exactly those routes assigned. Delivers value independently by removing the need to edit a newly created group just to grant it access.

**Acceptance Scenarios**:

1. **Given** I am on the group creation form, **When** the page loads, **Then** I see a list of available access routes with checkboxes, matching the same grouping and layout used on the group edit form.
2. **Given** I select a set of access routes and fill in the required group fields, **When** I submit the creation form, **Then** the new group is created and immediately has exactly the selected routes assigned.
3. **Given** I submit the group creation form without selecting any access routes, **When** the group is created, **Then** it is created successfully with no routes assigned, consistent with today's behavior when routes are cleared on the edit form.

---

### User Story 4 - Multi-line group description (Priority: P4)

As a staff member creating or editing a group, I can enter a longer, multi-line description using a proper text area, so I can write a clear, readable description instead of being limited to a single line of text.

**Why this priority**: Small, isolated, cosmetic-functional improvement limited to one field on one form; it doesn't block or depend on the other stories.

**Independent Test**: Open the group creation or edit form and verify the description field is a multi-line text area that accepts and displays line breaks. Delivers value independently as a standalone field-level fix.

**Acceptance Scenarios**:

1. **Given** I am on the group creation or edit form, **When** I view the "Description" field, **Then** it is rendered as a multi-line text area rather than a single-line text input.
2. **Given** I type a long description spanning multiple lines, **When** I review the field, **Then** the full text remains visible and editable within the expanded text area.

---

### Edge Cases

- What happens when a checkbox list has a very long option label? The label must wrap within its column rather than overflowing into neighboring columns or forcing horizontal scroll.
- What happens when a checkbox list is empty (e.g., no access routes exist yet)? The existing empty-state message continues to display in place of the grid.
- What happens when the browser window is resized between wide and narrow while a form is open? The container, card, and checkbox column count must respond and re-flow without leaving stale/broken layouts.
- What happens on the group creation form if route data fails to load? The rest of the creation form must remain usable, with a clear indication that route options are unavailable, consistent with existing error-handling patterns.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every create and edit form in the web and admin applications MUST render its inputs inside a single card, horizontally centered within a fixed-width container.
- **FR-002**: The form header (back navigation control and page title) on every create and edit page MUST be constrained to the same container width as the form card and MUST remain left-aligned within that container.
- **FR-003**: Whenever a form displays a group of checkbox options (e.g., access routes, group assignments), those options MUST be arranged in a 3-column layout on desktop-width screens.
- **FR-004**: Checkbox grids MUST reduce their column count on narrower viewports so that option labels remain fully readable and no horizontal scrolling is introduced.
- **FR-005**: The "Description" field on the group creation and edit forms MUST be a multi-line text area instead of a single-line text input.
- **FR-006**: The group creation form MUST include an access routes selector with the same checkbox grid presentation used on the group edit form.
- **FR-007**: Access routes selected during group creation MUST be saved and assigned to the group as part of the creation flow, so the group has those routes immediately after creation.
- **FR-008**: The group creation form MUST support submitting successfully with zero access routes selected.
- **FR-009**: The user creation and edit forms MUST follow the same centered-container, card-wrapped, left-aligned-header, and 3-column-checkbox rules defined above.
- **FR-010**: This layout standard MUST be documented as the default pattern for CRUD forms in the front-end project guidelines for both the web and admin packages, so future forms are built consistently with it.
- **FR-011**: The layout and structure changes described here MUST NOT alter existing form field behavior, validation rules, or submission/business logic beyond what is explicitly required (adding the access routes selector to group creation, per FR-006/FR-007).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing create and edit pages across both front-end applications use the centered, card-based container layout after implementation.
- **SC-002**: Every checkbox list with more than three options on any create or edit form displays in a 3-column arrangement on desktop-width screens.
- **SC-003**: Staff can create a new group with its intended access routes assigned in a single workflow (one form submission), down from two (create, then separately edit to assign routes).
- **SC-004**: Group descriptions of at least 300 characters remain fully visible and editable across multiple lines without being cut off or requiring horizontal scrolling.
- **SC-005**: No existing create/edit form regresses in functionality (all fields still validate and submit correctly) after the layout change, verified across all forms in both applications.
- **SC-006**: The layout standard is discoverable by any future contributor reading the web or admin package guidelines, without needing to inspect existing form code first.

## Assumptions

- "All CRUDs in the apps" refers to every existing create and edit form in both the `web` and `admin` front-end packages (currently: groups, users, hotels, administrators, and routes), not only the group and user forms explicitly called out by name.
- "Central, like a container in bootstrap" means a horizontally centered content area with a fixed maximum width and consistent side gutters, matching the general concept of a Bootstrap-style container, rather than adopting the Bootstrap framework itself.
- The current visual style of the back-navigation arrow and page title (their appearance, spacing, and typography) is preserved as-is; only their horizontal positioning/width is being constrained to the new container.
- "3 columns" refers to the desktop/wide-viewport presentation; on smaller viewports the column count is expected to reduce for readability, consistent with existing responsive patterns already used elsewhere in the applications.
- Assigning access routes during group creation reuses the same routes data and grouping-by-module presentation already used on the group edit form.
- Documenting the standard in the web and admin package guidelines is a documentation update to those packages' existing contributor guidelines, not a new standalone document.
