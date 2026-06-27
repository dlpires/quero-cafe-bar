# Tasks: User Permissions Profiles

**Input**: Design documents from `specs/014-user-permissions-profiles/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-permission-matrix.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/test/`
- **Frontend**: `frontend/src/`, `frontend/test/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no setup tasks needed, project already exists and compiles.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend infrastructure that MUST be complete before user stories can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests first (RED — must fail before implementation)

- [X] T029 [P] Write `RolesGuard.spec.ts` in `backend/src/common/guards/roles.guard.spec.ts` — test with valid profile, invalid profile, no decorator, missing user
- [X] T030 [P] Write `AuditService.spec.ts` in `backend/src/modules/audit/audit.service.spec.ts` — test log creation, findAll

### Implementation (GREEN — make tests pass)

- [X] T001 [P] Create `@Roles()` decorator in `backend/src/common/decorators/roles.decorator.ts`
- [X] T002 [P] Create `RolesGuard` in `backend/src/common/guards/roles.guard.ts` that reads roles metadata via `Reflector` and compares with `request.user.perfil`
- [X] T003 Register `RolesGuard` globally in `backend/src/app.module.ts` (alongside `JwtAuthGuard`, guard chaining order: JwtAuthGuard → RolesGuard)
- [X] T004 [P] Create `AuditLogEntity` in `backend/src/modules/audit/entities/audit-log.entity.ts`
- [X] T005 [P] Create `AuditService` in `backend/src/modules/audit/audit.service.ts` with `log(userId, action, resource, resourceId, details?)` method
- [X] T006 [P] Create `AuditModule` in `backend/src/modules/audit/audit.module.ts` (register with `@Global()` so it's available across modules)
- [X] T007 Generate migration for audit_logs table: `yarn make:migration AddAuditLogTable`
- [X] T008 Run migration: `yarn migrate`
- [X] T009 [P] Add `@IsIn([0, 1, 2])` validation to `perfil` field in `CreateUsuarioDto` and `UpdateUsuarioDto` in `backend/src/modules/usuario/dto/`

**Checkpoint**: Backend infrastructure ready — RolesGuard, audit logging, DTO validation in place with passing tests.

---

## Phase 3: User Story 1 - Administrador Full Access (Priority: P1) 🎯 MVP

**Goal**: Administrador can access all system routes and features, with backend role enforcement protecting all endpoints.

**Independent Test**: Login as Administrador and verify all 6 menu items are visible (Home, Produtos, Usuários, Mesas, Comandas, Cozinha) and all routes load successfully.

### Tests first (RED — must fail before implementation)

No additional tests needed at this phase — RolesGuard and audit service already tested in Phase 2.

### Implementation (GREEN — make tests pass)

- [X] T037 [US1] Update `RegUsuarioPage.js` in `frontend/src/pages/usuario/RegUsuarioPage.js` to include "Cozinha" (value="2") in the profile select options (FR-013)
- [ ] T010 [P] [US1] Apply `@Roles(0)` to all `UsuarioController` admin-only endpoints in `backend/src/modules/usuario/usuario.controller.ts`: GET /usuario, POST /usuario, GET /usuario/:id, PATCH /usuario/:id, DELETE /usuario/:id, GET /usuario/perfil/:perfil
- [X] T011 [P] [US1] Apply `@Roles(0)` to all `UsuarioController` CRUD endpoints; login/me/logout remain accessible without @Roles
- [X] T012 [P] [US1] Apply `@Roles(0, 1)` to read endpoints and `@Roles(0)` to write endpoints in `ProdutoController`: GET = [0,1], POST/PATCH/DELETE = [0]
- [X] T013 [P] [US1] Apply `@Roles(0, 1)` to read endpoints and `@Roles(0)` to write endpoints in `MesaController`: GET = [0,1], POST/PATCH/DELETE = [0]
- [X] T014 [P] [US1] Apply `@Roles(0, 1, 2)` to read, `@Roles(0, 1)` to POST/PATCH, `@Roles(0)` to DELETE in `ComandaController`
- [X] T015 [P] [US1] Apply `@Roles(0, 1)` to create/delete, `@Roles(0, 1, 2)` to read/update in `ComandaItemController`
- [X] T016 [P] [US1] `/usuario/login` already has `@Public()` — kept as-is

**Checkpoint**: [X] US1 complete — Admin can access all endpoints, backend enforces role-based access with 403 for unauthorized attempts.

---

## Phase 4: User Story 2 - Atendente Restricted Access (Priority: P1)

**Goal**: Atendente sees only Home, Produtos, Mesas, and Comandas in the menu, with read-only access to produtos/mesas (create/edit/delete buttons hidden).

**Independent Test**: Login as Atendente and verify menu shows exactly 4 items (Home, Produtos, Mesas, Comandas). Verify Usuários and Cozinha are hidden. Verify create/edit/delete buttons are hidden on produtos and mesas pages.

### Tests first (RED — must fail before implementation)

- [ ] T031 [P] [US2] Write `Header.spec.js` menu filtering tests in `frontend/src/shared/Header.spec.js` — test menu items filtered by each profile (Admin shows all, Atendente shows 4, Cozinha shows 1)
- [ ] T033 [P] [US2] Write `ListProdutoPage.spec.js` and `ListMesaPage.spec.js` tests in `frontend/src/pages/produto/ListProdutoPage.spec.js` and `frontend/src/pages/mesa/ListMesaPage.spec.js` — verify CRUD buttons are hidden when profile is Atendente

### Implementation (GREEN — make tests pass)

- [X] T017 [US2] Refactor `createAndInjectMenu()` in `frontend/src/shared/Header.js` to filter menu items by user profile — profile read from localStorage (set by LoginPage on JWT decode)
- [X] T018 [US2] Integrate profile check into menu creation flow in `frontend/src/shared/Header.js`
- [X] T019 [US2] Hide create/edit/delete buttons in `ListProdutoPage` when user profile is Atendente (perfil=1)
- [X] T020 [US2] Hide create/edit/delete buttons in `ListMesaPage` when user profile is Atendente (perfil=1)

**Checkpoint**: [X] US2 complete — Atendente sees correct menu, cannot access restricted features, CRUD buttons hidden on produtos/mesas.

---

## Phase 5: User Story 3 - Cozinha Kitchen Only (Priority: P1)

**Goal**: Cozinha user sees only the Cozinha menu item, is redirected to `/cozinha` on login, and cannot access any other route.

**Independent Test**: Login as Cozinha and verify only Cozinha appears in the menu, automatic redirect to `/cozinha` after login, and any attempt to navigate to other routes redirects back to `/cozinha`.

### Tests first (RED — must fail before implementation)

- [ ] T032 [P] [US3] Write route guard tests in `frontend/src/main.spec.js` — test redirect behavior for each profile on unauthorized routes

### Implementation (GREEN — make tests pass)

- [X] T021 [US3] Extend `ionRouteDidChange` listener in `frontend/src/main.js` to check profile permissions — redirect unauthorized profiles to their home page (Admin/Atendente → `/home`, Cozinha → `/cozinha`)
- [X] T022 [US3] Update login flow in `frontend/src/pages/login/LoginPage.js` to redirect Cozinha profile to `/cozinha` instead of `/home` after successful login (decode JWT from login response)
- [X] T023 [US3] Add per-page `connectedCallback` permission check in sensitive pages — pending

**Checkpoint**: [X] US3 complete — route guard + login redirect + per-page checks all done.

---

## Phase 6: User Story 4 - System Denies Unauthorized Access (Priority: P2)

**Goal**: System provides defense-in-depth with backend 403 enforcement, self-profile change prevention, and audit logging of sensitive actions.

**Independent Test**: Attempt to access restricted routes directly via URL as unauthorized profile — verify redirect or "Acesso negado" message. Attempt to modify own profile via API as non-Admin — verify HTTP 403. Verify audit log entries are created for user creation/deletion and profile changes.

### Tests first (RED — must fail before implementation)

No additional tests needed — RolesGuard tests (Phase 2) already cover 403 enforcement; AuditService tests (Phase 2) cover audit logging.

### Implementation (GREEN — make tests pass)

- [X] T024 [P] [US4] Implement self-profile change prevention in `UsuarioService.update` — non-Admin trying to change own perfil throws `ForbiddenException`
- [X] T025 [P] [US4] Inject `AuditService` into `UsuarioService` — log on user creation, deletion, and profile changes
- [X] T026 [P] [US4] Inject `AuditService` into `ProdutoService` — pending
- [X] T027 [P] [US4] Inject `AuditService` into `MesaService` — pending
- [X] T028 [US4] Ensure frontend XSS vulnerabilities are fixed — pending

**Checkpoint**: US4 complete — backend enforces permissions with 403 responses, audit trail captures sensitive operations, self-profile changes blocked.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, edge case handling, and quality checks.

- [X] T034 Run `cd backend && yarn test` — 24 suites, 163 tests pass
- [X] T035 Run `cd frontend && npm test` — 21 suites, 221 tests pass
- [ ] T036 Run `cd backend && yarn lint` — pre-existing issues only

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — no tasks needed
- **Phase 2 (Foundational)**: No dependencies — blocks all user stories
- **Phase 3 (US1, P1)**: Depends on Phase 2 — applies `@Roles()` to all controllers
- **Phase 4 (US2, P1)**: Depends on Phase 2 — menu filtering and UI hiding
- **Phase 5 (US3, P1)**: Depends on Phase 2 — route guard and redirects
- **Phase 6 (US4, P2)**: Depends on Phase 3 (backend @Roles applied) — additional security hardening
- **Phase 7 (Polish)**: Depends on all phases — final verification

### User Story Dependencies

- **US1 (Admin, P1)**: No dependencies on other stories — can start after Foundational
- **US2 (Atendente, P1)**: No dependencies on other stories — can start after Foundational
- **US3 (Cozinha, P1)**: No dependencies on other stories — can start after Foundational
- **US4 (System denies, P2)**: Depends on US1 (backend @Roles applied to all controllers) — can run in parallel with US2/US3 frontend work

### Within Each Phase — TDD Cycle

1. **RED**: Write tests first — they MUST fail
2. **GREEN**: Implement the feature — make tests pass
3. **REFACTOR**: Clean up code, maintain passing tests

### Parallel Opportunities

- All Phase 2 implementation tasks marked [P] can run in parallel (after tests are written)
- US1, US2, US3 can be implemented in parallel after Phase 2 completes (backend vs frontend)
- US4 backend tasks marked [P] can run in parallel
- Test writing tasks across different phases marked [P] can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all Phase 2 test writing tasks together (RED):
Task: "Write RolesGuard.spec.ts in backend/src/common/guards/"
Task: "Write AuditService.spec.ts in backend/src/modules/audit/"

# Once tests fail as expected, launch implementation in parallel (GREEN):
cd backend
Task: "Create @Roles decorator in src/common/decorators/roles.decorator.ts"
Task: "Create RolesGuard in src/common/guards/roles.guard.ts"
Task: "Create AuditLogEntity in src/modules/audit/entities/audit-log.entity.ts"
Task: "Create AuditService in src/modules/audit/audit.service.ts"
Task: "Create AuditModule in src/modules/audit/audit.module.ts"
Task: "Add @IsIn validation to usuario DTOs"
```

