# Tasks: Responsividade com Media Queries

**Input**: Design documents from `specs/005-responsividade-media-queries/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Per Constitution Principle III (NON-NEGOTIABLE), tests MUST be written and failing before implementation (RED-GREEN-REFACTOR).

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/pages/`
- Paths shown follow the project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline and confirm prerequisites are in place

- [X] T001 Run `npm test` inside `frontend/` to confirm all tests pass before any changes
- [X] T002 Confirm Fase 3 (Layout e Espaçamento Mobile) is complete: verify `HomePage.css` uses `minmax(280px, 1fr)` and `ListProdutoPage.css`/`ListUsuarioPage.css`/`ListMesaPage.css` have `padding: 16px` — padding OK, HomePage still uses `minmax(320px, 1fr)` — will correct in T007

**Checkpoint**: Baseline confirmed — known-good state, Fase 3 prerequisites verified

---

## Phase 2: US-R01 — Grid Adaptável da Cozinha (Priority: P1) 🎯 MVP

**Goal**: HomePage grid adapts columns per viewport — 1 col ≤360px, 2 col ≥768px, 3 col ≥1024px, 4 col ≥1400px

**Independent Test**: Resize browser to 320px→1 column, 768px→2 columns, 1024px→3 columns, 1400px→4 columns. No horizontal scroll.

### Tests ⚠️ — MUST fail before implementation

- [ ] T003 [P] [US1] Write test: HomePage grid shows 1 column at ≤360px in `frontend/src/pages/home/HomePage.spec.js`
- [ ] T004 [P] [US1] Write test: HomePage grid shows 2 columns at ≥768px in `frontend/src/pages/home/HomePage.spec.js`
- [ ] T005 [P] [US1] Write test: HomePage grid shows 3 columns at ≥1024px in `frontend/src/pages/home/HomePage.spec.js`
- [ ] T006 [P] [US1] Write test: HomePage grid shows 4 columns at ≥1400px in `frontend/src/pages/home/HomePage.spec.js`

### Implementation

- [ ] T007 [US1] Add media queries to `frontend/src/pages/home/HomePage.css` — `max-width: 360px` (1fr), `min-width: 768px` (repeat 2), `min-width: 1024px` (repeat 3), `min-width: 1400px` (repeat 4)

**Checkpoint**: US-R01 fully functional — grid adapts across all breakpoints

---

## Phase 3: US-R02 — Login Responsivo (Priority: P2)

**Goal**: Login form centered with max-width 400px on desktop (≥1024px)

**Independent Test**: Resize browser to ≥1024px → login form centered, max-width 400px. Resize to <1024px → full width.

### Tests ⚠️

- [ ] T008 [P] [US2] Write test: LoginPage has `max-width: 400px` and `margin: 0 auto` at ≥1024px in `frontend/src/pages/login/LoginPage.spec.js`

### Implementation

- [ ] T009 [US2] Add media query `min-width: 1024px` with `max-width: 400px; margin: 0 auto` to `.login-container` in `frontend/src/pages/login/LoginPage.css`

**Checkpoint**: US-R02 fully functional — login adapts on desktop

---

## Phase 4: US-R03 — Listagens Adaptáveis (Priority: P2)

**Goal**: All 4 CRUD list pages show cards in responsive grid (2/3/4 columns at 768/1024/1400px)

**Independent Test**: Open any list page at ≥768px → 2 columns; ≥1024px → 3 columns; ≥1400px → 4 columns

### Tests ⚠️

- [ ] T010 [P] [US3] Write test: ListProdutoPage shows grid columns at breakpoints in `frontend/src/pages/produto/ListProdutoPage.spec.js`
- [ ] T011 [P] [US3] Write test: ListUsuarioPage shows grid columns at breakpoints in `frontend/src/pages/usuario/ListUsuarioPage.spec.js`
- [ ] T012 [P] [US3] Write test: ListMesaPage shows grid columns at breakpoints in `frontend/src/pages/mesa/ListMesaPage.spec.js`
- [ ] T013 [P] [US3] Write test: ListComandaPage shows grid columns at breakpoints in `frontend/src/pages/comanda/ListComandaPage.spec.js`

### Implementation

- [ ] T014 [P] [US3] Add media queries to `frontend/src/pages/produto/ListProdutoPage.css` — display:grid with 2/3/4 columns at 768/1024/1400px
- [ ] T015 [P] [US3] Add media queries to `frontend/src/pages/usuario/ListUsuarioPage.css` — same grid pattern
- [ ] T016 [P] [US3] Add media queries to `frontend/src/pages/mesa/ListMesaPage.css` — same grid pattern
- [ ] T017 [P] [US3] Add media queries to `frontend/src/pages/comanda/ListComandaPage.css` — same grid pattern

**Checkpoint**: US-R03 fully functional — all list pages responsive

---

## Phase 5: US-R04 — Formulários Otimizados (Priority: P3)

**Goal**: All 8 CRUD form pages (Reg + Update for Produto, Usuario, Mesa, Comanda) show centered form with max-width 600px on tablet/desktop (≥768px)

**Independent Test**: Open any form page at ≥768px → form centered, max-width 600px. At <768px → full width.

### Tests ⚠️

