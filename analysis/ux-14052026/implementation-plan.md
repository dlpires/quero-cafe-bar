# Plano de Implementação — Melhorias UX/UI e Mobile First

Consolidação das auditorias de UX/UI e Mobile First em fases ordenadas para implementação.

---

## Fase 0 — Fundação: Utilitários Compartilhados (2h)

Antes de qualquer correção, criar funções reutilizáveis em `shared/util.js` para evitar repetição.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 0.1 | Criar `showToast()` — feedback visual genérico | `shared/util.js` | 15min |
| 0.2 | Criar `withLoading()` — wrapper com loading + disable | `shared/util.js` | 15min |
| 0.3 | Criar `createEmptyState()` — empty state rico com ícone e CTA | `shared/util.js` | 15min |
| 0.4 | Criar `validateRequired()` e `validatePositiveNumber()` | `shared/util.js` | 15min |
| 0.5 | Criar `focusFirstElement()` — gerenciamento de foco | `shared/util.js` | 15min |
| 0.6 | Corrigir `localStorage.clear()` → `localStorage.removeItem('token')` | `services/api.js:54` | 5min |
| 0.7 | Remover `ngrok-skip-browser-warning` header ou torná-lo configurável | `services/api.js:33,88` | 5min |

### Critério de aceitação
- `shared/util.js` exporta todas as funções listadas
- `api.js` não usa mais `localStorage.clear()` nem headers de debug fixos
- Testes existentes continuam passando (`cd frontend && npm test`)

---

## Fase 1 — Feedback e Validação em Formulários (3h)

Resolver os **problemas críticos de UX**: feedback de sucesso, loading states e validação frontend.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 1.1 | Adicionar `withLoading()` + `showToast()` sucesso em `RegProdutoPage.handleSubmit` | `pages/produto/RegProdutoPage.js` | 20min |
| 1.2 | Adicionar `withLoading()` + `showToast()` sucesso em `RegUsuarioPage.handleSubmit` | `pages/usuario/RegUsuarioPage.js` | 20min |
| 1.3 | Adicionar `withLoading()` + `showToast()` sucesso em `RegMesaPage.handleSubmit` | `pages/mesa/RegMesaPage.js` | 20min |
| 1.4 | Adicionar `withLoading()` + `showToast()` sucesso em `RegComandaPage.handleSubmit` | `pages/comanda/RegComandaPage.js` | 20min |
| 1.5 | Adicionar `withLoading()` + `showToast()` sucesso em `UpdateProdutoPage.handleSubmit` | `pages/produto/UpdateProdutoPage.js` | 20min |
| 1.6 | Adicionar `withLoading()` + `showToast()` sucesso em `UpdateUsuarioPage.handleSubmit` | `pages/usuario/UpdateUsuarioPage.js` | 20min |
| 1.7 | Adicionar `withLoading()` + `showToast()` sucesso em `UpdateMesaPage.handleSubmit` | `pages/mesa/UpdateMesaPage.js` | 20min |
| 1.8 | Adicionar `withLoading()` + `showToast()` sucesso em `UpdateComandaPage.handleSubmit` | `pages/comanda/UpdateComandaPage.js` | 20min |
| 1.9 | Adicionar validação frontend (campos obrigatórios, valor > 0) em `RegProdutoPage` | `pages/produto/RegProdutoPage.js` | 15min |
| 1.10 | Adicionar validação frontend em `RegUsuarioPage` | `pages/usuario/RegUsuarioPage.js` | 15min |
| 1.11 | Adicionar validação frontend em `RegMesaPage` | `pages/mesa/RegMesaPage.js` | 15min |

### Critério de aceitação
- Toda submissão de formulário desabilita o botão e mostra loading
- Após sucesso, toast de confirmação aparece antes de navegar de volta
- Campos obrigatórios são validados no frontend antes do envio
- Testes existentes continuam passando

---

## Fase 2 — Acessibilidade e ARIA (4h)

