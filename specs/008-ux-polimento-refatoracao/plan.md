# Implementation Plan: Polimento e Refatoração UX/UI

**Branch**: `008-ux-polimento-refatoracao` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-ux-polimento-refatoracao/spec.md`

## Summary

Fase final de qualidade de código do frontend Quero Café Bar. Compreende: definição de CSS custom properties globais no `style.css`, migração de todos os estilos inline para classes CSS, garantia de garbage collection de componentes Toast/Alert via lifecycle events, extração de funções utilitárias para escopo de módulo, correção de bug no toggle de status (`formData.get('status') === 'on'` → tratamento de `null`), limpeza de 5 arquivos CSS vazios, e absorção de 2 correções residuais da Fase 3 (grid `minmax` e `action-sheet` na cozinha). Impacto estimado: ~10 arquivos JS/CSS modificados, zero alterações no backend.

## Technical Context

**Language/Version**: JavaScript ES Modules (Vanilla JS, ES2020+)

**Primary Dependencies**: Ionic 8.x Web Components, Vite 7.x

**Storage**: N/A (frontend-only feature; localStorage usado apenas para token JWT)

**Testing**: Jest + jsdom (frontend test suite: 105 tests, 8 suites)

**Target Platform**: Navegadores modernos (Chrome 90+, Safari 14+, Firefox 90+), WebView Android (Capacitor 8.x)

**Project Type**: Mobile web application (Ionic SPA + Capacitor Android)

**Performance Goals**: 60fps em animações de dismiss; zero acumulação de nós DOM após 50 operações; Lighthouse Best Practices score estável ou em melhora

**Constraints**: Zero regressão nos testes existentes (105 passando); nenhum atributo `style` inline ao final da fase; todos os arquivos CSS do diretório `pages/` com conteúdo

**Scale/Scope**: ~13 arquivos frontend afetados (8 JS + 5 CSS); 7 user stories; 10 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — GATE NOT APPLICABLE. Esta é uma feature puramente frontend (CSS, JS refactoring). Nenhum endpoint, DTO ou serviço backend é criado ou modificado.

2. **Modular Architecture** — ✅ PASS. Todas as alterações respeitam a estrutura existente:
   - `src/style.css` — estilo global (já existe)
   - `src/shared/util.js` — utilitários compartilhados (já existe, expandido na Fase 0)
   - `src/pages/*/` — páginas existentes mantendo estrutura de Custom Elements
   - `src/services/api.js` — serviço API (alterado na Fase 0)
   Nenhum novo módulo é necessário.

3. **Test-First** (NON-NEGOTIABLE) — ✅ PASS. Estratégia:
   - Testes existentes (105 passing em 8 suites) devem continuar passando
   - Novos testes a serem adicionados: toggle `null` handling (User Story 5), toast/alert DOM cleanup (User Story 3)
   - Cobertura não deve diminuir

4. **Full-Stack Consistency** — GATE NOT APPLICABLE. Nenhum contrato de dados é alterado. As correções de toggle e CSS são puramente de camada de apresentação.

5. **Security & Observability** — ✅ PASS. O `localStorage.clear()` destrutivo já foi corrigido na Fase 0 (task 0.6). O header `ngrok-skip-browser-warning` hardcoded já foi removido (task 0.7). Nenhuma nova vulnerabilidade é introduzida.

**Gate Result**: ALL PASS. Nenhuma violação justificada necessária.

## Project Structure

### Documentation (this feature)

```text
specs/008-ux-polimento-refatoracao/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (CSS custom properties design tokens)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── style.css                    # FR-001, FR-008: CSS custom properties globais
│   ├── main.js                      # Sem alterações nesta fase
│   ├── shared/
│   │   └── util.js                  # FR-003: showToast/withLoading com lifecycle cleanup
│   ├── services/
│   │   └── api.js                   # Já corrigido na Fase 0 (tasks 0.6, 0.7)
│   └── pages/
│       ├── login/
│       │   └── LoginPage.js         # FR-004, FR-005: extrair presentToast → módulo
│       ├── home/
│       │   ├── HomePage.js          # FR-002: remover inline styles (linha 82)
│       │   │                        # FR-009: grid minmax(280px, 1fr) — absorvido da Fase 3
│       │   │                        # FR-010: ion-select interface="action-sheet" — absorvido da Fase 3
│       │   └── HomePage.css         # FR-009: ajuste do grid
│       ├── produto/
│       │   ├── RegProdutoPage.js    # FR-002: remover inline styles (linhas 31-35)
│       │   │                        # FR-006: toggle null handling (formData.get('status'))
│       │   ├── RegProdutoPage.css   # FR-007: preencher ou remover (vazio atualmente)
│       │   ├── UpdateProdutoPage.js # FR-002: verificar inline styles residuais
│       │   ├── UpdateProdutoPage.css# FR-007: preencher ou remover (vazio atualmente)
│       │   └── ListProdutoPage.js   # FR-002: remover inline styles (linhas 97-101)
│       ├── usuario/
│       │   ├── RegUsuarioPage.js    # FR-002: remover inline styles (linhas 37-42)
│       │   ├── ListUsuarioPage.js   # FR-002: remover inline styles (linhas 93-98)
│       │   └── UpdateUsuarioPage.js # FR-002: verificar inline styles residuais
│       ├── mesa/
│       │   ├── RegMesaPage.js       # FR-006: toggle null handling (formData.get('status'))
│       │   ├── RegMesaPage.css      # FR-007: preencher ou remover (vazio atualmente)
│       │   ├── UpdateMesaPage.css   # FR-007: preencher ou remover (vazio atualmente)
│       │   └── ListMesaPage.css     # FR-007: preencher ou remover (vazio atualmente)
│       └── comanda/
│           └── UpdateComandaPage.js # FR-002: remover inline styles (linhas 29-48)
└── tests/
    └── [novos testes para US3 e US5 adicionados aqui]
```

**Structure Decision**: Option 2 (Web application — frontend only). Esta feature toca exclusivamente o diretório `frontend/`. O backend (`backend/`) não sofre alterações. A estrutura de Custom Elements (`pages/*/`) e o CSS por página (`.css` irmão do `.js`) são preservados.

## Complexity Tracking

> Nenhuma violação constitucional detectada. Seção vazia por design.
