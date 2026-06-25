# Implementation Plan: Home Tables Redesign

**Feature**: `specs/013-home-tables-redesign/spec.md`
**Created**: 2026-06-25
**Status**: Draft

## Technical Context

### Current Architecture
- **Backend**: NestJS 11, TypeORM, MySQL 8.x
  - `Comanda` entity: id, id_mesa, obs_comanda, mesa (relation), itens (relation) — **no status field**
  - `Mesa` entity: id, qtd_cadeiras, status (boolean — active/inactive)
  - `ComandaItem` entity: id_comanda, id_produto, qtd_item, valor_venda, statusPg (boolean), statusEntrega (boolean)
  - Existing endpoints: `GET /mesa` (paginated), `GET /comanda`, `GET /comanda/mesa/:id_mesa`, `POST /comanda`, `PATCH /comanda/:id`, `PATCH /comanda-item/:id_comanda/:id_produto`

- **Frontend**: Ionic 8 Vanilla JS, Vite 7
  - `HomePage` (custom element): currently shows comandas with delivery status pagination
  - `ListMesaPage`: exists at `/mesas` route with CRUD, shows table list with swipe-to-delete
  - `RegComandaPage`: at `/comanda/register` route, form with mesa selector + observação
  - `UpdateComandaPage`: at `/comanda/edit?id=:id` route, edits comanda data + manages itens (add/remove/status)
  - Shared util: `createCardSkeleton`, `createListSkeleton`, `showToast`, `createPaginationState`, `calculateResponsivePageSize`, `renderPaginationBar`, `createEmptyState`

### Key Decisions (from clarify session)
1. **Comanda lifecycle**: Add `status` field ("aberta"/"fechada") to Comanda entity. Migration required. Table shows "Disponível" only if all its comandas have status "fechada" or none exist.
2. **Kitchen view**: Move to new `/cozinha` route, preserving functionality.
3. **Inactive mesas**: Home page shows only active mesas (status=true). Inactive mesas managed via `/mesas`.

### Unknowns (to be resolved in research.md)
- **U-01**: Best approach to expose `hasActiveComanda` flag in mesa list endpoint — computed column vs subquery vs separate API call
- **U-02**: Whether RegComandaPage already accepts mesa query param for pre-selection (currently loads all mesas in dropdown)
- **U-03**: Page size defaults for home page table grid vs list view
- **U-04**: Router configuration for new `/cozinha` route
- **U-05**: How the "Fechar Comanda" action integrates into UpdateComandaPage UI

## Constitution Check

Project constitution principles:
- **Clean architecture**: Separation of concerns, services handle business logic
- **Validation-first**: class-validator DTOs with global ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- **Consistent error handling**: GlobalExceptionFilter, HTTP status consistency
- **Security**: JWT auth (JwtAuthGuard), CORS restricted, bcrypt for passwords
- **TypeORM migrations**: `synchronize: false`, explicit migrations

**Gate check**:
1. Are we introducing architectural violations? → No. Adding a field to existing entity and creating new page follows existing patterns.
2. Are we breaking existing tests? → Possibly. HomePage.spec.js tests comanda rendering — will need complete rewrite. ListComandaPage and UpdateComandaPage tests should be unaffected.
3. Are we introducing security risks? → No. Same auth pattern, no new sensitive data.
4. Are we following the migration strategy? → Yes. New field on Comanda requires `yarn make:migration`.

## Phases

### Phase 0: Research (research.md)
Resolve all unknowns listed above.

### Phase 1: Design & Contracts
- `data-model.md`: Updated entity definitions
- `contracts/`: API contracts for new/changed endpoints
- `quickstart.md`: Setup instructions for this feature
- Update AGENTS.md SPECKIT markers

### Phase 2: Implementation Tasks
- Backend: Add status field + migration + mesa list with active comanda flag
- Frontend: Rewrite HomePage as table view (cards/list toggle)
- Frontend: Create CozinhaPage (extracted from current HomePage)
- Frontend: Update RegComandaPage to accept mesa pre-select via query param
- Frontend: Add "Fechar Comanda" action to UpdateComandaPage
- Tests: Update HomePage.spec.js, add CozinhaPage.spec.js

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| Spec complete and clarified | PASS | 3 clarifications resolved |
| All FRs are testable | PASS | 18 FRs all testable |
| Backward compatibility preserved | PASS | New field, existing endpoints unchanged |
| Migration strategy defined | PASS | `yarn make:migration` for new status column |
