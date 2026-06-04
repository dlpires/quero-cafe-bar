# Tasks: Performance Mobile e Gestos Touch Nativos

**Input**: Design documents from `specs/006-performance-touch-gestures/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and understand existing codebase

- [ ] T001 Verify backend tests pass: `cd backend && yarn test`
- [ ] T002 [P] Verify frontend tests pass: `cd frontend && npm test`
- [ ] T003 [P] Read backend pagination pattern: `backend/src/modules/produto/produto.service.ts` and `backend/src/modules/produto/produto.controller.ts`
- [ ] T004 [P] Read existing frontend list pages: `frontend/src/pages/produto/ListProdutoPage.js`, `frontend/src/pages/usuario/ListUsuarioPage.js`, `frontend/src/pages/mesa/ListMesaPage.js`, `frontend/src/pages/comanda/ListComandaPage.js`
- [ ] T005 [P] Read existing API service: `frontend/src/services/api.js`
- [ ] T006 [P] Read frontend entry point: `frontend/src/main.js`
- [ ] T007 [P] Read Vite config: `frontend/vite.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend pagination and code splitting configuration — MUST complete before US1

**⚠️ CRITICAL**: US1 (infinite scroll) requires backend pagination support. US4 (lazy loading) requires Vite code splitting config.

### Backend Pagination

- [ ] T008 [P] Add `skip` and `take` fields to `backend/src/modules/produto/dto/list-produto.dto.ts` with `@IsInt()`, `@Min(0)`, `@IsOptional()`, `@Type(() => Number)` decorators; default skip=0, take=20
- [ ] T009 [P] Add `skip` and `take` fields to `backend/src/modules/usuario/dto/list-usuario.dto.ts` (same decorators)
- [ ] T010 [P] Add `skip` and `take` fields to `backend/src/modules/mesa/dto/list-mesa.dto.ts` (same decorators)
- [ ] T011 [P] Add `skip` and `take` fields to `backend/src/modules/comanda/dto/list-comanda.dto.ts` (same decorators)
- [ ] T012 [P] Create `backend/src/modules/produto/dto/paginated-response.dto.ts` — generic `PaginatedResponse<T>` with `data: T[]`, `total: number`, `skip: number`, `take: number`
- [ ] T013 Modify `backend/src/modules/produto/produto.service.ts` — replace `find()` with `findAndCount()` using `skip`/`take` from DTO, return `{ data, total, skip, take }`
- [ ] T014 Modify `backend/src/modules/usuario/usuario.service.ts` — same `findAndCount()` pattern
- [ ] T015 Modify `backend/src/modules/mesa/mesa.service.ts` — same `findAndCount()` pattern
- [ ] T016 Modify `backend/src/modules/comanda/comanda.service.ts` — same `findAndCount()` pattern
- [ ] T017 Verify all backend tests still pass: `cd backend && yarn test`

### Frontend Code Splitting Config

- [ ] T018 Modify `frontend/vite.config.js` — remove `manualChunks: undefined` from `rollupOptions.output` to allow Vite automatic code splitting

---

## Phase 3: User Story 4 - Lazy Loading de Páginas (Priority: P2)

**Goal**: Bundle inicial contém apenas login/home; demais páginas carregam sob demanda via `import()` dinâmico

**Independent Test**: Bundle inicial não contém código de páginas CRUD. Verificar via DevTools Network tab — chunks separados aparecem apenas ao navegar para cada rota.

### Test-First (RED phase — TDD mandatory per constitution)

- [x] ~~T019 [US4] Write failing Jest test for lazy loading — mock `import()` and verify page chunks are NOT in initial bundle~~ → **CANCELLED** (ver B003 — lazy loading causou race condition com `ion-router`)

### Implementation

- [x] ~~T020 [P] [US4] Remove static imports of CRUD pages~~ → **REVERTED** (ver B003 — voltamos a usar imports estáticos)
- [x] ~~T021 [US4] Add dynamic `import()` in `ionRouteDidChange` handler~~ → **REVERTED** (ver B003)
- [x] ~~T022 [US4] Add adjacent route preloading~~ → **REVERTED** (ver B003)
- [x] ~~T023 [US4] Verify frontend build outputs separate chunks~~ → **CANCELLED** (ver B003)

**Checkpoint**: Lazy loading removido. Todas as páginas são importadas estaticamente para evitar race condition com `ion-router`. Ver detalhes em B003 no `plan.md`.

---

## Phase 4: User Story 1 - Infinite Scroll (Priority: P1)

**Goal**: Listagens carregam registros progressivamente conforme o usuário rola, usando virtual scroll (produto/usuario) ou append simples (mesa/comanda)

