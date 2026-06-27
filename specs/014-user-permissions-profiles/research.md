# Research: User Permissions Profiles

**Date**: 2026-06-25
**Status**: Complete

## R-01: NestJS RolesGuard implementation pattern

- **Decision**: Implement a `@Roles()` parameter decorator + `RolesGuard` that reads metadata via `Reflector`.
- **Rationale**: This is the standard NestJS pattern for RBAC. It integrates with the existing `JwtAuthGuard` via guard chaining. The `@Roles()` decorator sets route metadata; `RolesGuard` reads it and compares against `request.user.perfil`.
- **Alternatives considered**:
  - Middleware-based check: Would not have access to route handler metadata; less granular.
  - Per-controller if/else checks in each method: Duplicated logic, error-prone.
  - Custom decorator with guard composition: Chosen pattern; cleanest separation.
- **Implementation**:
  1. Create `src/common/decorators/roles.decorator.ts` — exports `Roles(...roles: number[])` using `SetMetadata`
  2. Create `src/common/guards/roles.guard.ts` — injects `Reflector`, reads `roles` metadata, compares with `request.user.perfil`
  3. Apply `@UseGuards(RolesGuard)` globally in `app.module.ts` alongside `JwtAuthGuard` (or per-module)
  4. Apply `@Roles(0)` to admin-only endpoints, `@Roles(0, 1)` to atendente endpoints, no decorator for public/any-authenticated

## R-02: Frontend menu filtering approach

- **Decision**: Refactor `Header.js` to accept user profile and filter menu items dynamically before DOM injection.
- **Rationale**: The menu is built as an HTML string in `createAndInjectMenu()`. By passing the profile number and filtering the items array, we avoid redundant DOM manipulation. The profile is already available via `getLoggedUserProfile()`.
- **Alternatives considered**:
  - CSS hide/show with classes: Would require all items in DOM, less secure for observability.
  - Conditional template string with if/else for each profile: Brittle and hard to maintain.
  - Post-render DOM removal: Causes flash of hidden content.
- **Implementation**:
  1. Define a permission map object: `{ '/home': [0, 1], '/produtos': [0, 1], '/usuarios': [0], '/mesas': [0, 1], '/comandas': [0, 1], '/cozinha': [0, 2] }`
  2. In `createAndInjectMenu(perfil)`, call `getLoggedUserProfile()` and filter `menuItems` by permission map
  3. Menu items array becomes: `[{ url: '/home', label: 'Home', icon: 'home-outline', profiles: [0, 1] }, ...]`
  4. Filter with `.filter(item => item.profiles.includes(perfil))` before generating HTML

## R-03: Frontend route guard for profile-based access

- **Decision**: Extend the `ionRouteDidChange` listener in `main.js` to check profile permissions before allowing navigation.
- **Rationale**: Existing listener already handles auth checks. Adding profile validation in the same place keeps all navigation logic centralized. Returning `false` or redirecting is straightforward.
- **Alternatives considered**:
  - Per-page `connectedCallback` checks: Decentralized, easy to miss a page.
  - IonRoute guard hooks: Not available in vanilla Ionic 8 Web Components.
- **Implementation**:
  1. Define the same permission map as in R-02 (or import from shared module)
  2. In the `ionRouteDidChange` callback, after auth check, call `getLoggedUserProfile()`
  3. Look up the destination path in the permission map
  4. If profile not in allowed profiles, redirect to profile's home (`/home` for Admin/Atendente, `/cozinha` for Cozinha)
  5. Add per-`connectedCallback` check as defense-in-depth on sensitive pages

## R-04: Audit logging in NestJS

- **Decision**: Create a lightweight `AuditService` that writes to a dedicated `audit_log` table via TypeORM.
- **Rationale**: A dedicated table allows querying audit history without affecting operational tables. Using TypeORM keeps the approach consistent with the rest of the codebase.
- **Alternatives considered**:
  - File-based logging (winston/pino): Not easily queryable, harder to maintain.
  - Console.log only: No persistence, not auditable.
  - Database trigger: Less flexible, harder to test.
- **Implementation**:
  1. Create `AuditLogEntity`: id, userId, action (string), resource (string), resourceId (number), details (JSON), timestamp
  2. Create `AuditService` with a `log(userId, action, resource, resourceId, details?)` method
  3. Inject into `UsuarioService` for user CRUD + profile changes
  4. Inject into other services for record deletions
  5. Generate migration for the new `audit_logs` table

## R-05: Profile value validation

- **Decision**: Add custom validation in `CreateUsuarioDto` and `UpdateUsuarioDto` to restrict perfil to 0, 1, 2.
- **Rationale**: Prevents invalid profile values from entering the system. Uses class-validator custom decorator for consistency with existing validation patterns.
- **Implementation**: `@IsIn([0, 1, 2], { message: 'Perfil must be 0 (Admin), 1 (Atendente), or 2 (Cozinha)' })` on the `perfil` field in DTOs.
