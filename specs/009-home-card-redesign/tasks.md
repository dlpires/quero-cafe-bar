# Tasks: Redesign dos Cartões da Visão Cozinha

**Input**: Design documents from `/specs/009-home-card-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/card-layout.md, quickstart.md

**Tests**: Included — existing test suite must be updated per constitution principle III (Test-First, non-negotiable). Updated tests MUST fail before implementation begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/pages/home/`
- **Affected files**: `HomePage.js`, `HomePage.css`, `HomePage.spec.js`

---

## Phase 1: Setup (Verify Current State)

**Purpose**: Ensure existing test suite passes as baseline before any changes

- [x] T001 Run `cd frontend && npm test` to verify all 20 suites / 161 tests pass as baseline
- [x] T002 Run `cd frontend && npm run dev` and visually inspect current /home page at 320px, 768px, 1024px, 1920px widths — document the quantity cut-off issue

---

## Phase 2: Foundational (Prerequisites)

**Purpose**: No additional dependencies needed. This is a pure CSS/HTML refactoring of existing files. Skip to Phase 3.

**Checkpoint**: Setup verified — user story implementation can now begin.

---

## Phase 3: User Story 1 - Visualização Clara de Produtos e Quantidades (Priority: P1)

**Goal**: Product name and quantity are always visible. Name truncates with ellipsis when needed; quantity never cut off.

**Independent Test**: Render a comanda with a 30+ character product name and 2-digit quantity at 320px width — quantity badge must be 100% visible without horizontal scroll.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T003 [US1] Update card render tests in `frontend/src/pages/home/HomePage.spec.js` — change assertions from `h3` to new `<h2>` + `<p>` two-line structure; add test for quantity visibility at narrow card width
- [x] T004 [US1] Add test for product name truncation with ellipsis (`text-overflow: ellipsis`) when name exceeds available width in `frontend/src/pages/home/HomePage.spec.js`

### Implementation for User Story 1

- [x] T005 [US1] Refactor `renderComandaCard()` HTML in `frontend/src/pages/home/HomePage.js` — replace single-line `h3` with `ion-badge` with two-line `ion-label` structure (`<h2>` for name, `<p>` for quantity)
- [x] T006 [US1] Add CSS for `.item-label`, `.item-name` (truncation), `.item-qty` (flex-shrink:0) in `frontend/src/pages/home/HomePage.css`
- [x] T007 [US1] Run `cd frontend && npm test` and verify tests pass (should now pass with new structure)

**Checkpoint**: Product names truncate with ellipsis, quantities always visible at any screen width.

---

## Phase 4: User Story 2 - Identificação Rápida do Status de Entrega (Priority: P1)

**Goal**: Items show pending/delivered status via subtle `border-left` only — no colored backgrounds. Card header icon reflects global delivery status.

**Independent Test**: Render a comanda with mixed item statuses. Verify colored backgrounds are absent; only `border-left` colored bars indicate status. Verify header icon updates when all items are delivered.

### Tests for User Story 2

- [x] T008 [US2] Add tests for status indication in `frontend/src/pages/home/HomePage.spec.js` — assert `border-left` present, assert no `rgba` background on items, verify header icon changes to `checkmark-circle` when all items delivered
- [x] T009 [US2] Update existing card render tests to check new header structure (flex layout with icon sibling, no `card-header-content` div wrapper)

### Implementation for User Story 2

- [x] T010 [US2] Remove `--background: rgba(...)` rules from `.item-pending` and `.item-delivered` in `frontend/src/pages/home/HomePage.css` — keep only `border-left`
- [x] T011 [US2] Remove text color overrides (`var(--ion-color-danger-shade)`, `var(--ion-color-success-shade)`) from status classes in `frontend/src/pages/home/HomePage.css` — use default text color
- [x] T012 [US2] Refactor card header in `renderComandaCard()` in `frontend/src/pages/home/HomePage.js` — simplify to `ion-card-title` + `ion-icon` as siblings in flex header, remove `card-header-content` div
- [x] T013 [US2] Add CSS for `.comanda-card ion-card-header` flex layout with `card-status-icon` in `frontend/src/pages/home/HomePage.css`
- [x] T014 [US2] Run `cd frontend && npm test` and verify status-indicator tests pass

