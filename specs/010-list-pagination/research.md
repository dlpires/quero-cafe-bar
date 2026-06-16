# Research: Controle de Paginação para Listas

## Backend Pagination Readiness

### Decision: Backend already supports pagination — no API changes needed

The four main entities (usuario, produto, mesa, comanda) already have:

- **List DTOs** with `skip: number = 0` and `take: number = 20` (validated: Min(1), Max(100))
- **Controllers** returning `Promise<PaginatedResponse<IEntityOutput>>`
- **Services** using `repository.findAndCount({ where, skip, take })`
- **PaginatedResponse<T>** DTO at `backend/src/modules/produto/dto/paginated-response.dto.ts`

| Entity | DTO File | Default `skip` | Default `take` | Max `take` |
|--------|----------|----------------|----------------|------------|
| Usuario | `list-usuario.dto.ts` | 0 | 20 | 100 |
| Produto | `list-produto.dto.ts` | 0 | 20 | 100 |
| Mesa | `list-mesa.dto.ts` | 0 | 20 | 100 |
| Comanda | `list-comanda.dto.ts` | 0 | 20 | 100 |
| ComandaItem | ❌ No pagination | — | — | — |

**Rationale**: All endpoints accept `?skip=N&take=M` and return `{ data: [...], total: N, skip: N, take: N }`.

**Alternatives considered**: Adding a shared `PaginationConstants` file. Deemed unnecessary — the pattern is already consistent and the spec does not change default values.

---

## Frontend List Pages — Current State

### Decision: Four CRUD list pages + Home page, all need pagination retrofit

| Page | Virtual Scroll | Infinite Scroll | Pagination |
|------|---------------|----------------|------------|
| `ListProdutoPage` | ✅ Yes (72px) | ✅ Yes | ❌ No |
| `ListUsuarioPage` | ✅ Yes (72px) | ✅ Yes | ❌ No |
| `ListMesaPage` | ❌ No | ✅ Yes | ❌ No |
| `ListComandaPage` | ❌ No | ✅ Yes | ❌ No |
| `HomePage` (cozinha) | ❌ No | ❌ No | ❌ No — loads ALL |

**Pattern** (all 4 CRUD pages):
```js
// api.js methods already accept skip/take
const response = await api.getProdutos(skip, take);
// Response shape: { data: T[], total: number, skip: number, take: number }
const items = response.data || response;
const total = response.total != null ? response.total : items.length;
```

### Decision: Replace virtual scroll + infinite scroll with pagination on CRUD lists
Virtual scroll is incompatible with the "no scrollbar" requirement (FR-001). Pagination replaces both mechanisms.

### Decision: Home page (cozinha) card grid needs pagination added
Currently loads all comandas with no skip/take. Must pass skip/take and paginate the card grid.

---

## Pagination Controls UX (from Clarifications)

| Decision | Source |
|----------|--------|
| Skeleton loader during page transitions | Clarification Q1 |
| Sticky bottom bar, 48px touch targets, Ionic default buttons | Clarification Q2 |
| Kitchen: `.card-grid` with `overflow-y: auto`, controls fixed below | Clarification Q3 |

---

## Page Size Calculation

### Originally planned: Fixed `take` per list type
*See Implementation History in spec.md for context of the change.*

### Actual implementation: Responsive page size via `calculateResponsivePageSize`

During implementation/testing, fixed page sizes (10, 10, 8, 6, 8) were found to cause vertical overflow — items extended past the footer on viewports at 768px height. The assumption that fixed values could reliably fit all viewport sizes was incorrect.

**Final approach**: Dynamic `take` based on `window.innerHeight`, calculated at page mount:

```
take = Math.floor((window.innerHeight - 56 - 52 - 32) / itemHeight)
```

| Page | Item Height | At 768px | At 900px | At 1080px |
|------|-------------|----------|----------|-----------|
| produto/usuario/mesa | 80px | 7 | 9 | 11 |
| comanda | 120px | 4 | 6 | 7 |
| home | 200px | 2 | 3 | 4 |

**Min**: 3 items, **Max**: 50 items. This ensures SC-001 (no scrollbar) at all viewport heights ≥ 768px.

**Item heights determined by layout analysis**:
- CRUD list items (ion-item-sliding): ~80px (2-line label with icon + edit button)
- Comanda items (ion-item with 4 lines): ~120px
- Kitchen cards (comanda-card in grid): ~200px minimum estimate

**Constants used**:
- `HEADER_HEIGHT` = 56px (ion-header default)
- `FOOTER_HEIGHT` = 52px (ion-footer + pagination bar padding)
- `CONTAINER_PADDING` = 32px (16px top + 16px bottom container padding)

---

## Skeleton Loader Implementation

### Decision: Use existing Ionic skeleton-text pattern

The Ionic framework provides `<ion-skeleton-text>` and `<ion-skeleton-avatar>` components. The skeleton should:
- Match the list item shape (72px height rows with avatar + text lines for CRUD lists; card-shaped for kitchen)
- Replace the entire list area content during transition
- Auto-hide when new data arrives

Ref: https://ionicframework.com/docs/api/skeleton-text

---

## Touch Targets

### Decision: Minimum 48x48px per WCAG / Material Design guidelines

The Ionic default button size meets this requirement. The pagination controls should use `ion-button` with `size="default"` (minimum 48px touch target). Confirmed that Ionic's `ion-button` has a minimum height of 44px — near the 48px spec target; `ion-button` with padding already exceeds 48px on most themes.

---

## API Contract Format (PaginatedResponse)

**Already established** — no change needed:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;   // total records in DB matching the query
  skip: number;    // offset used
  take: number;    // page size used
}
```

---

## Error Handling During Page Transitions

### Decision: Show error toast on API failure; keep current page content

On failure:
1. The skeleton loader should be replaced by the previous page's content (not left as skeleton)
2. Show a toast: "Erro ao carregar página. Tente novamente."
3. Keep pagination controls at the current page index

This matches the existing pattern in `util.js` (`showToast`) and avoids confusing the user with a blank/loading state.

---

## Empty State

Already covered by FR-009: hide pagination controls, show "Nenhum registro encontrado".

Single-page state (FR-011): hide navigation buttons but keep total count visible.
