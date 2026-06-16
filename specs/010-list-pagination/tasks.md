---
description: "Task list for Controle de Paginação para Listas feature"
---

# Tasks: Controle de Paginação para Listas

**Input**: Design documents from `/specs/010-list-pagination/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test-First (TDD) is mandated by the project constitution (Principle III, NON-NEGOTIABLE). Each user story MUST have its tests written and failing (RED) before implementation (GREEN) begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup

**Purpose**: Verify backend readiness and confirm no backend changes needed

- [X] T001 Verify all 4 CRUD endpoints return `PaginatedResponse` format (`{ data, total, skip, take }`) — backend/src/modules/produto/dto/paginated-response.dto.ts
- [X] T002 [P] Verify frontend api.js already passes skip/take params — frontend/src/services/api.js

> **Note**: Backend requires zero changes. Existing tests (163 backend, 161 frontend) should all pass without modification.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared pagination infrastructure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create a reusable pagination bar component template (HTML structure + CSS) — implemented `createPaginationBar`, `createListSkeleton`, `createCardSkeleton` in frontend/src/shared/util.js
- [X] T004 [P] Add `getPageSize(pageName)` utility in frontend/src/shared/util.js — returns `take` value per page (produto/usuario: 10, mesa: 8, comanda: 6, home: 8)
- [X] T005 [P] Create `PaginationState` helper in frontend/src/shared/util.js — manages currentPage, totalPages, totalRecords, skip calculation, next/prev/reset logic

**Checkpoint**: Foundation ready — all user stories can now use shared pagination utilities

---

## Phase 3: User Story 1 — Navegação Paginada nas Listas CRUD (Priority: P1) 🎯 MVP

**Goal**: Admin/waiter can paginate through usuario, produto, mesa, and comanda lists with buttons. No scrollbar on CRUD lists. Pagination controls use sticky bottom bar with 48px touch targets. Skeleton loader during transitions.

**Independent Test**: Open any CRUD list page. Verify: (a) one page of records visible, (b) "Anterior"/"Próxima" buttons in sticky bottom bar, (c) no vertical scrollbar on viewport >=768px, (d) clicking "Próxima" loads next page with skeleton, (e) buttons disable at boundaries, (f) "Total: N registro(s)" visible.

### Tests for User Story 1 (RED phase — MUST fail before implementation) ⚠️

- [X] T005a [P] [US1] Write failing test: pagination controls render on ListProdutoPage in frontend/src/pages/produto/ListProdutoPage.spec.js
- [X] T005b [P] [US1] Write failing test: clicking "Próxima" fetches next page on ListUsuarioPage in frontend/src/pages/usuario/ListUsuarioPage.spec.js
- [X] T005c [P] [US1] Write failing test: "Anterior" disabled on first page, "Próxima" disabled on last page on ListMesaPage in frontend/src/pages/mesa/ListMesaPage.spec.js
- [X] T005d [P] [US1] Write failing test: skeleton loader shows during page transition on ListComandaPage in frontend/src/pages/comanda/ListComandaPage.spec.js

**Checkpoint**: Tests written and failing (RED) — proceed to implementation

### Implementation for User Story 1

- [X] T006 [P] [US1] Refactor ListProdutoPage.js — replace virtual scroll + ion-infinite-scroll with pagination controls in frontend/src/pages/produto/ListProdutoPage.js
- [X] T007 [P] [US1] Refactor ListUsuarioPage.js — replace virtual scroll + ion-infinite-scroll with pagination controls in frontend/src/pages/usuario/ListUsuarioPage.js
- [X] T008 [P] [US1] Refactor ListMesaPage.js — replace ion-infinite-scroll with pagination controls in frontend/src/pages/mesa/ListMesaPage.js
- [X] T009 [P] [US1] Refactor ListComandaPage.js — replace ion-infinite-scroll with pagination controls in frontend/src/pages/comanda/ListComandaPage.js
- [X] T010 [US1] Add skeleton loader rendering during page transitions to all 4 CRUD list pages (match existing ITEM_HEIGHT=72px row shape) — via shared `createListSkeleton()` in loadPage()
- [X] T011 [US1] Add total record count display ("Total: N registro(s)") to all 4 CRUD list pages (US3 integration) — via shared `renderPaginationBar()`
- [X] T012 [US1] Verify no vertical scrollbar on any CRUD list page at viewport height >=768px — added `ion-content-no-scroll` CSS class with `--overflow: hidden`
- [X] T013 [US1] Update existing frontend tests to reflect pagination controls instead of infinite scroll — frontend/src/pages/*/*.spec.js

**Checkpoint**: All 4 CRUD list pages fully paginated, independently testable

---

## Phase 4: User Story 2 — Paginação nos Cards da Cozinha (Priority: P2)

**Goal**: Cook can paginate through kitchen card grid. Grid container scrolls internally (`overflow-y: auto`) when cards exceed available height. Pagination controls fixed below the grid.

**Independent Test**: Open /home with >1 page of active comandas. Verify: (a) first page of cards shown, (b) pagination controls below grid, (c) clicking "Próxima" loads next page and scrolls grid to top, (d) grid scrolls internally when cards exceed height, (e) page indicator updates correctly.

### Tests for User Story 2 (RED phase — MUST fail before implementation) ⚠️

- [X] T013a [P] [US2] Write failing test: pagination controls render on HomePage in frontend/src/pages/home/HomePage.spec.js
- [X] T013b [P] [US2] Write failing test: kitchen card grid scrolls internally when content overflows in frontend/src/pages/home/HomePage.spec.js

**Checkpoint**: Tests written and failing (RED) — proceed to implementation

### Implementation for User Story 2

- [X] T014 [P] [US2] Update HomePage.js — add skip/take params to api.getComandas() call in frontend/src/pages/home/HomePage.js
- [X] T015 [P] [US2] Add pagination state management (currentPage, totalPages) to HomePage.js — frontend/src/pages/home/HomePage.js
- [X] T016 [P] [US2] Add pagination controls bar (sticky below grid) to HomePage.js template — frontend/src/pages/home/HomePage.js
- [X] T017 [P] [US2] Add skeleton card loaders during page transitions in HomePage.js — frontend/src/pages/home/HomePage.js
- [X] T018 [US2] Ensure `.comandas-grid` container has `overflow-y: auto` and pagination controls stay fixed below — frontend/src/pages/home/HomePage.css
- [X] T019 [US2] Add auto-scroll-to-top of grid on page change in HomePage.js — frontend/src/pages/home/HomePage.js
- [X] T020 [US2] Add total record count display ("Total: N comanda(s)") to home page (US3 integration) — frontend/src/pages/home/HomePage.js

**Checkpoint**: Kitchen view fully paginated with internal scroll

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 [P] Add empty state handling — hide pagination controls and show "Nenhum registro encontrado" when list is empty (FR-009) across all 5 pages
- [X] T022 [P] Add single-page state handling — hide navigation buttons but keep total count when only 1 page (FR-011) across all 5 pages
- [X] T023 [P] Add error handling — show toast on pagination failure, restore previous page content — across all 5 pages
- [X] T024 [P] Verify pagination resets to page 1 when navigating away and back (FR-012) across all 5 pages
- [X] T025 [P] Add loading state guard — disable pagination buttons during active transition to prevent double-fetch on all 5 pages
- [X] T026 Clean up unused virtual-scroll.js imports and ion-infinite-scroll references from all modified pages — frontend/src/pages/*/
- [X] T027 Remove unused virtual-scroll.js shared module if no remaining consumers — frontend/src/shared/virtual-scroll.js
- [X] T028 Run `npm test` and ensure all existing + updated frontend tests pass — frontend/
- [ ] T029 [P] Verify page transition time is <2 seconds (SC-002) under normal network conditions on all 5 pages — manual test with browser DevTools Network tab

---

## Phase 6: Responsive Page Size (Added 2026-06-16)

**Purpose**: Replace fixed PAGE_SIZES with dynamic calculation based on viewport height (FR-013/FR-014). Bug found during testing: fixed values caused overflow below footer.

- [X] T030 Add `PAGE_LAYOUT` constant and `calculateResponsivePageSize(pageName)` to `frontend/src/shared/util.js`
- [X] T031 [P] Update all 5 list pages (produto, usuario, mesa, comanda, home) to use `calculateResponsivePageSize` instead of `getPageSize` — `frontend/src/pages/*/`
- [X] T032 [P] Update all 5 test spec files with mock for `calculateResponsivePageSize` — `frontend/src/pages/*/*.spec.js`
- [X] T033 Run `npm test` — verify 216 tests pass (no regressions) — `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify readiness
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational — independent of US1
- **Polish (Phase 5)**: Depends on both US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Fully independent — 4 CRUD list pages can be done in any order
- **User Story 2 (P2)**: Fully independent from US1 — home page is a separate component
- **User Story 3 (P3)**: Integrated into US1 (T011) and US2 (T020) — not a standalone phase

