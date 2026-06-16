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

## Key implementation pattern

```js
// In connectedCallback (replace ionInfinite with pagination buttons):
this.currentPage = 1;
this.take = 10; // per-page constant
this.totalRecords = 0;
this.totalPages = 0;

async loadPage(page) {
  this.isLoading = true;
  this.renderSkeleton(); // show skeleton placeholders
  try {
    const skip = (page - 1) * this.take;
    const response = await api.getProdutos(skip, this.take);
    this.items = response.data || response;
    this.totalRecords = response.total != null ? response.total : this.items.length;
    this.currentPage = page;
    this.totalPages = Math.ceil(this.totalRecords / this.take) || 1;
    this.renderItems();
    this.renderPaginationControls();
  } catch (err) {
    showToast('Erro ao carregar página. Tente novamente.');
    this.renderItems(); // restore previous content
  } finally {
    this.isLoading = false;
  }
}

renderPaginationControls() {
  // Sticky bottom bar with Anterior/Page X of Y/Próxima/Total
  const controlsHtml = `
    <div class="pagination-bar">
      <ion-button ${this.currentPage === 1 ? 'disabled' : ''}
        onclick="this.closest('ion-content').hostElement.prevPage()">
        <ion-icon name="chevron-back-outline"></ion-icon>
        Anterior
      </ion-button>
      <span class="page-indicator">Página ${this.currentPage} de ${this.totalPages}</span>
      <ion-button ${this.currentPage === this.totalPages ? 'disabled' : ''}
        onclick="this.closest('ion-content').hostElement.nextPage()">
        Próxima
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </ion-button>
      <span class="total-counter">Total: ${this.totalRecords} registro(s)</span>
    </div>
  `;
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
