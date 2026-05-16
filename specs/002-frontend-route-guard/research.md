# Research: Frontend Route Protection Patterns

**Date**: 2026-05-15
**Feature Spec**: [spec.md](spec.md)
**Phase**: Phase 0 — Research & Unknown Resolution

## Unknowns Resolution

No `[NEEDS CLARIFICATION]` markers were present in the spec. The following decisions were made based on existing codebase patterns:

### Decision 1: Two-layer auth guard

**Decision**: Implement route protection in two complementary layers.

**Rationale**: 
- **Layer 1 (Global)**: `ionRouteDidChange` event listener in `main.js` catches all navigation events and redirects unauthenticated users to `/login`. This is the primary defense.
- **Layer 2 (Per-page)**: `requireAuth()` call at the start of each page's `connectedCallback()` prevents flash of content and blocks API calls.

**Alternatives considered**:
- Single global guard only: Would allow brief flash of protected content before redirect.
- Per-page check only: Would not protect against navigation edge cases (e.g., back/forward browser buttons).
- Middleware-style interceptor on `ion-nav`: Not supported by Ionic's vanilla JS API without overriding internal methods.

### Decision 2: Auth service location

**Decision**: Create `src/services/auth.js` as a new service module.

**Rationale**: The `services/` directory already contains `api.js` as the API client singleton. An `auth.js` file with exported utility functions follows the same pattern as `shared/util.js` (named exports) and `api.js` (token management). Keeps auth logic centralized and testable.

**Alternatives considered**:
- Put auth functions in `shared/util.js`: Would mix concerns (util.js is for generic UI utilities).
- Inline in `main.js`: Would make testing harder.

### Decision 3: Navigation after auth redirect

**Decision**: Use `document.querySelector('ion-router').push('/login', 'root')` for redirects (consistent with login flow).

**Rationale**: The login page already uses this exact pattern (`router.push('/home', 'forward', 'replace')`). Using `'root'` direction ensures the protected page is removed from the navigation stack.

**Alternatives considered**:
- `window.location.href = '/login'`: Causes full page reload, losing state.
- `logout()` from `util.js`: Uses `window.location.href` which is appropriate for logout (clears all state) but not for guard redirects.

### Decision 4: `requireAuth()` return-early pattern

**Decision**: `requireAuth()` returns `false` when not authenticated, so `connectedCallback()` can `return` immediately.

**Rationale**: The pattern `if (!requireAuth()) return;` at the start of `connectedCallback()` prevents any rendering or API calls. The async import of `auth.js` at the top of each page ensures the function is available.

### Decision 5: Event listener timing

**Decision**: Use `customElements.whenDefined('ion-router')` before attaching the global guard listener.

**Rationale**: Ionic's async initialization means `ion-router` custom element may not be upgraded when `main.js` runs. Waiting for definition ensures events fire correctly.

**Confirmed patterns from codebase research**:

| Pattern | Approach | Source |
|---------|----------|--------|
| Module exports | Named exports (`export function`) | `util.js`, `Header.js` |
| Singleton | `class X { ... }; export const x = new X()` | `api.js` |
| Page definition | `customElements.define('page-name', ClassName)` | All pages |
| Page import | Static import in `main.js` | `main.js` |
| Navigation | `document.querySelector('ion-router').push()` | `LoginPage.js` |
| Auth token | `localStorage.getItem('token')` | `api.js` |
| Test pattern | `jest.mock()` inline, `jest.fn()` for methods | All spec files |
| Ionic mock | Custom elements registered with `if (!customElements.get(...))` guard | Test files |
