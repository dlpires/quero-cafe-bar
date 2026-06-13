# Implementation Plan: Redesign dos Cartões da Visão Cozinha

**Branch**: `009-home-card-redesign` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-home-card-redesign/spec.md`

## Summary

Redesign the kitchen view (`/home`) cards to fix layout issues where product quantities are cut off in cluttered cards. The redesign will replace the current single-row `ion-item` layout with a cleaner two-line structure, replace colorful backgrounds with subtle border indicators, and implement proper responsive breakpoints for the card grid. No backend changes required — this is a frontend-only CSS/HTML refactoring.

## Technical Context

**Language/Version**: JavaScript (ES Modules) — Vanilla JS Web Components, CSS3

**Primary Dependencies**: Ionic 8.x (Web Components via CDN), Vite 7.x (build), Jest (testing)

**Storage**: N/A (no new storage; existing comandas API used)

**Testing**: Jest (JSDOM) — 161 existing tests, 20 suites at `frontend/`

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) + Capacitor 8.x Android

**Project Type**: Web application — frontend UI refactoring

**Performance Goals**: Cards render in <100ms for up to 30 comandas; no layout shift on data load; <16ms per frame for smooth scrolling

**Constraints**: Minimum viewport support 320px width; WCAG AA contrast (4.5:1); touch targets ≥44x44px; no new npm dependencies; must work with existing Ionic CDN-loaded components

**Scale/Scope**: Single page component refactoring — 3 files changed (`HomePage.js`, `HomePage.css`, `HomePage.spec.js`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — ✅ Not applicable. No new API endpoints. Existing `/comanda` and `/comanda-item` endpoints are consumed without modification.
2. **Modular Architecture** — ✅ Changes fit within existing `frontend/src/pages/home/` module. No new modules needed.
3. **Test-First** (NON-NEGOTIABLE) — ✅ Tests will be updated first for new card structure (layout assertions, responsive breakpoints, quantity visibility). Coverage must not decrease from current 161 tests / 20 suites.
4. **Full-Stack Consistency** — ✅ No backend changes. Frontend consumes existing data contracts (`comanda.itens[].produto.dsc_produto`, `comanda.itens[].qtd_item`, `comanda.itens[].statusEntrega`).
5. **Security & Observability** — ✅ Existing JWT auth and route guard (`requireAuth`) unchanged. No new auth concerns.

**Gate Result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/009-home-card-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── card-layout.md   # Redesigned card structure contract
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── pages/
│       └── home/
│           ├── HomePage.js      # Card HTML generation (renderComandaCard, renderComandas)
│           ├── HomePage.css     # Card styles, responsive grid, status indicators
│           └── HomePage.spec.js # Updated tests for new layout
```

**Structure Decision**: Single page component refactoring. No new files. Only `HomePage.js`, `HomePage.css`, and `HomePage.spec.js` are modified. Shared utilities and services remain unchanged.

## Complexity Tracking

> No constitutional violations. No complexity justifications needed.
