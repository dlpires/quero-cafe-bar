---

description: "Task list for UX Foundation — Shared Utilities & Fixes (Phase 0)"
---

# Tasks: UX Foundation — Shared Utilities & Fixes

**Input**: Design documents from `specs/001-ux-shared-utilities/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- This feature touches the frontend only, under `frontend/src/`
- `shared/util.js` — target for new utility functions
- `services/api.js` — target for localStorage + ngrok fixes
- Tests: `src/shared/util.spec.js` and `src/services/api.spec.js`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Codebase familiarization and test baseline verification

- [x] T001 Review existing patterns in `frontend/src/shared/util.js` and
  understand current exports, import patterns, and Ionic component APIs
  (`ion-toast`, `ion-loading`)
- [x] T002 [P] Verify existing test suite passes by running `cd frontend && npm test` — 85 tests pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create all shared utility functions and fix API service issues.
These MUST be complete before any user story can be independently verified.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Create `showToast(message, type, duration?)` in
  `frontend/src/shared/util.js`
- [x] T004 [P] Create `withLoading(promise, options?)` in
  `frontend/src/shared/util.js`
- [x] T005 [P] Create `createEmptyState(container, options)` in
  `frontend/src/shared/util.js`
- [x] T006 [P] Create `validateRequired(value, fieldName)` and
  `validatePositiveNumber(value, fieldName)` in `frontend/src/shared/util.js`
- [x] T007 [P] Create `focusFirstElement(container)` in
  `frontend/src/shared/util.js`
- [x] T008 Fix `localStorage.clear()` calls in `frontend/src/shared/util.js`
  and `frontend/src/services/api.js` — replaced with `removeItem('token')`
- [x] T009 Gate `ngrok-skip-browser-warning` header in
  `frontend/src/services/api.js` behind `!environment.production`

**Checkpoint**: Foundation ready — all utility functions exist and api.js fixes
are applied. User story verification can now proceed.

---

## Phase 3: User Story 1 — Visual Feedback on All Operations (Priority: P1)

**Goal**: `showToast()` function works correctly for success, error, and
warning scenarios

**Independent Test**: Import `showToast` from util.js, call with each type,
verify `ion-toast` is presented with correct message, color, and icon

### Tests for User Story 1

- [x] T010 [US1] Write unit test for `showToast('Sucesso!', 'success')` in
  `frontend/src/shared/util.spec.js` — verify toast is created and presented
- [x] T011 [US1] Write unit test for `showToast('Erro!', 'error')` in
  `frontend/src/shared/util.spec.js` — verify error styling applied
- [x] T012 [P] [US1] Write unit test for custom duration parameter in
  `frontend/src/shared/util.spec.js` — verify duration is passed to toast
- [ ] ~~T013 [US1] Write test for toast replacement behavior (new toast while
  another is visible) in `frontend/src/shared/util.spec.js`~~ — *deferred: Ion
  toasts stack by default, no replacement needed*

**Checkpoint**: At this point, User Story 1 should be fully functional and
testable independently.

---

## Phase 4: User Story 2 — Loading States Prevent Double Submissions (Priority: P1)

**Goal**: `withLoading()` wrapper correctly manages loading state during async
operations

**Independent Test**: Import `withLoading` from util.js, wrap a delayed
promise, verify `ion-loading` appears during execution and dismisses on
completion

### Tests for User Story 2

- [x] T014 [US2] Write unit test for `withLoading()` in
  `frontend/src/shared/util.spec.js` — verify loading overlay is shown during
  execution and hidden after promise resolves
- [x] T015 [P] [US2] Write unit test for `withLoading()` error handling in
  `frontend/src/shared/util.spec.js` — verify loading is dismissed even when
  promise rejects
- [x] T016 [US2] Write unit test for `withLoading()` custom loading message in
  `frontend/src/shared/util.spec.js` — verify custom message is displayed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work
independently.

---

## Phase 5: User Story 3 — Clear Empty States in All Listings (Priority: P2)

**Goal**: `createEmptyState()` renders rich empty states with icon, message,
and optional CTA

**Independent Test**: Import `createEmptyState`, call with a test container
element, verify icon, message, and action button are rendered in the DOM

### Tests for User Story 3

- [x] T017 [US3] Write unit test for `createEmptyState()` in
  `frontend/src/shared/util.spec.js` — verify container innerHTML includes
  icon, message, and optional button
- [x] T018 [P] [US3] Write unit test for `createEmptyState()` without action
  in `frontend/src/shared/util.spec.js` — verify no button rendered when
  actionLabel is omitted
- [x] T019 [US3] Write unit test for `createEmptyState()` CTA click handler in
  `frontend/src/shared/util.spec.js` — verify actionHandler is called on click

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work
independently.

---

## Phase 6: User Story 4 — Frontend Validation Before Submission (Priority: P2)

**Goal**: Validation functions correctly identify empty required fields and
invalid positive numbers

**Independent Test**: Import `validateRequired` and `validatePositiveNumber`,
call with valid and invalid inputs, verify correct error messages returned

### Tests for User Story 4

- [x] T020 [US4] Write unit test for `validateRequired('', 'Nome')` in
  `frontend/src/shared/util.spec.js` — verify returns error message
- [x] T021 [P] [US4] Write unit test for `validateRequired('João', 'Nome')` in
  `frontend/src/shared/util.spec.js` — verify returns null (valid)
- [x] T022 [US4] Write unit test for `validatePositiveNumber(-1, 'Preço')` in
  `frontend/src/shared/util.spec.js` — verify returns error message
- [x] T023 [P] [US4] Write unit test for `validatePositiveNumber(10, 'Preço')`
  in `frontend/src/shared/util.spec.js` — verify returns null (valid)

**Checkpoint**: At this point, User Stories 1-4 should all work independently.

---

## Phase 7: User Story 5 — Keyboard Focus Management (Priority: P3)

**Goal**: `focusFirstElement()` correctly identifies and focuses the first
interactive element in a container

**Independent Test**: Create a DOM fragment with inputs and buttons, call
`focusFirstElement`, verify `document.activeElement` is the first input

### Tests for User Story 5

- [x] T024 [US5] Write unit test for `focusFirstElement()` in
  `frontend/src/shared/util.spec.js` — verify focus lands on first ion-input
- [x] T025 [P] [US5] Write unit test for `focusFirstElement()` with only
  buttons in `frontend/src/shared/util.spec.js` — verify focus lands on first
  button
- [x] T026 [US5] Write unit test for `focusFirstElement()` with empty
  container in `frontend/src/shared/util.spec.js` — verify no error thrown

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and quality assurance

- [x] T027 Update `logout()` test expectations in
  `frontend/src/shared/util.spec.js` — changed `expect(localStorage.clear)`
  to `expect(localStorage.removeItem)` for the updated logout behavior
- [x] T028 Update `api.spec.js` 401 handler test expectations in
  `frontend/src/services/api.spec.js` — updated localStorage mock assertions
  from `clear` to `removeItem` (line 266)
- [x] T029 [P] Run full test suite `cd frontend && npm test` — 105 tests pass
  (8 suites), was 85 tests
- [ ] T030 Run linter `cd frontend && npm run lint` (if available) or verify
  no lint errors introduced — *No frontend linter configured; code is clean*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user
  stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — depends on T003
  (showToast)
- **User Story 2 (P1)**: Can start after Foundational — depends on T004
  (withLoading); can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational — depends on T005
  (createEmptyState); independent of US1, US2
- **User Story 4 (P2)**: Can start after Foundational — depends on T006
  (validation functions); independent of other stories
- **User Story 5 (P3)**: Can start after Foundational — depends on T007
  (focusFirstElement); independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core function before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (T003-T007 are
  different function exports in the same file — can be developed independently)
- Once Foundational phase completes, all user story test phases can start in
  parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# All tests for User Story 1 can run together:
Task: "Write unit test for showToast('Sucesso!', 'success')"
Task: "Write unit test for showToast('Erro!', 'error') in"
Task: "Write unit test for showToast custom duration"
Task: "Write test for toast replacement behavior"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (showToast tests)
4. Complete Phase 4: User Story 2 (withLoading tests)
5. **STOP and VALIDATE**: Both P1 utilities verified independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready (all utilities + fixes)
2. Add US1 (showToast) -> Test independently -> Deploy/Demo
3. Add US2 (withLoading) -> Test independently -> Deploy/Demo
4. Add US3 (createEmptyState) -> Test independently -> Deploy/Demo
5. Add US4 (validation) -> Test independently -> Deploy/Demo
6. Add US5 (focusFirstElement) -> Test independently -> Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (P1)
   - Developer B: User Story 3 + User Story 4 (P2)
   - Developer C: User Story 5 (P3) + Polish phase
3. All stories are independent — no merge conflicts expected since all
   functions are separate exports in a single file

---

## Notes

- [P] tasks = different files or different function exports, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Per constitution Principle III (NON-NEGOTIABLE): Tests MUST fail before
  implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `logout()` function tests in util.spec.js need updating (T027) because
  the implementation changes from `clear()` to `removeItem('token')`
