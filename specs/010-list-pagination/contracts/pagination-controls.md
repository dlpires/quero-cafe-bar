# Contract: Pagination Controls (Frontend Component)

## UI Contract

Each list page MUST render pagination controls with:

```
[< Anterior]  Página 1 de 5  [Próxima >]    Total: 42 registros
```

## Controls Specification

| Element | Behavior | Disabled When |
|---------|----------|---------------|
| "Anterior" button | `currentPage--`, fetch new page | `currentPage === 1` |
| Page indicator | Shows `Página X de Y` | Always visible when `totalPages > 1` |
| "Próxima" button | `currentPage++`, fetch new page | `currentPage === totalPages` |
| Total counter | Shows `Total: N registro(s)` | Always visible (even when `totalPages <= 1`) |

## Visibility Rules

| State | Controls | Total Counter | Empty Message |
|-------|----------|---------------|---------------|
| Loading (first load) | Hidden | Hidden | Hidden |
| Loading (page change) | Visible (skeleton in list area) | Visible | Hidden |
| Has data, 1 page | Hidden | Visible | Hidden |
| Has data, >1 pages | Visible | Visible | Hidden |
| Empty (0 records) | Hidden | Hidden | Visible |
| Error during page change | Visible (keep current page) | Visible | Hidden |

## Skeleton Loader

During page transitions, the list area content is replaced with skeleton placeholders:

- **CRUD lists**: 6-10 rows of `ion-skeleton-text` matching `ion-item` shape (72px height, avatar circle + 2 text lines)
- **Kitchen cards**: 4-8 card-shaped skeleton placeholders with `ion-skeleton-text` in a CSS grid

Skeleton is rendered immediately on click; replaced when API responds.

## Styling

- Container: sticky bottom bar inside list area
- Touch targets: minimum 48px (Ionic `ion-button` default)
- Icons: `chevron-back-outline` / `chevron-forward-outline` on buttons
- Typography: Ionic default
