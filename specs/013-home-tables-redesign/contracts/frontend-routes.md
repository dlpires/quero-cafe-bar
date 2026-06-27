# Frontend Routes: Home Tables Redesign

## Route Changes

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/home` | `home-page` | **REWRITTEN** | Now shows table list (cards/list toggle) |
| `/cozinha` | `cozinha-page` | **NEW** | Extracted from current HomePage (kitchen view) |
| `/comanda/register` | `reg-comanda-page` | **UPDATED** | Accepts `?id_mesa=N` for pre-selection |
| `/comanda/edit` | `update-comanda-page` | **UPDATED** | Adds "Fechar Comanda" button |
| `/mesas` | `list-mesa-page` | Unchanged | |

## Navigation Flows

### From Home Page
```
[Home Page] → Click "Disponível" mesa → /comanda/register?id_mesa=N
[Home Page] → Click "Comanda Ativa" mesa → /comanda/edit?id=N
[Home Page] → Toggle view mode → cards/list toggle (no navigation)
```

### Kitchen View
```
[Any page] → Menu → "Cozinha" → /cozinha
```

## New Components

### home-page (Rewritten)
- Custom element: `home-page`
- File: `src/pages/home/HomePage.js`
- CSS: `src/pages/home/HomePage.css` (rewritten)
- New dependencies: none (uses existing util.js patterns)

### cozinha-page (New)
- Custom element: `cozinha-page`
- File: `src/pages/cozinha/CozinhaPage.js`
- CSS: `src/pages/cozinha/CozinhaPage.css` (copied from current HomePage.css)
- Logic: Exact copy of current HomePage.js kitchen view

## Updated Components

### reg-comanda-page
- Read `id_mesa` from URL query params
- Pre-select mesa in dropdown
- Optionally hide mesa selector and display mesa as read-only text

### update-comanda-page
- Add "Fechar Comanda" button (visible only when status = 'aberta')
- Show confirmation alert before closing
- After closing: disable form, show "Comanda Fechada" status badge
- Navigate back to `/home` after successful close
