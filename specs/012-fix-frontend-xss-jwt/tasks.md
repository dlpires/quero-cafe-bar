---

description: "Task list for Correções de Segurança no Frontend (XSS e JWT)"
---

# Tasks: Correções de Segurança no Frontend (XSS e JWT)

**Input**: Design documents from `/specs/012-fix-frontend-xss-jwt/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Include test tasks where applicable (backend tests for `/usuario/me`, frontend tests to verify no regression)

**Organization**: Tasks grouped by phase — foundational backend changes first, then US1 (XSS) and US2 (JWT cookie) in parallel where possible.

## Phase 1: Setup

**Purpose**: Install new dependencies

- [ ] T001 [P] Install `cookie-parser` + `@types/cookie-parser` in `backend/`
- [ ] T002 [P] Install `dompurify` in `frontend/`

---

## Phase 2: Foundational — Backend Auth Changes

**Purpose**: Backend infrastructure for httpOnly cookie auth — must be complete before US2 frontend work

- [ ] T003 Add `cookieParser()` middleware to `backend/src/main.ts`
- [ ] T004 [P] [US2] Adapt `JwtAuthGuard` in `backend/src/common/guards/jwt-auth.guard.ts` to read token from `request.cookies.token` as fallback
- [ ] T005 [US2] Modify `POST /usuario/login` in `usuario.controller.ts` to set httpOnly cookie via `response.cookie()` with env-conditional Secure flag (`secure: process.env.NODE_ENV === 'production'`)
- [ ] T006 [P] [US2] Create `GET /usuario/me` endpoint in `usuario.controller.ts` + `usuario.service.ts` (returns `{ id, usuario, perfil }`)
- [ ] T007 [US2] Create `POST /usuario/logout` endpoint in `usuario.controller.ts` that clears the cookie
- [ ] T025 [P] [US2] **TEST**: Write unit test for `GET /usuario/me` in `usuario.controller.spec.ts` (mock JwtAuthGuard, assert returns `{ id, usuario, perfil }`)
- [ ] T026 [P] [US2] **TEST**: Write unit test for `getMe()` in `usuario.service.spec.ts` (assert finds user by ID from decoded token)

**Checkpoint**: Backend ready — login sets cookie, `/usuario/me` returns profile, JwtAuthGuard reads cookie. Run `yarn test` (149+ tests must pass).

---

## Phase 3: User Story 1 — XSS Elimination (Priority: P1)

**Goal**: Eliminar toda vulnerabilidade XSS substituindo `innerHTML` por `textContent` + DOM API em páginas que renderizam dados da API

**Independent Test**: Cadastrar produto com nome `<img src=x onerror=alert('XSS')>` e verificar que o alerta NÃO é exibido na listagem

- [ ] T008 [P] [US1] Fix XSS in `frontend/src/pages/login/LoginPage.js`
- [ ] T009 [P] [US1] Fix XSS in `frontend/src/pages/home/HomePage.js` (cozinha — comandas com delivery status)
- [ ] T010 [P] [US1] Fix XSS in `frontend/src/pages/produto/ListProdutoPage.js`, `RegProdutoPage.js`, `UpdateProdutoPage.js`
- [ ] T011 [P] [US1] Fix XSS in `frontend/src/pages/usuario/ListUsuarioPage.js`, `RegUsuarioPage.js`, `UpdateUsuarioPage.js`
- [ ] T012 [P] [US1] Fix XSS in `frontend/src/pages/mesa/ListMesaPage.js`, `RegMesaPage.js`, `UpdateMesaPage.js`
- [ ] T013 [P] [US1] Fix XSS in `frontend/src/pages/comanda/ListComandaPage.js`, `RegComandaPage.js`, `UpdateComandaPage.js`
- [ ] T014 [P] [US1] Fix XSS in `frontend/src/shared/Header.js`
- [ ] T015 [P] [US1] Fix XSS in `frontend/src/shared/util.js` (audit for any `innerHTML` with dynamic data)
- [ ] T027 [P] [US1] **TEST**: Write or update frontend test verifying XSS-safe rendering (mock API data containing `<>` chars, assert rendered as `textContent`, not raw HTML)

**Checkpoint**: Nenhuma atribuição `innerHTML` com dados da API no frontend. Run `npm test` (216+ tests must pass).

---

## Phase 4: User Story 2 — JWT Cookie Migration (Priority: P1)

**Goal**: Migrar JWT de localStorage para cookie httpOnly, substituir `atob()` por chamada `/usuario/me`, adicionar CSP e BroadcastChannel

**Independent Test**: Fazer login e verificar que `localStorage.getItem('token')` retorna `null` e token não é acessível via `document.cookie`

- [ ] T016 [US2] Remove `setToken()`/`getToken()` from `frontend/src/services/api.js`, add `credentials: 'include'` to all requests, remove `localStorage` token logic
- [ ] T017 [US2] Replace `getLoggedUserId()` and `getLoggedUserProfile()` in `frontend/src/shared/util.js` — remove `atob()`, call `GET /usuario/me` instead
- [ ] T018 [US2] Update `frontend/src/pages/login/LoginPage.js` to handle new cookie-based auth flow
- [ ] T019 [US2] Update route guard in `frontend/src/main.js` (no longer relies on localStorage token)
- [ ] T020 [P] [US2] Add CSP meta tag to `frontend/index.html`
- [ ] T021 [US2] Add `BroadcastChannel` for cross-tab logout sync in `frontend/src/services/auth.js` (or `main.js`)

**Checkpoint**: Auth flows fully working via httpOnly cookie. Run `npm test` (216 tests) + `yarn test` (149 tests).

---

## Phase 5: Polish & Verification

**Purpose**: Final validation and cross-cutting concerns

- [ ] T022 Run full test suites: `cd backend && yarn test && yarn lint`, `cd frontend && npm test`
- [ ] T023 Manual verification per `quickstart.md` (login sets cookie, `/usuario/me` works, XSS injection rendered as text, CSP present)
- [ ] T024 [P] Update `AGENTS.md` with any new commands or conventions from this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (cookie-parser installed) — BLOCKS US2 frontend work
- **US1 — XSS (Phase 3)**: No backend dependencies — can start immediately after Setup (independent of Phase 2)
- **US2 — JWT Frontend (Phase 4)**: Depends on Phase 2 (backend endpoints and cookie auth must be ready)
- **Polish (Phase 5)**: Depends on Phases 3 and 4

### Parallel Opportunities

- T001 + T002: Install backend and frontend deps in parallel
- T004 + T006: JwtAuthGuard and `/usuario/me` can be done in parallel (different files)
- T008–T015: All XSS fixes are independent — fully parallelizable across all pages
- T020: CSP can be done in parallel with other US2 tasks (independent file)
- Phase 3 (US1) and Phase 2 (backend) can run in parallel by different developers

### Implementation Order (solo developer)

1. Phase 1: T001 + T002
2. Phase 2: T003 → T004 + T006 → T005 → T007
3. Phase 3: T008–T015 (any order, all parallel)
4. Phase 4: T016 → T017 → T018 → T019 → T020 → T021
5. Phase 5: T022 → T023 → T024
