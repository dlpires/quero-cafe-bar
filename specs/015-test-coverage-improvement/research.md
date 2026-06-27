# Research: Test Coverage Improvement

## Decision: Mocking Strategy — Backend

**Decision**: Use `Test.createTestingModule` with mocked TypeORM repositories and services

**Rationale**: All existing backend tests use this pattern via `@nestjs/testing`. Introducing a different mocking library would add unnecessary complexity and deviate from project conventions.

**Alternatives considered**:
- Manual instantiation without NestJS DI: Would lose dependency injection and module context, making tests less realistic
- In-memory SQLite database: Adds setup overhead; not needed since business logic tests don't require actual DB queries

---

## Decision: Mocking Strategy — Frontend

**Decision**: Use `jest.mock` for `api.js` and DOM Custom Elements for page lifecycle testing

**Rationale**: The project uses Jest with `jest-environment-jsdom`. All existing frontend tests use `jest.mock` for external dependencies. Page tests need real DOM to test `connectedCallback` — `document.createElement` + insertion into DOM is the standard approach for Custom Elements testing.

**Alternatives considered**:
- Shallow rendering (no DOM): Would not exercise `connectedCallback`, which is the main coverage gap
- Full JSDOM with all Ionic components: Overly complex; mocking API calls and checking DOM output is sufficient

---

## Decision: Cache TTL Implementation

**Decision**: Timestamp-based expiration with `Date.now()` comparison

**Rationale**: Simplest approach that meets the requirement. Store the fetch timestamp alongside the cached user object. Check `Date.now() - timestamp > 300000` (5 min) before returning cache.

**Alternatives considered**:
- `setTimeout`-based invalidation: More complex, requires cleanup, and doesn't handle tab visibility changes
- BroadcastChannel: Over-engineered for a single-user SPA; adds complexity without corresponding benefit

---

## Decision: XSS Refactoring Approach

**Decision**: Replace `innerHTML` with `document.createElement` + `textContent` + `appendChild`

**Rationale**: Consistent with the patterns already applied in recent commits to `ListProdutoPage.js`, `ListMesaPage.js`, etc. No new dependencies required (e.g., DOMPurify is unnecessary since labels are hardcoded).

**Alternatives considered**:
- DOMPurify sanitization: Adds a dependency for hardcoded content — over-engineering
- Keeping innerHTML with eslint-plugin-no-innerhtml: Doesn't fix the underlying pattern inconsistency

---

## Decision: JWT Auth Guard Testing Approach

**Decision**: Mock `jsonwebtoken.verify` and use ExecutionContext mock objects

**Rationale**: The guard relies on `Reflector` for `@Public()` decorator detection and `jsonwebtoken.verify` for token validation. Both can be safely mocked. The `ExecutionContext` mock needs to provide `switchToHttp().getRequest()` with realistic `headers`, `cookies`, and route handler metadata.

**Alternatives considered**:
- Integration test with real token generation: Would require a running NestJS app and is better suited for e2e tests
- Using `TestingModule` with all dependencies: Overkill for a single guard with only 2 external dependencies (`Reflector`, `jsonwebtoken`)
