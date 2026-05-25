# Auditoria UX/UI — Quero Café Bar

## 1. Resumo Executivo

O frontend do **Quero Café Bar** utiliza Ionic 8.x Web Components com uma arquitetura de Custom Elements Vanilla JS, apresentando uma base sólida com componentes nativos do Ionic que já entregam boa acessibilidade básica (contrastes, toques, foco). No entanto, a aplicação sofre de **ausência crítica de feedback visual em operações de salvamento**, **falta de loading states em formulários**, **validação de frontend praticamente inexistente**, e **nenhum atributo ARIA** nos componentes dinâmicos.

As listagens CRUD (Produto, Usuário, Mesa, Comanda) seguem um padrão consistente e replicável — o que é positivo para manutenção — mas **nenhuma delas fornece feedback visual de sucesso** após salvar um registro, navegando de volta cegamente sem confirmação.

O maior risco de usabilidade está nos **formulários de cadastro/edição**, onde o usuário pode clicar múltiplas vezes no botão "Salvar" sem qualquer feedback visual, potencialmente criando registros duplicados. Além disso, a **ausência de atributos de acessibilidade** (ARIA) nos ícones decorativos e botões de ação torna o app problemático para leitores de tela.

---

## 2. Problemas Encontrados

### 🔴 Críticos

| # | Problema | Localização | Heurística |
|---|----------|-------------|------------|
| C1 | **Nenhum feedback de sucesso após salvar** — todas as páginas de cadastro/edição navegam de volta sem exibir toast de confirmação | `RegProdutoPage.js:59`, `RegUsuarioPage.js:65`, `RegMesaPage.js:44`, `RegComandaPage.js:80`, `UpdateProdutoPage.js:88`, `UpdateUsuarioPage.js:94`, `UpdateMesaPage.js:63`, `UpdateComandaPage.js:335` | Nielsen #1 (Visibilidade do Status) |
| C2 | **Sem loading state em botões de submit** — formulário pode ser submetido múltiplas vezes; nenhum dos formulários CRUD desabilita o botão durante o envio | `RegProdutoPage.js:47-68`, `RegUsuarioPage.js:53-74`, `RegMesaPage.js:34-53`, `RegComandaPage.js:69-89`, `UpdateProdutoPage.js:72-97`, `UpdateUsuarioPage.js:78-103`, `UpdateMesaPage.js:53-71`, `UpdateComandaPage.js:324-344` | Nielsen #5 (Prevenção de Erros) |
| C3 | **Sem validação de frontend em formulários CRUD** — apenas o login valida campos vazios | `RegProdutoPage.js:47-68`, `RegUsuarioPage.js:53-74`, `RegMesaPage.js:34-53` | Nielsen #5 (Prevenção de Erros) |
| C4 | **`localStorage.clear()` no 401 é destrutivo** — apaga todo o localStorage | `api.js:54` | Nielsen #3 (Controle e Liberdade) |

### 🟠 Altos

| # | Problema | Localização |
|---|----------|-------------|
| A1 | **Nenhum `aria-label` em botões de ícone puro** — `create-outline`, `trash-outline`, `log-out-outline` | `Header.js:83`, `ListProdutoPage.js:110-114`, `ListUsuarioPage.js:105-109`, `ListMesaPage.js:92-97`, `ListComandaPage.js:125-130`, `UpdateComandaPage.js:139-141` |
| A2 | **Nenhum `aria-label` em ícones decorativos no menu** — sem `aria-hidden="true"` | `Header.js:37,41,45,49,53` |
| A3 | **Gerenciamento de foco ausente** — ao navegar entre páginas, o foco não é movido para o topo | Todas as páginas |
| A4 | **Cancelar sem confirmação** — botão Cancelar descarta dados sem perguntar | Todos os formulários de Reg/Update |
| A5 | **Mensagens de erro genéricas** — "Tente novamente mais tarde" sem especificar o motivo | Todos os catch blocks |
| A6 | **Nenhuma proteção contra exclusão acidental de usuário logado** | `ListUsuarioPage.js:133-165` |

