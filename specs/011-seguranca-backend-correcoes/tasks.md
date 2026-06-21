# Tasks: Correções de Segurança no Backend

**Input**: Design documents from `/specs/011-seguranca-backend-correcoes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks are excluded from this list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/` at repository root
- All paths are relative to `backend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and remove obsolete ones

- [ ] T001 Install `bcrypt`, `@nestjs/throttler`, `helmet` and `@types/bcrypt` via yarn in `backend/`
- [ ] T002 [P] Remove obsolete `crypto` npm package via `yarn remove crypto` in `backend/`

---

## Phase 2: Foundational — JwtAuthGuard (Blocking Prerequisite for US1)

**Purpose**: Create the JWT authentication guard that all user story 1 depends on

**⚠️ CRITICAL**: User Story 1 cannot proceed until this phase is complete

- [ ] T003 Create `JwtAuthGuard` in `backend/src/common/guards/jwt-auth.guard.ts` — guard that reads `Authorization: Bearer <token>` header, verifies JWT using `jsonwebtoken.verify()` with `{ algorithms: ['HS256'] }` and `JWT_SECRET`, injects decoded payload into `request.user`, and throws `UnauthorizedException` with PT-BR messages for missing/invalid/expired tokens

**Checkpoint**: Foundation ready — User Story 1 can now begin

---

## Phase 3: User Story 1 — JWT Authentication Guards (Priority: P1) 🎯 MVP

**Goal**: All API routes (except login) require valid JWT token; JWT algorithm is explicit (HS256) with 2h expiry; JWT_SECRET fallback hardcoded is removed.

**Independent Test**: Send GET request to any protected route (e.g., `GET /usuario`) without `Authorization` header → expect `401 { "message": "Token não fornecido" }`

### Implementation for User Story 1

- [ ] T004 [P] [US1] Apply `JwtAuthGuard` globally in `backend/src/main.ts` via `app.useGlobalGuards(new JwtAuthGuard())`
- [ ] T005 [P] [US1] Fix JWT algorithm and expiration in `backend/src/modules/usuario/usuario.controller.ts` — add `algorithm: 'HS256'` and change `expiresIn` from `'24h'` to `'2h'`
- [ ] T006 [P] [US1] Remove JWT_SECRET hardcoded fallback in `backend/src/modules/usuario/usuario.controller.ts` — replace `process.env.JWT_SECRET || 'dev-secret-change-in-production'` with validation that throws if `JWT_SECRET` is not configured

**Checkpoint**: At this point, User Story 1 should be fully functional — every route except login returns 401 without valid token.

---

## Phase 4: User Story 2 — bcrypt Password Hashing (Priority: P1)

**Goal**: Passwords are stored as bcrypt hashes (irreversible), not AES ciphertext; login uses `bcrypt.compare()`; ENCRYPTION_KEY fallback is removed.

**Independent Test**: Create a new user via API, then inspect the `senha` column in the database — value must start with `$2b$10$` (bcrypt format). Login with correct credentials succeeds; login with wrong credentials returns error.

### Implementation for User Story 2

- [ ] T007 [US2] Remove `EncryptionTransformer` from `backend/src/modules/usuario/entities/usuario.entity.ts` — replace `@Column({ type: 'varchar', transformer: new EncryptionTransformer() })` with plain `@Column()` for the `senha` field
- [ ] T008 [US2] Update `UsuarioService.create()` in `backend/src/modules/usuario/usuario.service.ts` — use `bcrypt.hash(createUsuarioDto.senha, 10)` before saving
- [ ] T009 [US2] Update `UsuarioService.login()` in `backend/src/modules/usuario/usuario.service.ts` — use `bcrypt.compare(senha, user.senha)` instead of decrypting stored password
- [ ] T010 [US2] Remove ENCRYPTION_KEY hardcoded fallback in `backend/src/common/encryption/encryption.utils.ts` — replace `process.env.ENCRYPTION_KEY || 'default_secret_key_32_characters'` with validation that throws if key is missing or shorter than 32 chars
- [ ] T011 [US2] Clean up unused files: remove `backend/src/common/encryption/encryption.transformer.ts` and consider removing `backend/src/common/encryption/encryption.utils.ts` if not used elsewhere
- [ ] T012 [US2] Generate TypeORM migration via `yarn make:migration MigratePasswordToBcrypt` in `backend/` and run `yarn migrate`

**Checkpoint**: At this point, User Story 2 should be fully functional — new passwords stored as bcrypt, existing AES passwords handled by migration.

---

## Phase 5: User Story 3 — No Hardcoded Secret Fallbacks (Priority: P2)

**Goal**: Application fails safely at startup if required secrets (`JWT_SECRET`) are not configured, instead of using insecure defaults. (ENCRYPTION_KEY validation done in US2.)

**Independent Test**: Start the application with `JWT_SECRET` environment variable unset — the application must fail to start with a clear error message indicating `JWT_SECRET` is not configured.

### Implementation for User Story 3

- [ ] T013 [US3] Add bootstrap environment validation in `backend/src/main.ts` — check that `JWT_SECRET` is defined before the application starts; throw descriptive error if missing
- [ ] T014 [US3] Add validation for `JWT_SECRET` in a NestJS lifecycle hook (e.g., `OnApplicationBootstrap` in `AppModule`) or keep it in `main.ts` before `bootstrap()` call

**Checkpoint**: Application refuses to start without required secrets.

---

## Phase 6: User Story 4 — Rate Limiting on Login (Priority: P2)

**Goal**: Login endpoint has rate limiting to prevent brute-force attacks; max 10 requests per minute per client; excess requests return HTTP 429.

**Independent Test**: Send 11 POST requests to `/usuario/login` within 1 minute — the 11th request must return `429 Too Many Requests`.

### Implementation for User Story 4

- [ ] T015 [US4] Configure `ThrottlerModule.forRoot()` in `backend/src/app.module.ts` with `ttl: 60000` and `limit: 10`
- [ ] T016 [US4] Register `ThrottlerGuard` as a global `APP_GUARD` provider in `backend/src/app.module.ts`

**Checkpoint**: Login endpoint blocks after 10 requests/minute with 429 status.

---

## Phase 7: User Story 5 — Restricted CORS (Priority: P3)

**Goal**: CORS accepts requests only from known origins in production; `localhost:5173` fallback in development.

**Independent Test**: Send a request to the API from an unauthorized origin (e.g., `Origin: https://evil.com`) in production mode — the server must reject with CORS error.

