# Data Model: Redesign dos Cartões da Visão Cozinha

**Feature**: 009-home-card-redesign  
**Date**: 2026-06-13

## Overview

This feature is a frontend-only UI refactoring. No new entities, tables, or backend changes are required. The existing data contracts remain unchanged. This document maps the data consumed by the kitchen view for clarity.

## Entities Consumed (Read-Only)

### Comanda (Order)

| Field | Type | Source | Usage |
|-------|------|--------|-------|
| `id` | number | API response | Card title ("Comanda #N"), card key |
| `mesa.id` | number | Nested object | Card subtitle ("Mesa: N") |
| `itens` | array | Nested array | Renders item rows within card |

### Comanda Item (Order Item)

| Field | Type | Source | Usage |
|-------|------|--------|-------|
| `id_produto` | number | API response | Key for updateItemComanda API call |
| `qtd_item` | number | API response | Quantity badge display |
| `statusEntrega` | boolean | API response | Controls border color and select value |
| `produto.dsc_produto` | string | Nested object | Product name display |

### API Endpoints (Unchanged)

| Method | Endpoint | Usage |
|--------|----------|-------|
| GET | `/comanda?skip=0&take=20` | Fetch all comandas for kitchen view |
| PATCH | `/comanda-item/:id_comanda/:id_produto` | Update item delivery status |

## State Transitions

### Item Delivery Status

```
Pendente (false) ──[staff marks as delivered]──> Entregue (true)
```

- Transition triggered by user changing `ion-select` value
- Backend PATCH updates `statusEntrega` field
- Frontend re-evaluates: card icon updates if all items are delivered

## Validation Rules

No new validation. Existing constraints:
- `statusEntrega` must be boolean (`true` or `false`)
- `id_comanda` and `id_produto` must exist (enforced by backend 404)
- Authentication required (enforced by `requireAuth()` in frontend, JWT guard in backend)
