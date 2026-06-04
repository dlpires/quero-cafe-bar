# Research: Performance Mobile e Gestos Touch Nativos

## Ionic 8.x Infinite Scroll

**Decision**: Usar `ion-infinite-scroll` com `ion-infinite-scroll-content` nativo do Ionic 8.x.

**Rationale**: Componente oficial, maduro e bem testado. Dispara evento `ionInfinite` quando o usuário atinge o fim da lista. Controle de threshold via `threshold` property (padrão 15%). Desativação via `disabled` property quando não há mais dados.

**Alternatives considered**: Implementação manual com Intersection Observer — rejeitada por duplicar funcionalidade já existente no Ionic.

**Implementation pattern**:
```html
<ion-infinite-scroll threshold="100px" (ionInfinite)="loadMore($event)">
  <ion-infinite-scroll-content loadingText="Carregando..."></ion-infinite-scroll-content>
</ion-infinite-scroll>
```
No Vanilla JS: `addEventListener('ionInfinite', handler)` + `target.complete()` para sinalizar fim do carregamento.

## Virtual Scroll (DOM Pruning)

**Decision**: Implementação manual de virtual scroll com buffer de 2 telas (1 acima + 1 abaixo da viewport), usando `scrollTop` + `offsetHeight` do `ion-content` para calcular itens visíveis.

**Rationale**: `ion-virtual-scroll` foi depreciado no Ionic 8 e removido. Não há substituto oficial. Implementação manual com有限 buffer é a abordagem recomendada pela equipe Ionic.

**Alternatives considered**: 
- `ion-virtual-scroll` (depreciado, remoção futura)
- CDK virtual scroll de Angular (incompatível — projeto usa Vanilla JS)
- Intersection Observer para renderização sob demanda (mais overhead que scroll position calculation)

**Key implementation details**:
- Escutar evento `ionScroll` no `ion-content`
- Calcular `startIndex = Math.floor(scrollTop / itemHeight) - buffer`
- Calcular `endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer`
- Renderizar apenas itens entre `startIndex` e `endIndex`
- Altura total do container: `totalItems * itemHeight` (placeholder para scrollbar)
- Usar `position: absolute` + `transform: translateY()` nos itens renderizados
- Item height fixo ou estimado via média (para items de altura variável, usar técnica de estimated height com re-medir)

## Swipe-to-Delete (ion-item-sliding)

**Decision**: Usar `ion-item-sliding` com `ion-item-options` side="end" para revelar botão de excluir.

**Rationale**: Componente nativo do Ionic que gerencia gestos touch, animações de 60fps e acessibilidade (ARIA). Suporta fechamento automático ao clicar fora.

**Alternatives considered**: Implementação manual com touch events + CSS transforms (rejeitada: mais complexa, menos acessível, maior risco de conflito com scroll)

**Implementation pattern**:
```html
<ion-item-sliding>
  <ion-item>
    <ion-label>...</ion-label>
  </ion-item>
  <ion-item-options side="end">
    <ion-item-option color="danger" (click)="confirmDelete(item)">
      <ion-icon name="trash" slot="icon-only"></ion-icon>
      Excluir
    </ion-item-option>
  </ion-item-options>
</ion-item-sliding>
```

**Edge cases**:
- Múltiplos swipes rápidos: `ion-item-sliding` já gerencia fila de animações internamente
- Conflito com scroll vertical: Ionic detecta movimento horizontal vs vertical e prioriza o gesto correto
- Fechar sliding abertos: `closeSlidingItems()` no `ion-list` quando navegar para outra rota

## Pull-to-Refresh (ion-refresher)

**Decision**: Usar `ion-refresher` com `ion-refresher-content` nativo. `pullFactor="0.5"` para reduzir resistência em mobile.

**Rationale**: Componente oficial do Ionic, suporta puxar para recarregar com animação nativa. Evento `ionRefresh` disparado quando o usuário completa o gesto.

**Alternatives considered**: Nenhuma — componente oficial é suficiente.

**Implementation pattern**:
```html
<ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
  <ion-refresher-content refreshingText="Atualizando..."></ion-refresher-content>
</ion-refresher>
```
No Vanilla JS: `addEventListener('ionRefresh', handler)` + chamar `event.target.complete()` após recarregar dados.