**Checkpoint**: Status visible via left border only, no visual pollution from background colors, card header clean.

---

## Phase 5: User Story 3 + User Story 4 - Touch Targets + Layout Responsivo (Priority: P2)

**Goal**: Status select controls have minimum 44x44px touch area. Grid uses explicit media query breakpoints for predictable responsive behavior at all screen sizes.

**Independent Test** (US3): Measure touch area of status select — must be ≥44×44px.  
**Independent Test** (US4): Resize browser from 320px to 1920px — verify 1, 2, 3, 4 column layout at correct breakpoints. No horizontal scroll at any width.

### Tests for User Story 3 & 4

- [x] T015 [US3] Add test for touch target dimensions in `frontend/src/pages/home/HomePage.spec.js` — verify `--min-height: 44px` on status select and `--min-height: 48px` on ion-item
- [x] T016 [US4] Update responsive grid tests in `frontend/src/pages/home/HomePage.spec.js` — replace old `auto-fill` assertions with explicit breakpoint tests: 1fr at ≤480px, 2fr at 481-900px, 3fr at 901-1200px, 4fr at ≥1201px
- [x] T017 [US4] Add test for no horizontal overflow at 320px in `frontend/src/pages/home/HomePage.spec.js` — verify container padding doesn't cause overflow

### Implementation for User Story 3 & 4

- [x] T018 [US3] Add `--min-height: 44px` and `min-width: 100px` to `.item-status-select` in `frontend/src/pages/home/HomePage.css`
- [x] T019 [US3] Add `--min-height: 48px` to `.comanda-item` and ensure `padding: 8px` vertical spacing in `frontend/src/pages/home/HomePage.css`
- [x] T020 [US4] Replace `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` with 4 explicit media query breakpoints in `frontend/src/pages/home/HomePage.css`:
  - ≤480px: `1fr`
  - 481–900px: `repeat(2, 1fr)`
  - 901–1200px: `repeat(3, 1fr)`
  - ≥1201px: `repeat(4, 1fr)`
- [x] T021 [US4] Update `.home-container` padding to use percentage-based padding on mobile viewports in `frontend/src/pages/home/HomePage.css`
- [x] T022 [US4] Run `cd frontend && npm test` and verify responsive + touch-target tests pass

**Checkpoint**: Grid adapts predictably at all breakpoints, touch targets meet WCAG 44x44px minimum.

---

## Phase 6: User Story 5 - Navegação Acessível por Leitor de Tela (Priority: P3)

**Goal**: Cards have `role="region"` and `aria-labelledby`. Items announce name, quantity, and status to screen readers.

**Independent Test**: Navigate with NVDA or VoiceOver — each card announced as "Comanda N, Mesa M", each item announced with product name, quantity, and delivery status.

### Tests for User Story 5

- [x] T023 [US5] Add tests for ARIA attributes in `frontend/src/pages/home/HomePage.spec.js` — verify `role="region"` and `aria-labelledby` present on `ion-card`, verify `aria-label` on `ion-select` includes product name and status
- [x] T024 [US5] Add test for `aria-hidden="true"` on card status icon (`card-status-icon`) in `frontend/src/pages/home/HomePage.spec.js`

### Implementation for User Story 5

- [x] T025 [US5] Add `role="region"` and `aria-labelledby="comanda-title-{id}"` to `ion-card` in `renderComandaCard()` in `frontend/src/pages/home/HomePage.js`
- [x] T026 [US5] Add `id="comanda-title-{id}"` to `ion-card-title` in `renderComandaCard()` in `frontend/src/pages/home/HomePage.js`
- [x] T027 [US5] Add dynamic `aria-label="Status de {produto}: {statusText}"` to each `ion-select` in `renderComandaCard()` in `frontend/src/pages/home/HomePage.js`
- [x] T028 [US5] Add `aria-hidden="true"` to the status `ion-icon` in card header in `renderComandaCard()` in `frontend/src/pages/home/HomePage.js`
- [x] T029 [US5] Run `cd frontend && npm test` and verify ARIA tests pass

