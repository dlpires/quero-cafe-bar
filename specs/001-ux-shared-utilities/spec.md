# Feature Specification: UX Foundation — Shared Utilities & Fixes

**Feature Branch**: `001-ux-shared-utilities`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "Implemente a fase 0 do plano de ux, da pasta analysis"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Feedback on All Operations (Priority: P1)

As a waiter or admin using the app, when I save, delete, or update a record
(produto, usuario, mesa, comanda), I want to see a clear success or error
message so I know the operation was completed successfully or what went wrong.

**Why this priority**: Without visual feedback, users cannot tell if their
action succeeded or failed, leading to confusion, repeated submissions, and
data integrity risks. This is the most critical UX improvement.

**Independent Test**: Open any registration form, fill in valid data, submit,
and confirm a success toast/notification appears. Then open a list page, delete
an item, and confirm a success toast appears.

**Acceptance Scenarios**:

1. **Given** the user is on a registration form, **When** they submit with
   valid data, **Then** they see a success notification and are redirected to
   the list page
2. **Given** the user triggers an error during submission, **When** the
   operation fails, **Then** they see an error notification describing the
   problem
3. **Given** the user deletes a record from a list, **When** the deletion
   completes, **Then** they see a confirmation notification

---

### User Story 2 - Loading States Prevent Double Submissions (Priority: P1)

As a waiter or admin, when I click the save button on a form, I want the
button to become disabled and show a loading indicator until the operation
completes, so I know the system is processing and I do not accidentally
submit the form multiple times.

**Why this priority**: Double submissions cause duplicate records, server
errors, and a frustrating user experience. Preventing this is essential for
data integrity.

**Independent Test**: Open any registration form, fill in data, click submit,
and verify the button becomes disabled with a loading indicator until the
operation finishes.

**Acceptance Scenarios**:

1. **Given** the user is on a registration form, **When** they click submit,
   **Then** the submit button is immediately disabled and shows a loading state
2. **Given** the submit button is in loading state, **When** the user clicks
   again, **Then** the second click is ignored
3. **Given** the operation completes, **When** the system finishes processing,
   **Then** the button returns to normal state or the page navigates away

---

### User Story 3 - Clear Empty States in All Listings (Priority: P2)

As a waiter or admin viewing a list page (produtos, usuarios, mesas, comandas),
when there are no records to display, I want to see a helpful message with an
icon and a button to add the first record, so I am not staring at a blank page.

**Why this priority**: Empty screens confuse users and provide no guidance on
what to do next. A rich empty state improves usability and reduces support
questions.

**Independent Test**: Open a list page when the database has no records for
that entity. Verify a descriptive message with icon and action button is
displayed instead of a blank page.

**Acceptance Scenarios**:

1. **Given** a list page has no records, **When** the page loads, **Then** an
   empty state with icon, descriptive message, and add button is displayed
2. **Given** the user sees an empty state, **When** they click the add button,
   **Then** they are taken to the registration form

---

### User Story 4 - Frontend Validation Before Submission (Priority: P2)

As a waiter or admin filling out a form, when I try to submit with empty
required fields or invalid values, I want to see clear inline validation
errors before the data is sent to the server, so I can correct them
immediately without a server round-trip.

**Why this priority**: Server-side validation alone creates slow feedback loops
and a poor user experience. Frontend validation catches common mistakes
instantly.

**Independent Test**: Open any registration form, leave required fields empty,
click submit, and verify validation messages appear without a server call.

**Acceptance Scenarios**:

1. **Given** the user leaves a required field empty, **When** they submit,
   **Then** a validation message appears next to the empty field
2. **Given** the user enters a value of zero or negative for a price field,
   **When** they submit, **Then** a validation message appears saying the value
   must be positive
3. **Given** all fields pass validation, **When** the user submits, **Then**
   the form proceeds to submit to the server

---

### User Story 5 - Keyboard Focus Management (Priority: P3)

As a waiter or admin navigating the app with a keyboard or screen reader,
when a page loads, I want the keyboard focus to move to the first interactive
element so I can start using the page immediately without manual tabbing.

**Why this priority**: Proper focus management is essential for accessibility
and power users who prefer keyboard navigation over mouse interaction.

**Independent Test**: Navigate to any page using keyboard tab key and verify
focus starts on the first input, button, or link rather than at the top of
the page.

**Acceptance Scenarios**:

1. **Given** a form page loads, **When** the page is fully rendered, **Then**
   keyboard focus is on the first input field
2. **Given** a list page loads, **When** the page is fully rendered, **Then**
   keyboard focus is on the first interactive element (search or add button)

---

### Edge Cases

- What happens when a toast notification appears while another is already
  visible? The new toast should replace or queue after the current one.
- What happens when the user navigates away during a loading operation?
  The loading should stop and no side effects should occur.
- What happens when validation is triggered on a field that is conditionally
  hidden? Validation should only apply to visible fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a success notification after every
  create, update, or delete operation
- **FR-002**: The system MUST display an error notification when an operation
  fails, with a description of the problem
- **FR-003**: Submit buttons MUST be disabled and show a loading state during
  form submission
- **FR-004**: Users MUST NOT be able to trigger multiple simultaneous
  submissions of the same form
- **FR-005**: List pages with no records MUST show a descriptive empty state
  with icon, message, and action button
- **FR-006**: The system MUST validate required fields on the client side
  before sending data to the server
- **FR-007**: The system MUST validate that numeric fields (prices, quantities)
  contain positive values on the client side
- **FR-008**: Keyboard focus MUST move to the first interactive element when
  each page loads
- **FR-009**: The logout function MUST only clear the authentication token,
  not all local storage data
- **FR-010**: Debug-specific HTTP headers MUST be removed from all API
  requests or made configurable via a settings mechanism

### Key Entities *(include if feature involves data)*

- **Utility Functions**: Reusable helpers shared across all frontend pages
  for toast notifications, loading states, empty states, validation, and focus
  management — no new data entities

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All registration and update forms show a success toast within
  1 second of operation completion
- **SC-002**: All submit buttons enter a disabled loading state within
  100ms of being clicked
- **SC-003**: All list pages display a meaningful empty state instead of a
  blank page when no records exist
- **SC-004**: Zero localStorage data other than the auth token persists after
  logout
- **SC-005**: No browser debug warning headers are sent with API requests in
  production
- **SC-006**: All existing frontend tests continue to pass without
  modification
- **SC-007**: Keyboard focus is correctly placed on first interactive element
  on every page

## Assumptions

- All form pages follow the same submission pattern (button click -> async
  call -> response feedback)
- The project uses a shared JavaScript module pattern where utility functions
  can be imported and reused across pages
- The authentication token is stored under a known localStorage key
- All list pages have access to the same empty state rendering capability
- Existing test coverage is sufficient to validate that no regressions occur
