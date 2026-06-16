# Quickstart: Redesign dos Cartões da Visão Cozinha

**Feature**: 009-home-card-redesign  
**Date**: 2026-06-13

## Scope

Redesign the kitchen view cards in `frontend/src/pages/home/` to fix:
1. Product quantities being cut off on small screens
2. Visual pollution from colored backgrounds
3. Responsive grid breakpoints
4. Accessibility (ARIA roles, touch targets, contrast)

## Affected Files

| File | Change |
|------|--------|
| `frontend/src/pages/home/HomePage.js` | Refactor `renderComandaCard()` — new two-line item layout |
| `frontend/src/pages/home/HomePage.css` | Replace grid, remove backgrounds, add responsive breakpoints |
| `frontend/src/pages/home/HomePage.spec.js` | Update tests for new HTML structure |

## Key Changes

### 1. HTML Structure (HomePage.js)

**Before** (single line, badge inline with name):
```js
<h3 class="item-produto-nome">
  ${item.produto.dsc_produto}
  <ion-badge color="primary">x${item.qtd_item}</ion-badge>
</h3>
```

**After** (two-line label, quantity as subtitle):
```js
<ion-label class="item-label">
  <h2 class="item-name">${item.produto.dsc_produto}</h2>
  <p class="item-qty">Quantidade: ${item.qtd_item}</p>
</ion-label>
```

Card header also simplified:
**Before**: `<div class="card-header-content">` with three `<span>` + icon
**After**: `<ion-card-title>` with text + `<ion-icon>` as sibling in flex header

### 2. CSS (HomePage.css)

**Grid**: Replace `auto-fill, minmax(280px, 1fr)` with 4 explicit media query breakpoints.

**Status indicators**: Remove `--background: rgba(...)` rules. Keep only `border-left`.

**Text truncation**: Product name gets `text-overflow: ellipsis`; quantity gets `flex-shrink: 0`.

### 3. Tests (HomePage.spec.js)

Update card render tests:
- Change assertions from single `h3` to new `<h2>` + `<p>` structure
- Update responsiveness tests to match new explicit breakpoints
- Add tests for `role="region"` and `aria-labelledby` presence
- Add tests for status border-only indicators (verify no background color)

Verify: Tests **must** pass before merging:
```bash
cd frontend && npm test
```

## Running Locally

```bash
# Backend (required for API)
cd backend && yarn start:dev

# Frontend
cd frontend && npm run dev
# Open http://localhost:5173 and navigate to /home
```

## Verification Checklist

- [ ] Product quantity visible at all viewport widths (320px–1920px)
- [ ] No horizontal scrollbar at any width ≥320px
- [ ] Status indicated by border-left only (no background colors)
- [ ] Status select has touch area ≥44×44px
- [ ] Screen reader announces "Comanda X, Mesa Y" for each card
- [ ] No visual fatigue after 5 minutes of use
- [ ] `npm test` passes with updated assertions