# Quickstart: User Permissions Profiles

## Prerequisites

- Working backend and frontend dev servers
- Database migrated with latest schema
- All existing tests passing (`yarn test` + `npm test`)

## Implementation Order

### Phase 1: Backend — Infrastructure

1. **Create Roles decorator**: `src/common/decorators/roles.decorator.ts`
2. **Create RolesGuard**: `src/common/guards/roles.guard.ts` — reads `@Roles()` metadata from route handler, compares with `request.user.perfil`
3. **Register RolesGuard** globally in `app.module.ts` (behind `JwtAuthGuard`)
4. **Create AuditLog entity**: `src/modules/audit/entities/audit-log.entity.ts`
5. **Create AuditService**: `src/modules/audit/audit.service.ts` — log method
6. **Create AuditModule**: `src/modules/audit/audit.module.ts`
7. **Generate migration**: `yarn make:migration AddAuditLogTable`
8. **Run migration**: `yarn migrate`

### Phase 2: Backend — Permission Enforcement

Apply `@Roles()` decorators to all controller methods per the [API Permission Matrix](contracts/api-permission-matrix.md).

Key patterns:
- Admin-only: `@Roles(0)` on usuario CRUD, produto/mesa write endpoints
- Atendente-allowed: `@Roles(0, 1)` on comanda CRUD, produto/mesa read
- Cozinha-allowed: `@Roles(0, 2)` on comanda read, comanda-item status update
- Inject `AuditService` into controllers and call `log()` on sensitive operations

### Phase 3: Frontend — Menu Filtering

1. Define permission map in `Header.js` (or shared constants file)
2. Refactor `createAndInjectMenu()` to accept profile and filter items
3. Call `getLoggedUserProfile()` before building menu

### Phase 4: Frontend — Route Guard

1. Extend `ionRouteDidChange` listener in `main.js`
2. After auth check, call `getLoggedUserProfile()` and verify route permission
3. Add per-page `connectedCallback` check on sensitive pages (usuarios, produto register/edit)

### Phase 5: Frontend — UI Updates

1. Update `RegUsuarioPage.js` to include Cozinha profile in select options
2. Hide create/edit/delete buttons on list-produto-page and list-mesa-page for Atendente users
3. Ensure Cozinha profile redirects to `/cozinha` on login

### Phase 6: Tests

1. `RolesGuard.spec.ts`: Test guard with valid/invalid profiles, no decorator case
2. `Header.spec.js`: Test menu items filtered by profile
3. `main.js` route guard tests: Test redirect for unauthorized profiles
4. Update existing controller tests to account for new guards (add profile to JWT mock)
5. `AuditService.spec.ts`: Test audit log creation

## Verification

```bash
cd backend && yarn test        # All suites passing
cd frontend && npm test        # All suites passing
# Manual: login as each profile and verify menu items