### Implementation for User Story 5

- [ ] T017 [US5] Replace `app.enableCors({ origin: '*' })` in `backend/src/main.ts` with `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'], methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true, preflightContinue: false, optionsSuccessStatus: 204 })`

**Checkpoint**: CORS restricted to configured origins.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improve overall security posture with additional protections

- [ ] T018 [P] Add `helmet()` middleware in `backend/src/main.ts` for security HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- [ ] T019 [P] Fix health check endpoint in `backend/src/app.service.ts` and `backend/src/app.controller.ts` — return only `{ health: 'ok', timestamp }` without app name/version
- [ ] T020 [P] Configure conditional SQL logging in `backend/src/config/orm.config.ts` — set `logging: process.env.NODE_ENV === 'production' ? ['error'] : true`
- [ ] T021 [P] Configure connection pool size in `backend/src/config/orm.config.ts` — add `extra: { connectionLimit: Number(process.env.MAX_CONNECTION_POOL_SIZE) || 10 }`
- [ ] T022 [P] Configure optional SSL for MySQL in `backend/src/config/orm.config.ts` — add conditional `ssl` block when `DB_SSL === 'true'`
- [ ] T023 Run lint: `yarn lint` in `backend/`
- [ ] T024 Run all tests: `yarn test` in `backend/` (must keep all 163 tests passing)
- [ ] T025 Run full validation per `specs/011-seguranca-backend-correcoes/quickstart.md`

---

## Phase 9: Seed de Administrador Padrão

**Purpose**: Criar mecanismo para gerar usuário admin padrão na inicialização, resolvendo o bootstrap do sistema pós-migração.

**Motivação**: Com o `JwtAuthGuard` global protegendo todas as rotas, não é possível criar o primeiro usuário sem já estar autenticado.

### Implementation for User Story 6

- [ ] T026 [US6] Add `seedAdminIfNeeded()` method to `backend/src/modules/usuario/usuario.service.ts` — checks repo for existing admin (`perfil: 0`), creates `admin`/`admin` with bcrypt hash if none found, returns boolean indicating if creation occurred
- [ ] T027 [US6] Create `SeedService` at `backend/src/common/seed/seed.service.ts` — injects `UsuarioService`, exposes `seed()` method that checks `SEED_ADMIN` env var and delegates to `usuarioService.seedAdminIfNeeded()`
- [ ] T028 [US6] Register `SeedService` in `backend/src/app.module.ts` providers and call `app.get(SeedService).seed()` in `backend/src/main.ts` before `app.listen()`
- [ ] T029 [US6] Add `SEED_ADMIN=true` to `backend/.env.example` with explanatory comment