### 🟡 Médios

| # | Problema | Localização |
|---|----------|-------------|
| M1 | **CSS `h3` global poluindo escopo** | `ListProdutoPage.css:1`, `ListUsuarioPage.css:1` |
| M2 | **Inline styles espalhados pelo código** | `RegProdutoPage.js:31-35`, `RegUsuarioPage.js:37-42`, `UpdateComandaPage.js:29-31,38-40,45-48`, `HomePage.js:82` |
| M3 | **CSS com erro de sintaxe: `margin: 10` sem unidade** | `HomePage.css:46` |
| M4 | **Empty states pobres** — apenas um `<p>` sem ilustração ou CTA | `HomePage.js:48`, `ListProdutoPage.js:86`, `ListUsuarioPage.js:86`, `ListMesaPage.js:75`, `ListComandaPage.js:95`, `UpdateComandaPage.js:120` |
| M5 | **Nenhum cache ou suporte offline** — sem service worker | Todo o app |
| M6 | **Toast/Alert criados no DOM sem garbage collection** — nunca removidos após dismiss | Todas as páginas |
| M7 | **Navegação mista** — `router.push()` vs `window.location.href` | `ListProdutoPage.js:76,128` |
| M8 | **`presentToast` definida dentro de `connectedCallback`** — recriada a cada render | `LoginPage.js:82-91` |

### 🔵 Baixos

| # | Problema | Localização |
|---|----------|-------------|
| B1 | **Código comentado em produção** | `main.js:46-48` |
| B2 | **Favicon padrão do Vite** — `vite.svg` não representa a marca | `public/vite.svg` |
| B3 | **`formData.get('status') === 'on'` frágil** — toggle desabilitado retorna `null` | `RegProdutoPage.js:54`, `RegMesaPage.js:39` |
| B4 | **`ngrok-skip-browser-warning` hardcoded** — header de debug vaza para produção | `api.js:33,88` |

---

## 3. Análise Heurística (Nielsen)

### H1 — Visibilidade do Status do Sistema ⚠️ ALERTA
- ✅ Loading spinners nas listagens (fetch de dados)
- ❌ Nenhum feedback de sucesso ao salvar/editar
- ❌ Nenhum feedback visual de progresso durante submit
- ❌ Empty states genéricos sem orientação

### H2 — Correspondência com o Mundo Real ✅ BOM
- ✅ Terminologia em português brasileiro
- ✅ Ícones intuitivos
- ✅ Uso de `pt-BR` para formatação de moeda
- ⚠️ Nomes de página inconsistentes (header vs título do card)

### H3 — Controle e Liberdade do Usuário ⚠️ ALERTA
- ✅ Botão Cancelar presente em todos os formulários
- ❌ Cancelar não pede confirmação para dados não salvos
- ❌ `localStorage.clear()` remove dados que não são da sessão
- ❌ Nenhuma funcionalidade "desfazer" após exclusão

### H4 — Consistência e Padrões ⚠️ ATENÇÃO
- ✅ Padrão consistente entre páginas CRUD
- ❌ Navegação mista (`router.push()` vs `window.location.href`)
- ❌ CSS global de `h3` conflitando entre páginas
- ⚠️ Botões de submit com ícones inconsistentes

### H5 — Prevenção de Erros 🔴 CRÍTICO
- ❌ Sem validação frontend nos formulários
- ❌ Botão submit não é desabilitado durante processamento
- ❌ Pode submeter formulário com dados inválidos
- ❌ Usuário pode excluir a si mesmo

### H6 — Reconhecimento vs Recordação ⚠️ ATENÇÃO
- ✅ Labels flutuantes nos inputs
- ❌ Erros de API devolvem mensagens genéricas
- ⚠️ Empty states não orientam sobre ações disponíveis