**Checkpoint**: Screen reader announces all card and item information correctly.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, code quality, and documentation

- [x] T030 Run full test suite `cd frontend && npm test` — all 20+ suites must pass
- [x] T031 Run `cd frontend && npm run build` to verify production build succeeds
- [x] T032 Visual QA: test /home page at 320px, 480px, 768px, 1024px, 1440px, 1920px — verify no horizontal scroll, quantities visible, clean status indicators
- [x] T033 Validate WCAG AA contrast: run a contrast checker on pending/delivered text colors against card background — must be ≥4.5:1
- [x] T034 Run `cd frontend && npm run test:coverage` — verify coverage did not decrease from baseline
- [x] T035 Run `cd frontend && npm run dev` and verify quickstart.md validation checklist items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Skipped — no new infrastructure needed
- **US1 (Phase 3)**: Depends on Phase 1 (baseline verified) — BLOCKS US2
- **US2 (Phase 4)**: Depends on US1 (new HTML structure must exist before status CSS is finalized)
- **US3+US4 (Phase 5)**: Depends on US2 (uses the same CSS file; builds on status/header changes)
- **US5 (Phase 6)**: Depends on US1 (new HTML structure) but can run in parallel with US2-US4 for CSS-only changes
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Independent starting point — two-line layout must be first
- **US2 (P1)**: Depends on US1 (removes backgrounds from new structure)
- **US3 (P2)**: Depends on US2 (touch targets on refined components)
- **US4 (P2)**: Independent — can be done in parallel with US3
- **US5 (P3)**: Depends on US1 (ARIA on new HTML); can parallel with US2-US4

### Within Each User Story

- Tests written FIRST and verified FAILING before implementation
- CSS implementation tasks can be parallelized with JS tasks (different files)
- Implementation complete before test verification

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T015 [US3] + T016 [US4] tests can be written in parallel (different sections of spec file)
- T018 [US3] + T020 [US4] CSS changes can be done in parallel (same file but different selectors)
- T025-T028 [US5] are in same file but different sections — sequential recommended due to shared function

---

## Parallel Example: Phase 5 (US3 + US4)

```bash
# Launch test writing in parallel:
Task: "T015 [US3] Add test for touch target dimensions in frontend/src/pages/home/HomePage.spec.js"
Task: "T016 [US4] Update responsive grid tests in frontend/src/pages/home/HomePage.spec.js"

# After tests fail, launch CSS implementation in parallel:
Task: "T018 [US3] Add --min-height touch target CSS in frontend/src/pages/home/HomePage.css"
Task: "T020 [US4] Replace grid with explicit breakpoints in frontend/src/pages/home/HomePage.css"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 3: US1 (two-line layout, quantity always visible)
3. Complete Phase 4: US2 (clean status indicators, no backgrounds)
4. **STOP and VALIDATE**: Test independently at all breakpoints
5. Core problem solved — quantities visible, interface clean

### Incremental Delivery

1. Setup → Baseline verified
2. Add US1 → Quantities visible at all widths (core fix!)
3. Add US2 → Clean UI without visual fatigue
4. Add US3+US4 → Touch-friendly + predictable responsive grid
5. Add US5 → Full accessibility compliance
6. Polish → Final validation and production build

### Single Developer Strategy

Since all changes affect the same 3 files, sequential execution is required:
1. T001-T002 (Setup)
2. T003-T007 (US1: write tests → fail → implement → pass)
3. T008-T014 (US2: write tests → fail → implement → pass)
4. T015-T022 (US3+US4: write tests → fail → implement → pass)
5. T023-T029 (US5: write tests → fail → implement → pass)
6. T030-T035 (Polish: full validation)

---

## Notes

- All tasks modify files under `frontend/src/pages/home/` only — no backend changes
- The 3 affected files: `HomePage.js` (HTML generation), `HomePage.css` (styling), `HomePage.spec.js` (tests)
- CSS changes for US3 and US4 both modify `HomePage.css` — complete US3 then US4 sequentially to avoid merge conflicts
- Test file changes in each phase must be cumulative — don't revert previous phase's test updates
- Commit after each phase completes (all tests passing)
- Reference `contracts/card-layout.md` for exact HTML structure and CSS rules