- [ ] T018 [P] [US4] Write test: RegProdutoPage has max-width 600px centered at ≥768px in `frontend/src/pages/produto/RegProdutoPage.spec.js`
- [ ] T019 [P] [US4] Write test: UpdateProdutoPage has max-width 600px centered at ≥768px in `frontend/src/pages/produto/UpdateProdutoPage.spec.js`
- [ ] T020 [P] [US4] Write test: RegUsuarioPage has max-width 600px centered at ≥768px in `frontend/src/pages/usuario/RegUsuarioPage.spec.js`
- [ ] T021 [P] [US4] Write test: UpdateUsuarioPage has max-width 600px centered at ≥768px in `frontend/src/pages/usuario/UpdateUsuarioPage.spec.js`
- [ ] T022 [P] [US4] Write test: RegMesaPage has max-width 600px centered at ≥768px in `frontend/src/pages/mesa/RegMesaPage.spec.js`
- [ ] T023 [P] [US4] Write test: UpdateMesaPage has max-width 600px centered at ≥768px in `frontend/src/pages/mesa/UpdateMesaPage.spec.js`
- [ ] T024 [P] [US4] Write test: RegComandaPage has max-width 600px centered at ≥768px in `frontend/src/pages/comanda/RegComandaPage.spec.js`
- [ ] T025 [P] [US4] Write test: UpdateComandaPage has max-width 600px centered at ≥768px in `frontend/src/pages/comanda/UpdateComandaPage.spec.js`

### Implementation

- [ ] T026 [P] [US4] Add media query `min-width: 768px` with `max-width: 600px; margin: 0 auto` targeting `ion-content.ion-padding form` in `frontend/src/pages/produto/RegProdutoPage.css`
- [ ] T027 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/produto/UpdateProdutoPage.css`
- [ ] T028 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/usuario/RegUsuarioPage.css`
- [ ] T029 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/usuario/UpdateUsuarioPage.css`
- [ ] T030 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/mesa/RegMesaPage.css`
- [ ] T031 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/mesa/UpdateMesaPage.css`
- [ ] T032 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/comanda/RegComandaPage.css`
- [ ] T033 [P] [US4] Add same media query targeting `ion-content.ion-padding form` to `frontend/src/pages/comanda/UpdateComandaPage.css`

**Checkpoint**: US-R04 fully functional — all forms responsive

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T034 Run `npm test` — confirm all tests pass (new + existing)
- [ ] T035 Run `npm run build` — confirm production build succeeds
- [ ] T036 [P] Write automated overflow test: verify `document.documentElement.scrollWidth <= window.innerWidth` at each breakpoint in a shared test helper
- [ ] T037 [P] Write automated touch target test: verify all interactive elements (buttons, `ion-item`, inputs) have computed `min-height >= 44px` at breakpoints 320px, 768px, 1024px in a shared test helper
- [ ] T038 Verify all 7 success criteria (CS-R01 through CS-R07) manually on viewports 320px, 375px, 414px, 768px, 1024px, 1400px

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **US-R01 (Phase 2, P1 MVP)**: Depends on Phase 1
- **US-R02 (Phase 3, P2)**: Depends on Phase 1 — independent of US-R01 (different files)
- **US-R03 (Phase 4, P2)**: Depends on Phase 1 — independent of all above
- **US-R04 (Phase 5, P3)**: Depends on Phase 1 — independent of all above
- **Polish (Phase 6)**: Depends on all prior phases complete

### User Story Dependencies

- **US-R01 (P1)**: No dependencies on other stories — can start immediately after Setup
- **US-R02 (P2)**: No dependencies on other stories — different file (LoginPage.css)
- **US-R03 (P2)**: No dependencies on other stories — different files (list CSS)
- **US-R04 (P3)**: No dependencies on other stories — different files (form CSS)

### Parallel Opportunities

- All tasks within Phase 2 marked [P] can run in parallel (different test assertions)
- All tasks within Phase 4 marked [P] can run in parallel (4 different list CSS files)
- All tasks within Phase 5 marked [P] can run in parallel (8 different form CSS files)
- Phases 2, 3, 4, 5 can all run in parallel with each other (different files)

---

## Parallel Example: Phase 4 (Listagens — 4 CSS files)

```bash
# All 4 list files can be implemented in parallel:
Task: T014 ListProdutoPage.css
Task: T015 ListUsuarioPage.css
Task: T016 ListMesaPage.css
Task: T017 ListComandaPage.css
```

## Parallel Example: Phase 5 (Formulários — 8 CSS files)

```css
/* All 8 form CSS files use the same selector: ion-content.ion-padding form */
@media (min-width: 768px) {
  ion-content.ion-padding form {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

```bash
# All 8 form CSS files can be implemented in parallel:
Task: T026 RegProdutoPage.css
Task: T027 UpdateProdutoPage.css
Task: T028 RegUsuarioPage.css
Task: T029 UpdateUsuarioPage.css
Task: T030 RegMesaPage.css
Task: T031 UpdateMesaPage.css
Task: T032 RegComandaPage.css
Task: T033 UpdateComandaPage.css
```

---

## Implementation Strategy

### MVP First (US-R01 Only)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: US-R01 (kitchen grid)
3. **STOP and VALIDATE**: Test grid manually at all breakpoints
4. MVP = Kitchen grid responsive

### Incremental Delivery

1. US-R01 (Grid cozinha) → Deploy/Demo 🚀
2. Add US-R02 (Login responsivo) → Deploy/Demo
3. Add US-R03 (Listagens adaptáveis) → Deploy/Demo
4. Add US-R04 (Formulários otimizados) → Deploy/Demo
5. Polish → Final release
