# Implementation Plan: UX Foundation — Shared Utilities & Fixes

**Branch**: `001-ux-shared-utilities` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-ux-shared-utilities/spec.md`

**Note**: Phase 0 of the UX implementation plan from `analysis/ux-14052026/implementation-plan.md`.

## Summary

Create a set of reusable shared utility functions in the frontend (`shared/util.js`)
to eliminate code duplication and establish consistent UX patterns across all pages:
- `showToast()` for success/error feedback
- `withLoading()` to prevent double submissions
- `createEmptyState()` for rich empty list states
- `validateRequired()` and `validatePositiveNumber()` for frontend validation
- `focusFirstElement()` for accessibility keyboard focus

Also fix two API service issues: replace `localStorage.clear()` with scoped
`removeItem('token')` and remove hardcoded `ngrok-skip-browser-warning` header.

## Technical Context

**Language/Version**: JavaScript (Vanilla ES Modules) / Ionic 8.x / Vite 7.x

**Primary Dependencies**: None new — only extending existing `shared/util.js`

**Storage**: `localStorage` (token key only)

**Testing**: Jest 29.x (`npm test`)

**Target Platform**: Android (Capacitor 8.x) + Web (Vite dev server)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Utility functions MUST NOT introduce measurable overhead
(< 5ms each call)

**Constraints**: All existing tests MUST continue passing without modification;
functions MUST be pure or have no side effects beyond DOM/UI interaction

**Scale/Scope**: Single frontend module (`shared/util.js` + `services/api.js`
patches)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — No API changes needed. Feature is purely frontend UX
   utilities. ✅ PASS (N/A)
2. **Modular Architecture** — Adding utilities to `shared/util.js` fits existing
   structure; api.js patches are in the correct service layer. ✅ PASS
3. **Test-First** (NON-NEGOTIABLE) — Existing tests MUST continue passing; new
   utility functions MUST be tested before implementation. ✅ PASS
4. **Full-Stack Consistency** — No backend changes involved. ✅ PASS (N/A)
5. **Security & Observability** — Fixing `localStorage.clear()` → scoped
   `removeItem('token')` improves security; removing `ngrok` header eliminates
   debug leakage. ✅ PASS

**Result**: All gates pass. No complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-ux-shared-utilities/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── shared/
│   │   └── util.js          # Target file for new utility functions
│   ├── services/
│   │   └── api.js            # Target for localStorage + ngrok fixes
│   ├── pages/                # Consumers of utility functions
│   │   ├── home/
│   │   ├── login/
│   │   ├── produto/
│   │   ├── usuario/
│   │   ├── mesa/
│   │   └── comanda/
│   └── environments/
└── tests/
    └── unit/
```

**Structure Decision**: Option 2 (Web application with frontend + backend).
This feature touches only the frontend layer — specifically `shared/util.js`,
`services/api.js`, and their tests.

## Complexity Tracking

> *Not needed — all constitution gates pass.*
