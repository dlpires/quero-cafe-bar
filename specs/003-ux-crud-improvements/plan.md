# Implementation Plan: UX CRUD Improvements

**Branch**: `003-ux-crud-improvements` | **Date**: 2026-05-22 | **Spec**: `specs/003-ux-crud-improvements/spec.md`

**Input**: Feature specification from `specs/003-ux-crud-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Improve UX of all CRUD pages (produto, usuario, mesa, comanda) with: success toast feedback after save, button disable during submit, frontend validation, safe 401 session cleanup, CSS inline-to-class migration, empty states with CTA, toast/alert DOM cleanup, consistent `router.push()` navigation, safe-area support for notched devices, minimum font sizes, and skeleton loading screens.

## Technical Context

**Language/Version**: Vanilla JS (ES Modules) + Ionic 8.x Web Components + Vite 7.x

**Primary Dependencies**: Ionic 8.x (`@ionic/core`), Vite 7.x, Capacitor 8.x (Android builds)

**Storage**: localStorage (JWT token only) — no backend storage changes; no new entities

**Testing**: Jest 29.x (`npm test`) — 8 suites, 105 tests passing; tests for pages in `*.spec.js` co-located with pages

**Target Platform**: Web (mobile-first, Android via Capacitor), viewports: 320px–1024px

**Project Type**: Mobile-hybrid web app (Ionic + Capacitor, Vanilla JS Web Components)

**Performance Goals**: Validation feedback <100ms (SC-004), skeleton loading replaces spinner during list fetch (FR-017)

**Constraints**: Zero inline layout styles (FR-009), font-size min 14px labels / 16px body (FR-016), touch targets already ≥44x44px per audit (except edit/delete ~36px — see mobile-first-audit.md §2.1)

**Scale/Scope**: 8 user stories across 4 CRUD entities × 2 page types (list + form/update) = ~12 page files to modify, ~6 CSS files, 1 shared utility update (api.js 401 handling)

**NEEDS CLARIFICATION**: None — all ambiguities resolved via prior `/speckit.clarify` session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — ✅ PASS. This feature is frontend-only UX. No new API endpoints needed. Consumes existing REST endpoints (`/produtos`, `/usuarios`, `/mesas`, `/comandas`).

2. **Modular Architecture** — ✅ PASS. All changes fit within existing page modules (`pages/produto/`, `pages/usuario/`, `pages/mesa/`, `pages/comanda/`). No new modules needed. Shared utilities already in `shared/util.js`.

3. **Test-First** (NON-NEGOTIABLE) — ⚠️ Needs attention. Existing tests (105 passing) MUST continue passing. New tests MUST be written for: toast behavior after save, button disabled state during submit, validation error display, DOM cleanup of toasts/alerts. Tests MUST be failing before implementation begins.

4. **Full-Stack Consistency** — ✅ PASS. No backend contract changes. Same data contracts apply.

5. **Security & Observability** — ✅ PASS. User Story 4 improves 401 handling (safe `removeItem` over `clear()`). Validation (FR-005–007) adds frontend guard layer complementing backend ValidationPipe. Error toasts replace silent failures.

**Gate verdict**: ✅ PASS — proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/003-ux-crud-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/
│   ├── produto/
│   │   ├── ListProdutoPage.js      # Modify: empty state, skeleton, router.push, inline styles
│   │   ├── ListProdutoPage.css     # Modify: padding, safe-area, font-size, class-based styles
│   │   ├── RegProdutoPage.js       # Modify: toast + loading + validation
│   │   ├── UpdateProdutoPage.js    # Modify: toast + loading + validation
│   │   ├── RegProdutoPage.css      # Modify (if empty): font-size rules
│   │   └── UpdateProdutoPage.css   # Modify (if empty): font-size rules
│   ├── usuario/
│   │   ├── ListUsuarioPage.js      # Modify: same as produto list
│   │   ├── ListUsuarioPage.css     # Modify: padding + safe-area
│   │   ├── RegUsuarioPage.js       # Modify: toast + loading + validation
│   │   ├── UpdateUsuarioPage.js    # Modify: toast + loading + validation
│   │   ├── RegUsuarioPage.css      # Modify (if empty)
│   │   └── UpdateUsuarioPage.css   # Modify (if empty)
│   ├── mesa/
│   │   ├── ListMesaPage.js         # Modify: empty state, skeleton, router.push
│   │   ├── ListMesaPage.css        # Modify: padding + safe-area
│   │   ├── RegMesaPage.js          # Modify: toast + loading + validation
│   │   ├── UpdateMesaPage.js       # Modify: toast + loading + validation
│   │   ├── RegMesaPage.css         # Modify (if empty)
│   │   └── UpdateMesaPage.css      # Modify (if empty)
│   └── comanda/
│       ├── ListComandaPage.js      # Modify: empty state, skeleton, router.push
│       ├── ListComandaPage.css     # Modify (if needed)
│       ├── RegComandaPage.js       # Modify: toast + loading + validation
│       ├── UpdateComandaPage.js    # Modify: toast + loading + validation
│       ├── RegComandaPage.css      # Modify (if empty)
│       └── UpdateComandaPage.css   # Modify (if empty)
├── services/
│   └── api.js                     # Modify: safe 401 removeItem only (line 54)
├── shared/
│   └── util.js                    # Already implemented (showToast, withLoading, createEmptyState, validateRequired, validatePositiveNumber)
└── __tests__/ or *.spec.js        # New/new tests for added behavior
```

**Structure Decision**: Option 2 — Web application (frontend only for this feature). Backend is untouched.

## Complexity Tracking

No constitution violations. Complexity tracking is N/A.