### Within Each User Story

- Shared pagination utility (Phase 2) before page refactors
- Individual page refactors can proceed in parallel (all [P] within US1)
- Core pagination logic before empty/single-page/error state polish

### Parallel Opportunities

- Phase 1 tasks T001 and T002 are independent
- Phase 2 tasks T003, T004, T005 are independent
- Phase 3 tasks T006-T009 (all 4 CRUD lists) can run in parallel — different files, no shared state
- Phase 4 tasks T014-T017 can run in parallel within US2
- Polish tasks T021-T025 can all run in parallel (cross-cutting but independent files)

---

## Parallel Example: User Story 1

```bash
# All 4 CRUD list pages can be refactored in parallel:
Task: "Refactor ListProdutoPage.js — frontend/src/pages/produto/ListProdutoPage.js"
Task: "Refactor ListUsuarioPage.js — frontend/src/pages/usuario/ListUsuarioPage.js"
Task: "Refactor ListMesaPage.js — frontend/src/pages/mesa/ListMesaPage.js"
Task: "Refactor ListComandaPage.js — frontend/src/pages/comanda/ListComandaPage.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (all 4 CRUD pages — can parallelize)
4. **STOP and VALIDATE**: All 4 CRUD lists paginated, no scrollbar
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → pagination utilities ready
2. Add US1 (CRUD lists) → Test independently → Deploy (MVP!)
3. Add US2 (Kitchen cards) → Test independently → Deploy
4. Add Polish (empty state, error handling) → Deploy

### Parallel Team Strategy

With multiple developers:

1. Complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 pages (produto + usuario)
   - Developer B: US1 pages (mesa + comanda)
   - Developer C: US2 (home page)
3. Stories complete and integrate independently

---

## Notes

- Backend requires **zero changes** — all pagination support already exists
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 37 tasks (2 Setup + 3 Foundational + 4 test-RED[US1] + 8 US1 impl + 2 test-RED[US2] + 7 US2 impl + 7 Polish + 4 Phase 6)
