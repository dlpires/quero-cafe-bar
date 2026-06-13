# Research: Redesign dos Cartões da Visão Cozinha

**Feature**: 009-home-card-redesign  
**Date**: 2026-06-13

## R1: Text Truncation Strategy for Product Names

**Decision**: Use two-line layout with `text-overflow: ellipsis` on product name only. Quantity gets its own dedicated space via `flex-shrink: 0`.

**Rationale**: The current single-line layout (`h3` with `display: flex`) causes the badge to be pushed out when product name is long. Moving to a two-line structure (name on line 1, quantity as subtitle on line 2) or keeping single-line with explicit `min-width: 0` on the name container and `flex-shrink: 0` on the quantity badge ensures the quantity is always visible.

**Alternatives considered**:
- Single-line with `overflow-wrap: break-word`: Causes awkward mid-word breaks.
- Fixed-width columns: Breaks responsiveness.
- Hidden overflow on entire row: Would hide the select control too — unacceptable.

**Implementation**: The `ion-label` gets a two-line structure using `<h2>` for product name (with `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`) and `<p>` for quantity (with `flex-shrink: 0`). The select control occupies the `slot="end"` position.

---

## R2: Status Indicator Design (Replacing Colorful Backgrounds)

**Decision**: Use only `border-left` (4px solid) for item status, with transparent background. Red (`var(--ion-color-danger)`) for pending, green (`var(--ion-color-success)`) for delivered. Text color remains default (no tinting).

**Rationale**: The UX audit identified that the current `rgba(255,0,0,0.08)` and `rgba(0,128,0,0.08)` backgrounds create a "zebra effect" that causes visual fatigue after prolonged use. A subtle left border maintains quick status recognition while reducing visual noise.

**Alternatives considered**:
- Status dot only: Too subtle for kitchen environment with fast-paced viewing.
- Colored text only: Fails WCAG AA contrast on some backgrounds.
- Colored tags/chips: Adds visual clutter from extra elements.
- Keep backgrounds but lighten: Still adds noise; border-left is cleaner.

**Implementation**: Remove `.item-pending` and `.item-delivered` background rules. Keep `border-left` only. Text color stays at default `var(--ion-text-color)`.

---

## R3: Responsive Grid Breakpoints

**Decision**: Replace `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` with explicit media query breakpoints:
- ≤480px: `1fr` (single column)
- 481px–900px: `repeat(2, 1fr)` (two columns)
- 901px–1200px: `repeat(3, 1fr)` (three columns)
- ≥1201px: `repeat(4, 1fr)` (four columns)

**Rationale**: The `minmax(280px, 1fr)` approach causes horizontal overflow on 320px screens (280 + 32px container padding = 312px, exceeding viewport). Fixed breakpoints provide predictable layout at all sizes. This aligns with Ionic's recommended breakpoint strategy.

**Alternatives considered**:
- `minmax(260px, 1fr)`: Still fragile at 320px (260 + 32 = 292, works but very tight with no margin for scrollbar).
- CSS `clamp()`: Doesn't solve the fundamental minimum width issue.
- Keep auto-fill but add max-width media query: More complex, harder to test.

**Implementation**: Replace the single `grid-template-columns` rule with 4 media query blocks in `HomePage.css`. Update `.home-container` padding to use percentage-based padding on mobile.

---

## R4: Touch Target Compliance (WCAG 2.1)

**Decision**: Set explicit `min-height: 44px` and `min-width: 44px` on the status select control, with additional `padding: 8px` for comfortable touch area.

**Rationale**: WCAG 2.1 Success Criterion 2.5.5 requires touch targets of at least 44x44 CSS pixels. Kitchen staff often wear gloves, making precise touch harder. The current `min-width: 120px` on the select is sufficient in width but the effective touch area depends on the rendered height.

**Alternatives considered**:
- Touch area via invisible pseudo-element: Complex, hard to maintain.
- Toggle button instead of select: Better UX but changes interaction pattern significantly.
- Only height enforcement: Doesn't cover all scenarios.

**Implementation**: Add `--min-height: 44px` to the select component, ensure the ion-item has `--min-height: 48px` for comfortable spacing.

---

## R5: Accessibility Enhancements (ARIA & Screen Reader)

**Decision**: Add `role="region"` and `aria-labelledby` to each comanda card, linking to a heading element with a unique `id`. Add `aria-label` to the status select with current state description. Use `<h3>` for product names to maintain heading hierarchy.

**Rationale**: The UX audit identified missing semantic roles on cards. Without `role="region"` and `aria-labelledby`, screen readers cannot differentiate between cards or announce which comanda they're navigating into. Each card should be announced as "Comanda X, Mesa Y".

**Alternatives considered**:
- `role="article"`: Less appropriate — cards are administrative items, not standalone content.
- `aria-describedby`: Better suited for supplementary descriptions, not primary identification.
- No ARIA changes: Fails WCAG 1.3.1 (Info and Relationships).

**Implementation**: Generate unique `id` for each card header (e.g., `comanda-title-${comanda.id}`). Add `role="region" aria-labelledby="comanda-title-${comanda.id}"` to each `ion-card`. Add `aria-label` to item rows indicating name, quantity, and current status.

---

## R6: Color Contrast Compliance (WCAG AA)

**Decision**: Verify and enforce 4.5:1 contrast ratio for all text against backgrounds in both pending and delivered states. Default Ionic color tokens should be used to ensure consistency.

**Rationale**: The current design uses `var(--ion-color-danger-shade)` and `var(--ion-color-success-shade)` on tinted backgrounds, which may not meet WCAG AA (4.5:1). With the removal of colored backgrounds (R2), only the border-left remains colored, and text stays on default background.

**Alternatives considered**:
- Custom color values: Risk inconsistency with Ionic theme.
- Higher contrast (7:1 AAA): Not required for this use case.

**Implementation**: Text uses default `var(--ion-text-color)` on default card background. Border colors use Ionic's standard `--ion-color-danger` and `--ion-color-success`. Verify with a contrast checker.