Resolver os **problemas altos de UX** relacionados a acessibilidade.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 2.1 | Adicionar `aria-label` no botão de logout | `shared/Header.js:83` | 5min |
| 2.2 | Adicionar `aria-hidden="true"` em ícones decorativos do menu | `shared/Header.js:37,41,45,49,53` | 10min |
| 2.3 | Adicionar `aria-label` nos botões edit (`create-outline`) de todas as listas | `ListProdutoPage.js`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js` | 20min |
| 2.4 | Adicionar `aria-label` nos botões delete (`trash-outline`) de todas as listas | `ListProdutoPage.js`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js` | 20min |
| 2.5 | Adicionar `aria-label` nos botões de entrega na cozinha | `HomePage.js`, `UpdateComandaPage.js` | 15min |
| 2.6 | Implementar `focusFirstElement()` no `connectedCallback` de cada página | Todas as páginas | 1h |
| 2.7 | Melhorar mensagens de erro com tratamento por status HTTP específico | Todos os catch blocks | 1h |
| 2.8 | Adicionar proteção contra auto-exclusão em `ListUsuarioPage` | `pages/usuario/ListUsuarioPage.js:133-165` | 15min |
| 2.9 | Adicionar confirmação ao clicar em Cancelar em formulários com dados | Todos os formulários Reg/Update | 30min |

### Critério de aceitação
- Lighthouse Accessibility score ≥ 90
- Navegação por teclado funcional em todas as páginas
- Leitor de tela consegue identificar todos os botões de ação
- Usuário não consegue excluir a si mesmo

---

## Fase 3 — Layout e Espaçamento Mobile (2h)

Resolver os **problemas críticos de Mobile First** relacionados a layout.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 3.1 | Adicionar `padding: 16px` ao container de `ListProdutoPage` | `pages/produto/ListProdutoPage.css` | 5min |
| 3.2 | Adicionar `padding: 16px` ao container de `ListUsuarioPage` | `pages/usuario/ListUsuarioPage.css` | 5min |
| 3.3 | Adicionar `padding: 16px` ao container de `ListMesaPage` | `pages/mesa/ListMesaPage.css` | 5min |
| 3.4 | Corrigir grid `minmax(320px → 280px)` na HomePage | `pages/home/HomePage.css:7` | 1min |
| 3.5 | Corrigir `margin: 10` → `margin: 10px` | `pages/home/HomePage.css:45` | 1min |
| 3.6 | Escopar seletores CSS de `h3` nas listagens (adicionar classe container) | `ListProdutoPage.css`, `ListUsuarioPage.css` | 10min |
| 3.7 | Substituir `window.location.href` por `router.push()` no FAB das listas | `ListProdutoPage.js:76`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js` | 15min |
| 3.8 | Adicionar `action-sheet` como interface no `ion-select` da Home | `HomePage.js:89` | 5min |
| 3.9 | Implementar empty states ricos com `createEmptyState()` em todas as listas | `HomePage.js:48`, `ListProdutoPage.js:86`, `ListUsuarioPage.js:86`, `ListMesaPage.js:75`, `ListComandaPage.js:95`, `UpdateComandaPage.js:120` | 1h |

### Critério de aceitação
- Nenhum container de listagem tem conteúdo colado nas bordas
- HomePage não tem scroll horizontal em iPhone SE (320px)
- Navegação consistente entre todas as páginas (só `router.push()`)
- Empty states têm ícone, mensagem descritiva e CTA

---

## Fase 4 — Responsividade com Media Queries (2h)

Resolver a **falta total de responsividade** na aplicação.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 4.1 | Adicionar media query para smartphones pequenos (≤360px) | `HomePage.css` | 20min |
| 4.2 | Adicionar media query para tablets (≥768px) — grid 2 colunas | `HomePage.css` | 15min |
| 4.3 | Adicionar media query para desktop (≥1024px) — grid 3 colunas | `HomePage.css` | 15min |
| 4.4 | Adicionar media query para login em desktop (max-width container) | `LoginPage.css` | 15min |
| 4.5 | Adicionar media queries para listagens em desktop (cards lado a lado) | `ListProdutoPage.css`, `ListUsuarioPage.css`, `ListMesaPage.css`, `ListComandaPage.css` | 30min |
| 4.6 | Adicionar breakpoints para formulários em tablet/desktop | `RegProdutoPage.css`, `RegUsuarioPage.css`, `RegMesaPage.css`, `RegComandaPage.css` | 30min |

### Critério de aceitação
- App testado em 320px, 375px, 414px, 768px e 1024px sem quebras
- Navegação e formulários utilizáveis em todas as resoluções
- Grid da cozinha se adapta ao número de colunas por viewport

---

## Fase 5 — Performance Mobile (2h)

Melhorar performance de carregamento e listagens.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 5.1 | Adicionar `ion-infinite-scroll` nas listagens | `ListProdutoPage.js`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js` | 1h |
| 5.2 | Implementar lazy loading de páginas com dynamic imports | `main.js` | 1h |
| 5.3 | Adicionar service worker básico para cache de assets | `index.html`, novo `sw.js` | 30min |

