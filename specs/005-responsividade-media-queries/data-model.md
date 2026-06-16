# Data Model: Responsividade com Media Queries

> **Nota**: Esta fase é exclusivamente CSS — não há modelos de dados, entidades de domínio ou schema de banco. Este documento descreve os "componentes de layout" (seletores CSS) e seus comportamentos esperados em cada breakpoint.

## Layout Components

### `.comandas-grid` (HomePage)

| Propriedade | Padrão (<768px) | ≥768px | ≥1024px | ≥1400px | ≤360px |
|-------------|----------------|--------|---------|---------|--------|
| `grid-template-columns` | `repeat(auto-fill, minmax(280px, 1fr))` | `repeat(2, 1fr)` | `repeat(3, 1fr)` | `repeat(4, 1fr)` | `1fr` |
| `gap` | `16px` | `16px` | `16px` | `16px` | `16px` |

### `.login-container` (LoginPage)

| Propriedade | Padrão (<1024px) | ≥1024px |
|-------------|-------------------|---------|
| `max-width` | `100%` | `400px` |
| `margin` | `0` | `0 auto` |

### `.list-*-container` (ListProduto, ListUsuario, ListMesa, ListComanda)

| Propriedade | Padrão (<768px) | ≥768px | ≥1024px | ≥1400px |
|-------------|------------------|--------|---------|---------|
| display | `block` | `grid` | `grid` | `grid` |
| `grid-template-columns` | — | `repeat(2, 1fr)` | `repeat(3, 1fr)` | `repeat(4, 1fr)` |
| `gap` | — | `16px` | `16px` | `16px` |

### `ion-content.ion-padding form` (Reg/Update pages)

| Propriedade | Padrão (<768px) | ≥768px |
|-------------|------------------|--------|
| `max-width` | `100%` | `600px` |
| `margin` | `0` | `0 auto` |

> **Nota**: O selector `form` (filho direto de `ion-content.ion-padding`) é o mesmo em todas as 8 páginas de formulário: `form#form-produto`, `form#form-usuario`, `form#form-mesa`, `form#form-comanda`. Não usar `ion-content.ion-padding` diretamente como selector — isso restringiria a largura do componente inteiro, não apenas do formulário.

## Breakpoint Constants

| Name | Value | Device |
|------|-------|--------|
| `XS` | ≤360px | Smartphones pequenos (iPhone SE) |
| `SM` | 361-767px | Smartphones médios/grandes |
| `MD` | ≥768px | Tablets (iPad portrait) |
| `LG` | ≥1024px | Desktops |
| `XL` | ≥1400px | Ultra-wide / Monitores grandes |

## Validation Rules

- Nenhum container deve exceder `100vw` em qualquer breakpoint (sem scroll horizontal)
- Touch targets devem manter ≥44px efetivos (já garantido pelo Ionic)
- Grids com `repeat(N, 1fr)` devem ocupar exatamente N colunas sem overflow

## State Transitions

Não aplicável — componentes CSS não possuem estado transicional. A mudança de layout ocorre instantaneamente no resize do viewport via media query (sem transição CSS animada entre breakpoints).