## Lazy Loading via Dynamic Imports (Vite)

**Decision**: Remover importações estáticas de páginas em `main.js` e substituir por importação dinâmica no evento `ionRouteDidChange`.

**Rationale**: Vite suporta code splitting nativamente com `import()` dinâmico. Cada página se torna um chunk separado. O bundle inicial contém apenas login e home.

**Alternatives considered**: 
- `manualChunks` no rollup config (agrupa mas não elimina código do bundle inicial)
- `vite-plugin-lazyRoutes` (desnecessário — Vite já faz isso com `import()`)

**Implementation steps**:
1. Remover todos `import './pages/...'` de `main.js`, exceto Login e Home
2. No evento `ionRouteDidChange`, fazer `import('./pages/produto/ListProdutoPage.js')` quando a rota for `/produtos`
3. Opcional: pré-carregar rota adjacente após renderizar a página atual

**Code splitting config**: Remover `manualChunks: undefined` do `vite.config.js` para permitir que Vite crie chunks automaticamente.

## Service Worker

**Decision**: Criar service worker manual em `frontend/src/sw.js` com estratégia cache-first para assets estáticos. Registrar no `main.js` se o navegador suportar `navigator.serviceWorker`.

**Rationale**: O projeto não possui dependência externa para PWA. `vite-plugin-pwa` (baseado em Workbox) adicionaria complexidade desnecessária. Um SW simples com cache-first cobre todos os requisitos (FR-010, FR-011).

**Alternatives considered**: 
- `vite-plugin-pwa` (Workbox) — mais features (precache, runtime cache, update flow), mas maior complexidade e依赖
- Workbox manual — overkill para assets estáticos apenas

**Cache strategy**:
- Instalação: `self.addEventListener('install')` — pré-cachear assets críticos
- Ativação: `self.addEventListener('activate')` — limpar caches antigos
- Fetch: Cache-first para JS/CSS/fontes/ícones, network-first para API (não cachear dados)
- Versão: Incrementar `CACHE_VERSION` manualmente em cada deploy

## Backend Pagination (TypeORM)

**Decision**: Adicionar parâmetros `skip` e `take` (opcionais, com validação `@IsInt` + `@IsOptional`) nos DTOs de listagem. Usar `findAndCount()` nos services para retornar dados paginados + total.

**Rationale**: `findAndCount()` do TypeORM retorna `[entities, totalCount]` — ideal para infinite scroll saber quando parar. Parâmetros `skip`/`take` são padrão REST.

**Alternatives considered**:
- Page-based (`page`/`limit`) — convergente, mas `skip`/`take` é mais natural para TypeORM
- Cursor-based (keyset pagination) — mais eficiente para grandes volumes, mas complexidade desnecessária para este projeto

**Response format**: `{ data: Produto[], total: number, skip: number, take: number }` — permite ao frontend calcular se há mais páginas (`skip + data.length < total`).

**Validation defaults**: `skip` padrão = 0, `take` padrão = 20 (conforme spec assumptions).

## User Timing API (Performance Observability)

**Decision**: Adicionar `performance.mark()` no início e `performance.measure()` após conclusão de cada operação (infinite scroll fetch, pull-to-refresh, swipe render). Em desenvolvimento, emitir `console.warn` se a medida exceder 16ms (frame budget para 60fps).

**Rationale**: API nativa do navegador, zero dependências, disponível em todos os navegadores alvo. `performance.measure()` permite correlação com DevTools Performance panel.

**Alternatives considered**: 
- `web-vitals` library — métricas padronizadas mas não captura operações específicas do app
- Sentry Performance — requer serviço externo, overkill para esta feature

**Implementation pattern**:
```javascript
const markName = `infinite-scroll:${entityType}:${page}`;
performance.mark(`${markName}:start`);
try {
  await fetchData();
  performance.mark(`${markName}:end`);
  performance.measure(markName, `${markName}:start`, `${markName}:end`);
  const duration = performance.getEntriesByName(markName)[0].duration;
  if (duration > 16) {
    console.warn(`[Performance] ${markName} levou ${duration.toFixed(1)}ms (orçamento: 16ms)`);
  }
} finally {
  performance.clearMarks(`${markName}:start`);
  performance.clearMarks(`${markName}:end`);
  performance.clearMeasures(markName);
}
```
