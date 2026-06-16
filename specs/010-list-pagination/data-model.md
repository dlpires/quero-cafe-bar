# Data Model: Pagination

## PaginationState (Frontend)

Represents the current pagination state for a list page. Each list page maintains its own instance.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentPage` | `number` | `1` | 1-based current page index |
| `totalPages` | `number` | `0` | Total pages calculated from `total / take` (ceil) |
| `totalRecords` | `number` | `0` | Total records in DB matching current filters |
| `skip` | `number` | `0` | Current offset sent to API (`(currentPage - 1) * take`) |
| `take` | `number` | Per-page constant | Number of records per page |

**Page-specific `take` values:**

| Page | Items per page | Rationale |
|------|---------------|-----------|
| ListProdutoPage | `calculado`* | 80px item height, calculado via `calculateResponsivePageSize('produto')` |
| ListUsuarioPage | `calculado`* | Mesma altura (80px) que produto |
| ListMesaPage | `calculado`* | Mesma altura (80px) que produto |
| ListComandaPage | `calculado`* | 120px item height (4 linhas por comanda) |
| HomePage (cozinha) | `calculado`* | 200px item height (cards na grid) |

*\*Valores calculados dinamicamente: `Math.floor((window.innerHeight - 140) / itemHeight)`, mínimo 3, máximo 50.*

*Para referência, os valores fixos originais eram: produto/usuario: 10, mesa: 8, comanda: 6, home: 8 — substituídos durante implementação por causarem overflow vertical.*

## PageSizeCalculator (Frontend Utility)

```js
// Original: returns fixed take from PAGE_SIZES constant
function getPageSize(pageName: string): number

// Actual implementation: returns dynamic take based on viewport height
function calculateResponsivePageSize(pageName: string): number
```

### Supporting constants

| Constant | Value | Description |
|----------|-------|-------------|
| `HEADER_HEIGHT` | 56 | Altura do `ion-header` fixo |
| `FOOTER_HEIGHT` | 52 | Altura do `ion-footer` com barra de paginação |
| `CONTAINER_PADDING` | 32 | Padding vertical do container da lista (16px × 2) |

### PAGE_LAYOUT

| Page | itemHeight | Descrição |
|------|-----------|-----------|
| `produto` | 80 | 2 linhas (nome + preço) |
| `usuario` | 80 | 2 linhas (nome + usuário) |
| `mesa` | 80 | 2 linhas (status + cadeiras) |
| `comanda` | 120 | 4 linhas (título + mesa + itens/total + status) |
| `home` | 200 | Cards em grid com altura variável (estimativa conservadora) |

## State Transitions

```
[First Load]
    |
    v
[currentPage=1, skip=0] ──────► [Next Page]
    │                               │
    │ [Prev Page]                   │
    └─────────────◄─────────────────┘
                    │
                    ▼
            [Filter Applied]
                    │
                    ▼
            [reset to page=1]
```

- **Next**: `currentPage++`, `skip = (currentPage - 1) * take`
- **Previous**: `currentPage--`, `skip = (currentPage - 1) * take`
- **Filter**: `currentPage = 1`, `skip = 0`
- **Data refresh** (pull-to-refresh): `currentPage = 1`, `skip = 0`
- **Navigate away and back**: Reset to page 1 (FR-012)
