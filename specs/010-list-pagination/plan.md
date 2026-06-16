# Implementation Plan: Controle de Paginação para Listas

**Branch**: `010-list-pagination` | **Date**: 2026-06-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-list-pagination/spec.md`

## Summary

Replace infinite scroll / virtual scroll with button-based pagination on all list pages (usuários, produtos, mesas, comandas) and add pagination to the kitchen card grid (/home). Backend already supports `skip`/`take` pagination — only frontend changes needed. No scrollbars on CRUD lists; kitchen grid scrolls internally.

## Technical Context

**Language/Version**: TypeScript (NestJS 11.x) + Vanilla JS (ES2020)

**Primary Dependencies**: NestJS + TypeORM (backend), Ionic 8.x + Vite (frontend)

**Storage**: MySQL 8.x (via TypeORM) — no schema changes needed

**Testing**: Jest (backend: 163 tests, frontend: 161 tests)

**Target Platform**: Web (tablet Android via Capacitor 8.x, desktop browser)

**Project Type**: Web application (full-stack: NestJS backend + Ionic frontend)

**Performance Goals**: Page transitions <2s (SC-002); no scrollbar at viewport >=768px (SC-001)

**Constraints**: 48px minimum touch targets (clarified); skeleton loader during transitions (clarified); sticky bottom bar pagination controls (clarified); kitchen grid scrolls internally with `overflow-y: auto` (clarified)

**Scale/Scope**: 5 list pages (usuário, produto, mesa, comanda, home/cozinha) with pagination controls

## Changes During Implementation

### 2026-06-16 — Responsive Page Size

**Problema**: Valores fixos de `PAGE_SIZES` (produto/usuario: 10, mesa: 8, comanda: 6, home: 8) causavam overflow vertical no viewport. Itens vazavam para baixo do footer sem scroll, violando SC-001.

**Solução**: Substituído `getPageSize(pageName)` por `calculateResponsivePageSize(pageName)` que calcula dinamicamente quantos itens cabem:

```js
export const PAGE_LAYOUT = {
  produto:  { itemHeight: 80 },
  usuario:  { itemHeight: 80 },
  mesa:     { itemHeight: 80 },
  comanda:  { itemHeight: 120 },
  home:     { itemHeight: 200 },
};

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 52;
const CONTAINER_PADDING = 32;

export function calculateResponsivePageSize(pageName) {
  const layout = PAGE_LAYOUT[pageName] || PAGE_LAYOUT.produto;
  const viewportHeight = window.innerHeight;
  const contentHeight = viewportHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
  const availableHeight = contentHeight - CONTAINER_PADDING;
  const count = Math.floor(availableHeight / layout.itemHeight);
  return Math.max(3, Math.min(count, 50));
}
```

**Testes**: Mocks de `calculateResponsivePageSize` retornam mesmos valores fixos anteriores, preservando asserts existentes. 216 testes, 20 suites — todos passam.

**Arquivos**: `util.js`, 5 páginas de lista, 5 arquivos `.spec.js`.

### Problema de JSDOM em Testes

Durante implementação dos testes, `document.createElement('div')` dentro dos mocks de página disparava o lifecycle de custom elements do JSDOM, que tentava instanciar `ion-skeleton-text` e outros componentes — cujos construtores mock eram inválidos (`Error: Invalid custom element constructor return value`).

**Solução**: Todos os containers nos testes usam objetos simples (`{ innerHTML: '' }`) em vez de nós reais do DOM; `querySelector` é sobrescrito com arrow function que retorna esses objetos mock.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — All endpoints MUST be defined via contracts/DTOs before implementation begins
   - Status: **PASS** — `PaginatedResponse<T>` DTO already exists (`backend/src/modules/produto/dto/paginated-response.dto.ts`). All 4 CRUD endpoints already accept `skip`/`take` and return this format. Contracts documented in `contracts/paginated-response.md`.

2. **Modular Architecture** — Feature MUST fit into existing module structure or justify a new module
   - Status: **PASS** — Cross-cutting frontend concern. No new module needed. Each existing page module (usuario, produto, mesa, comanda, home) receives pagination within its own file.

3. **Test-First** (NON-NEGOTIABLE) — Tests MUST be written and failing before implementation; coverage MUST NOT decrease
   - Status: **PASS** — Backend: no changes, existing tests unaffected. Frontend: existing list page tests must be updated to reflect pagination controls instead of infinite scroll. New tests required for pagination controls.

4. **Full-Stack Consistency** — Data contracts MUST align between backend and frontend
   - Status: **PASS** — Backend returns `{ data, total, skip, take }` and frontend already consumes this format. No contract drift.

5. **Security & Observability** — Auth, validation, and error handling requirements MUST be addressed
   - Status: **PASS** — No auth changes. Error handling: pagination failures show toast (researched approach). ValidationPipe already validates `skip`/`take` on backend (Min/Max decorators).

## Project Structure

### Documentation (this feature)

```text
specs/010-list-pagination/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── paginated-response.md
│   └── pagination-controls.md
├── checklists/
│   └── requirements.md
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
backend/
└── src/
    └── modules/
        ├── usuario/
        │   ├── dto/list-usuario.dto.ts     # ✅ Already has skip/take
        │   └── usuario.service.ts          # ✅ Already uses findAndCount
        ├── produto/
        │   ├── dto/list-produto.dto.ts     # ✅ Already has skip/take
        │   ├── dto/paginated-response.dto.ts  # ✅ Shared DTO
        │   └── produto.service.ts          # ✅ Already uses findAndCount
        ├── mesa/
        │   ├── dto/list-mesa.dto.ts        # ✅ Already has skip/take
        │   └── mesa.service.ts             # ✅ Already uses findAndCount
        └── comanda/
            ├── dto/list-comanda.dto.ts     # ✅ Already has skip/take
            └── comanda.service.ts          # ✅ Already uses findAndCount

frontend/
└── src/
    ├── pages/
    │   ├── produto/ListProdutoPage.js      # 🔄 Replace virtual + infinite scroll → pagination
    │   ├── usuario/ListUsuarioPage.js      # 🔄 Replace virtual + infinite scroll → pagination
    │   ├── mesa/ListMesaPage.js            # 🔄 Replace infinite scroll → pagination
    │   ├── comanda/ListComandaPage.js      # 🔄 Replace infinite scroll → pagination
    │   └── home/
    │       ├── HomePage.js                 # 🔄 Add skip/take + pagination controls
    │       └── HomePage.css                # 🔄 (May need) sticky bar styles
    ├── services/
    │   └── api.js                          # ✅ Already supports skip/take
    └── shared/
        └── util.js                         # 🔄 (Optional) add pagination helper
```

**Structure Decision**: Option 2 — Web application (frontend + backend). This is a frontend-only feature; backend requires zero changes.

## Complexity Tracking

No Constitution violations. Zero backend changes. Frontend changes follow existing patterns — no added complexity.
