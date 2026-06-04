# Implementation Plan: Performance Mobile e Gestos Touch Nativos

**Branch**: `006-performance-touch-gestures` | **Date**: 2026-05-29 | **Spec**: `specs/006-performance-touch-gestures/spec.md`

**Input**: Feature specification from `/specs/006-performance-touch-gestures/spec.md`

## Summary

Implementar infinite scroll com virtual scroll (produto/usuario) e append simples (mesa/comanda), swipe-to-delete via `ion-item-sliding`, pull-to-refresh via `ion-refresher`, lazy loading de páginas via importação dinâmica Vite, cache de assets via service worker, e instrumentação de performance com User Timing API. Requer adição de paginação (`skip`/`take`) nos endpoints findAll do backend (produto, usuario, mesa, comanda) e resposta com contagem total.

## Technical Context

**Language/Version**: Backend: NestJS 11.x (TypeScript 5.x) / Node.js 18+; Frontend: Ionic 8.x + Vanilla JS Web Components + Vite 7.x

**Primary Dependencies**: Backend: TypeORM, class-validator, class-transformer, jsonwebtoken; Frontend: Ionic 8.x, Vite 7.x, Capacitor 8.x

**Storage**: MySQL 8.x (existente, sem novas entidades)

**Testing**: Backend: Jest (24 suites, 163 tests); Frontend: Jest (8 suites, 105 tests)

**Target Platform**: Android (via Capacitor 8.x) em dispositivos mid-range (Moto G54, Galaxy A54 class); Web (Vite build); desktop fallback via clique

**Project Type**: Web + Mobile hybrid (Ionic PWA + Android APK)

**Performance Goals**: 60fps em animações touch (swipe, pull-to-refresh, scroll); infinite scroll a 60fps em mid-range; Lighthouse Performance ≥ 80 (3G slow, CPU throttling 4x); bundle inicial reduzido ≥ 40%

**Constraints**: Virtual scroll buffer de 2 telas (1 acima + 1 abaixo da viewport); 20 registros por lote; cache-first para assets estáticos, network-first para API; sem otimização de imagens (entidades sem imagem); User Timing API para diagnóstico de jank; service worker criado do zero (inexistente atualmente)

**Scale/Scope**: 4 list pages (produto, usuario, mesa, comanda) com infinite scroll; produto/usuario com virtual scroll (potencialmente centenas/milhares de registros); mesa/comanda com append simples (< 50 registros esperados); lazy loading em todas as 9 páginas CRUD + login + home; service worker para cache de assets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — ✅ PASS. Backend endpoints existentes receberão parâmetros `skip`/`take` via DTOs. Contratos de paginação definidos antes da implementação.
2. **Modular Architecture** — ✅ PASS. Frontend-only feature que se encaixa na estrutura existente de módulos/páginas. Nenhum novo módulo necessário.
3. **Test-First (NON-NEGOTIABLE)** — ✅ PASS. Tasks incluem etapa RED (teste falhando) antes de cada fase de user story: T019 (US4), T024 (US1), T035 (US2), T040 (US3), T045 (US5). Cobertura existente deve ser mantida.
4. **Full-Stack Consistency** — ✅ PASS. DTOs de paginação no backend syncronizados com chamadas da API service no frontend. snake_case/camelCase mantido.
5. **Security & Observability** — ✅ PASS. JWT já protege rotas. FR-013/014 adicionam User Timing API para observabilidade de performance.

**No violations found.** Complexity Tracking não é necessário.

## Project Structure

### Documentation (this feature)

