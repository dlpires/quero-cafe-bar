# Research: UX Foundation — Shared Utilities & Fixes

## Overview

Phase 0 of the UX implementation plan calls for creating shared utility
functions in the frontend to standardize UX patterns and fix two known issues
in the API service. All technical context was resolved from the existing
codebase — no NEEDS CLARIFICATION markers remain.

## Current State Analysis

### existing `shared/util.js`
- Contains only a single `logout()` function
- Uses `localStorage.clear()` instead of scoped `removeItem('token')`
- Functions are exported as ES module named exports

### existing `services/api.js`
- Sends `ngrok-skip-browser-warning: 'true'` header on all requests (lines 33, 88)
- Uses `localStorage.clear()` on 401 responses (line 54)
- Token key used consistently across the codebase

### Test Infrastructure
- Jest 29.x with `jest.mock()` for mocking dependencies
- `api.spec.js` mocks `fetch`, `localStorage`, and environment
- `util.spec.js` tests the `logout` function
- Test count: 64 tests across 6 suites

## Technology Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Toast mechanism | `ion-toast` component | Already available in Ionic — no new dependencies |
| Loading mechanism | `ion-loading` component | Already available in Ionic — no new dependencies |
| Empty state | Custom HTML template | Simple DOM generation — no template engine needed |
| Validation approach | Pure functions returning error strings | Testable, no side effects, composable |
| Focus management | `focus()` on first input/button | Standard DOM API, works in Ionic shadow DOM |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Custom event-based toast | `ion-toast` already provides `present()` API — simpler |
| Third-party toast library | Unnecessary dependency — Ionic provides built-in solution |
| Inline loading per page | Duplicates code — shared wrapper reduces repetition |
| Form library (e.g., VeeValidate) | Overkill for 3-4 validation rules — pure functions suffice |

## API Service Fixes

### `localStorage.clear()` → `removeItem('token')`
- Current: `localStorage.clear()` wipes all stored data (including non-auth keys)
- Target: `localStorage.removeItem('token')` only removes the auth token
- Impact: Prevents accidental loss of other localStorage data
- Test impact: `api.spec.js` and `util.spec.js` reference `clear` — tests need update

### `ngrok-skip-browser-warning` header
- Current: Hardcoded header sent on every request
- Target: Remove header or make it configurable via environment
- Production URL in `environment.prod.js` already points to ngrok
- If header is only needed for ngrok development, it can be gated behind
  `environment.production` flag
