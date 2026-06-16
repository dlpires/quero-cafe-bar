# Quickstart: Polimento e Refatoração UX/UI

**Feature**: 008-ux-polimento-refatoracao
**Date**: 2026-06-12

## Pré-requisitos

- Fases 0, 1, 2, e 3 implementadas e testadas
- `shared/util.js` exportando `showToast()` e `withLoading()` (Fase 0)
- `frontend/` rodando com `npm run dev` (porta 5173)
- 105 testes passando (`npm test`)

## Ordem de Implementação

### Passo 1: CSS Custom Properties (FR-001, FR-008)
**Arquivo**: `frontend/src/style.css`

1. Adicionar bloco `:root { }` com 8 tokens de design (ver `data-model.md`)
2. Mover `.radio-icon` e `ion-input, ion-select { font-size: 16px }` dos CSS de página para `style.css`
3. Verificar via DevTools que as variáveis aparecem no `:root` do DOM

### Passo 2: Toast/Alert Cleanup (FR-003)
**Arquivo**: `frontend/src/shared/util.js`

1. Adicionar `toast.addEventListener('ionToastDidDismiss', () => toast.remove())` no `showToast()`
2. Adicionar `loading.addEventListener('ionLoadingDidDismiss', () => loading.remove())` no `withLoading()`
3. Testar: abrir DevTools → Elements → realizar 5 operações CRUD → verificar que nenhum `ion-toast` ou `ion-loading` permanece no DOM

### Passo 3: LoginPage — Substituir `presentToast` (FR-004, FR-005)
**Arquivo**: `frontend/src/pages/login/LoginPage.js`

1. Adicionar `showToast` à importação de `shared/util.js`
2. Substituir 3 chamadas de `presentToast(...)` por `showToast(...)` com argumentos equivalentes
3. Remover definição da função `presentToast`
4. Testar login com campos vazios, credenciais inválidas, e login bem-sucedido

### Passo 4: Inline Styles → CSS Classes (FR-002)
**Arquivos**: `HomePage.js`, `ListProdutoPage.js`, `ListUsuarioPage.js`, `UpdateComandaPage.js`

1. Criar classes CSS (ex: `.skeleton-w-70 { width: 70% }`) nos respectivos `.css` irmãos
2. Substituir `style="width: 70%"` por `class="skeleton-w-70"`
3. Para `UpdateComandaPage.js:238`: criar classe `.add-item-modal` com `--width: 90%; --height: 80%` no CSS e aplicar via `classList.add`
4. Manter `style="height:${n}px"` e `style="transform:translateY(${n}px)"` inline (valores dinâmicos — ver research.md seção 2)
5. Rodar `npm test` e inspecionar HTML para garantir zero `style=` estáticos

### Passo 5: Toggle `null` Fix (FR-006)
**Arquivos**: `RegProdutoPage.js:68`, `RegMesaPage.js:39`, `UpdateProdutoPage.js:89`

1. Alterar `formData.get('status') === 'on'` para:
   ```js
   formData.get('status') !== null ? formData.get('status') === 'on' : true
   ```
2. Para UpdateProdutoPage, alterar para usar o valor atual do registro como fallback
3. Testar: criar produto sem tocar no toggle → verificar que fica ativo
4. Testar: editar produto ativo sem tocar no toggle → verificar que permanece ativo

### Passo 6: CSS Vazios / Duplicados (FR-007)
**Arquivos**: 4 CSS de página a remover

1. Verificar que regras de `.radio-icon` e `ion-input` já estão no `style.css` (Passo 1)
2. Remover arquivos: `RegProdutoPage.css`, `UpdateProdutoPage.css`, `RegMesaPage.css`, `UpdateMesaPage.css`
3. Remover `import './RegProdutoPage.css'` etc. dos respectivos `.js`
4. Rodar `npm run build` e verificar que build não quebra

### Passo 7: HomePage Correções (FR-009, FR-010)
**Arquivos**: `HomePage.css`, `HomePage.js`

1. Alterar `minmax(320px, 1fr)` → `minmax(280px, 1fr)` no `.comandas-grid`
2. Alterar `margin: 10` → `margin: 10px` no `.comanda-card h3`
3. Alterar `interface="popover"` → `interface="action-sheet"` no `ion-select`
4. Testar em viewport 320px de largura

## Verificação Final

```bash
cd frontend
npm test              # 105+ testes passando
npm run lint          # Deve passar (verificar se há ESLint configurado)
npm run build         # Build sem erros
```

### Checklist Pós-Implementação

- [ ] `style.css` tem 8+ CSS custom properties no `:root`
- [ ] Zero `style=` estáticos no HTML (DevTools Elements)
- [ ] Nenhum `ion-toast`/`ion-alert`/`ion-loading` residual após operações
- [ ] LoginPage usa `showToast` de `shared/util.js`
- [ ] Toggle de status funciona com `null` (não interagido = ativo)
- [ ] 4 arquivos CSS removidos, importações limpas
- [ ] HomePage sem scroll horizontal em 320px
- [ ] `ion-select` da cozinha abre como action-sheet
- [ ] `npm test` todos passando
- [ ] `npm run build` sucesso