**Independent Test**: Abrir listagem com >20 registros, rolar até o fim — novos itens aparecem sem interrupção. Com <20 registros, sem indicador adicional.

### Test-First (RED phase — TDD mandatory per constitution)

- [ ] T024 [US1] Write failing Jest test for infinite scroll — verify `ionInfinite` event triggers API call and items are appended to DOM, using `frontend/src/pages/produto/ListProdutoPage.js`

### Frontend API Service

- [ ] T025 [P] [US1] Add `getProdutos(skip = 0, take = 20)` with pagination params to `frontend/src/services/api.js` (keep existing `getProdutos()` for backward compat or deprecate)
- [ ] T026 [P] [US1] Add `getUsuarios(skip = 0, take = 20)` with pagination params to `frontend/src/services/api.js`
- [ ] T027 [P] [US1] Update `getMesas()` to accept `skip = 0, take = 20` params in `frontend/src/services/api.js`
- [ ] T028 [P] [US1] Update `getComandas()` to accept `skip = 0, take = 20` params in `frontend/src/services/api.js`

### Virtual Scroll Implementation (shared)

- [ ] T029 [P] [US1] Create virtual scroll utility in `frontend/src/shared/virtual-scroll.js` — class/function that accepts container, itemHeight, items array, buffer (2 screens), and returns indices to render with offsetY

### Produto List Page (virtual scroll + infinite scroll)

- [ ] T030 [US1] Modify `frontend/src/pages/produto/ListProdutoPage.js`:
  - Add `ion-infinite-scroll` at bottom of list
  - Load first 20 items on mount via `api.getProdutos(0, 20)`
  - On `ionInfinite` event: call `api.getProdutos(currentLength, 20)`, append to items, call `event.target.complete()`
  - Disable infinite scroll when `skip + data.length >= total`
  - Use virtual scroll utility: only render visible items + 2 screen buffer
  - On `ionScroll`: recalculate visible range and update DOM
  - Show skeleton loading on initial load
  - Handle network errors via FR-012 pattern (show toast, keep existing data)

### Usuario List Page (virtual scroll + infinite scroll)

- [ ] T031 [US1] Modify `frontend/src/pages/usuario/ListUsuarioPage.js` — same pattern as T030 (virtual scroll, infinite scroll, error handling)

### Mesa List Page (append simples + infinite scroll)

- [ ] T032 [US1] Modify `frontend/src/pages/mesa/ListMesaPage.js`:
  - Add `ion-infinite-scroll` at bottom of list
  - Load first 20 items on mount via `api.getMesas(0, 20)`
  - On `ionInfinite`: append results to DOM (no virtual scroll — simple append)
  - Disable infinite scroll when exhausted
  - Show skeleton loading on initial load
  - Handle network errors via FR-012 pattern

### Comanda List Page (append simples + infinite scroll)

- [ ] T033 [US1] Modify `frontend/src/pages/comanda/ListComandaPage.js` — same pattern as T032 (append simples, infinite scroll, error handling)

### Verify

- [ ] T034 Verify frontend tests pass (including the new US1 test — now GREEN): `cd frontend && npm test`

**Checkpoint**: Infinite scroll should work on all 4 list pages. Virtual scroll visible on produto/usuario (DOM nodes limited to ~buffer). Append simples on mesa/comanda.

---

## Phase 5: User Story 2 - Swipe para Excluir (Priority: P1)

**Goal**: Deslizar item para esquerda revela botão de excluir em todas as listas CRUD

**Independent Test**: Em qualquer listagem (produto, usuário, mesa), deslizar item para esquerda — botão de excluir com ícone e cor danger aparece.

### Test-First (RED phase — TDD mandatory per constitution)

- [ ] T035 [US2] Write failing Jest test for swipe-to-delete — verify `ion-item-sliding` reveals delete button, confirmation dialog appears, and delete API is called, using `frontend/src/pages/produto/ListProdutoPage.js`

### Implementation

- [ ] T036 [US2] Modify `frontend/src/pages/produto/ListProdutoPage.js` — wrap each `ion-item` in `ion-item-sliding`, add `ion-item-options side="end"` with `ion-item-option color="danger"` containing trash icon + "Excluir" label; on click: show `ion-alert` confirmation, call `api.deleteProduto(id)`, re-render on success
- [ ] T037 [US2] Modify `frontend/src/pages/usuario/ListUsuarioPage.js` — same swipe-to-delete pattern
- [ ] T038 [US2] Modify `frontend/src/pages/mesa/ListMesaPage.js` — same swipe-to-delete pattern
- [ ] T039 [US2] Add `closeSlidingItems()` call on route change to close any open swipe menus when navigating away; confirm tests now pass (GREEN)

