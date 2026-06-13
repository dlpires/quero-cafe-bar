# Tasks: Polimento e Refatoração UX/UI

**Input**: Design documents from `specs/008-ux-polimento-refatoracao/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Test tasks incluídos para US3 (toast cleanup) e US5 (toggle null fix) conforme Constitution Check (Test-First).

**Organization**: Tasks grouped by user story (US1–US7) em ordem de prioridade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All paths relative to `frontend/`

---

## Phase 1: Foundation — CSS Custom Properties (US1) 🎯 MVP

**Purpose**: Definir os tokens de design globais e consolidar regras CSS duplicadas no `style.css`. Este é o pré-requisito para US6 (remoção de CSS duplicados).

**Independent Test**: Inspecionar `:root` no DevTools e verificar 8+ CSS custom properties definidas. Abrir qualquer página e confirmar que `ion-input` e `ion-select` têm `font-size: 16px` aplicado via regra global.

### Implementation for User Story 1

- [ ] T001 [US1] Adicionar bloco `:root { }` com 8 CSS custom properties em `frontend/src/style.css` (tokens: --app-spacing, --app-spacing-sm, --app-spacing-lg, --app-border-radius, --app-font-family, --app-color-surface, --app-color-text-muted, --app-shadow-card)
- [ ] T002 [P] [US1] Mover regra `.radio-icon { margin-right: 8px; }` de `frontend/src/pages/produto/RegProdutoPage.css`, `frontend/src/pages/produto/UpdateProdutoPage.css`, e `frontend/src/pages/comanda/UpdateComandaPage.css` para `frontend/src/style.css`
- [ ] T003 [P] [US1] Mover regra `ion-input, ion-select { font-size: 16px; }` de `frontend/src/pages/produto/RegProdutoPage.css`, `frontend/src/pages/produto/UpdateProdutoPage.css`, `frontend/src/pages/mesa/RegMesaPage.css`, `frontend/src/pages/mesa/UpdateMesaPage.css`, e `frontend/src/pages/comanda/UpdateComandaPage.css` para `frontend/src/style.css`

**Checkpoint**: `style.css` global contém 10+ regras (8 tokens + 2 regras migradas). Nenhuma página perdeu estilos visuais.

---

## Phase 2: User Story 2 — Remoção de Estilos Inline (Priority: P1)

**Goal**: Eliminar todos os atributos `style` estáticos do HTML, migrando para classes CSS. Estilos dinâmicos (altura/offset de virtual scroll) permanecem inline com justificativa documentada.

**Independent Test**: `npm run build && npm test`. Inspecionar HTML renderizado de cada página e verificar zero `style=` estáticos.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Criar classes CSS `.skeleton-w-70`, `.skeleton-w-60`, `.skeleton-end` em `frontend/src/pages/home/HomePage.css` e substituir `style="width: 70%"`, `style="width: 60%"`, `style="width: 80px; height: 24px"` em `frontend/src/pages/home/HomePage.js`
- [ ] T005 [P] [US2] Criar classes `.skeleton-w-50`, `.skeleton-w-80` em `frontend/src/pages/produto/ListProdutoPage.css` e substituir `style="width: 50%"`, `style="width: 80%"` em `frontend/src/pages/produto/ListProdutoPage.js`
- [ ] T006 [P] [US2] Criar classe `.virtual-scroll-viewport` com `position: relative; overflow: hidden` em `frontend/src/pages/produto/ListProdutoPage.css` e substituir inline style estático em `frontend/src/pages/produto/ListProdutoPage.js` (manter `height` e `transform` inline — valores dinâmicos)
- [ ] T007 [P] [US2] Criar classes `.skeleton-w-50`, `.skeleton-w-80` em `frontend/src/pages/usuario/ListUsuarioPage.css` e substituir `style="width: 50%"`, `style="width: 80%"` em `frontend/src/pages/usuario/ListUsuarioPage.js`
- [ ] T008 [P] [US2] Criar classe `.virtual-scroll-viewport` com `position: relative; overflow: hidden` em `frontend/src/pages/usuario/ListUsuarioPage.css` e substituir inline style estático em `frontend/src/pages/usuario/ListUsuarioPage.js` (manter `height` e `transform` inline — valores dinâmicos)
- [ ] T009 [US2] Criar classe `.add-item-modal` com `--width: 90%; --height: 80%` em `frontend/src/pages/comanda/UpdateComandaPage.css` e substituir `style.cssText = '--width: 90%; --height: 80%;'` por `classList.add('add-item-modal')` em `frontend/src/pages/comanda/UpdateComandaPage.js`

**Checkpoint**: Zero `style=` estáticos no HTML. `npm test` todos passando.

---

## Phase 3: User Story 3 — Toast/Alert Garbage Collection (Priority: P2)

**Goal**: Garantir que `ion-toast`, `ion-alert` e `ion-loading` sejam removidos do DOM após dismiss, eliminando acúmulo progressivo de elementos.

**Independent Test**: Abrir DevTools → Elements. Realizar 20 operações CRUD consecutivas. Contagem de nós DOM deve retornar ao patamar inicial. Nenhum `ion-toast`, `ion-alert`, `ion-loading` residual no DOM.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US3] Criar teste unitário para `showToast()` verificando remoção do DOM após dismiss em `frontend/tests/shared/util.test.js`
- [ ] T011 [P] [US3] Criar teste unitário para `withLoading()` verificando remoção do DOM após dismiss e restauração do botão disabled em `frontend/tests/shared/util.test.js`

### Implementation for User Story 3

- [ ] T012 [US3] Adicionar `toast.addEventListener('ionToastDidDismiss', () => toast.remove())` em `showToast()` no arquivo `frontend/src/shared/util.js`
- [ ] T013 [US3] Adicionar `loading.addEventListener('ionLoadingDidDismiss', () => loading.remove())` em `withLoading()` no arquivo `frontend/src/shared/util.js`

**Checkpoint**: `npm test` passa (105+ novos testes). Toast/Alert/Loading não acumulam no DOM.

---

## Phase 4: User Story 4 — Substituir `presentToast` da LoginPage (Priority: P2)

**Goal**: Substituir a função `presentToast` local da LoginPage pela `showToast` importada de `shared/util.js`.

**Independent Test**: Testar login com campos vazios (toast warning), credenciais inválidas (toast danger), e login bem-sucedido (toast success). Todos os toasts devem aparecer e sumir corretamente.

### Implementation for User Story 4

- [ ] T014 [US4] Adicionar `showToast` à importação de `frontend/src/shared/util.js` em `frontend/src/pages/login/LoginPage.js`
- [ ] T015 [US4] Substituir 3 chamadas de `presentToast(...)` por `showToast(...)` com argumentos equivalentes em `frontend/src/pages/login/LoginPage.js` (linhas ~58 → `showToast('Informe usuário e senha...', 'warning', 2000)`, ~73 → `showToast('Login realizado...', 'success', 2000)`, ~80 → `showToast(mensagem, 'danger', 2000)`)
- [ ] T016 [US4] Remover definição da função local `presentToast` de `frontend/src/pages/login/LoginPage.js`

**Checkpoint**: LoginPage não possui função de toast local. Toasts do login usam `showToast` compartilhado.

---

## Phase 5: User Story 5 — Correção de Bug: Toggle `null` (Priority: P3)

**Goal**: Corrigir `formData.get('status') === 'on'` para tratar `null` (toggle não interagido) como ativo (`true`).

**Independent Test**: Editar produto ativo sem tocar no toggle → salvar → produto permanece ativo. Criar nova mesa sem tocar no toggle → mesa é criada ativa.

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [US5] Criar teste unitário para `RegProdutoPage` verificando que toggle não interagido (FormData `null`) resulta em status `true` em `frontend/tests/pages/produto/RegProdutoPage.test.js`
- [ ] T018 [US5] Criar teste unitário para `RegMesaPage` verificando que toggle não interagido (FormData `null`) resulta em status `true` em `frontend/tests/pages/mesa/RegMesaPage.test.js`

### Implementation for User Story 5

- [ ] T019 [P] [US5] Corrigir `formData.get('status') === 'on'` para `formData.get('status') !== null ? formData.get('status') === 'on' : true` em `frontend/src/pages/produto/RegProdutoPage.js` (linha ~68)
- [ ] T020 [P] [US5] Corrigir `formData.get('status') === 'on'` para `formData.get('status') !== null ? formData.get('status') === 'on' : true` em `frontend/src/pages/mesa/RegMesaPage.js` (linha ~53)
- [ ] T021 [US5] Corrigir `formData.get('status') === 'on'` em `frontend/src/pages/produto/UpdateProdutoPage.js` (linha ~89) para usar o valor atual do registro como fallback quando toggle não interagido

**Checkpoint**: `npm test` passa (105+ testes). Toggle de status funciona corretamente em cadastro e edição.

---

## Phase 6: User Story 6 — Consolidação de Arquivos CSS Duplicados (Priority: P3)

**Goal**: Remover 4 arquivos CSS duplicados (`RegProdutoPage.css`, `UpdateProdutoPage.css`, `RegMesaPage.css`, `UpdateMesaPage.css`) cujas regras já foram migradas para `style.css` no Phase 1.

**Independent Test**: `npm run build` sem erros. Listar `frontend/src/pages/` e verificar que os 4 arquivos foram removidos. Nenhum erro 404 no console das páginas afetadas.

### Implementation for User Story 6

- [ ] T022 [P] [US6] Remover arquivo `frontend/src/pages/produto/RegProdutoPage.css` e sua importação em `frontend/src/pages/produto/RegProdutoPage.js`
- [ ] T023 [P] [US6] Remover arquivo `frontend/src/pages/produto/UpdateProdutoPage.css` e sua importação em `frontend/src/pages/produto/UpdateProdutoPage.js`
- [ ] T024 [P] [US6] Remover arquivo `frontend/src/pages/mesa/RegMesaPage.css` e sua importação em `frontend/src/pages/mesa/RegMesaPage.js`
- [ ] T025 [P] [US6] Remover arquivo `frontend/src/pages/mesa/UpdateMesaPage.css` e sua importação em `frontend/src/pages/mesa/UpdateMesaPage.js`

**Checkpoint**: 4 arquivos CSS removidos. `npm run build` sucesso. Nenhum CSS carregado sem conteúdo útil.

---

## Phase 7: User Story 7 — Correções Residuais de Layout na Cozinha (Priority: P2)

**Goal**: Corrigir grid `minmax(320px→280px)`, `margin: 10` sem unidade, e `ion-select interface="popover"→"action-sheet"` na HomePage.

**Independent Test**: Redimensionar viewport para 320px e verificar que a cozinha não tem scroll horizontal. Abrir em mobile/emulador e verificar que `ion-select` abre como action-sheet.

### Implementation for User Story 7

- [ ] T026 [P] [US7] Alterar `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` para `minmax(280px, 1fr)` em `frontend/src/pages/home/HomePage.css`
- [ ] T027 [P] [US7] Corrigir `margin: 10` para `margin: 10px` no seletor `.comanda-card h3` em `frontend/src/pages/home/HomePage.css`
- [ ] T028 [US7] Alterar `interface="popover"` para `interface="action-sheet"` no `ion-select` de item-entrega em `frontend/src/pages/home/HomePage.js`

**Checkpoint**: HomePage funcional em 320px. Seletor de entrega usa interface mobile nativa.

---

## Phase 8: Polish & Cross-Cutting Validation

**Purpose**: Verificação final de todos os critérios de sucesso e qualidade.

- [ ] T029 Executar `npm test` e confirmar que todos os testes passam (105+ testes)
- [ ] T030 Executar `npm run build` e confirmar build sem erros
- [ ] T031 [P] Validar SC-001: inspecionar HTML de todas as páginas e confirmar zero `style=` estáticos
- [ ] T032 [P] Validar SC-002: realizar 50 operações CRUD e verificar contagem de nós DOM estável (sem acúmulo)
- [ ] T033 [P] Validar SC-003: verificar que `style.css` contém 8+ CSS custom properties documentadas
- [ ] T034 [P] Validar SC-004: verificar que nenhum arquivo CSS em `frontend/src/pages/` é duplicado ou desnecessário
- [ ] T035 [P] Validar SC-005: testar toggle de status com e sem interação em cadastro e edição de produto/mesa
- [ ] T036 [P] Validar SC-007: testar HomePage em viewport 320px de largura sem scroll horizontal
- [ ] T037 Validar SC-006: executar Lighthouse audit via `npx lighthouse http://localhost:5173 --only-categories=best-practices` e verificar score ≥ score de referência (não regredir)
- [ ] T038 Rodar quickstart.md checklist completo e marcar todos os itens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1 - CSS Custom Properties)**: No dependencies — start immediately. Foundation for US6.
- **Phase 2 (US2 - Inline Styles)**: Independent of Phase 1 — can run in parallel
- **Phase 3 (US3 - Toast Cleanup)**: Independent — can run in parallel with Phase 1/2
- **Phase 4 (US4 - LoginPage)**: **Depends on Phase 3** (needs `showToast` with cleanup from `shared/util.js`)
- **Phase 5 (US5 - Toggle Fix)**: Independent — can run in parallel with Phase 3/4
- **Phase 6 (US6 - CSS Cleanup)**: **Depends on Phase 1** (regras já migradas para `style.css`)
- **Phase 7 (US7 - HomePage Fixes)**: Independent — can run in parallel with any phase
- **Phase 8 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

