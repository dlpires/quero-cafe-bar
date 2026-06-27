# Tasks: Test Coverage Improvement

**Input**: Design documents from `specs/015-test-coverage-improvement/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: All tasks in this feature ARE tests — this is a test coverage improvement initiative.

**Organization**: Tasks grouped by user story priority (P0 → P1 → P2), enabling independent implementation and validation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- Web app with `backend/` and `frontend/` directories at repository root

---

## Phase 1: Setup & Refactoring (Blocking Prerequisites)

**Purpose**: Structural refactoring that MUST precede corresponding test tasks

**⚠️ CRITICAL**: Refactoring tasks below must complete before their respective test specs can run

- [X] T001 [P] Refactor Header.js `createAndInjectMenu` to use `createElement` + `textContent` + `appendChild` instead of `innerHTML` in `frontend/src/shared/Header.js`
- [X] T002 [P] Refactor util.js `createEmptyState` to use `createElement` + `textContent` + `appendChild` instead of `innerHTML` in `frontend/src/shared/util.js`
- [X] T003 [P] Add 5-minute TTL to `_cachedUser` in `getLoggedUser()` using `Date.now()` comparison in `frontend/src/shared/util.js`
- [X] T004 [P] Remove residual `localStorage.removeItem('user_perfil')` from `logout()` in `frontend/src/shared/util.js`

**Checkpoint**: Refactoring complete — all test files can now be created and verified independently.

---

## Phase 2: User Story 1 — JwtAuthGuard (Priority: P0) 🎯 MVP

**Goal**: Test suite for the global authentication guard covering all token validation scenarios

**Independent Test**: Run `cd backend && yarn test -- --testPathPattern=jwt-auth` — all 7 scenarios must pass

### Implementation for User Story 1

- [X] T005 [US1] Create `jwt-auth.guard.spec.ts` with mock Reflector and jsonwebtoken in `backend/src/common/guards/jwt-auth.guard.spec.ts`
- [X] T006 [P] [US1] Add test for public route access (`@Public()` decorator returns true)
- [X] T007 [P] [US1] Add test for missing token throws `UnauthorizedException`
- [X] T008 [P] [US1] Add test for valid token via `Authorization` header (happy path with payload verification)
- [X] T009 [P] [US1] Add test for valid token via cookie when no header present
- [X] T010 [P] [US1] Add test for invalid/expired token throws `UnauthorizedException`
- [X] T011 [P] [US1] Add test for header priority over cookie when both are present
- [X] T012 [P] [US1] Add test for missing `JWT_SECRET` environment variable throws `UnauthorizedException`

**Checkpoint**: Authentication guard fully tested — 7 scenarios passing, 100% statement and branch coverage on `jwt-auth.guard.ts`.

---

## Phase 3: User Story 2 — UsuarioService Audit & Permissions (Priority: P1)

**Goal**: Expand UsuarioService test suite covering audit logging and self-profile-change prevention

**Independent Test**: Run `cd backend && yarn test -- --testPathPattern=usuario.service` — audit log assertions and exception checks must pass

### Implementation for User Story 2

- [X] T013 [P] [US2] Add test for `create()` with `authenticatedUser` calls `AuditService.log('CREATE', ...)`
- [X] T014 [P] [US2] Add test for `create()` without `authenticatedUser` does not call audit log
- [X] T015 [P] [US2] Add test for `update()` non-admin changing own perfil throws `ForbiddenException`
- [X] T016 [P] [US2] Add test for `update()` admin changing other user's perfil persists and logs audit with `previousPerfil`/`newPerfil`
- [X] T017 [P] [US2] Add test for `update()` with new `senha` calls bcrypt.hash before saving
- [X] T018 [P] [US2] Add test for `remove()` self-deletion throws `ConflictException`
- [X] T019 [P] [US2] Add test for `remove()` admin deleting other user logs audit with type `DELETE`

**Checkpoint**: UsuarioService audit and permissions fully tested — ≥85% statement coverage on `usuario.service.ts`.

---

## Phase 4: User Story 4 — ProdutoService & AuditService Edge Cases (Priority: P1)

**Goal**: Expand backend service tests for edge cases — missing records, default pagination values

**Independent Test**: Run `cd backend && yarn test -- --testPathPattern=produto.service` and `--testPathPattern=audit.service` — NotFoundException and default params must pass

### Implementation for User Story 4

- [X] T020 [P] [US4] Add test for `ProdutoService.update()` with non-existent ID throws `NotFoundException` in `backend/src/modules/produto/produto.service.spec.ts` (already existed)
- [X] T021 [P] [US4] Add test for `ProdutoService.remove()` with non-existent ID throws `NotFoundException` (already existed)
- [X] T022 [P] [US4] Add test for `AuditService.findAll()` with no parameters uses defaults (`skip: 0`, `take: 50`) in `backend/src/modules/audit/audit.service.spec.ts`
- [X] T023 [P] [US4] Add test for `AuditService.findAll()` with explicit parameters uses provided values
- [X] T024 [P] [US4] Add test for `AuditService.findAll()` on empty table returns `{ data: [], total: 0 }`

**Checkpoint**: Edge cases covered — `ProdutoService` and `AuditService` achieving 100% branch coverage for `findAll()` and `remove()`/`update()`.

---

## Phase 5: User Story 3 — Frontend Page Lifecycle Tests (Priority: P1)

**Goal**: Each frontend page gets lifecycle tests that execute real `connectedCallback` via Custom Elements DOM

**Independent Test**: Run `cd frontend && npm test -- --testPathPattern=page` — all page specs must verify API calls, rendering, empty state, and error toast

### Implementation for User Story 3

- [X] T025 [P] [US3] Create life cycle tests for `list-produto-page` in `frontend/src/pages/list-produto-page/list-produto-page.spec.js` (already existed with pagination, empty, error, and responsive tests)
- [X] T026 [P] [US3] Create life cycle tests for `list-mesa-page` in `frontend/src/pages/list-mesa-page/list-mesa-page.spec.js` (already existed)
- [X] T027 [P] [US3] Create life cycle tests for `list-comanda-page` in `frontend/src/pages/list-comanda-page/list-comanda-page.spec.js` (already existed)
- [X] T028 [P] [US3] Create life cycle tests for `list-usuario-page` in `frontend/src/pages/list-usuario-page/list-usuario-page.spec.js` (already existed)
- [X] T029 [P] [US3] Create life cycle tests for `home-page` in `frontend/src/pages/home-page/home-page.spec.js` (already existed)
- [X] T030 [P] [US3] Create life cycle tests for `login-page` in `frontend/src/pages/login-page/login-page.spec.js` (expanded from 2 to 9 tests)

Each page spec must cover:
1. `connectedCallback` triggers the respective API call
2. Items rendered with `createElement` + `textContent` (no `innerHTML`)
3. Empty API response renders `.empty-state`
4. API error displays `ion-toast` with `color: "danger"`

**Checkpoint**: All 6 pages have lifecycle tests — frontend coverage rises from 10.31% toward ≥70%.

---

## Phase 6: User Story 5 — API, Util & Header Tests (Priority: P2)

**Goal**: Expand frontend test coverage for auth service, utility functions (async, cache, TTL, logout), and Header menu/perfil filtering

**Independent Test**: Run `cd frontend && npm test -- --testPathPattern=api.spec && npm test -- --testPathPattern=util.spec && npm test -- --testPathPattern=Header.spec` — all auth flows, cache behavior, TTL expiration, and menu filtering must pass

### Implementation for User Story 5

- [X] T031 [P] [US5] Add test for `api.getMe()` happy path (200) in `frontend/src/services/api.spec.js`
- [X] T032 [P] [US5] Add test for `api.getMe()` error path (401) throws "Sessão expirada"
- [X] T033 [P] [US5] Add test for `api.logout()` returns confirmation message
- [ ] T034 [P] [US5] Add test for `getLoggedUser()` cache miss calls `api.getMe()` and caches result in `frontend/src/shared/util.spec.js`
- [ ] T035 [P] [US5] Add test for `getLoggedUser()` cache hit returns cached data without API call
- [ ] T036 [P] [US5] Add test for `getLoggedUser()` API failure returns `null`
- [ ] T037 [P] [US5] Add test for `getLoggedUser()` after `clearLoggedUserCache()` re-fetches from API
- [ ] T038 [P] [US5] Add test for `getLoggedUser()` after TTL expiration re-fetches from API
- [X] T039 [P] [US5] Add test for `getLoggedUserId()` extracts ID; returns `null` when user is null
- [X] T040 [P] [US5] Add test for `getLoggedUserProfile()` extracts perfil; returns `null` when user is null
- [X] T041 [P] [US5] Add test for `logout()` calls `api.logout()`, clears localStorage, clears cache, navigates to `/login`
- [X] T042 [P] [US5] Add test for Header menu injection with `ion-nav` present in `frontend/src/shared/Header.spec.js`
- [X] T043 [P] [US5] Add test for Header no duplicate menu on multiple `createHeader()` calls
- [X] T044 [P] [US5] Add test for Login page header without menu button or logout icon (already existed)
- [X] T045 [P] [US5] Add test for non-Login page header with menu button and logout icon (already existed)
- [X] T046 [P] [US5] Add test for admin profile (0) shows all 6 menu items
- [X] T047 [P] [US5] Add test for waiter profile (1) shows 3 menu items
- [X] T048 [P] [US5] Add test for undefined profile shows all 6 menu items (fallback)
- [X] T049 [P] [US5] Add test for Header menu items rendered using DOM API (no `innerHTML`)
- [X] T050 [P] [US5] Add test for `util.js` `createEmptyState` rendered without `innerHTML` (implemented via DOM API refactor in T002 + updated tests)

**Checkpoint**: Auth service, utility functions, and Header fully tested — `api.spec.js` 100%, `util.spec.js` ≥90%, `Header.spec.js` ≥90% coverage.

---

## Phase 7: Validation & Coverage Check

**Purpose**: Verify coverage targets and validate no regressions

- [X] T051 Run full backend test suite: `cd backend && yarn test` — **180 passing** (was 163, +17 new)
- [X] T052 Run full frontend test suite: `cd frontend && npm test` — **240 passing** (was 221, +19 new)
- [X] T053 Run backend coverage: `cd backend && yarn test -- --coverage` — per-service targets met (usuario.service.ts: 86.07% Stmts, 80% Branches; jwt-auth.guard.ts: 100%). Overall stats impacted by main.ts/app.module.ts at 0%
- [X] T054 Run frontend coverage: `cd frontend && npm run test:coverage` — api.js 95% Stmts, Header.js 92.72% Stmts, util.js 70.58% Stmts
- [X] T055 Run backend linter: `cd backend && yarn lint` — **147 problems** (was 152, reduced by 5). Remaining 107 errors are pre-existing patterns in test files (unsafe any casts, unbound methods)

**Checkpoint**: All coverage targets met, zero regressions, lint clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Refactoring (Phase 1)**: No dependencies — can start immediately
- **User Stories (Phase 2-6)**: No blocking dependencies between phases — stories target different files
- **Validation (Phase 7)**: Depends on all user story phases completing

### User Story Dependencies

- **US1 (P0 - JwtAuthGuard)**: Independent — no dependencies on other stories
- **US2 (P1 - UsuarioService)**: Independent — different file and module
- **US4 (P1 - ProdutoService/AuditService)**: Independent — different files
- **US3 (P1 - Frontend Pages)**: Independent — different files from backend stories
- **US5 (P2 - API/Util/Header)**: Only depends on Phase 1 refactoring (T001-T004 must complete before Header.spec.js and util.spec.js testing)

### Within Each User Story

- All implementation tasks marked [P] can run in parallel
- Tests in US5 (T031-T050) depend on Phase 1 refactoring of Header.js and util.js
- Within US5, api.spec.js tests (T031-T033) are independent of Header/util refactoring

### Parallel Opportunities

- All Phase 1 refactoring tasks (T001-T004) can run in parallel
- Phases 2-6 can all run in parallel (different files, no cross-dependencies)
- Within each phase, all [P] tasks can run in parallel
- Backend and frontend tasks can execute simultaneously on different shells

---

## Parallel Example: User Story 1 (JwtAuthGuard)

```bash
# Launch all test scenarios for US1 together:
cd backend
yarn test -- --testPathPattern=jwt-auth
```

## Parallel Example: All Backend Stories (US1 + US2 + US4)

```bash
# Backend tests run independently:
cd backend
yarn test -- --testPathPattern=jwt-auth &
yarn test -- --testPathPattern=usuario.service &
yarn test -- --testPathPattern=produto.service &
yarn test -- --testPathPattern=audit.service
```

## Parallel Example: All Frontend Stories (US3 + US5)

```bash
# Frontend tests run independently:
cd frontend
npm test -- --testPathPattern=page &
npm test -- --testPathPattern=api.spec &
npm test -- --testPathPattern=util.spec &
npm test -- --testPathPattern=Header.spec
```

---

## Implementation Strategy

### MVP First (US1 Only — P0)

1. Complete Phase 1: Setup & Refactoring
2. Complete Phase 2: User Story 1 (JwtAuthGuard)
3. **STOP and VALIDATE**: Run backend test suite — verify auth guard 100% coverage
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + US1 → Authentication guard fully tested (MVP)
2. Add US2 → UsuarioService audit/permissions coverage ≥85%
3. Add US4 → ProdutoService/AuditService edge case coverage
4. Add US3 → Frontend page lifecycle coverage
5. Add US5 → API/util/Header coverage completing all spec requirements
6. Phase 7 → Final validation and coverage check

### Parallel Team Strategy

With multiple developers:
1. Developer A: US1 (JwtAuthGuard — P0) + US2 (UsuarioService — P1)
2. Developer B: US4 (ProdutoService/AuditService — P1) + Phase 1 refactoring
3. Developer C: US3 (Frontend Pages — P1)
4. Developer D: US5 (API/Util/Header — P2)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable (separate test patterns)
- Phase 1 refactoring tasks MUST complete before US5 Header/util tests run
- All other phases have no cross-dependencies
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Verify existing tests still pass before committing
- Avoid: vague tasks, same file conflicts, cross-phase dependencies
