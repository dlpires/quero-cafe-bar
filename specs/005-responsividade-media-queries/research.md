# Research: Responsividade com Media Queries

## Breakpoint Selection

**Decision**: 320px, 375px, 414px, 768px, 1024px, 1400px

**Rationale**: Cobre os 3 segmentos de smartphone mais comuns (iPhone SE 320px, iPhone médio 375px, Android large 414px), tablet (iPad 768px), desktop (1024px) e ultra-wide (1400px). Alinhado com o plano de implementação original (Fase 4) e clarificação Q2.

**Alternatives considered**:
- Breakpoints Bootstrap (576/768/992/1200px): Rejeitado por não cobrir smartphones pequenos (320px) adequadamente
- Apenas 3 breakpoints (mobile/tablet/desktop): Rejeitado por deixar lacuna em 1400px+ (ultra-wide)

## CSS Grid para Responsividade

**Decision**: Usar `grid-template-columns: repeat(N, 1fr)` nos breakpoints definidos

**Rationale**: `repeat(N, 1fr)` garante colunas de largura igual sem necessidade de `auto-fill`/`minmax` nos breakpoints controlados. A faixa 361-767px mantém `auto-fill` para fluidez.

**Alternatives considered**:
- Flexbox com `flex-wrap`: Rejeitado por não garantir número fixo de colunas por linha
- `auto-fill` puro: Rejeitado porque não permite controle de N colunas por breakpoint

## Media Query Syntax

**Decision**: Mobile-first (`min-width`) para todos os breakpoints, exceto ≤360px que usa `max-width`

**Rationale**: Mobile-first é padrão da indústria e evita sobreposição de regras. O breakpoint ≤360px é uma exceção para tratar o caso limite de smartphones muito pequenos.

```css
/* ≤360px — exceção mobile-first */
@media (max-width: 360px) { ... }

/* ≥768px */
@media (min-width: 768px) { ... }

/* ≥1024px */
@media (min-width: 1024px) { ... }

/* ≥1400px */
@media (min-width: 1400px) { ... }
```

## Testes de Responsividade

**Decision**: Jest + jsdom para testes unitários de CSS + verificação manual

**Rationale**: jsdom permite simular viewports via `window.resizeTo()` e verificar `getComputedStyle()`. Testes manuais complementam para validação visual real.

**Alternatives considered**:
- Cypress/Playwright para testes visuais: Viável mas excessivo para o escopo (CSS puro)
- Apenas testes manuais: Rejeitado por violar Princípio III (Test-First)

```js
// Padrão de teste:
it('exibe 2 colunas em tablet (768px)', () => {
  window.resizeTo(768, 600);
  const grid = document.querySelector('.comandas-grid');
  expect(getComputedStyle(grid).gridTemplateColumns).toBe('1fr 1fr');
});
```

## Compatibilidade

**Decision**: Suporte a browsers modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Rationale**: CSS Grid e media queries têm suporte universal nestas versões. Ionic 8.x já exige browser moderno.

**Alternatives considered**:
- Suporte a IE11/legacy: Rejeitado — Ionic 8.x não suporta IE11

## Conclusão

Nenhum NEEDS CLARIFICATION pendente. Todas as decisões técnicas estão resolvidas. Pronto para Fase 1 (Design & Contracts).