| Story | Can Start After | Blocks |
|-------|----------------|--------|
| US1 (CSS Custom Properties) | — | US6 |
| US2 (Inline Styles) | — | — |
| US3 (Toast Cleanup) | — | US4 |
| US4 (LoginPage) | US3 complete | — |
| US5 (Toggle Fix) | — | — |
| US6 (CSS Cleanup) | US1 complete | — |
| US7 (HomePage Fixes) | — | — |

### Within Each User Story

- Tests FIRST (write, verify fail, then implement) — US3 and US5
- Implementation after tests pass (or skip if no tests)
- Independent test after implementation before advancing

### Parallel Opportunities

```
Phase 1 (US1) ──────────────────────────────────────────────────┐
                                                                  │
Phase 2 (US2) ──────────┐                                       │
Phase 3 (US3) ──────────┤── all 3 can start in parallel         │
Phase 5 (US5) ──────────┤                                       │
Phase 7 (US7) ──────────┘                                       │
                        │                                        │
                        ▼                                        │
              Phase 4 (US4) — depends on US3                    │
                        │                                        │
                        ▼                                        ▼
              Phase 6 (US6) — depends on US1 ────────────► Phase 8 (Polish)
```

---

## Parallel Example: Phase 2 (US2 - Inline Styles)

```bash
# All 6 tasks touch different files — can run in parallel:
Task: T004 "Criar classes skeleton em HomePage.css e HomePage.js"
Task: T005 "Criar classes skeleton em ListProdutoPage.css e ListProdutoPage.js"
Task: T006 "Criar .virtual-scroll-viewport em ListProdutoPage.css e ListProdutoPage.js"
Task: T007 "Criar classes skeleton em ListUsuarioPage.css e ListUsuarioPage.js"
Task: T008 "Criar .virtual-scroll-viewport em ListUsuarioPage.css e ListUsuarioPage.js"
Task: T009 "Criar .add-item-modal em UpdateComandaPage.css e UpdateComandaPage.js"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: CSS Custom Properties + Rule Migration
2. `npm run build` → verificar sem erros
3. Inspecionar `:root` no DevTools → 8 tokens visíveis
4. **STOP and VALIDATE**: Fundação do design system pronta

### Incremental Delivery

1. Phase 1 → CSS custom properties + regras globais consolidadas
2. Phase 2 + 3 + 7 → Inline styles removidos + Toast cleanup + HomePage fixes (rodar em paralelo)
3. Phase 4 → LoginPage usa utilitário compartilhado
4. Phase 5 + 6 → Toggle fix + CSS cleanup (rodar em paralelo)
5. Phase 8 → Validação final, todos SCs verificados

### Parallel Team Strategy (2 devs)

1. Dev A: Phase 1 (US1) + Phase 3 (US3)
2. Dev B: Phase 2 (US2) + Phase 7 (US7)
3. Dev A: Phase 6 (US6)
4. Dev B: Phase 4 (US4) + Phase 5 (US5)
5. Ambos: Phase 8 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [Story] label maps task to user story for traceability (US1–US7)
- Tests for US3 and US5 must be written FIRST and FAIL before implementation (Constitution III - Test-First)
- T004-T009 (inline styles) all touch different page directories — fully parallelizable
- T022-T025 (CSS removal) all touch different files — fully parallelizable
- Commit after each phase checkpoint
- Stop at any checkpoint to validate story independently
