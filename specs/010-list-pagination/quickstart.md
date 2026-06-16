# Quickstart: Controle de Paginação para Listas

## What needs to change

**Backend**: No changes needed. All 4 CRUD endpoints already support `?skip=N&take=M` and return `PaginatedResponse`.

**Frontend**: Modify 5 pages to replace infinite scroll / virtual scroll with pagination controls.

## Files to modify

### CRUD List Pages (4 pages)

| Page | File | Changes |
|------|------|---------|
| Produto | `frontend/src/pages/produto/ListProdutoPage.js` | Remove virtual scroll + infinite scroll; add pagination |
| Usuario | `frontend/src/pages/usuario/ListUsuarioPage.js` | Remove virtual scroll + infinite scroll; add pagination |
| Mesa | `frontend/src/pages/mesa/ListMesaPage.js` | Remove infinite scroll; add pagination |
| Comanda | `frontend/src/pages/comanda/ListComandaPage.js` | Remove infinite scroll; add pagination |

### Kitchen Page

| Page | File | Changes |
|------|------|---------|
| Home | `frontend/src/pages/home/HomePage.js` | Add `skip`/`take` params; add pagination controls |

### (Optional) Shared Utilities

| File | Changes |
|------|---------|
| `frontend/src/shared/util.js` | Add `createPaginationControls()` shared function (optional, can be inline) |

### (Optional) CSS

| File | Changes |
|------|---------|
| `frontend/src/pages/home/HomePage.css` | Add fixed/sticky bottom bar for pagination controls |
| Individual list page CSS | Add sticky pagination bar styles |

## Implementation order

1. **Pick one CRUD list** (e.g., `ListProdutoPage`) as template — implement pagination controls, refactor to remove virtual/infinite scroll
2. **Apply same pattern** to `ListUsuarioPage`, `ListMesaPage`, `ListComandaPage`
3. **Adapt HomePage** for card grid pagination (different layout but same pagination logic)
4. **Verify** no scrollbar at 768px viewport height, all controls functional

## Key implementation patterns

### Pattern 1: Pagination state management

```js
import { createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton } from '../../shared/util.js';

// In constructor:
this.pagination = createPaginationState(calculateResponsivePageSize('produto'));
```

### Pattern 2: Page loading with responsive take

```js
async loadPage(page) {
  if (this.isLoading) return;
  this.isLoading = true;
  const container = this.querySelector('.list-produto-container');
  const paginationContainer = this.querySelector('.pagination-bar-container');

  try {
    const skip = (page - 1) * this.pagination.take;
    container.innerHTML = createListSkeleton(5);
    paginationContainer.innerHTML = '';

    const response = await api.getProdutos(skip, this.pagination.take);
    this.items = response.data || response;
    const total = response.total != null ? response.total : this.items.length;
    this.pagination.update(total);
    this.pagination.currentPage = page;
    this.renderItems();
    this.renderPaginationControls();
  } catch (error) {
    showToast('Erro ao carregar página. Tente novamente.', 'error');
    this.renderItems();
    this.renderPaginationControls();
  } finally {
    this.isLoading = false;
  }
}
```

### Pattern 3: Responsive page size calculation

```js
// In shared/util.js:
const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 52;
const CONTAINER_PADDING = 32;

export const PAGE_LAYOUT = {
  produto:  { itemHeight: 80 },
  usuario:  { itemHeight: 80 },
  mesa:     { itemHeight: 80 },
  comanda:  { itemHeight: 120 },
  home:     { itemHeight: 200 },
};

export function calculateResponsivePageSize(pageName) {
  const layout = PAGE_LAYOUT[pageName] || PAGE_LAYOUT.produto;
  const viewportHeight = window.innerHeight;
  const contentHeight = viewportHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
  const availableHeight = contentHeight - CONTAINER_PADDING;
  const count = Math.floor(availableHeight / layout.itemHeight);
  return Math.max(3, Math.min(count, 50));
}
```

### Pattern 4: Pagination controls (sticky footer bar)

```js
renderPaginationControls() {
  const container = this.querySelector('.pagination-bar-container');
  if (this.items.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = renderPaginationBar(this.pagination);

  container.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => this.prevPage());
  container.querySelector('[data-action="next-page"]')?.addEventListener('click', () => this.nextPage());
}
```

## Testing

### Backend
No backend changes needed — existing tests should continue to pass.

### Frontend
Existing tests may need updates after removing infinite scroll. New tests should cover:
- Pagination controls render correctly
- Clicking "Próxima" loads next page
- Buttons disabled at boundaries
- Skeleton shows during load
- Empty state renders correctly
- Single-page state hides controls
