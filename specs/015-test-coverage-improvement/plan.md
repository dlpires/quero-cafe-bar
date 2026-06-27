# Implementation Plan: Test Coverage Improvement

**Branch**: `015-test-coverage-improvement` | **Date**: 26/06/2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-test-coverage-improvement/spec.md`

## Summary

Adicionar cobertura de testes automatizados para áreas críticas (P0) e de alta prioridade (P1/P2) do backend (NestJS) e frontend (Ionic + Vanilla JS): JwtAuthGuard (7 cenários), UsuarioService (auditoria e permissões, 7 cenários), ciclo de vida de 6 páginas frontend, api.js/util.js/Header.js (métodos de autenticação assíncronos, cache, menu), e casos de borda em ProdutoService/AuditService. Inclui refatoração de innerHTML residual em Header.js e util.js, adição de TTL de 5 min ao cache _cachedUser, e remoção de chave residual user_perfil do localStorage.

## Technical Context

**Language/Version**: TypeScript 5.x (backend), JavaScript ES2022 (frontend)

**Primary Dependencies**: Jest 29.x, @nestjs/testing (backend), ts-jest, jest-environment-jsdom (frontend), jsonwebtoken (mocked), bcrypt (mocked)

**Storage**: N/A — all tests use mocked TypeORM repositories and mocked fetch

**Testing**: Jest with --coverage (Istanbul/LCOV reporter); backend uses Test.createTestingModule; frontend uses jest.mock + Custom Elements DOM

**Target Platform**: Node.js 18+ (backend tests), jsdom (frontend tests)

**Project Type**: Web application (NestJS backend + Ionic frontend)

**Performance Goals**: N/A — test execution time should not increase by more than 30% over current baseline

**Constraints**: All 163 backend tests and 221 frontend tests MUST continue passing (zero regressions). All new tests MUST follow existing *.spec.* naming convention alongside source files.

**Scale/Scope**: 14 test suites (7 new/expanded backend + 7 frontend) across ~25 new test cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.1):**

1. **API-First** — N/A. This feature does not define new endpoints; it adds test coverage to existing endpoints. No new contracts needed.
2. **Modular Architecture** — PASS. Tests are added alongside existing source files within their respective modules (common/guards/, modules/usuario/, modules/produto/, modules/audit/, services/, shared/, pages/).
3. **Test-First** (NON-NEGOTIABLE) — PASS. This feature IS the application of the Test-First principle. All existing 384 tests will continue passing (FR-014), and coverage will increase. No implementation code is changed without corresponding tests.
4. **Full-Stack Consistency** — N/A. No new data contracts are introduced. Refactoring Header.js and util.js from innerHTML to DOM API maintains functional parity.
5. **Security & Observability** — PASS. XSS residual fixes (Header.js, util.js createEmptyState), cache TTL for profile staleness prevention, and removal of residual localStorage key all improve security posture.

**Gate Status**: PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/015-test-coverage-improvement/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Research findings
├── data-model.md        # Data/entity definitions (minimal — test-only)
├── quickstart.md        # Test execution guide
├── contracts/           # No new contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
backend/src/
├── common/guards/
│   ├── jwt-auth.guard.ts
│   └── jwt-auth.guard.spec.ts       # [NEW] P0 — 7 scenarios
├── modules/
│   ├── usuario/
│   │   ├── usuario.service.ts
│   │   └── usuario.service.spec.ts  # [EXPAND] audit + permissions
│   ├── produto/
│   │   ├── produto.service.ts
│   │   └── produto.service.spec.ts  # [EXPAND] edge cases
│   └── audit/
│       ├── audit.service.ts
│       └── audit.service.spec.ts    # [EXPAND] branch coverage

frontend/src/
├── services/
│   ├── api.js
│   └── api.spec.js                  # [EXPAND] getMe + logout
├── shared/
│   ├── Header.js                    # [REFACTOR] innerHTML → DOM API
│   ├── Header.spec.js               # [EXPAND] menu + perfil
│   ├── util.js                      # [REFACTOR] createEmptyState + cache TTL + user_perfil
│   └── util.spec.js                 # [EXPAND] async auth + cache + TTL + logout
└── pages/
    ├── list-produto-page/
    ├── list-mesa-page/
    ├── list-comanda-page/
    ├── list-usuario-page/
    ├── home-page/
    ├── login-page/
    └── [each with *.spec.js]        # [NEW] lifecycle tests
```

**Structure Decision**: Tests follow the existing `*.spec.*` convention alongside source files, consistent with the current project structure.

## Complexity Tracking

N/A — no Constitution violations.
