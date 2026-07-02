# Feature Specification: Suporte — Admin Access to Hotel Web App

**Feature Branch**: `008-suporte-hotel-access`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "All the admin users can access the hotels. The admin app must have a module in the menu called 'Suporte', where the all the hotels active is going to be listed. Each item in the list must have a button that gives the admin user the access in the web application with the hotel choosed."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin opens the Suporte module and sees active hotels (Priority: P1)

Any authenticated admin user opens the "Suporte" item in the admin app's side menu and sees a list of every active hotel on the platform, so they know which tenants they can assist.

**Why this priority**: Without a reliable list of active hotels, there is nothing to act on — this is the entry point for the entire feature.

**Independent Test**: Can be fully tested by logging in as any admin user, opening "Suporte", and confirming the list shows exactly the hotels currently marked active, with inactive hotels excluded.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they open the "Suporte" item in the sidebar, **Then** a page listing all active hotels is displayed (name, and other identifying details already shown on the existing hotel listing).
2. **Given** a hotel is inactive, **When** the admin views the Suporte list, **Then** that hotel does not appear.
3. **Given** there are more active hotels than fit on one page, **When** the admin views the list, **Then** the list is searchable and paginated using the same pattern as other admin list pages.
4. **Given** there are zero active hotels, **When** the admin opens Suporte, **Then** an empty-state message is shown instead of an empty table.

---

### User Story 2 - Admin accesses a hotel's web application from Suporte (Priority: P1)

From the Suporte list, the admin clicks an "Access" button on a specific hotel and is granted entry into that hotel's web application (the hotel-facing app), scoped to that hotel, without needing that hotel's own user credentials.

**Why this priority**: This is the actual value of the feature — enabling support staff to see and troubleshoot a hotel's environment directly. The list from User Story 1 has no purpose without this action.

**Independent Test**: Can be fully tested by clicking "Access" next to a specific hotel and confirming the hotel's web application opens in an authenticated state scoped to that exact hotel — with no other hotel's data visible.

**Acceptance Scenarios**:

1. **Given** an admin viewing the Suporte list, **When** they click the "Access" button for a hotel that has one or more users, **Then** they are prompted to choose which of that hotel's existing users to act as.
2. **Given** the admin has chosen a user to act as, **When** the choice is confirmed, **Then** the hotel's web application opens in a new browser tab, authenticated as that chosen user.
3. **Given** the admin is now inside the hotel's web application via Suporte access, **When** they navigate through the app, **Then** all data shown belongs exclusively to the chosen hotel and reflects the permissions of the impersonated user.
4. **Given** an admin uses Suporte access to enter a hotel, **When** the action occurs, **Then** the system records who performed it, which hotel was accessed, which user was impersonated, and when — for audit purposes.
5. **Given** an admin's Suporte access session, **When** a defined period of time elapses, **Then** the session expires and the admin must request access again through Suporte (it does not behave like a normal, long-lived hotel-user login).
6. **Given** an admin without a valid admin session, **When** they attempt to use a Suporte access link directly, **Then** access is denied.
7. **Given** a hotel with zero users, **When** the admin clicks "Access", **Then** the system informs the admin that no user exists to impersonate and does not proceed (see Assumptions for the fallback behavior).

---

### Edge Cases

- What happens when a hotel that was active becomes inactive while an admin's Suporte session for it is still open? (Assumption: the existing session is allowed to finish naturally until it expires; new access attempts to that hotel are blocked while it is inactive.)
- What happens if the admin closes the tab without explicitly ending the Suporte session? The session simply expires on its own per the time-boxed policy.
- What happens if the same admin opens Suporte access to two different hotels in two tabs at once? Each tab holds its own independently scoped session; no cross-hotel bleed occurs.
- What happens when the hotel has no users of its own yet? The admin cannot pick a user to impersonate, so Suporte access is blocked for that hotel until it has at least one user (see FR-011).

---

## Clarifications

### Session 2026-07-01

- Q: When an admin uses Suporte to access a hotel's web app, what identity/session should they assume? → A: The admin picks which existing user of that hotel to act as (option C); the session impersonates that specific chosen user.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin app MUST display a "Suporte" item in its main navigation menu, visible to every authenticated admin user.
- **FR-002**: The Suporte page MUST list every hotel currently marked active, using the same search, sort, and pagination conventions as other admin list pages.
- **FR-003**: The Suporte page MUST exclude inactive hotels from the list.
- **FR-004**: Each hotel row in the Suporte list MUST include an "Access" action that, when triggered, grants the admin entry into that hotel's web application scoped exclusively to that hotel.
- **FR-005**: When an admin triggers "Access" for a hotel with one or more users, the system MUST require the admin to choose which existing user of that hotel to impersonate before granting access; the resulting session in the hotel's web application MUST reflect that chosen user's identity and permissions.
- **FR-006**: A Suporte access session MUST be time-limited and MUST NOT persist indefinitely like a normal hotel-user login; once expired, the admin must initiate access again from the Suporte page.
- **FR-007**: The system MUST record an auditable entry for every Suporte access grant, capturing which admin performed it, which hotel was accessed, which user was impersonated, and when.
- **FR-008**: Every action performed by an admin during a Suporte session MUST be scoped to the target hotel only — no cross-hotel data must ever be reachable during that session.
- **FR-009**: Suporte access MUST only be usable by an authenticated admin user; any attempt to use it without a valid admin session MUST be denied.
- **FR-010**: The hotel's web application MUST visibly indicate, while a Suporte session is active, that the current session is an administrative support session (impersonating a specific user) rather than that user's own normal login.
- **FR-011**: If the target hotel has zero users, the "Access" action MUST be blocked with a clear message explaining that no user exists to impersonate, rather than silently failing or granting an unattributed session.

### Key Entities

- **Suporte Access Event**: One instance of an admin entering a hotel's web application through the Suporte module. Represents which admin, which hotel, which impersonated user, and when.
- **Hotel** (existing entity): The tenant being supported; only hotels with active status are eligible for Suporte access.
- **User** (existing entity): The hotel user the admin selects to impersonate; must belong to the target hotel.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can go from opening the Suporte menu item to being inside a specific hotel's web application in under 10 seconds.
- **SC-002**: 100% of Suporte access events produce a retrievable audit record identifying the admin, the hotel, and the time.
- **SC-003**: 0% of Suporte sessions ever expose data belonging to a hotel other than the one selected.
- **SC-004**: 100% of Suporte sessions automatically stop being usable after their defined time limit elapses, without manual intervention.
- **SC-005**: Admins can distinguish, without ambiguity, when they are inside a hotel's app via a Suporte session versus a normal login.

---

## Assumptions

- "Active" hotels refers to the same active/inactive status already tracked on the existing hotel record.
- The existing admin hotel-listing UI conventions (search, pagination, columns) are reused for the Suporte list rather than inventing a new layout.
- Suporte access opens the hotel's web application in a new browser tab, leaving the admin's own admin-app session untouched and separate.
- The support session's time limit is short relative to a normal 7-day hotel-user session (industry-standard support/impersonation sessions typically last on the order of a single support interaction); the exact duration is an implementation detail for the planning phase, not a business rule needing further clarification here.
- Audit records are retained indefinitely for compliance purposes, consistent with the administrative-action auditability principle already documented for the admin app.
- No notification is sent to the hotel's own users when an admin accesses their environment via Suporte; visibility is limited to the in-app session indicator (FR-010) and the audit record (FR-007).
- When a hotel has exactly one user, the admin is still shown the user-selection step (for consistency and to keep the audit trail explicit) rather than auto-selecting that single user silently.