```text
specs/006-performance-touch-gestures/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (DTOs de paginação)
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
backend/src/modules/
├── produto/
│   ├── dto/
│   │   ├── list-produto.dto.ts    # + skip, take (pagination)
│   │   └── paginated-response.dto.ts  # NOVO
│   ├── produto.controller.ts      # findAll retorna paginado
│   └── produto.service.ts         # + skip/take no find

frontend/
├── src/
│   ├── main.js                    # Importação dinâmica das páginas
│   ├── services/
│   │   └── api.js                 # + skip/take params nos GETs
│   ├── pages/
│   │   ├── produto/
│   │   │   └── ListProdutoPage.js # + ion-infinite-scroll, ion-item-sliding, ion-refresher
│   │   ├── usuario/
│   │   │   └── ListUsuarioPage.js # + ion-infinite-scroll, ion-item-sliding, ion-refresher
│   │   ├── mesa/
│   │   │   └── ListMesaPage.js    # + ion-infinite-scroll, ion-item-sliding, ion-refresher
│   │   └── comanda/
│   │       └── ListComandaPage.js # + ion-infinite-scroll, ion-refresher
│   ├── shared/
│   │   └── util.js                # + showToast de erro de rede
│   └── sw.js                      # NOVO: Service Worker
└── vite.config.js                 # + PWA plugin, code splitting
```

## Complexity Tracking

N/A — nenhuma violação constitucional identificada.

---

## Bug Fixes (Descobertos durante a implementação)

### B001 — HomePage: `comandas.map is not a function`

**Arquivo:** `frontend/src/pages/home/HomePage.js`
**Sintoma:** Erro `TypeError: comandas.map is not a function` ao carregar `/home`.
**Causa:** O método `getComandas()` retorna um objeto paginado `{ data: [...], total, skip, take }`, mas `renderComandas()` chamava `.map()` diretamente no objeto.
**Correção:** Extrair `response.data || response` antes de passar para `renderComandas()`, seguindo o padrão já usado em `ListProdutoPage.js` e `ListMesaPage.js`.

### B002 — Service Worker: `cache.put()` rejeita requisições não-GET

**Arquivo:** `frontend/src/sw.js`
**Sintoma:** Erro `TypeError: Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported`.
**Causa:** O fetch handler tentava cacheados todas as requisições via `cache.put()`, que só aceita método `GET`. Requisições `POST`, `PATCH`, `DELETE` para a API quebravam.
**Correção:** Adicionar `if (request.method !== 'GET') return;` no início do fetch handler, deixando requisições não-GET passarem sem intervenção do SW. Versão do cache incrementada (`v1` → `v2`) para forçar re-cache dos assets.

### B003 — Páginas CRUD em branco (race condition no lazy loading)

**Arquivo:** `frontend/src/main.js`
**Sintoma:** Home page funciona, mas ao navegar para `/produtos`, `/usuarios`, `/mesas` ou `/comandas` a página aparece em branco sem erros no console.
**Causa:** O `import()` dinâmico no handler `ionRouteDidChange` não completava antes do `ion-router` tentar criar o componente. Com o cache vazio (após bump do SW), o fetch da rede adicionava latência suficiente para o router criar o componente antes do `customElements.define()` ser executado.
**Correção:** Migrar todos os imports de página de dinâmicos (`import()` em `routeToPage`) para estáticos no topo de `main.js`. Removido `routeToPage`, `adjacentRoutes` e `preloadAdjacentRoutes` — desnecessários com imports estáticos.

### B004 — UpdateMesaDto exige `id` no body da requisição

**Arquivo:** `backend/src/modules/mesa/dto/update-mesa.dto.ts`
**Sintoma:** Erro `Dados inválidos: id: id should not be empty, id must be an integer number` ao salvar edição de mesa.
**Causa:** `UpdateMesaDto` tinha campo `id` com decoradores `@IsInt() @IsNotEmpty()`, exigindo `id` no body. O frontend envia apenas `qtd_cadeiras` e `status` — o `id` vem do parâmetro de URL. Os outros DTOs de update (`UpdateProdutoDto`, `UpdateUsuarioDto`) não têm este campo.
**Correção:** Removido o campo `id` e a interface `IUpdateMesaInput` do DTO, alinhando com o padrão dos demais módulos.
