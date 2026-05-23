# Research: UX CRUD Improvements

## Unknowns Resolved

### 1. Toast DOM cleanup pattern

**Decision**: Keep existing `showToast()` implementation in `shared/util.js:13-24`
**Rationale**: Already appends to `document.body`, calls `toast.present()`, awaits `toast.onWillDismiss()`, then calls `toast.remove()` — proper DOM cleanup confirmed.
**Alternatives considered**: None needed — already correct.

### 2. Button disable during submit

**Decision**: Use `ion-button disabled` attribute + text change to "Salvando..."
**Rationale**: Ionic `ion-button` supports `disabled` boolean property natively. Pattern: set `button.disabled = true` and `button.innerHTML = 'Salvando...'` before async call, restore in `finally` block.
**Alternatives considered**: Using `withLoading()` from util.js — this adds a spinner overlay AND disables the button implicitly via the loading overlay, but doesn't change button text. Per spec (User Story 2 AC1), the button text must change to "Salvando...". So manual button disable + withLoading wrapper is the correct combo.

### 3. Skeleton screen implementation

**Decision**: Replace `ion-loading` in `fetch*()` methods with skeleton screens using `<ion-skeleton-text>` and `<ion-skeleton-item>` inside the list container
**Rationale**: Ionic provides `<ion-skeleton-text>` as part of `@ionic/core`. Pattern: render skeleton markup inside `.list-produto-container` before fetch, replace with real data on success, or empty state if no data. The `ion-loading` is heavy for this use case (blocks UI). Skeletons are the modern mobile pattern.
**Implementation**: 
```html
<ion-list>
  <ion-item>
    <ion-thumbnail slot="start"><ion-skeleton-text animated></ion-skeleton-text></ion-thumbnail>
    <ion-label>
      <h3><ion-skeleton-text animated style="width: 50%"></ion-skeleton-text></h3>
      <p><ion-skeleton-text animated style="width: 80%"></ion-skeleton-text></p>
    </ion-label>
  </ion-item>
</ion-list>
```
**Alternatives considered**: Keep `ion-loading` spinner (rejected — blocks interaction, not modern UX); Use custom CSS shimmer (rejected — Ionic provides native skeleton component).

### 4. Safe area inset for notched devices

**Decision**: Add `padding-left: env(safe-area-inset-left, 16px)` and `padding-right: env(safe-area-inset-right, 16px)` to the 3 containers currently missing padding
**Rationale**: `env()` CSS function with `safe-area-inset-*` variables is supported in iOS Safari 11+ and Chrome 69+. The fallback `16px` ensures non-notched devices get standard padding.
**Target files**: `ListProdutoPage.css`, `ListUsuarioPage.css`, `ListMesaPage.css`
**Alternatives considered**: Using `constant()` for older iOS (obsolete — dropped in iOS 15.4+); Using JS to detect notch (unnecessary — CSS-only solution exists).

### 5. `window.location.href` migration

**Decision**: Replace only FAB navigation hard reloads with `ion-router.push()` — keep logout (util.js:107) and 401 redirect (api.js:55) as hard navigations
**Rationale**: FABs navigate within the app — SPA navigation is appropriate. Logout and 401 are security/auth flows that benefit from full page reload to clear component state.
**Target files**: `ListProdutoPage.js:78`, `ListUsuarioPage.js:78`, `ListMesaPage.js:70`, `ListComandaPage.js:88`
**New pattern**:
```js
const router = document.querySelector('ion-router');
router.push('/produto/register');
```
**Alternatives considered**: Replace all `window.location.href` (rejected — logout/401 redirects are intentional).

### 6. Empty state pattern

**Decision**: Use `createEmptyState()` from `shared/util.js` replacing inline `<p>` messages
**Rationale**: The utility already exists (spec 001-ux-shared-utilities) and provides icon + message + CTA button per spec FR-012. All 5 list pages need updating.
**Target files**: `ListProdutoPage.js:88`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js`, `HomePage.js`
**Alternatives considered**: Keep inline `<p>` (rejected — violates spec); Create per-page empty states (rejected — utility promotes consistency).

### 7. Form validation pattern

**Decision**: Use `validateRequired()` and `validatePositiveNumber()` from `shared/util.js` in each page's `handleSubmit`, before API call
**Rationale**: Utils already exist. Validate in `handleSubmit`, show inline errors or toast on first invalid field, focus the field, prevent API call if invalid.
**Target files**: All 8 Reg/Update pages
**Validation rules per entity** (see data-model.md):
- Produto: `dsc_produto` required, `valor_unit` > 0
- Usuario: `nome` required, `login` required, `senha` required
- Mesa: `dsc_mesa` required, `num_lugares` > 0
- Comanda: `id_mesa` required (select), `id_usuario` from auth context

### 8. Empty CSS files handling

**Decision**: Populate all 6 empty/whitespace-only CSS files with font-size minimum rules (FR-016)
**Rationale**: Per spec FR-016, font-size must be ≥14px labels, ≥16px body. These files are imported but empty — add rules rather than remove imports (minimal change).
**Target files**: `RegProdutoPage.css`, `UpdateProdutoPage.css`, `ListMesaPage.css`, `RegMesaPage.css`, `UpdateMesaPage.css`, `RegComandaPage.css`
**Pattern**:
```css
:host { font-size: 16px; }
ion-label { font-size: 14px; }
```

### 9. Test coverage approach

**Decision**: Add new spec files or extend existing ones for:
- Toast display after save (all 8 Reg/Update pages)
- Button disabled state during submit (all 8 Reg/Update pages)
- Validation error display before API call (all 8 Reg/Update pages)
- Empty state rendering with `createEmptyState()` (all 5 list pages)
- Skeleton screen during fetch (all 5 list pages)
- SPA navigation (FAB uses router.push instead of href)
- Toast/alert DOM cleanup

**Rationale**: Current test files (`ListProdutoPage.spec.js`, `ListComandaPage.spec.js`, `HomePage.spec.js`, `LoginPage.spec.js`) test basic rendering, empty state, and errors. They need updates for new behaviors and new spec files needed for pages without tests (usuario, mesa).
**Pattern** (from `HomePage.spec.js`): Mock `api` module, mock Ionic custom elements, define mock page component in `beforeEach`, use `jest.fn()` for DOM queries, use `async/await`.

### 10. Success criteria from spec

| SC | Verification method |
|----|-------------------|
| SC-001: Toast on save | Functional test per page |
| SC-002: Button disabled on submit | Interaction test per form |
| SC-003: Frontend validation | Unit test per validator |
| SC-004: Validation <100ms | Timer assertion in test |
| SC-005: Zero inline styles | Code inspection per page |
| SC-006: Empty states | Visual test per list |
| SC-007: Toast/alert DOM cleanup | DOM query after dismiss |
| SC-008: SPA navigation | Code analysis per FAB |
| SC-009: Skeleton screens | Visual test per list |
| SC-010: Font-size ≥14px/16px | CSS inspection per page |