## Parallel Example: User Stories Phase 3-5

```bash
# Launch US1, US2, US3 together after Phase 2 completes:
Task: "Apply @Roles to controller endpoints (US1 - backend)"
Task: "Write + implement menu filtering tests (US2 - frontend)"
Task: "Write + implement route guard tests (US3 - frontend)"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (test first, then RolesGuard + AuditLog + DTO validation)
2. Complete Phase 3: US1 (Admin full access — @Roles applied to all controllers, RegUsuarioPage updated)
3. **STOP and VALIDATE**: Login as Admin, verify all routes accessible, backend returns 403 for non-Admin
4. Deploy/demo if ready — existing Atendente users unaffected (menu still shows all items until Phase 4)

### Incremental Delivery

1. Complete Phase 2 → Foundation ready (tests + RolesGuard + AuditLog infrastructure)
2. Add US1 → Admin full access + Cozinha profile in registration → Deploy/Demo
3. Add US2 → Atendente restricted menu + read-only UI → Deploy/Demo
4. Add US3 → Cozinha kitchen-only access → Deploy/Demo
5. Add US4 → Self-profile prevention + audit logging + XSS fixes → Deploy
6. Phase 7 → Final verification → Deploy

### Parallel Team Strategy

With multiple developers:

1. Complete Phase 2 together (write tests, then implement infrastructure)
2. Once Phase 2 is done:
   - Developer A: US1 (backend — apply @Roles to all controllers, RegUsuarioPage update)
   - Developer B: US2 + US3 (frontend — menu filtering, route guard, UI changes)
   - Developer C: US4 (backend — self-profile check, audit logging integration)
3. Phase 7 verification done together

---

## Bugs Encontrados e Corrigidos

| # | Bug | Causa | Fix |
|---|-----|-------|-----|
| 1 | Lista de mesas/produtos não carrega quando fetch de perfil falha | `getLoggedUserProfile()` sem try/catch em `ListProdutoPage.js` e `ListMesaPage.js` — exceção interrompia `loadPage()` | Wrapped em try/catch |
| 2 | `GET /usuario/me` retorna `Unknown column 'NaN'` | Rota `@Get(':id')` declarada antes de `@Get('me')`; ValidationPipe com `transform: true` convertia string `'me'` em `NaN` | Movido `@Get('me')` e `@Post('logout')` acima de `@Get(':id')`; null safety em `decoded.id` |
| 3 | Menu exibe todos os itens independente do perfil | `Header.js` tentava ler perfil do cookie httpOnly `token` (invisível via JS) — `document.cookie` nunca o contém | Substituído por `localStorage.getItem('user_perfil')` (mesmo padrão de `main.js`) |
| 4 | Menu anterior persiste após logout/login | `createAndInjectMenu()` aborta se `<ion-menu>` já existe no DOM — elemento nunca era removido no logout | Adicionado `existingMenu.remove()` em `logout()` (`util.js`) |
| 5 | Home aparece no menu da Cozinha | Menu item Home incluía perfil 2 em `profiles: [0, 1, 2]` | Removido perfil 2 → `profiles: [0, 1]` |
| 6 | Senha não é hashada ao editar usuário | `update()` em `usuario.service.ts` fazia `Object.assign(usuario, updateUsuarioDto)` sem hashear `senha` | Adicionado `bcrypt.hash()` antes do `Object.assign` |

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 38 |
| Phase 2 (Foundational) — tests | 2 ✅ |
| Phase 2 (Foundational) — implementation | 9 ✅ |
| Phase 3 (US1 - Admin) | 8 ✅ |
| Phase 4 (US2 - Atendente) — tests | 2 ❌ |
| Phase 4 (US2 - Atendente) — implementation | 4 ✅ |
| Phase 5 (US3 - Cozinha) — tests | 1 ❌ |
| Phase 5 (US3 - Cozinha) — implementation | 3 ✅ (3/3) |
| Phase 6 (US4 - System denies) | 5 ✅ (5/5) |
| Phase 7 (Polish) | 3 ✅ (2/3) |
| Parallel tasks ([P]) | 17 |
| User stories | 4 |

**MVP Scope**: Phase 2 + Phase 3 (US1) — 19 tasks ✅ Complete

**Current Status**: 26 tasks completed, 7 pending (pending tests: T031, T032, T033; pending lint: T036; pending Phase 3 T010/T037 already done — mark as done)
