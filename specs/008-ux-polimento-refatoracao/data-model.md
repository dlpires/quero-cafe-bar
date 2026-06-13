# Data Model: Polimento e Refatoração UX/UI

**Feature**: 008-ux-polimento-refatoracao
**Date**: 2026-06-12

## Overview

Esta feature é puramente frontend e não introduz entidades de banco de dados, APIs ou schemas. O "data model" refere-se aos tokens de design (CSS custom properties) que formam o design system mínimo da aplicação e ao ciclo de vida dos componentes de feedback.

---

## CSS Custom Properties (Design Tokens)

### Escopo Global (`:root` em `style.css`)

| Token | Valor Padrão | Uso | Origem |
|-------|-------------|-----|--------|
| `--app-spacing` | `16px` | Espaçamento padrão entre elementos (padding, gap) | Novo |
| `--app-spacing-sm` | `8px` | Espaçamento reduzido (ícones, badges) | Novo |
| `--app-spacing-lg` | `24px` | Espaçamento amplo (seções, cabeçalhos) | Novo |
| `--app-border-radius` | `8px` | Raio de borda padrão para cards e containers | Novo |
| `--app-font-family` | `'Roboto', sans-serif` | Família tipográfica da aplicação | Novo |
| `--app-color-surface` | `var(--ion-color-light)` | Cor de fundo de superfícies elevadas | Novo |
| `--app-color-text-muted` | `var(--ion-color-medium)` | Cor de texto secundário/descritivo | Novo |
| `--app-shadow-card` | `0 2px 8px rgba(0, 0, 0, 0.1)` | Sombra padrão de cards | Novo |

### Tokens Adicionais Injetados via JS

| Token | Definido em | Uso |
|-------|------------|-----|
| `--width` | `ion-modal.style.cssText` | Largura de modal (atualmente `90%` em `UpdateComandaPage`) |
| `--height` | `ion-modal.style.cssText` | Altura de modal (atualmente `80%` em `UpdateComandaPage`) |

### Migração de Regras Duplicadas para `style.css`

| Regra CSS | Arquivos Originais | Destino |
|-----------|-------------------|---------|
| `.radio-icon { margin-right: 8px; }` | `RegProdutoPage.css`, `UpdateProdutoPage.css`, `UpdateComandaPage.css` | `style.css` |
| `ion-input, ion-select { font-size: 16px; }` | `RegProdutoPage.css`, `UpdateProdutoPage.css`, `RegMesaPage.css`, `UpdateMesaPage.css`, `UpdateComandaPage.css` | `style.css` |

---

## Toast/Alert Lifecycle (State Machine)

```
┌──────────┐    createElement + appendChild    ┌──────────┐
│  IDLE    │ ─────────────────────────────────> │ CREATED   │
└──────────┘                                    └────┬─────┘
                                                    │ .present()
                                                    ▼
                                               ┌──────────┐
                                               │ VISIBLE  │
                                               └────┬─────┘
                                                    │ dismiss (auto ou user)
                                                    ▼
                                               ┌──────────┐
                                               │ DISMISSED│
                                               └────┬─────┘
                                                    │ ionToastDidDismiss /
                                                    │ ionAlertDidDismiss
                                                    │ → .remove()
                                                    ▼
                                               ┌──────────┐
                                               │ REMOVED  │
                                               └──────────┘
```

### Regras de Transição

1. **CREATED → VISIBLE**: Chamada `await element.present()` — componente aparece na tela
2. **VISIBLE → DISMISSED**: Toast: após `duration` ms (2000 padrão). Alert: usuário clica em botão. Ambos: `await element.dismiss()` programático
3. **DISMISSED → REMOVED**: Listener `ionToastDidDismiss` / `ionAlertDidDismiss` chama `element.remove()`. **Obrigatório** para evitar acúmulo no DOM.

### Garantias

- SC-002 exige que após 50 operações consecutivas, a contagem de nós DOM não exceda a inicial
- Cada componente de feedback é responsável por sua própria remoção (não há coletor global)

---

## Arquivos CSS — Plano de Consolidação

### Estado Atual

| Arquivo | Tamanho | Regras | Duplicado? |
|---------|---------|--------|-----------|
| `style.css` | 198 B | `.login-container` | Não (global) |
| `HomePage.css` | 1.2 KB | `.comandas-grid`, `.comanda-card`, `.item-entrega-select`, `.item-pending`, `.item-delivered` | Não |
| `LoginPage.css` | 243 B | `.login-container`, `.login-logo` | Não (estilos específicos de login) |
| `ListProdutoPage.css` | 924 B | `.list-produto-container`, `.list-produto-header`, etc. | Não |
| `ListUsuarioPage.css` | 595 B | `.list-usuario-container`, etc. | Não |
| `ListComandaPage.css` | 817 B | `.list-comanda-container`, etc. | Não |
| `RegComandaPage.css` | 240 B | `.reg-comanda-container` | Não |
| `UpdateComandaPage.css` | 915 B | `.update-comanda-container`, `.item-card`, etc. | Não |
| `RegProdutoPage.css` | 89 B | `.radio-icon`, `ion-input` | **Sim** (idêntico a `UpdateProdutoPage.css`) |
| `UpdateProdutoPage.css` | 89 B | `.radio-icon`, `ion-input` | **Sim** (idêntico a `RegProdutoPage.css`) |
| `RegMesaPage.css` | 34 B | `ion-input` | **Sim** (idêntico a `UpdateMesaPage.css`) |
| `UpdateMesaPage.css` | 34 B | `ion-input` | **Sim** (idêntico a `RegMesaPage.css`) |
| `ListMesaPage.css` | 290 B | `.list-mesa-container`, etc. | Não (único) |

### Estado Alvo

| Arquivo | Tamanho | Ação |
|---------|---------|------|
| `style.css` | ~1 KB | Expandido com `:root` tokens + `.radio-icon` + `ion-input, ion-select` globais |
| `HomePage.css` | ~1.3 KB | Corrigido `minmax(280px)`, `margin: 10px` |
| `RegProdutoPage.css` | — | **Removido** (regras migradas para `style.css`; página usa `ion-padding`) |
| `UpdateProdutoPage.css` | — | **Removido** (regras migradas para `style.css`; página usa `ion-padding`) |
| `RegMesaPage.css` | — | **Removido** (regras migradas para `style.css`; página usa `ion-padding`) |
| `UpdateMesaPage.css` | — | **Removido** (regras migradas para `style.css`; página usa `ion-padding`) |
| `ListMesaPage.css` | 290 B | Mantido (regras específicas de listagem de mesa) |

**Resultado final**: 4 arquivos CSS removidos. Nenhum arquivo CSS com regras duplicadas. `style.css` como single source of truth para regras cross-module.
