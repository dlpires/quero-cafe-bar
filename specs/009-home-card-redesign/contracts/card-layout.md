# UI Contract: Card Layout da Visão Cozinha

**Feature**: 009-home-card-redesign  
**Date**: 2026-06-13

## Overview

This document defines the HTML structure and CSS contract for the redesigned comanda card component rendered by `renderComandaCard()` in `HomePage.js`.

## Card Structure

### HTML Contract

```html
<ion-card class="comanda-card" role="region" aria-labelledby="comanda-title-{id}">
  <ion-card-header>
    <ion-card-title id="comanda-title-{id}">
      Comanda #{id} — Mesa: {mesa.id}
    </ion-card-title>
    <ion-icon name="{statusIcon}" color="{statusColor}" class="card-status-icon" aria-hidden="true"></ion-icon>
  </ion-card-header>
  <ion-card-content>
    <!-- One ion-item per product -->
    <ion-item lines="none" class="comanda-item {statusClass}">
      <ion-label class="item-label">
        <h2 class="item-name">{produto.dsc_produto}</h2>
        <p class="item-qty">Quantidade: {qtd_item}</p>
      </ion-label>
      <ion-select
        class="item-status-select"
        slot="end"
        value="{statusEntrega}"
        interface="action-sheet"
        aria-label="Status de {produto.dsc_produto}: {statusText}"
        data-id-comanda="{id}"
        data-id-produto="{id_produto}"
      >
        <ion-select-option value="false">Pendente</ion-select-option>
        <ion-select-option value="true">Entregue</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-card-content>
</ion-card>
```

### CSS Contract

```css
/* Grid: responsive breakpoints */
.comandas-grid {
  display: grid;
  gap: 16px;
}

/* ≤480px: 1 column */
@media (max-width: 480px) {
  .comandas-grid { grid-template-columns: 1fr; }
}
/* 481px–900px: 2 columns */
@media (min-width: 481px) and (max-width: 900px) {
  .comandas-grid { grid-template-columns: repeat(2, 1fr); }
}
/* 901px–1200px: 3 columns */
@media (min-width: 901px) and (max-width: 1200px) {
  .comandas-grid { grid-template-columns: repeat(3, 1fr); }
}
/* ≥1201px: 4 columns */
@media (min-width: 1201px) {
  .comandas-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Card */
.comanda-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Card header: flex row with icon at end */
.comanda-card ion-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
}

/* Card status icon */
.card-status-icon {
  font-size: 24px;
  flex-shrink: 0;
}

/* Item label: two-line layout */
.item-label {
  overflow: hidden;
}

/* Product name: truncate with ellipsis */
.item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 15px;
  margin: 0;
}

/* Quantity: always visible, no shrink */
.item-qty {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 2px 0 0 0;
  flex-shrink: 0;
}

/* Status select: minimum touch target */
.item-status-select {
  --min-height: 44px;
  min-width: 100px;
  flex-shrink: 0;
}

/* Item row: no background, border-left only for status */
.comanda-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 48px;
}

.comanda-item.item-pending {
  border-left: 4px solid var(--ion-color-danger);
}

.comanda-item.item-delivered {
  border-left: 4px solid var(--ion-color-success);
}
```

## Expected Behavior

| Scenario | Width | Grid Columns | Quantity Visibility |
|----------|-------|-------------|---------------------|
| Mobile portrait | 320px–480px | 1 | Always visible, name truncated |
| Mobile landscape / small tablet | 481px–900px | 2 | Always visible, name truncated on small cards |
| Tablet landscape | 901px–1200px | 3 | Always visible |
| Desktop / monitor | ≥1201px | 4 | Always visible, names fully shown |

## Accessibility Requirements

- Each `ion-card` has `role="region"` and `aria-labelledby` linking to card title `id`
- Each `ion-select` has `aria-label` including product name and current status
- Status icon has `aria-hidden="true"` (decorative)
- Touch targets ≥44×44px on all interactive elements
- Text contrast ≥4.5:1 (WCAG AA) on default backgrounds