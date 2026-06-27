# Tasks: Home Tables Redesign

**Feature**: `specs/013-home-tables-redesign/spec.md`
**Created**: 2026-06-25
**Total tasks**: 20

## Phase 1: Setup

- [X] T001 Add `status` field (varchar(10), default 'aberta') to Comanda entity in `backend/src/modules/comanda/entities/comanda.entity.ts`
- [X] T002 Update Comanda DTOs and interfaces to include status field in `backend/src/modules/comanda/dto/` and `backend/src/modules/comanda/interfaces/comanda.interface.ts`
- [X] T003 Generate TypeORM migration for the new comanda status column via `yarn make:migration AddComandaStatus`

## Phase 2: Foundational

- [X] T004 [P] Add `hasActiveComanda` derived boolean field to GET /mesa response in `backend/src/modules/mesa/mesa.service.ts` using TypeORM subquery (count comandas with status='aberta' per mesa, ordered by most recent `id` DESC for "most recent comanda" rule); update `IMesaOutput` interface if needed
- [X] T005 [P] Create CozinhaPage custom element — copy current HomePage.js to `frontend/src/pages/cozinha/CozinhaPage.js` and copy HomePage.css to `frontend/src/pages/cozinha/CozinhaPage.css`; rename class to `CozinhaPage`, register as `cozinha-page`
- [X] T006 Register `/cozinha` route in `frontend/index.html` (`<ion-route url="/cozinha" component="cozinha-page">`) and import `cozinha-page` in `frontend/src/main.js`

## Phase 3: User Story 1 — Garçom visualiza mesas e abre nova comanda (P1)

- [X] T007 [US1] Rewrite `frontend/src/pages/home/HomePage.js` to load active mesas from API instead of comandas; render as cards showing mesa number prominently, status color (green = disponivel, orange = comanda ativa), and availability text; integrate pagination controls using existing `renderPaginationBar` pattern; handle click: disponivel → navigate to `/comanda/register?id_mesa=N`, comanda ativa → navigate to `/comanda/edit?id=N`
- [X] T008 [US1] Rewrite `frontend/src/pages/home/HomePage.css` with grid layout for table cards, status color styles, responsive breakpoints (1/2/3/4 columns)
- [X] T009 [US1] Add `getActiveComandaByMesaId(id_mesa)` method to `frontend/src/services/api.js` calling GET `/comanda/mesa/:id_mesa`
- [X] T010 [US1] Update `frontend/src/pages/comanda/RegComandaPage.js` to read `id_mesa` from URLSearchParams; if present, pre-select the mesa in the dropdown after loading mesas and show mesa number as read-only text

## Phase 4: User Story 2 — Garçom gerencia comanda aberta (P1)

- [X] T011 [US2] Add "Fechar Comanda" button to `frontend/src/pages/comanda/UpdateComandaPage.js` — place after items section with ion-button color="medium"; show confirmation alert; on confirm call `api.updateComanda(id, { status: 'fechada' })`; show success toast and navigate back to `/home`
- [X] T012 [US2] Implement read-only state in `frontend/src/pages/comanda/UpdateComandaPage.js` for closed comandas — when comanda.status is 'fechada', disable all form inputs, hide "Adicionar Item" and "Fechar Comanda" buttons, show "Comanda Fechada" badge; prevent item status changes
- [X] T013 [US2] Add backend validation in `backend/src/modules/comanda/comanda.service.ts` to reject PATCH requests adding/updating items on comandas with status='fechada' (throw BadRequestException with message "Comanda já está fechada")

## Phase 5: User Story 3 — Alterna visualizações (P2)

- [X] T014 [US3] Add list view rendering to `frontend/src/pages/home/HomePage.js` — render mesas as vertical list items showing mesa number, chairs count, and status with color-coded icon; reuse `createListSkeleton` pattern
- [X] T015 [US3] Add view toggle control to `frontend/src/pages/home/HomePage.js` — ion-segment or icon button to switch between card and list views; persist preference in localStorage key `home-view-mode` (default 'cards')
- [X] T016 [US3] Add summary bar to `frontend/src/pages/home/HomePage.js` — show "X mesas | Y disponíveis" at top of content area, updating dynamically with loaded data

## Phase 6: Polish & Cross-cutting

- [X] T017 Add pull-to-refresh (`ion-refresher`) to home page in `frontend/src/pages/home/HomePage.js`
- [X] T018 Add empty state handling for no active tables in `frontend/src/pages/home/HomePage.js` using `createEmptyState` with icon 'grid-outline', message 'Nenhuma mesa ativa encontrada.', and action to navigate to `/mesas`
- [X] T019 Rewrite `frontend/src/pages/home/HomePage.spec.js` to test new table card rendering, status colors, click navigation, pagination, and empty state
- [X] T020 Create `frontend/src/pages/cozinha/CozinhaPage.spec.js` mirroring the old HomePage.spec.js but for the cozinha-page custom element

## Dependency Graph

```
Phase 1 (Setup)
  ├── T001 → T002 → T003
  └── (no parallel, sequential)

Phase 2 (Foundational)
  ├── T004 [P] (backend — independent)
  ├── T005 [P] (frontend CozinhaPage — independent)
  └── T006 (frontend route — depends on T005)

Phase 3 (US1) — requires T001–T006
  ├── T007 → T008 (HomePage rewrite + CSS)
  ├── T009 (API method)
  └── T010 (RegComandaPage — can start after T009)

Phase 4 (US2) — requires HomePage rewrite (T007)
  ├── T011 → T012 (Fechar comanda + read-only)
  └── T013 (backend — independent of other US2 tasks)

Phase 5 (US3) — requires HomePage rewrite (T007)
  ├── T014 → T015 → T016 (sequential within US3)
  └──

Phase 6 (Polish) — requires T007+T005
  ├── T017 → T018 (HomePage enhancements)
  └── T019 → T020 (tests)
```

## Parallel Execution Opportunities

| Tasks | Rationale |
|-------|-----------|
| T004 ∥ T005 | Backend hasActiveComanda is independent of CozinhaPage creation (T006 depends on T005) |
| T007 + T009 | HomePage rewrite + API method can be implemented concurrently |
| T013 ∥ T011 + T012 | Backend validation is independent of frontend UI |
| T017 + T018 ∥ T019 + T020 | Feature work and test writing can happen in parallel |

## Independent Test Criteria

| Story | How to test independently |
|-------|--------------------------|
| US1 | Navigate to /home → see tables in card view → click available table → redirected to /comanda/register?id_mesa=N |
| US2 | Navigate to /comanda/edit?id=N (comanda with status='aberta') → click "Fechar Comanda" → confirm → comanda status changes to 'fechada' → table returns to "Disponível" on home page |
| US3 | Navigate to /home → click view toggle → layout switches between cards and list → preference persists on page reload |

## MVP Scope

Phase 1 + Phase 2 + Phase 3 (US1) + T017 (pull-to-refresh) is the minimum viable product:
- Backend entity with status + migration
- hasActiveComanda in mesa endpoint
- CozinhaPage for kitchen access
- HomePage with table cards, status colors, click-to-open-comanda
- Pull-to-refresh for data freshness
