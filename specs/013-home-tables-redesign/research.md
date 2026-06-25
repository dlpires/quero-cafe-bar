# Research: Home Tables Redesign

**Date**: 2026-06-25
**Status**: Complete

## U-01: How to expose `hasActiveComanda` in mesa list

- **Decision**: Add computed field `hasActiveComanda` to mesa list endpoint via TypeORM subquery in the MesaService
- **Rationale**: Single query avoids N+1 problem. The subquery counts comandas with `status = 'aberta'` for each mesa. No schema change needed on Mesa entity.
- **Alternatives considered**:
  - Separate API call per mesa: Rejected (N+1, poor performance).
  - Client-side join after fetching comandas: Rejected (unnecessary complexity, more network requests).
  - Dedicated endpoint `GET /mesa/status`: Possible but duplicates logic; simpler to extend existing `GET /mesa`.
- **Implementation**: In `MesaService.findAll()`, add a left-join to comandas with `status = 'aberta'` and expose as `hasActiveComanda: boolean` in a new `IMesaWithComandaStatus` interface. Keep existing `IMesaOutput` for backward compat.

## U-02: RegComandaPage mesa pre-selection

- **Decision**: RegComandaPage currently loads all mesas into a dropdown (`ion-select`). Add support for `?id_mesa=N` query param to pre-select a mesa and optionally auto-hide the mesa selector.
- **Rationale**: FR-005 requires redirect with mesa pre-selected. Adding query param support is the simplest, most consistent approach (UpdateComandaPage already uses query params).
- **Implementation**: Read `id_mesa` from `URLSearchParams` in `connectedCallback()`. If present, set `select.value = id_mesa` after loading mesas. Consider adding a hidden read-only display of the selected mesa if param is present.

## U-03: Page size defaults for home

- **Decision**: Reuse the existing `calculateResponsivePageSize('home')` pattern with a new key. Default card view: 8 items (matches current comanda page size). List view: 10 items (matches mesa page size).
- **Rationale**: Cards need more screen space per item than list rows. Responsive sizing follows existing pattern.
- **Alternatives considered**: Fixed 12/20/50 — rejected to stay consistent with existing responsive pattern.

## U-04: Router configuration for `/cozinha`

- **Decision**: Add a new `<ion-route url="/cozinha" component="cozinha-page">` in `index.html` and create a new `CozinhaPage` custom element (copy of current HomePage logic).
- **Rationale**: Clean separation. The existing HomePage code becomes CozinhaPage. The new HomePage is built from scratch.
- **Implementation**:
  1. Rename current `HomePage.js` → `CozinhaPage.js` (update class name, custom element tag, imports, CSS).
  2. Create new `HomePage.js` with table view logic.
  3. Update `main.js` imports.

## U-05: "Fechar Comanda" action UI

- **Decision**: Add a "Fechar Comanda" button at the bottom of UpdateComandaPage, after the items section. Style as a secondary/medium color button. Show confirmation alert before closing.
- **Rationale**: Natural placement — user manages items first, then closes comanda. Consistent with existing pattern (delete uses confirmation alert).
- **Implementation**: Call `api.updateComanda(id, { status: 'fechada' })`. After success, disable all form elements, show "Comanda Fechada" indicator, and change button text to read-only. Navigate back to home after confirmation.
- **Edge case**: If comanda is already "fechada", hide the button and show read-only status.
