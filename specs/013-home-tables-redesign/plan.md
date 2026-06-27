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

## Infrastructure Fixes Applied (2026-06-25)

Before implementing this feature, the following pre-existing bugs were fixed:

### 1. Backend — Dependency Injection resolution (ComandaItemModule)

**Problem:** `yarn start:dev` crashed with `UnknownDependenciesException`:
```
Nest can't resolve dependencies of the ComandaItemService
(ComandaItemRepository, ?). Please make sure that the argument
"ComandaRepository" at index [1] is available in the ComandaItemModule context.
```

**Root cause:** `ComandaItemService` (src/modules/comanda-item/comanda-item.service.ts:17) injects `ComandaRepository` to validate comanda status, but `ComandaItemModule` did not have access to it.

**Changes made:**
| File | Change |
|------|--------|
| `src/modules/comanda/comanda.module.ts:11` | Added `TypeOrmModule` to `exports` array |
| `src/modules/comanda-item/comanda-item.module.ts:8,11` | Added `import { ComandaModule }` and included `ComandaModule` in `imports` |

### 2. Tests — MesaService.spec.ts (2 tests)

**Problem:** `TypeError: Cannot read properties of undefined (reading 'getRepository')` in `MesaService.findAll` which uses `this.mesaRepository.manager.getRepository(Comanda)`.

**Fix:** Added mock `manager` object with `getRepository` returning a chainable query builder mock (`select → where → andWhere → getRawMany`). Updated assertion to expect `hasActiveComanda: false` on each mesa.

### 3. Tests — ComandaService.spec.ts (4 tests)

**Problem:** `expect(jest.fn()).toHaveBeenCalledWith(...expected)` failed because the service calls `findOne` with `relations: ['mesa', 'itens', 'itens.produto']` but tests expected calls without that property.

**Fix:** Added `relations: ['mesa', 'itens', 'itens.produto']` to all `findOne` expectations in `findOne`, `findOneByMesaId`, `update`, and `remove` test cases.

### 4. Migration — `status` column não existia no banco

**Problem:** `Unknown column 'c.status' in 'where clause'` no `GET /mesa`.
O `MesaService.findAll` consulta `c.status = 'aberta'` mas a coluna `status`
não existia na tabela `comandas`. A entidade `Comanda` já tinha o campo
(`comanda.entity.ts:23`) mas nenhuma migration havia sido gerada/aplicada.

A migration auto-gerada (`1782401239491-AddComandaStatus.ts`) continha
operações redundantes (`CREATE TABLE comandasItens`, FKs) que já existiam
da migration inicial, causando `QueryFailedError: Table 'comandasitens' already exists`.

**Changes made:**
| File | Change |
|------|--------|
| `src/database/migrations/1782401239491-AddComandaStatus.ts` | Removido `CREATE TABLE comandasItens`, `CHANGE obs_comanda`, e `ADD CONSTRAINT` FKs — mantido apenas `ALTER TABLE comandas ADD status varchar(10) NOT NULL DEFAULT 'aberta'` |
| Migration run | `yarn migrate` executado com sucesso |

### 5. Backend — `hasActiveComanda` sempre `false`

**Problem:** Todas as mesas apareciam como "Disponível" no frontend, mesmo as que possuíam comandas abertas.

**Root cause:** `mesa.service.ts:53` — `activeComandas.map((r) => Number(r.c_id_mesa))`.
O `getRawMany()` do TypeORM retorna `[{ id_mesa: 1 }]` (sem prefixo `c.`),
então `r.c_id_mesa` é `undefined` → `NaN` → Set vazio → `hasActiveComanda` sempre `false`.

**Fix:** `r.c_id_mesa` → `r.id_mesa` em `mesa.service.ts:53`.

### 6. Frontend — Paginação removida do HomePage

**Problem:** O HomePage paginava ~3-9 mesas por vez, exigindo navegação
desnecessária. Restaurantes têm tipicamente < 50 mesas, então todas devem
ser exibidas de uma vez.

**Changes made:**
| File | Change |
|------|--------|
| `HomePage.js` | Removida lógica de paginação (`pagination`, `renderPaginationControls`, `nextPage`, `prevPage`); `loadPage` chama `api.getMesas(0, 100)`; removido `<ion-footer>` com barra de paginação do template |
| `HomePage.spec.js` | Removidos testes de paginação; adaptado mock e chamadas `loadPage()` sem argumento |

### Result after fixes
- **Server**: `Nest application successfully started` on port 3001
- **Tests**: 151/151 passing, 22/22 suites
- **Migration**: `AddComandaStatus` aplicada — coluna `status` adicionada à tabela `comandas`
- **HomePage**: Todas as mesas exibidas de uma vez (sem paginação), status reflete corretamente `hasActiveComanda`

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