**Checkpoint**: System boots with empty DB and `SEED_ADMIN=true` → admin user is created automatically; login with admin/admin returns JWT token.

---

## Bug Fix: Undefined Values em `where` de `findAll`

**Purpose**: Corrigir o padrão `{ skip, take, ...where } = dto` que propaga valores `undefined` para o TypeORM, interferindo no carregamento de `relations` aninhadas (ex: `itens.produto` na comanda).

**Motivação**: Ao chamar `GET /comanda?skip=0&take=8` sem filtros opcionais, o `where` resultante é `{ id: undefined, id_mesa: undefined }`. TypeORM pode falhar ao resolver `relations: ['mesa', 'itens', 'itens.produto']` com valores `undefined` no where, retornando a comanda sem itens.

### Implementation

- [ ] T030 [FIX] Filter `undefined` from `where` in `ComandaService.findAll()` — `backend/src/modules/comanda/comanda.service.ts`
- [ ] T031 [FIX] Filter `undefined` from `where` in `ProdutoService.findAll()` — `backend/src/modules/produto/produto.service.ts`
- [ ] T032 [FIX] Filter `undefined` from `where` in `MesaService.findAll()` — `backend/src/modules/mesa/mesa.service.ts`
- [ ] T033 [FIX] Filter `undefined` from `where` in `UsuarioService.findAll()` — `backend/src/modules/usuario/usuario.service.ts`

**Checkpoint**: Kitchen view (`/home`) displays comanda items correctly; all paginated list endpoints return proper data with relations loaded.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup
- **US1 (Phase 3)**: Depends on Foundational (JwtAuthGuard)
- **US2 (Phase 4)**: Depends on Setup only — independent of US1
- **US3 (Phase 5)**: Depends on US1 (JWT_SECRET validation) — startup validation requires inline fallback to be handled first
- **US4 (Phase 6)**: Depends on Setup only — independent
- **US5 (Phase 7)**: Depends on Setup only — independent
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Setup — No dependencies on other stories
- **US3 (P2)**: Depends on US1 + US2 (validates both secrets are hard-failing)
- **US4 (P2)**: Can start after Setup — No dependencies on other stories
- **US5 (P3)**: Can start after Setup — No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel
- T004, T005, T006 can all run in parallel (different aspects of US1)
- US1, US2, US4, US5 can all start in parallel after Setup completes
- All Polish tasks (T018–T022) can run in parallel
- T026 depends on US2 (bcrypt) — bcrypt must be available before seedAdminIfNeeded
- T027 depends on T026 (SeedService uses seedAdminIfNeeded)
- T028 depends on T027 (main.ts calls SeedService)
- T029 independent — can run any time
- T030-T033 independent — can run any time after implementation of respective services

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# All US1 tasks are independent — launch together:
Task: "Apply JwtAuthGuard globally in main.ts"
Task: "Fix JWT algorithm to HS256 and expiry to 2h in usuario.controller.ts"
Task: "Remove JWT_SECRET fallback in usuario.controller.ts"
```

## Parallel Example: Phase 8 (Polish)

```bash
# All Polish tasks are independent — launch together:
Task: "Add helmet() middleware in main.ts"
Task: "Fix health check response in app.service.ts / app.controller.ts"
Task: "Conditional SQL logging in orm.config.ts"
Task: "Connection pool size in orm.config.ts"
Task: "Optional MySQL SSL in orm.config.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (JwtAuthGuard)
3. Complete Phase 3: User Story 1 (JWT auth protection)
4. Complete Phase 4: User Story 2 (bcrypt migration)
5. **STOP and VALIDATE**: Run tests, verify auth works, verify passwords are bcrypt
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (JWT guards) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (bcrypt) → Test independently → Deploy/Demo
4. Add US3 (secrets validation) → Test independently → Deploy/Demo
5. Add US4 (rate limiting) → Test independently → Deploy/Demo
6. Add US5 (CORS) → Test independently → Deploy/Demo
7. Polish (Helmet, ORM config, health check) → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Setup is done:
   - Developer A: US1 (3 tasks, parallel)
   - Developer B: US2 (6 tasks, sequential)
   - Developer C: US4 (2 tasks, parallel) + US5 (1 task)
3. Developer A + B merge → US3 (2 tasks)
4. All teams merge → Polish (5 tasks, parallel)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to `backend/` directory
