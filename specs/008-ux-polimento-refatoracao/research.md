# Research: Polimento e Refatoração UX/UI

**Feature**: 008-ux-polimento-refatoracao
**Date**: 2026-06-12

## 1. CSS Custom Properties — Design Tokens

### Decision
Definir CSS custom properties no arquivo `frontend/src/style.css` (já é o entry point global, importado na linha 1 do `main.js` antes de qualquer CSS de página). Não criar `App.css` — o `style.css` já cumpre essa função.

### Rationale
- `style.css` é importado antes do Ionic core, garantindo que as variáveis cascateiam para todas as páginas
- Não existe `App.css` no projeto — criar um agora fragmentaria desnecessariamente os estilos globais
- Ionic 8.x já provê `--ion-color-primary`, `--ion-color-success`, etc. — as custom properties da aplicação complementam, não substituem

### Custom Properties Mínimas (8 tokens)
```css
:root {
  --app-spacing: 16px;
  --app-spacing-sm: 8px;
  --app-spacing-lg: 24px;
  --app-border-radius: 8px;
  --app-font-family: 'Roboto', sans-serif;
  --app-color-surface: var(--ion-color-light);
  --app-color-text-muted: var(--ion-color-medium);
  --app-shadow-card: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Alternatives Considered
- Criar `src/theme/variables.css` separado — rejeitado: adiciona complexidade de build (precisa de import adicional no `main.js`) sem benefício para um projeto com 13 arquivos CSS
- Usar apenas variáveis Ionic (`--ion-color-*`) — rejeitado: não cobre tokens de design específicos do app (ex: `--app-spacing` para 16px)

---

## 2. Inline Styles — Migração para Classes CSS

### Decision
Migrar apenas estilos **estáticos** para classes CSS. Estilos **dinâmicos** (valores computados em JS como `height`, `translateY`) permanecem como `style` inline com justificativa documentada — não é tecnicamente viável movê-los.

### Rationale
Após inspeção do código, os inline styles se dividem em duas categorias:

| Categoria | Arquivos | Pode migrar? | Ação |
|-----------|----------|-------------|------|
| `width: 70%/60%/50%/80%` em skeleton texts | `HomePage.js:68,74`, `ListProdutoPage.js:172,173`, `ListUsuarioPage.js:169,170` | Sim | Classes CSS: `.skeleton-w-70`, `.skeleton-w-60`, etc. |
| `width: 80px; height: 24px` em skeleton | `HomePage.js:76` | Sim | Classe CSS: `.skeleton-end` |
| `position:relative;overflow:hidden` no viewport | `ListProdutoPage.js:167,256`, `ListUsuarioPage.js:164,250` | Sim | Classe CSS: `.virtual-scroll-viewport` |
| `height:${n}px`, `transform:translateY(${n}px)` dinâmicos | `ListProdutoPage.js:257`, `ListUsuarioPage.js:251` | **Não** | Permanece inline (valores dependem de JS — virtual scroll) |
| `ion-modal style.cssText = '--width:90%;--height:80%'` | `UpdateComandaPage.js:238` | Parcial | Mover `--width` e `--height` para classe CSS `.add-item-modal` |

### Alternatives Considered
- CSS custom properties setadas via JS (`element.style.setProperty`) — rejeitado: mais verboso que `style=` para valores calculados e igualmente "inline" em termos de separação de responsabilidades
- Ignorar skeletons no escopo desta fase — rejeitado: a spec exige "zero inline styles" (SC-001), com a exceção documentada para valores dinâmicos

---

## 3. Toast/Alert Garbage Collection

### Decision
Adicionar listener `ionToastDidDismiss` / `ionAlertDidDismiss` nos utilitários `showToast` e `withLoading` em `shared/util.js` para remover o elemento do DOM após dismiss. Todas as páginas que chamam esses utilitários herdam o comportamento automaticamente.

### Rationale
- `showToast()` e `withLoading()` (Fase 0) são os pontos centrais de criação de feedback — corrigir neles resolve o problema em toda a aplicação
- O evento `ionToastDidDismiss` dispara após a animação de saída terminar — timing correto para `remove()`
- O `LoginPage.presentToast()` local será substituído por `showToast()` do utilitário, eliminando o código duplicado

### Padrão de implementação
```js
export async function showToast(message, color = 'success', duration = 2000) {
  const toast = document.createElement('ion-toast');
  toast.message = message;
  toast.duration = duration;
  toast.color = color;
  toast.position = 'bottom';
  document.body.appendChild(toast);
  await toast.present();
  toast.addEventListener('ionToastDidDismiss', () => toast.remove());
}
```

### Alternatives Considered
- Usar `onDidDismiss()` com Promise — rejeitado: retorna após dismiss mas não garante remoção do DOM; listener com callback explícito é mais idiomático para Vanilla JS
- `toast.parentNode?.removeChild(toast)` — rejeitado: `toast.remove()` é mais direto e suportado universalmente

---

## 4. Toggle (`ion-toggle`) — Tratamento de `null`

### Decision
Corrigir `formData.get('status') === 'on'` para `formData.get('status') !== null ? formData.get('status') === 'on' : true` em formulários de cadastro (RegProdutoPage, RegMesaPage) e `formData.get('status') !== null ? formData.get('status') === 'on' : <valor atual do registro>` em formulários de edição (UpdateProdutoPage).

### Rationale
O `ion-toggle` participa do `FormData` apenas quando está **checked** (valor `"on"`). Quando desmarcado ou não interagido, `FormData.get('status')` retorna `null`.

| Cenário | `formData.get('status')` | Comportamento atual | Comportamento corrigido |
|---------|-------------------------|---------------------|------------------------|
| Toggle ligado (tocado ou default `checked`) | `"on"` | `true` ✅ | `true` ✅ |
| Toggle desligado (usuário tocou) | `null` | `false` ✅ | `false` ✅ |
| Toggle nunca tocado (sem atributo `checked`) | `null` | `false` ❌ | `true` (default ativo para cadastro) |
| Toggle nunca tocado (com atributo `checked`) | `"on"` | `true` ✅ | `true` ✅ |

O bug ocorre no 3º cenário: se o template de cadastro remover o atributo `checked` do toggle, um produto/mesa seria criado como inativo sem o usuário saber.

### Alternatives Considered
- Inverter lógica: `formData.get('status') !== 'on' ? false : true` — rejeitado: igualmente frágil
- Usar `form.elements['status'].checked` diretamente — rejeitado: `ion-toggle` é um Web Component Ionic, não um `<input type="checkbox">` nativo; a propriedade `checked` pode não refletir o estado real em todos os cenários

---

## 5. Arquivos CSS — Duplicação e Consolidação

### Decision
Consolidar regras CSS duplicadas e remover arquivos desnecessários. O escopo muda de "preencher ou remover vazios" para "eliminar duplicação e consolidar regras comuns".

### Rationale
Nenhum dos 5 arquivos está vazio — todos têm conteúdo. No entanto:

| Arquivo | Tamanho | Situação | Ação |
|---------|---------|----------|------|
| `RegProdutoPage.css` | 89 B | Duplicata exata de `UpdateProdutoPage.css` | Consolidar em arquivo único (manter `ListProdutoPage.css` com regras comuns a produto) |
| `UpdateProdutoPage.css` | 89 B | Duplicata exata de `RegProdutoPage.css` | Remover; importar `ListProdutoPage.css` ou regra comum |
| `RegMesaPage.css` | 34 B | Duplicata exata de `UpdateMesaPage.css` | Consolidar em `ListMesaPage.css` |
| `UpdateMesaPage.css` | 34 B | Duplicata exata de `RegMesaPage.css` | Remover; importar regra comum |
| `ListMesaPage.css` | 290 B | CSS válido com regras de layout | Manter e expandir com regras comuns de mesa |

Regras duplicadas cross-module a consolidar:
- `.radio-icon { margin-right: 8px; }` — aparece em 3 arquivos → mover para `style.css`
- `ion-input, ion-select { font-size: 16px; }` — aparece em 5 arquivos → mover para `style.css` (já que é uma regra global de acessibilidade/a11y)

### Alternatives Considered
- Manter arquivos duplicados — rejeitado: viola DRY e SC-004 (zero arquivos vazios). Se a spec original mencionava "vazios", a intenção era limpeza — a duplicação é um problema pior que arquivos vazios
- Criar `shared/styles/common.css` — rejeitado: fragmenta estilos globais. `style.css` já existe e é o local correto para regras cross-module

---

## 6. LoginPage — Substituir `presentToast` Local por `showToast`

### Decision
Substituir a função `presentToast` local da LoginPage pela `showToast` importada de `shared/util.js`. A `presentToast` local será removida.

### Rationale
- `showToast` (Fase 0) já oferece funcionalidade equivalente: message, color, duration, position
- A `presentToast` local NÃO faz garbage collection (não remove o toast do DOM após dismiss) — a versão em `shared/util.js` o fará
- A LoginPage já importa `focusFirstElement` de `shared/util.js` — adicionar `showToast` à importação é trivial

### Mapeamento de chamadas existentes
| Linha | Chamada atual | Substituição |
|-------|--------------|--------------|
| 58 | `presentToast('Informe usuário e senha...', 'warning')` | `showToast('Informe usuário e senha...', 'warning', 2000)` |
| 73 | `presentToast('Login realizado...', 'success')` | `showToast('Login realizado...', 'success', 2000)` |
| 80 | `presentToast(mensagem)` | `showToast(mensagem, 'danger', 2000)` |

### Alternatives Considered
- Manter `presentToast` local e apenas adicionar cleanup — rejeitado: duplicação desnecessária. O utilitário compartilhado existe exatamente para evitar isso
- Mover `presentToast` para escopo de módulo (fora da classe) — rejeitado: seria redundante com `showToast` de `shared/util.js`

---

## 7. HomePage: Grid `minmax` e `ion-select interface`

### Decision
- **Grid**: Alterar `minmax(320px, 1fr)` → `minmax(280px, 1fr)` no `.comandas-grid` (`HomePage.css:13`)
- **ion-select**: Alterar `interface="popover"` → `interface="action-sheet"` (`HomePage.js:137`)
- **margin bug**: Corrigir `margin: 10` → `margin: 10px` no `.comanda-card h3` (`HomePage.css:51`)

### Rationale
- **Grid 320→280px**: Com 320px, o grid cria 1 coluna de 320px + gap 16px = 336px mínimo. Em tela de 320px (iPhone SE), causa scroll horizontal. Com 280px, o mínimo é 296px — cabe em 320px.
- **action-sheet**: O Ionic recomenda `action-sheet` para seletores mobile (melhor ergonomia touch, aparece na parte inferior). O `popover` é mais adequado para desktop.
- **margin: 10**: CSS inválido (unidade faltando). Corrigir para `10px` ou `0` — a intenção mais provável é `10px` (separação visual entre heading e conteúdo).

### Alternatives Considered
- Grid `minmax(260px, 1fr)` — rejeitado: card de comanda ficaria muito estreito, ilegível
- `interface="popover"` com `trigger-action="context-menu"` — rejeitado: mais complexo, não resolve o problema mobile
