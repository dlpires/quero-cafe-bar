---

description: "Task list for Frontend Route Protection feature"
---

# Tasks: Frontend Route Protection (Auth Guard)

**Input**: Design documents from `/specs/002-frontend-route-guard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are included in this task list because the frontend already has 105+ tests that must be maintained, and the Constitution (Test-First) mandates coverage preservation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for source, `frontend/src/services/` for services

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create test mock for auth module in frontend/src/services/__mocks__/auth.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create authentication service in frontend/src/services/auth.js with isAuthenticated(), requireAuth(), redirectToLogin(), redirectToHome()

**Checkpoint**: Foundation ready — auth service available, user story implementation can now begin

---

## Phase 3: User Story 1 - Block Unauthenticated Access (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated users are blocked from all protected routes and redirected to `/login`

**Independent Test**: Open browser in incognito, type URL of any protected page (`/home`, `/produtos`, etc.) — system must redirect to `/login` without showing protected content

### Implementation for User Story 1

- [x] T003 [P] [US1] Add global navigation guard (ionRouteDidChange) in frontend/src/main.js
- [x] T004 [P] [US1] Add requireAuth() guard to HomePage in frontend/src/pages/home/HomePage.js
- [x] T005 [P] [US1] Add requireAuth() guard to ListComandaPage and RegComandaPage and UpdateComandaPage in frontend/src/pages/comanda/
- [x] T006 [P] [US1] Add requireAuth() guard to ListMesaPage and RegMesaPage and UpdateMesaPage in frontend/src/pages/mesa/
- [x] T007 [P] [US1] Add requireAuth() guard to ListProdutoPage and RegProdutoPage and UpdateProdutoPage in frontend/src/pages/produto/
- [x] T008 [P] [US1] Add requireAuth() guard to ListUsuarioPage and RegUsuarioPage and UpdateUsuarioPage in frontend/src/pages/usuario/

**Checkpoint**: At this point, User Story 1 should be fully functional — all 13 protected pages redirect unauthenticated users to `/login`

---

## Phase 4: User Story 2 - Redirect Logged-in User from Login (Priority: P2)

**Goal**: Authenticated users who access `/login` are redirected to Home automatically

**Independent Test**: Login, manually type `/login` in address bar — system must redirect to `/home` without displaying login content

### Implementation for User Story 2

- [x] T009 [P] [US2] Add login redirect to LoginPage in frontend/src/pages/login/LoginPage.js — check isAuthenticated() in connectedCallback and redirect to /home
- [x] T010 [P] [US2] Add isAuthenticated check to global guard in frontend/src/main.js for /login route (redirect to /home when already logged in)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — unauthenticated users blocked, authenticated users redirected from login

---

## Phase 5: User Story 3 - Session Invalidation During Use (Priority: P2)

**Goal**: Users whose session is invalidated mid-session (expiry, logout in another tab) are redirected to login on next navigation or interaction

**Independent Test**: Login, navigate to any page, remove token from localStorage manually, try navigating via menu — system must redirect to login

### Implementation for User Story 3

- [x] T011 [P] [US3] Add cross-tab session sync listener in frontend/src/services/auth.js — listen for storage 'token' removal events
- [x] T012 [US3] Wire up auth storage listener to global guard in frontend/src/main.js — force redirect on token removal during active session

**Checkpoint**: All user stories should now be independently functional — session invalidation during use is handled

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, verification, and edge case hardening

- [x] T013 [P] Create auth service unit tests in frontend/src/services/auth.spec.js (isAuthenticated, requireAuth, redirectToLogin, redirectToHome)
- [x] T014 [P] Update page spec files to mock auth.js module for 13 protected page tests
- [x] T015 Run full test suite with `npm test` and verify all tests pass
- [x] T016 Run quickstart.md validation — verify all files modified match the quickstart checklist
- [x] T017 [P] Verify backward compatibility with existing session mechanism (login, logout, 401 handling) — ensure new auth guard does not break existing auth flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational (T002) completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (T002) — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (global guard from T003 must exist for login redirect logic)
- **User Story 3 (P2)**: Depends on US1 (global guard from T003 must exist for session listener wiring)

### Within Each User Story

- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All user story implementation tasks within a phase marked [P] can run in parallel (different pages, different files)
- T004-T008 (13 page guards) can all run in parallel
- T013, T014, and T017 can run in parallel
- Different user stories should be worked on sequentially (US1 → US2 → US3)

---

## Parallel Example: User Story 1

```bash
# Launch all page guard tasks together (different files, no shared dependencies):
Task: "Add requireAuth() guard to HomePage in frontend/src/pages/home/HomePage.js"
Task: "Add requireAuth() guard to ListComandaPage and RegComandaPage and UpdateComandaPage"
Task: "Add requireAuth() guard to ListMesaPage and RegMesaPage and UpdateMesaPage"
Task: "Add requireAuth() guard to ListProdutoPage and RegProdutoPage and UpdateProdutoPage"
Task: "Add requireAuth() guard to ListUsuarioPage and RegUsuarioPage and UpdateUsuarioPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003-T008)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Auth service ready
2. Add User Story 1 (global guard + 13 page guards) → MVP (unauthenticated access blocked)
3. Add User Story 2 → Login redirect ✓
4. Add User Story 3 → Session invalidation handling ✓
5. Add Polish → Tests pass, quickstart validated, backward compatibility verified

### Implementation Order

1. Team completes Setup + Foundational together
2. Once Foundational is done, implement US1 (all 13 pages can be done in parallel)
3. Then US2 (login redirect)
4. Then US3 (session invalidation)
5. Finally Polish (tests, verification)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
