# Tasks: UX CRUD Improvements

**Input**: Design documents from `specs/003-ux-crud-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included per Constitution v1.0.0 — Test-First is NON-NEGOTIABLE. Tests MUST be written and failing before implementation.

**Organization**: Tasks grouped by user story. US1+US2+US3 share implementation files (same `handleSubmit` across 8 pages) — combined into one phase with traceability to all three stories.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline and confirm shared utilities exist

- [X] T001 Run `npm test` to confirm all 105 frontend tests pass before any changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify no foundational work is needed — shared utilities from spec 001 already exist

- [X] T002 Confirm `showToast`, `withLoading`, `createEmptyState`, `validateRequired`, `validatePositiveNumber` all exported from `frontend/src/shared/util.js`
- [X] T003 Confirm `api.js:53-54` already uses `localStorage.removeItem('token')` (not `clear()`) — US4 is already done
- [X] T004 Confirm `showToast()` in `util.js:13-24` already removes toast from DOM after `onWillDismiss()` — US7 is already done

**Checkpoint**: Foundation ready — known-good state confirmed, shared utils available

---

## Phase 3: User Story 1+2+3 — Form Behavior Improvements (Priority: P1) 🎯 MVP

**Goal**: All 8 CRUD form pages (Reg/Update for Produto, Usuario, Mesa, Comanda) get: success toast after save, button disabled+loading during submit, frontend validation before API call

**Independent Test**: Open any form page, leave required field empty → error shown without API call. Fill valid data → submit → button shows "Salvando..." → toast appears → navigates back. Quick double-click → only one request sent.

**Note**: US1 (toast), US2 (button disable), US3 (validation) all modify the same `handleSubmit` method in same 8 files. Combined here for implementation efficiency. Each file gets modified once with all three behaviors.

### Tests for User Stories 1+2+3 ⚠️ — MUST fail before implementation

- [X] T005 [P] [US1+US2+US3] Write test: RegProdutoPage shows success toast after save in `frontend/src/pages/produto/RegProdutoPage.spec.js`
- [X] T006 [P] [US1+US2+US3] Write test: RegProdutoPage disables button and shows "Salvando..." during submit in `frontend/src/pages/produto/RegProdutoPage.spec.js`
- [X] T007 [P] [US1+US2+US3] Write test: RegProdutoPage shows validation error and blocks API call when fields empty in `frontend/src/pages/produto/RegProdutoPage.spec.js`
- [X] T008 [P] [US1+US2+US3] Write test: UpdateProdutoPage shows update success toast after save in `frontend/src/pages/produto/UpdateProdutoPage.spec.js`
- [X] T009 [P] [US1+US2+US3] Write test: UpdateProdutoPage re-enables button on error in `frontend/src/pages/produto/UpdateProdutoPage.spec.js`
- [X] T010 [P] [US1+US2+US3] Write test: RegUsuarioPage validation with required fields in `frontend/src/pages/usuario/RegUsuarioPage.spec.js`
- [X] T011 [P] [US1+US2+US3] Write test: RegMesaPage shows toast and button states in `frontend/src/pages/mesa/RegMesaPage.spec.js`
- [X] T012 [P] [US1+US2+US3] Write test: RegComandaPage shows toast on comanda created in `frontend/src/pages/comanda/RegComandaPage.spec.js`

### Implementation for User Stories 1+2+3 — Produto pages (pilot entity, then replicate)

- [X] T013 [US1+US2+US3] Add `showToast`, `withLoading`, `validateRequired`, `validatePositiveNumber` imports to `RegProdutoPage.js` and `UpdateProdutoPage.js`
- [X] T014 [US1+US2+US3] Implement `handleSubmit` in `RegProdutoPage.js`: validate fields → if invalid, call `focusFirstElement(form)` on first invalid field and return → disable button + show "Salvando..." → `withLoading(api.addProduto(...))` → showToast success → navigate back. On error: re-enable button, showToast error
- [X] T015 [US1+US2+US3] Implement `handleSubmit` in `UpdateProdutoPage.js`: same pattern with "Registro atualizado com sucesso!" toast
- [X] T016 [P] [US1+US2+US3] Replicate form improvements to `RegUsuarioPage.js` and `UpdateUsuarioPage.js` (validate: nome, login, senha, confirmar_senha, id_perfil)
- [X] T017 [P] [US1+US2+US3] Replicate form improvements to `RegMesaPage.js` and `UpdateMesaPage.js` (validate: dsc_mesa, num_lugares)
- [X] T018 [P] [US1+US2+US3] Replicate form improvements to `RegComandaPage.js` and `UpdateComandaPage.js` (validate: id_mesa required)

**Checkpoint**: All 8 form pages have toast + button disable + validation. Run `npm test` — all tests pass (new and existing).

---

## Phase 4: User Story 6 — Empty States with CTA (Priority: P3)

**Goal**: All 5 list pages show rich empty state (icon + message + CTA button) instead of plain `<p>` text when no records exist

**Independent Test**: Access any list page without data → icon, "Nenhum [recurso] encontrado" message, and "Cadastrar [recurso]" button displayed. Click button → navigates to register form.

### Tests for User Story 6 ⚠️

- [X] T019 [P] [US6] Write test: ListProdutoPage empty state renders `createEmptyState()` with icon and CTA in `ListProdutoPage.spec.js`
- [X] T020 [P] [US6] Write test: ListUsuarioPage empty state in `frontend/src/pages/usuario/ListUsuarioPage.spec.js`
- [X] T021 [P] [US6] Write test: ListMesaPage empty state in `frontend/src/pages/mesa/ListMesaPage.spec.js`
- [X] T022 [P] [US6] Write test: ListComandaPage empty state renders correct CTA in `ListComandaPage.spec.js`
- [X] T023 [P] [US6] Write test: HomePage empty state in `HomePage.spec.js`

### Implementation for User Story 6

- [X] T024 [P] [US6] Add `createEmptyState` import and replace inline `<p>` in `ListProdutoPage.js:88`
- [X] T025 [P] [US6] Add `createEmptyState` import and replace inline `<p>` in `ListUsuarioPage.js`
- [X] T026 [P] [US6] Add `createEmptyState` import and replace inline `<p>` in `ListMesaPage.js`
- [X] T027 [P] [US6] Add `createEmptyState` import and replace inline `<p>` in `ListComandaPage.js`
- [X] T028 [P] [US6] Add `createEmptyState` import and replace inline `<p>` in `HomePage.js`

**Checkpoint**: All 5 list pages show rich empty states. Run `npm test` — pass.

---

## Phase 5: FR-017 — Skeleton Loading Screens (Priority: P3)

**Goal**: Replace `ion-loading` spinner during list fetch with skeleton screens using `<ion-skeleton-text>` for modern mobile UX

**Independent Test**: Refresh any list page → skeleton placeholders shown during data fetch, replaced by real content on completion

### Tests for FR-017 ⚠️

- [X] T029 [P] [FR-017] Write test: ListProdutoPage shows skeleton during fetch in `ListProdutoPage.spec.js`
- [X] T030 [P] [FR-017] Write test: ListComandaPage shows skeleton then replaces on data load in `ListComandaPage.spec.js`

### Implementation for FR-017

- [X] T031 [P] [FR-017] Add skeleton screen markup in `ListProdutoPage.js` inside `.list-produto-container` before `fetchProdutos()`, replace with data on success or empty state on empty
- [X] T032 [P] [FR-017] Replicate skeleton screen to `ListUsuarioPage.js`
- [X] T033 [P] [FR-017] Replicate skeleton screen to `ListMesaPage.js`
- [X] T034 [P] [FR-017] Replicate skeleton screen to `ListComandaPage.js`
- [X] T035 [P] [FR-017] Replicate skeleton screen to `HomePage.js`

**Checkpoint**: All 5 list pages use skeleton loading during fetch instead of spinner. Run `npm test` — pass.

---

## Phase 6: User Story 8 — SPA Navigation (Priority: P3)

**Goal**: Replace `window.location.href` with `ion-router.push()` in all 4 list FAB buttons for SPA-style navigation

**Independent Test**: Click FAB "Adicionar" on any list page → page changes without full reload (no flash, no loss of app state)

### Tests for User Story 8 ⚠️

- [X] T036 [P] [US8] Write test: FAB click uses `router.push()` not `window.location.href` in `ListProdutoPage.spec.js`
- [X] T037 [P] [US8] Write test: FAB click uses `router.push()` in `ListComandaPage.spec.js`

### Implementation for User Story 8

- [X] T038 [P] [US8] Replace `window.location.href` with `router.push('/produto/register')` in `ListProdutoPage.js:78`
- [X] T039 [P] [US8] Replace `window.location.href` with `router.push('/usuario/register')` in `ListUsuarioPage.js:78`
- [X] T040 [P] [US8] Replace `window.location.href` with `router.push('/mesa/register')` in `ListMesaPage.js:70`
- [X] T041 [P] [US8] Replace `window.location.href` with `router.push('/comanda/register')` in `ListComandaPage.js:88`

**Checkpoint**: All 4 FABs use SPA navigation. Run `npm test` — pass.

---

## Phase 7: User Story 5 + FR-015 + FR-016 — CSS Improvements, Safe Areas, Font Sizes (Priority: P3)

**Goal**: Remove inline styles (US5), add safe-area padding for notched devices (FR-015), set minimum font sizes on empty CSS files (FR-016)

**Independent Test**: Inspect any CRUD page → no inline styles, containers have safe-area padding when applicable, font-size ≥14px labels and ≥16px body text

### Tests for CSS Improvements ⚠️

- [X] T042 [P] [US5] Write test: ListProdutoPage has no inline layout styles in `ListProdutoPage.spec.js`
- [X] T043 [P] [FR-015] Write test: ListProdutoPage CSS contains safe-area padding in `ListProdutoPage.spec.js`
- [X] T044 [P] [FR-016] Write test: CSS files have font-size rules in appropriate spec file

### Implementation for CSS

- [X] T045 [P] [US5] Move inline styles from `ListProdutoPage.js:97-104` (h2, p, icons in list items) to CSS classes in `ListProdutoPage.css`
- [X] T046 [P] [US5] Move inline styles from `ListUsuarioPage.js` to CSS classes in `ListUsuarioPage.css`
- [X] T047 [P] [US5] Remove inline styles from `RegProdutoPage.js:33,37` (icon margin) — use CSS classes
- [X] T048 [P] [US5] Remove inline styles from all remaining Reg/Update pages (icon `margin-right: 8px`)
- [X] T049 [P] [FR-015] Add `padding-left: env(safe-area-inset-left, 16px)` and `padding-right: env(safe-area-inset-right, 16px)` to `.list-produto-container` in `ListProdutoPage.css`
- [X] T050 [P] [FR-015] Add safe-area padding to `.list-usuario-container` in `ListUsuarioPage.css`
- [X] T051 [P] [FR-015] Add safe-area padding to `.list-mesa-container` in `ListMesaPage.css`
- [X] T052 [P] [FR-016] Add font-size rules to empty `RegProdutoPage.css` (`:host { font-size: 16px; } ion-label { font-size: 14px; }`)
- [X] T053 [P] [FR-016] Add font-size rules to `UpdateProdutoPage.css`
- [X] T054 [P] [FR-016] Add font-size rules to `ListMesaPage.css`
- [X] T055 [P] [FR-016] Add font-size rules to `RegMesaPage.css`
- [X] T056 [P] [FR-016] Add font-size rules to `UpdateMesaPage.css`
- [X] T057 [P] [FR-016] Add font-size rules to `RegComandaPage.css`

**Checkpoint**: Zero inline layout styles, safe-area padding on 3 containers, all CSS files have font-size rules. Run `npm test` — pass.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T058 Run `npm test` — confirm all tests pass (existing + new)
- [X] T059 Run `npm run build` — confirm production build succeeds
- [X] T060 Run quickstart.md verification checklist manually on a mobile viewport (320px)
- [X] T061 Verify all 10 success criteria (SC-001 through SC-010) pass per their verification methods
- [X] T062 [SC-004] Add timer assertion in validation tests to confirm validation feedback displays in <100ms after clicking "Salvar" — verify in `frontend/src/pages/produto/RegProdutoPage.spec.js` and replicate across entities

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **Form P1 (Phase 3, US1+2+3 MVP)**: Depends on Phase 2 — **BLOCKS MVP delivery**
- **Empty States (Phase 4, US6)**: Depends on Phase 2 — independent of Phase 3 (different files)
- **Skeleton Loading (Phase 5, FR-017)**: Depends on Phase 2 — independent of Phases 3, 4 (same pages as Phase 4 but different concerns in different methods)
- **SPA Nav (Phase 6, US8)**: Depends on Phase 2 — independent of all above
- **CSS (Phase 7, US5+FR-015+FR-016)**: Depends on Phase 2 — independent of all above (CSS files)
- **Polish (Phase 8)**: Depends on all prior phases complete

### User Story Dependencies

- **US1+2+3 (P1)**: No dependencies on other stories — can start immediately after Foundational
- **US6 (P3)**: No dependencies on other stories — different files
- **FR-017 (P3)**: Same files as US6 but different methods — can be done in any order
- **US8 (P3)**: Different methods (FAB only) — completely independent
- **US5+FR-015+FR-016 (P3)**: CSS files — completely independent

### Parallel Opportunities

- All tasks within Phase 3 marked [P] can run in parallel (different page files per entity)
- All tasks within Phase 4 marked [P] can run in parallel
- All tasks within Phase 5 marked [P] can run in parallel
- All tasks within Phase 6 marked [P] can run in parallel
- All tasks within Phase 7 marked [P] can run in parallel
- Phases 4, 5, 6, 7 can all run in parallel with each other (different files) once Phase 2 completes

---

## Parallel Example: Phase 3 (Form Improvements)

```bash
# All 4 entities can be implemented in parallel:
Task: T014 RegProdutoPage + T015 UpdateProdutoPage
Task: T016 RegUsuarioPage + UpdateUsuarioPage
Task: T017 RegMesaPage + UpdateMesaPage
Task: T018 RegComandaPage + UpdateComandaPage
```

## Parallel Example: Phases 4+5+6+7 (P3 stories)

```bash
# Launch a team member per P3 phase:
Person A: Phase 4 (Empty states — 5 list pages)
Person B: Phase 5 (Skeleton — 5 list pages)
Person C: Phase 6 (SPA nav — 4 FABs)
Person D: Phase 7 (CSS — ~15 CSS/JS files)
```

---

## Implementation Strategy

### MVP First (Phase 3 Only — US1+2+3)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational ✅
3. Complete Phase 3: All 8 form pages with toast + button disable + validation
4. **STOP and VALIDATE**: Test all forms independently
5. MVP = P1 delivered (all 3 P1 stories)

### Incremental Delivery

1. P1 Complete (Phase 3) → Deploy/Demo 🚀
2. Add P3: Empty states (Phase 4) → Deploy/Demo
3. Add P3: Skeleton loading (Phase 5) → Deploy/Demo
4. Add P3: SPA navigation (Phase 6) → Deploy/Demo
5. Add P3: CSS improvements (Phase 7) → Deploy/Demo
6. Final polish (Phase 8) → Final release