### H7 — Flexibilidade e Eficiência ✅ REGULAR
- ✅ FAB button para criar novos registros
- ❌ Sem atalhos de teclado
- ❌ Sem suporte offline (service worker)

### H8 — Design Estético e Minimalista ⚠️ ATENÇÃO
- ❌ Muitos estilos inline
- ✅ Grid responsivo na cozinha
- ⚠️ CSS com erro de sintaxe (`margin: 10`)

### H9 — Ajuda a Diagnosticar Erros ⚠️ ALERTA
- ❌ Mensagens de erro genéricas ("Tente novamente mais tarde")
- ❌ `console.error` sem expor detalhes ao usuário
- ⚠️ Sem sugestões de ação corretiva nos erros

### H10 — Ajuda e Documentação ✅ REGULAR
- ✅ Labels nos formulários autoexplicativos
- ❌ Sem tooltips, onboarding, ou página de ajuda

---

## 4. Análise de Acessibilidade (WCAG)

### Percepção

| Critério | Status | Evidência |
|----------|--------|-----------|
| 1.1.1 Conteúdo não textual | ❌ Falha | Ícones sem `aria-hidden` |
| 1.4.3 Contraste mínimo (AA) | ✅ OK | Ionic default colors |
| 1.4.1 Uso de cor | ✅ OK | Status também usa texto |

### Operação

| Critério | Status | Evidência |
|----------|--------|-----------|
| 2.1.1 Teclado | ⚠️ Parcial | Ionic components navegáveis |
| 2.4.3 Ordem de foco | ❌ Falha | Nenhuma página gerencia foco |
| 2.5.3 Rótulo em nome | ❌ Falha | Botões sem `aria-label` |

### Compreensão

| Critério | Status | Evidência |
|----------|--------|-----------|
| 3.3.2 Rótulos | ✅ OK | `label-placement="floating"` |
| 3.3.1 Identificação de erro | ⚠️ Parcial | Alert exibe erro sem descrição do campo |
| 4.1.2 Nome, função, valor | ❌ Falha | Componentes dinâmicos sem ARIA |

---

## 5. Padrões de Código Sugeridos

### 5.1. Utilitário de feedback (`shared/util.js`)

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

export async function withLoading(buttonElement, action, loadingMessage = 'Processando...') {
  const loading = document.createElement('ion-loading');
  loading.message = loadingMessage;
  document.body.appendChild(loading);
  await loading.present();
  if (buttonElement) buttonElement.disabled = true;
  try {
    await action();
  } finally {
    if (buttonElement) buttonElement.disabled = false;
    await loading.dismiss();
    loading.addEventListener('ionLoadingDidDismiss', () => loading.remove());
  }
}
```

### 5.2. Empty state component pattern

```js
export function createEmptyState(container, { icon, title, message, buttonText, buttonUrl }) {
  container.innerHTML = `
    <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center;">
      <ion-icon name="${icon}" style="font-size: 64px; color: var(--ion-color-medium-shade); margin-bottom: 16px;" aria-hidden="true"></ion-icon>
      <h3 style="margin-bottom: 8px; font-weight: 600;">${title}</h3>
      <p style="color: var(--ion-color-medium); margin-bottom: 24px;">${message}</p>
      ${buttonText && buttonUrl ? `<ion-button expand="block" id="empty-state-cta">${buttonText}</ion-button>` : ''}
    </div>
  `;
  if (buttonText && buttonUrl) {
    container.querySelector('#empty-state-cta')
      .addEventListener('click', () => document.querySelector('ion-router').push(buttonUrl));
  }
}
```

### 5.3. Form validation helper

```js
export async function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    await showToast(`O campo "${fieldName}" é obrigatório.`, 'warning', 3000);
    return false;
  }
  return true;
}

export async function validatePositiveNumber(value, fieldName) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    await showToast(`O campo "${fieldName}" deve ser um número maior que zero.`, 'warning', 3000);
    return false;
  }
  return true;
}
```