### Critério de aceitação
- Listas com muitos registros carregam progressivamente
- Bundle inicial não inclui todas as páginas
- Lighthouse Performance score ≥ 80

---

## Fase 6 — Gestos Touch Nativos (2h)

Adicionar interações touch esperadas em mobile.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 6.1 | Substituir `ion-item` por `ion-item-sliding` com swipe-to-delete em `ListProdutoPage` | `pages/produto/ListProdutoPage.js` | 30min |
| 6.2 | Substituir `ion-item` por `ion-item-sliding` em `ListUsuarioPage` | `pages/usuario/ListUsuarioPage.js` | 30min |
| 6.3 | Substituir `ion-item` por `ion-item-sliding` em `ListMesaPage` | `pages/mesa/ListMesaPage.js` | 30min |
| 6.4 | Adicionar `ion-refresher` (pull-to-refresh) em todas as listas | Todas as list pages | 30min |

### Critério de aceitação
- Swipe para esquerda revela botão de excluir em todas as listas
- Pull-to-refresh recarrega dados em todas as listas
- Gestos não conflitam com scroll

---

## Fase 7 — App Shell e PWA (1h)

Preparar a aplicação para ser instalada como PWA.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 7.1 | Adicionar `<meta name="theme-color">` | `index.html` | 5min |
| 7.2 | Adicionar `<meta name="apple-mobile-web-app-capable">` | `index.html` | 5min |
| 7.3 | Adicionar `<link rel="apple-touch-icon">` | `index.html` | 5min |
| 7.4 | Criar `manifest.json` para PWA | `public/manifest.json` | 20min |
| 7.5 | Substituir favicon `vite.svg` por ícone da marca | `public/` | 15min |
| 7.6 | Remover código comentado em `main.js:46-48` | `main.js` | 5min |

### Critério de aceitação
- Lighthouse PWA score ≥ 80
- App pode ser adicionado à tela inicial no Chrome Android
- Meta tags corretas para iOS Safari

---

## Fase 8 — Polimento e Refatoração (2h)

Melhorias finais de qualidade de código e consistência.

### Tarefas

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 8.1 | Extrair `presentToast` de `LoginPage.connectedCallback` para escopo de módulo | `pages/login/LoginPage.js:82-91` | 10min |
| 8.2 | Garantir garbage collection de Toast/Alert (remover do DOM após dismiss) | Todas as páginas | 30min |
| 8.3 | Consolidar inline styles em classes CSS | `HomePage.js:82`, `ListProdutoPage.js:97-101`, `ListUsuarioPage.js:93-98`, `UpdateComandaPage.js:29-48` | 45min |
| 8.4 | Corrigir `formData.get('status') === 'on'` para lidar com `null` | `RegProdutoPage.js:54`, `RegMesaPage.js:39` | 10min |
| 8.5 | Definir CSS custom properties no `App.css` ou `style.css` | `src/style.css` | 30min |
| 8.6 | Remover ou preencher CSS vazios | 5 arquivos CSS vazios | 5min |

### Critério de aceitação
- Zero inline styles (tudo em classes CSS)
- Toast/Alert não acumulam no DOM
- CSS vazios foram removidos ou preenchidos

---

## Sumário de Esforço

| Fase | Descrição | Esforço | Dependências |
|------|-----------|---------|--------------|
| 0 | Fundação: Utilitários Compartilhados | 2h | Nenhuma |
| 1 | Feedback e Validação em Formulários | 3h | Fase 0 |
| 2 | Acessibilidade e ARIA | 4h | Nenhuma |
| 3 | Layout e Espaçamento Mobile | 2h | Nenhuma |
| 4 | Responsividade com Media Queries | 2h | Fase 3 |
| 5 | Performance Mobile | 2h | Nenhuma |
| 6 | Gestos Touch Nativos | 2h | Nenhuma |
| 7 | App Shell e PWA | 1h | Nenhuma |
| 8 | Polimento e Refatoração | 2h | Fases 1, 2, 3 |
| **Total** | | **~20h** | |

## Prioridade de Implementação Sugerida

1. **Fase 0** (fundação — desbloqueia Fase 1)
2. **Fase 1 + Fase 3** (paralelo — críticos de UX + Mobile First)
3. **Fase 2** (acessibilidade)
4. **Fase 4** (responsividade — depende de Fase 3)
5. **Fase 5 + Fase 6** (paralelo — performance + gestos)
6. **Fase 7** (PWA)
7. **Fase 8** (polimento — depende de Fase 1, 2, 3)
