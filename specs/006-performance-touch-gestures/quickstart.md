# Quickstart — Performance Mobile e Gestos Touch Nativos

## Ordem de implementação sugerida

### Fase 1: Backend — Paginação (pré-requisito)

```bash
cd backend
```

1. Adicionar `skip` e `take` ao `ListProdutoDto`, `ListUsuarioDto`, `ListMesaDto`, `ListComandaDto`
2. Criar `PaginatedResponse<T>` genérico (ou tipo alias)
3. Alterar services para usar `findAndCount()` com `skip`/`take`
4. Alterar controllers para retornar `{ data, total, skip, take }`
5. Gerar migration se necessário (nenhuma — apenas DTOs, sem schema change)
6. `yarn run test` ✅

### Fase 2: Frontend — Lazy Loading

```bash
cd frontend
```

1. Remover imports estáticos de páginas em `main.js` (manter apenas LoginPage e HomePage)
2. Configurar carregamento dinâmico via `import()` no `ionRouteDidChange`
3. Remover `manualChunks: undefined` do `vite.config.js`
4. Adicionar pré-carregamento de rota adjacente
5. `npm test` ✅

### Fase 3: Frontend — Infinite Scroll + Virtual Scroll

1. **ListProdutoPage**: Adicionar `ion-infinite-scroll`, virtual scroll, `ion-refresher`, `ion-item-sliding`
2. **ListUsuarioPage**: Idem (virtual scroll)
3. **ListMesaPage**: Adicionar `ion-infinite-scroll` (append simples), `ion-refresher`, `ion-item-sliding`
4. **ListComandaPage**: Adicionar `ion-infinite-scroll` (append simples), `ion-refresher`
5. Adicionar métodos `getProdutos(skip, take)` no `api.js`
6. `npm test` ✅

### Fase 4: Frontend — Service Worker

1. Criar `frontend/src/sw.js` (cache-first para assets)
2. Registrar em `main.js` se `navigator.serviceWorker` disponível
3. `npm run build && npm test` ✅

### Fase 5: Performance Observability

1. Adicionar `performance.mark()` / `performance.measure()` nos handlers
2. Adicionar `console.warn` se > 16ms em dev
3. Verificar Lighthouse Performance ≥ 80

## Test commands

```bash
cd backend && yarn test              # Backend tests
cd frontend && npm test              # Frontend tests
cd backend && yarn run lint          # Lint backend
cd frontend && npm run build         # Build frontend
```

## Verification checklist

- [ ] Listagens com > 20 registros carregam progressivamente
- [ ] Swipe-to-delete revela botão em todas as listas
- [ ] Pull-to-refresh recarrega dados
- [ ] Bundle inicial não contém código de páginas além de login/home
- [ ] Service worker registrado e cacheando assets
- [ ] Lighthouse Performance ≥ 80
- [ ] User Timing marks visíveis no DevTools
- [ ] Testes existentes continuam passando