**Checkpoint**: Swipe-to-delete functional on produto, usuario, and mesa list pages. Confirmation dialog appears before deletion.

---

## Phase 6: User Story 3 - Pull-to-Refresh (Priority: P1)

**Goal**: Puxar tela para baixo recarrega dados em todas as listas

**Independent Test**: Em qualquer listagem, puxar para baixo — indicador de refresh aparece, dados são recarregados.

### Test-First (RED phase — TDD mandatory per constitution)

- [ ] T040 [US3] Write failing Jest test for pull-to-refresh — verify `ionRefresh` event triggers API call with `skip=0`, data is reset, and refresher completes, using `frontend/src/pages/produto/ListProdutoPage.js`

### Implementation

- [ ] T041 [US3] Modify `frontend/src/pages/produto/ListProdutoPage.js` — add `ion-refresher` with `slot="fixed"` inside `ion-content`, on `ionRefresh`: call `api.getProdutos(0, 20)`, reset items + virtual scroll state, call `event.target.complete()`; handle network errors (keep existing data, show toast)
- [ ] T042 [US3] Modify `frontend/src/pages/usuario/ListUsuarioPage.js` — same pull-to-refresh pattern
- [ ] T043 [US3] Modify `frontend/src/pages/mesa/ListMesaPage.js` — same pull-to-refresh pattern
- [ ] T044 [US3] Modify `frontend/src/pages/comanda/ListComandaPage.js` — same pull-to-refresh pattern (note: comanda already had pull-to-refresh mentioned in spec — ensure it's added); confirm tests now pass (GREEN)

**Checkpoint**: Pull-to-refresh functional on all 4 list pages. Error state preserves existing data.

---

## Phase 7: User Story 5 - Cache de Assets via Service Worker (Priority: P3)

**Goal**: Assets estáticos cacheados via service worker para carregamento mais rápido em visitas repetidas

**Independent Test**: Service worker registrado no painel Application > Service Workers. Assets servidos do cache em visitas subsequentes.

### Test-First (RED phase — TDD mandatory per constitution)

- [ ] T045 [US5] Write failing test for service worker registration — verify `navigator.serviceWorker.register` is called with `/sw.js` and that the SW file exists after build, targeting `frontend/src/main.js` and `frontend/src/sw.js`

### Implementation

- [ ] T046 [P] [US5] Create `frontend/src/sw.js` — service worker with:
  - `CACHE_VERSION` constant
  - `install` event: pre-cache critical assets (core CSS, Ionic JS)
  - `activate` event: delete old caches
  - `fetch` event: cache-first strategy for static assets (JS, CSS, fonts, icons), network-first for API calls
- [ ] T047 [US5] Register service worker in `frontend/src/main.js` — check `navigator.serviceWorker`, call `navigator.serviceWorker.register('/sw.js')`, handle registration errors gracefully; confirm tests now pass (GREEN)
- [ ] T048 [US5] Verify: `cd frontend && npm run build` — check `dist/sw.js` exists; load app in browser, verify SW registered in Application panel

**Checkpoint**: Service worker registered and caching assets. Second load should show cached assets in Network tab.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance observability via User Timing API, Lighthouse validation, edge case hardening

### User Timing Instrumentation (FR-013, FR-014)

- [ ] T049 [P] Add `performance.mark()` and `performance.measure()` to infinite scroll fetch handler in all 4 list pages — measure fetch duration per entity type
- [ ] T050 [P] Add `performance.mark()` and `performance.measure()` to pull-to-refresh handler in all 4 list pages
- [ ] T051 [P] Add `performance.mark()` and `performance.measure()` to swipe action handler
- [ ] T052 [P] Add `console.warn()` in dev mode (check `environment.production`) when any measured operation exceeds 16ms threshold in all pages
- [ ] T053 Add `beforeunload` cleanup — call `performance.clearMarks()` and `performance.clearMeasures()` to avoid memory leaks from accumulated entries

### Verification

- [ ] T054 [P] Run `cd backend && yarn test` — all 163 tests (24 suites) passing
- [ ] T055 [P] Run `cd frontend && npm test` — all 105 tests (8 suites) passing
- [ ] T056 [P] Run `cd backend && yarn lint` — no lint errors
- [ ] T057 Run Lighthouse performance audit on mobile emulation (3G slow, CPU 4x throttling) — score ≥ 80
- [ ] T058 Verify `quickstart.md` checklist items are all satisfiable

### Edge Cases

- [ ] T059 Verify rapid successive swipes (ion-item-sliding handles queue internally — ensure no visual glitches on mid-range device)
- [ ] T060 Verify API returning fewer records than `take` (e.g., `take=20` but `total=5`) — infinite scroll should not fire again
- [ ] T061 Verify pull-to-refresh on empty list — shows empty state after refresh, no error
- [ ] T062 Verify service worker registration failure on unsupported browsers — app continues without caching, no console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US1
- **US4 - Lazy Loading (Phase 3)**: Depends on Phase 2 (code splitting config) — independent from other stories. T019 (test) → T020-T023 (implementation)
- **US1 - Infinite Scroll (Phase 4)**: Depends on Phase 2 (backend pagination + API service) — can run in parallel with US2, US3. T024 (test) → T025-T034 (implementation)
- **US2 - Swipe to Delete (Phase 5)**: Depends on Phase 2 only — independent from US1, US3, US4. T035 (test) → T036-T039 (implementation)
- **US3 - Pull-to-Refresh (Phase 6)**: Depends on Phase 2 only — independent from US1, US2, US4. T040 (test) → T041-T044 (implementation)
- **US5 - Service Worker (Phase 7)**: Depends on Phase 2 only — independent from all other stories. T045 (test) → T046-T048 (implementation)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Blocked by Foundational (backend pagination). No dependency on other stories.
- **US2 (P1)**: No blocking dependencies besides Foundational. Swipe components are independent of infinite scroll in the same file.
- **US3 (P1)**: No blocking dependencies besides Foundational. Pull-to-refresh is an independent Ionic component.
- **US4 (P2)**: Blocked by Foundational (code splitting config). Independent from US1/US2/US3.
- **US5 (P3)**: No dependencies beyond Foundational. Service worker is standalone.

### Within Each Phase

- Tasks marked [P] can run in parallel
- Tasks without [P] may have implicit ordering (read before modify)

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- Backend DTO changes (T008-T011) can run in parallel
- Backend service changes (T013-T016) depend on their respective DTOs
- US4 (Phase 3 — T019 to T023) can run in parallel with US2/US3
- US1 (Phase 4 — T024 to T034) can run after backend pagination is done
- US2 (Phase 5 — T035 to T039) and US3 (Phase 6 — T040 to T044) can run in parallel with each other and with US1
- US5 (Phase 7 — T045 to T048) is fully independent
- All Phase 8 verification tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Infinite Scroll)

