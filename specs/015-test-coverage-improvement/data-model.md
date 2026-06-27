# Data Model: Test Coverage Improvement

## Overview

This feature does not introduce new data entities or schema changes. All tests operate on existing entities via mocked TypeORM repositories. Below is the logical test model — the set of entities, their fields under test, and the validation rules being verified.

## Existing Entities Under Test

### JwtAuthGuard (common/guards/jwt-auth.guard.ts)

| Test Concern | Input | Expected Output |
|---|---|---|
| Public route | `@Public()` decorator present | `canActivate` returns `true` |
| Missing token | No `Authorization` header, no cookie | Throws `UnauthorizedException` |
| Valid token (header) | `Authorization: Bearer <valid-token>` | Returns `true`, payload on request |
| Valid token (cookie) | Cookie `token=<valid-token>` | Returns `true`, payload on request |
| Invalid/expired token | `Authorization: Bearer <invalid-token>` | Throws `UnauthorizedException` |
| Header priority | Both header and cookie present | Uses header token |
| Missing JWT_SECRET | `JWT_SECRET` env var not set | Throws `UnauthorizedException` |

### UsuarioService (modules/usuario/usuario.service.ts)

| Method | Test Scenario | Expected Behavior |
|---|---|---|
| `create()` | With `authenticatedUser` | Calls `AuditService.log('CREATE')`, returns new user |
| `create()` | Without `authenticatedUser` | No audit log, returns new user |
| `update()` | Non-admin changes own `perfil` | Throws `ForbiddenException` |
| `update()` | Admin changes other user's `perfil` | Persists change, logs audit with `previousPerfil`/`newPerfil` |
| `update()` | With new `senha` | Hashes with bcrypt before save |
| `remove()` | Self-deletion | Throws `ConflictException` |
| `remove()` | Admin deletes other user | Removes record, logs audit('DELETE') |

### ProdutoService (modules/produto/produto.service.ts)

| Method | Test Scenario | Expected Behavior |
|---|---|---|
| `update()` | Non-existent ID (999) | Throws `NotFoundException` |
| `remove()` | Non-existent ID (999) | Throws `NotFoundException` |

### AuditService (modules/audit/audit.service.ts)

| Method | Test Scenario | Expected Behavior |
|---|---|---|
| `findAll()` | No parameters | Default: `skip: 0`, `take: 50` |
| `findAll()` | Explicit parameters | Uses provided values |
| `findAll()` | Empty table | Returns `{ data: [], total: 0 }` |

## Frontend Modules Under Test

### api.js (services/api.js)

| Method | Scenario | Expected |
|---|---|---|
| `getMe()` | Authenticated (200) | Returns user object |
| `getMe()` | Unauthenticated (401) | Throws "Sessão expirada" |
| `logout()` | Success (200) | Returns confirmation message |

### util.js (shared/util.js)

| Function | Scenario | Expected |
|---|---|---|
| `getLoggedUser()` | Cache miss | Calls `api.getMe()`, caches result |
| `getLoggedUser()` | Cache hit | Returns cached, no API call |
| `getLoggedUser()` | API failure | Returns `null` |
| `getLoggedUser()` | After `clearLoggedUserCache()` | Re-fetches from API |
| `getLoggedUser()` | After TTL (5 min) | Re-fetches from API |
| `getLoggedUserId()` | User cached | Returns `user.id` |
| `getLoggedUserId()` | User null | Returns `null` |
| `getLoggedUserProfile()` | User cached | Returns `user.perfil` |
| `getLoggedUserProfile()` | User null | Returns `null` |
| `logout()` | Success | Clears localStorage, clears cache, navigates to `/login` |

### Header.js (shared/Header.js)

| Scenario | Expected |
|---|---|
| `ion-nav` present | Menu injected with `contentId: 'main-content'` |
| Multiple `createHeader()` calls | No duplicate menu |
| Login page | No menu button, no logout icon |
| Non-login page | Menu button and logout icon present |
| Admin profile (0) | 6 menu items visible |
| Waiter profile (1) | 3 menu items visible |
| Profile undefined | 6 menu items visible (fallback) |
| Menu rendering | Uses `createElement` + `textContent`, no `innerHTML` |

## Validation Rules (from Requirements)

| FR | Rule | Scope |
|---|---|---|
| FR-003 | Non-admin MUST NOT change own perfil | update() |
| FR-005 | User MUST NOT self-delete | remove() |
| FR-015 | Header.js, util.js MUST NOT use innerHTML | Render |
| FR-023 | _cachedUser MUST expire after 5 min TTL | getLoggedUser() |
| FR-025 | logout() MUST clean user_perfil from localStorage | logout() |
