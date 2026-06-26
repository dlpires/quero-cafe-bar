# Implementation Plan: User Permissions Profiles

**Feature**: `specs/014-user-permissions-profiles/spec.md`
**Created**: 2026-06-25
**Status**: Draft

## Technical Context

### Current Architecture
- **Backend**: NestJS 11, TypeORM, MySQL 8.x
  - `Usuario` entity: id, nome, usuario, senha, perfil (number, default 0)
  - Profile values: 0=Administrador, 1=Atendente, 2=Cozinha (to be added)
  - JWT token payload includes `{ id, perfil }` — signed via `jsonwebtoken`
  - `JwtAuthGuard`: global guard that validates token and attaches `user` to request, but **never checks `perfil`**
  - No role/permission guard exists — all authenticated users have identical access
  - All controllers (`usuario`, `produto`, `mesa`, `comanda`, `comanda-item`) are open to any authenticated user

- **Frontend**: Ionic 8 Vanilla JS, Vite 7
  - `Header.js`: `createAndInjectMenu()` builds sidebar menu with **all 6 items hardcoded** — no profile filtering
  - `main.js`: route listener only checks `logged_in` flag — no profile-based route protection
  - `util.js`: `getLoggedUserProfile()` fetches profile via `GET /usuario/me`, cached in memory (`_cachedUser`)
  - No page-level permission checks exist in any custom element

### Key Decisions (from clarify session)
1. **Atendente permissions**: Read-only for produtos/mesas, full CRUD for comandas
2. **Cozinha permissions**: Kitchen route only, can update comanda-item delivery status
3. **Self-profile change**: Blocked at backend for non-Admin users
4. **Audit logging**: Log sensitive actions (user CRUD, profile changes, record deletions)

### Unknowns (resolved in research.md)
No technical unknowns — the stack is fully defined by the constitution. Research covers best practices for implementation patterns.

## Infrastructure Fixes

No pre-existing infrastructure fixes are required for this feature. The system compiles and tests pass.

## Constitution Check

**Gate evaluation** — all five constitutional principles:

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. API-First | PASS | No new endpoints; existing endpoint contracts are extended with role metadata via a `@Roles()` decorator. The permission matrix in `contracts/` defines which roles can access which endpoints. |
| II. Modular Architecture | PASS | The `RolesGuard` fits in `src/common/guards/` alongside `JwtAuthGuard`. Frontend menu filtering stays in `Header.js`. Route guard extends `main.js`. No new modules needed. |
| III. Test-First (NON-NEGOTIABLE) | MUST ENSURE | New tests required: `RolesGuard` unit tests, profile-filtered menu tests, route guard tests. Must follow RED-GREEN-REFACTOR. |
| IV. Full-Stack Consistency | PASS | Both backend and frontend use the same `perfil` numeric values (0, 1, 2). JWT token carries the profile for frontend consumption. No data contract drift. |
| V. Security & Observability | PASS | The feature explicitly addresses role-based access control (FR-010), self-profile change prevention (FR-016), and audit logging (FR-017). These strengthen the existing security posture. |

## Phases

### Phase 0: Research (research.md)
Research best practices for: NestJS RolesGuard implementation, frontend route/menu filtering with Web Components, audit logging in NestJS.

### Phase 1: Design & Contracts
- `data-model.md`: Entity definitions and profile value references
- `contracts/`: API permission matrix (profile × endpoint)
- `quickstart.md`: Setup and implementation instructions
- Update AGENTS.md SPECKIT markers

### Phase 2: Implementation Tasks
- Backend: Create `@Roles()` decorator + `RolesGuard` + apply to all controllers
- Backend: Add audit logging infrastructure
- Backend: Validate perfil range in DTOs (0-2)
- Frontend: Filter menu items in `Header.js` based on user profile
- Frontend: Extend route guard in `main.js` for profile-based protection
- Frontend: Add per-page permission checks in sensitive pages (connectedCallback)
- Frontend: Update user registration form to include Cozinha profile
- Tests: `RolesGuard.spec.ts`, updated `Header.spec.js`, updated route guard tests

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| Spec complete and clarified | PASS | 4 clarifications resolved in clarify session |
| All FRs are testable | PASS | 17 FRs all testable |
| Backward compatibility preserved | PASS | New profile value only; existing perfil=0 and perfil=1 users unaffected |
| Migration strategy | N/A | No DB schema changes needed — `perfil` field already exists |
