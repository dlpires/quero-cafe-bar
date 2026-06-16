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
| ListProdutoPage | `10` | 72px item height, ~500px available → ~6-7 visible, 10 allows comfortable fit + some buffer |
| ListUsuarioPage | `10` | Same layout as produto |
| ListMesaPage | `8` | Slightly taller items (status icon + mesa info) |
| ListComandaPage | `6` | Each comanda row has more info (items, totals, status) |
| HomePage (cozinha) | `8` | Card grid: 2-4 cols × 2 rows ≈ 4-8 cards; `8` fits most layouts |

*Note: These values are starting defaults. They can be adjusted during implementation/testing to ensure the "no scrollbar" requirement (FR-001) at 768px min viewport height.*

## PageSizeCalculator (Frontend Utility)

```js
// Returns { take: number } for a given page context
function getPageSize(pageName: string): number
```

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