```bash
# Launch API service methods (T025-T028) together:
Task: "Add getProdutos(skip, take) in api.js"
Task: "Add getUsuarios(skip, take) in api.js"
Task: "Update getMesas(skip, take) in api.js"
Task: "Update getComandas(skip, take) in api.js"

# Launch virtual scroll utility + first list page together:
Task: "Create virtual-scroll.js utility (T029)"
Task: "Modify ListProdutoPage.js with infinite scroll (T030)"
```

## Parallel Example: User Story 2 (Swipe to Delete)

```bash
# All list pages can be modified in parallel:
Task: "Modify ListProdutoPage.js with ion-item-sliding (T036)"
Task: "Modify ListUsuarioPage.js with ion-item-sliding (T037)"
Task: "Modify ListMesaPage.js with ion-item-sliding (T038)"
```

## Parallel Example: User Story 3 (Pull-to-Refresh)

```bash
# All list pages can be modified in parallel:
Task: "Modify ListProdutoPage.js with ion-refresher (T041)"
Task: "Modify ListUsuarioPage.js with ion-refresher (T042)"
Task: "Modify ListMesaPage.js with ion-refresher (T043)"
Task: "Modify ListComandaPage.js with ion-refresher (T044)"
```

---

## Implementation Strategy

### MVP First (US1 + Backend Pagination Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (backend pagination + code splitting)
3. Complete Phase 4: US1 (infinite scroll) — T024 test (RED) → T025-T034 implementation (GREEN). Skip virtual scroll initially, use simple append
4. **STOP and VALIDATE**: Infinite scroll working on all 4 list pages
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US4 (lazy loading) → bundle size reduced ≥ 40% → Deploy/Demo
3. Add US1 (infinite scroll) → list performance improved → Deploy/Demo
4. Add US2 (swipe to delete) → gesture navigation → Deploy/Demo
5. Add US3 (pull-to-refresh) → refresh gesture → Deploy/Demo
6. Add US5 (service worker) → faster revisits → Deploy/Demo
7. Polish (User Timing + Lighthouse) → performance verified → Final

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US4 (lazy loading) + US5 (service worker)
   - Developer B: US1 (infinite scroll) + virtual scroll
   - Developer C: US2 (swipe to delete) + US3 (pull-to-refresh)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
