# Feature Specification: UX CRUD Improvements

**Feature Branch**: `003-ux-crud-improvements`

**Created**: 2026-05-21

**Status**: Draft

**Input**: UX audit report from `analysis/ux-14052026/ux-ui-audit.md` — Critical and Medium findings across all CRUD pages

## User Scenarios & Testing

### User Story 1 - Feedback visual ao salvar registros (Priority: P1)

Todas as páginas de cadastro e edição do sistema (produto, usuário, mesa, comanda) devem exibir uma notificação visual de sucesso após salvar um registro, antes de navegar de volta para a listagem. Atualmente o sistema navega de volta sem qualquer confirmação, deixando o usuário sem saber se a operação foi bem-sucedida.

**Why this priority**: Sem feedback, o usuário não sabe se o dado foi salvo, podendo tentar salvar novamente e criar duplicatas. Afeta todos os formulários CRUD.

**Independent Test**: Abrir qualquer formulário de cadastro, preencher dados, clicar em "Salvar" — o sistema deve exibir um toast de sucesso antes de redirecionar para a listagem.

**Acceptance Scenarios**:

1. **Given** um usuário preenche um formulário de cadastro, **When** ele clica em "Salvar" e a operação é bem-sucedida, **Then** o sistema exibe um toast de sucesso com a mensagem "Registro salvo com sucesso!" antes de redirecionar para a listagem.
2. **Given** um usuário edita um registro existente, **When** ele clica em "Salvar" e a operação é bem-sucedida, **Then** o sistema exibe um toast de sucesso com a mensagem "Registro atualizado com sucesso!" antes de redirecionar para a listagem.

---

### User Story 2 - Prevenção de múltiplos envios de formulário (Priority: P1)

Os botões de submit dos formulários CRUD devem ser desabilitados durante o processamento da requisição, impedindo que o usuário clique múltiplas vezes e envie dados duplicados. O botão deve ser reabilitado em caso de erro para permitir nova tentativa.

**Why this priority**: Usuários podem clicar múltiplas vezes por ansiedade ou latência de rede, causando registros duplicados no sistema.

**Independent Test**: Abrir formulário de cadastro, preencher dados, clicar em "Salvar" rapidamente várias vezes — apenas uma requisição deve ser enviada.

**Acceptance Scenarios**:

1. **Given** um usuário clica em "Salvar" em um formulário, **When** a requisição está em andamento, **Then** o botão "Salvar" deve aparecer como desabilitado e o texto deve indicar "Salvando...".
2. **Given** um usuário clica em "Salvar" e a requisição falha, **When** o erro é exibido, **Then** o botão "Salvar" deve ser reabilitado para permitir nova tentativa.

---

### User Story 3 - Validação de frontend nos formulários CRUD (Priority: P1)

Todos os formulários de cadastro e edição devem validar os campos obrigatórios e formatos antes de enviar a requisição ao servidor, exibindo mensagens claras de erro para cada campo inválido.

**Why this priority**: Sem validação no frontend, o usuário só descobre erros após a requisição falhar no servidor, gerando frustração e perda de dados preenchidos.

**Independent Test**: Preencher formulário com campos obrigatórios vazios e clicar em "Salvar" — o sistema deve exibir erro sem enviar requisição ao servidor.

**Acceptance Scenarios**:

1. **Given** um formulário com campo obrigatório vazio, **When** o usuário clica em "Salvar", **Then** o sistema exibe um aviso visual "O campo '[nome]' é obrigatório." e não envia a requisição.
2. **Given** um campo numérico com valor zero ou negativo, **When** o usuário clica em "Salvar", **Then** o sistema exibe um aviso "O campo '[nome]' deve ser maior que zero." e não envia a requisição.
3. **Given** um formulário com toggle "Ativo", **When** o toggle está desabilitado, **Then** o sistema deve interpretar corretamente como "false" e não como null.

---

### User Story 4 - Limpeza segura de sessão no 401 (Priority: P1)

Quando o servidor retorna 401 (não autorizado), o sistema deve remover apenas o token de autenticação do armazenamento local, preservando quaisquer outros dados armazenados pelo usuário no navegador.

**Why this priority**: O uso de `localStorage.clear()` apaga todos os dados do armazenamento local, não apenas o token da sessão. Isso pode remover preferências do usuário ou dados de outras aplicações no mesmo domínio.

**Independent Test**: Simular um cenário onde existem múltiplos itens no localStorage e uma requisição retorna 401 — apenas o token deve ser removido.

**Acceptance Scenarios**:

1. **Given** que existem múltiplos itens no localStorage (ex: token, preferências, cache), **When** uma requisição retorna 401, **Then** apenas o item com chave "token" deve ser removido.
2. **Given** que o token é removido por 401, **When** o redirecionamento para o login ocorre, **Then** os demais dados do localStorage devem permanecer intactos.

---

### User Story 5 - Remoção de estilos inline e correção de CSS (Priority: P3)

Os componentes devem substituir estilos CSS inline por classes definidas em arquivos de estilo específicos da página. Erros de sintaxe CSS (ex: `margin: 10` sem unidade) devem ser corrigidos. Regras CSS globais como `h3` que poluem o escopo de outras páginas devem ser escopadas.

**Why this priority**: Estilos inline dificultam manutenção e temas. CSS global polui o escopo de componentes não relacionados. Erros de sintaxe podem causar comportamentos inesperados de layout.

**Independent Test**: Inspecionar cada página CRUD — nenhum elemento deve conter estilos inline. Verificar que regras CSS usam classes específicas do componente.

**Acceptance Scenarios**:

1. **Given** uma página de formulário CRUD, **When** o HTML é inspecionado, **Then** nenhum elemento deve conter o atributo `style` com valores de layout ou espaçamento.
2. **Given** um arquivo CSS de página, **When** analisado, **Then** todas as regras devem usar classes prefixadas pelo nome da página.
3. **Given** o arquivo `HomePage.css`, **When** analisado, **Then** valores de propriedade como `margin` devem conter unidade CSS válida (ex: `10px`).

---

### User Story 6 - Estados vazios com orientação ao usuário (Priority: P3)

As listagens que atualmente exibem apenas um parágrafo de texto quando não há dados devem mostrar um estado vazio completo com ícone ilustrativo, mensagem descritiva e botão de ação para criar o primeiro registro.

**Why this priority**: Estados vazios pobres não orientam o usuário sobre o que fazer a seguir, prejudicando a descoberta de funcionalidades.

**Independent Test**: Acessar uma listagem sem nenhum registro — o sistema deve exibir um ícone, mensagem e botão para criar um novo registro.

**Acceptance Scenarios**:

1. **Given** uma listagem sem registros, **When** a página é carregada, **Then** o sistema exibe um ícone ilustrativo, uma mensagem "Nenhum [recurso] encontrado" e um botão "Cadastrar [recurso]".
2. **Given** um usuário em um estado vazio, **When** ele clica no botão de ação, **Then** o sistema navega para o formulário de cadastro correspondente.

---

### User Story 7 - Limpeza de toasts e alerts do DOM (Priority: P3)

Componentes de toast e alert criados dinamicamente devem ser removidos do DOM após serem dispensados, evitando acúmulo de elementos não utilizados que podem causar problemas de performance e memória.

**Why this priority**: Elementos não removidos do DOM acumulam-se com o uso prolongado, potencialmente causando degradação de performance.

**Independent Test**: Disparar múltiplos toasts e alerts e verificar que todos são removidos do DOM após o usuário interagir com eles.

**Acceptance Scenarios**:

1. **Given** um toast é exibido, **When** ele é dispensado (automaticamente ou pelo usuário), **Then** o elemento é removido do DOM.
2. **Given** um alert é exibido, **When** o usuário clica em um botão para fechar, **Then** o elemento é removido do DOM.

---

### User Story 8 - Padronização de navegação (Priority: P3)

O sistema deve usar consistentemente `ion-router.push()` para navegação interna entre páginas, substituindo usos de `window.location.href` que causam recarregamento completo da página.

**Why this priority**: Navegação mista causa perda de estado da aplicação e experiência inconsistente. `window.location.href` recarrega todo o app, enquanto `router.push` mantém o estado.

**Independent Test**: Navegar entre páginas usando botões e FAB — todas as navegações devem usar o roteador Ionic sem recarregar a página.

**Acceptance Scenarios**:

1. **Given** um usuário clica no FAB "Adicionar" em uma listagem, **When** a navegação ocorre, **Then** deve usar `ion-router.push()` sem recarregar a página.
2. **Given** um usuário clica em "Cancelar" em um formulário, **When** a navegação de volta ocorre, **Then** deve usar `ion-router.push()` sem recarregar a página.

---

### Edge Cases

- O que acontece se o usuário clicar em "Cancelar" em um formulário com dados não salvos? O sistema deve exibir uma confirmação antes de descartar as alterações.
- O que acontece se a requisição de salvamento falhar por rede? O sistema deve exibir mensagem de erro específica e reabilitar o botão de submit para nova tentativa.
- O que acontece se o formulário tiver múltiplos campos inválidos? O sistema deve exibir erro no primeiro campo inválido e focar nele.
- O que acontece se o toast for fechado antes do tempo de duração? O sistema deve remover o toast do DOM imediatamente.
- O que acontece se o usuário estiver na página de edição e o registro for excluído por outro usuário? O sistema deve exibir erro e redirecionar para a listagem.
- Dispositivos com notch (ex: iPhone X+, Android com display furável): containers sem padding (ListProdutoPage, ListUsuarioPage, ListMesaPage) devem incluir `env(safe-area-inset-left)` e `env(safe-area-inset-right)` no padding para evitar conteúdo atrás dos cantos arredondados.

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE exibir toast de sucesso após salvar um registro, antes de redirecionar para a listagem.
- **FR-002**: Sistema DEVE exibir toast de sucesso após atualizar um registro, antes de redirecionar para a listagem.
- **FR-003**: Botão de submit DEVE ser desabilitado durante o processamento da requisição, com texto alterado para indicar progresso.
- **FR-004**: Botão de submit DEVE ser reabilitado em caso de erro na requisição, permitindo nova tentativa.
- **FR-005**: Sistema DEVE validar campos obrigatórios no frontend antes de enviar a requisição.
- **FR-006**: Sistema DEVE validar campos numéricos (valor maior que zero) no frontend antes de enviar a requisição.
- **FR-007**: Sistema DEVE exibir mensagem de erro específica para cada campo inválido, identificando qual campo precisa ser corrigido.
- **FR-008**: Sistema DEVE remover apenas o item "token" do localStorage em caso de 401, preservando outros dados.
- **FR-009**: Sistema DEVE substituir estilos CSS inline por classes em arquivos de estilo específicos da página.
- **FR-010**: Sistema DEVE corrigir valores CSS sem unidade (ex: `margin: 10` deve ser `margin: 10px`).
- **FR-011**: Regras CSS globais (ex: `h3`) DEVE ser escopadas ao componente específico.
- **FR-012**: Listagens sem registros DEVE exibir estado vazio com ícone, mensagem descritiva e botão de ação.
- **FR-013**: Componentes de toast e alert DEVE ser removidos do DOM após serem dispensados.
- **FR-014**: Navegação interna DEVE usar o mecanismo de navegação do framework sem recarregar a página, evitando navegação por URL direta.
- **FR-015**: Containers sem padding (ListProdutoPage, ListUsuarioPage, ListMesaPage) DEVE incluir `padding-left: env(safe-area-inset-left, 16px)` e `padding-right: env(safe-area-inset-right, 16px)` para compatibilidade com dispositivos com notch.
- **FR-016**: Fontes em páginas CRUD DEVE ter tamanho mínimo de 14px para labels e 16px para body text, garantindo legibilidade em mobile e prevenindo zoom automático do iOS.
- **FR-017**: Listas CRUD DEVE exibir skeleton screens (`ion-skeleton-text`) durante o carregamento inicial dos dados, substituindo o spinner genérico, para melhor percepção de performance em conexões móveis.

### Key Entities

- **Toast de Feedback**: Notificação visual temporária exibida ao usuário para confirmar operações (sucesso, erro, aviso).
- **Estado Vazio**: Tela apresentada quando uma listagem não contém registros, com orientações visuais e call-to-action.
- **Formulário CRUD**: Páginas de cadastro (Reg) e edição (Update) para as entidades Produto, Usuário, Mesa e Comanda.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das páginas de cadastro e edição exibem toast de sucesso após salvar — verificado por teste funcional em cada página.
- **SC-002**: 100% dos formulários CRUD desabilitam o botão de submit durante o envio — verificado por teste de interação.
- **SC-003**: 100% dos formulários CRUD validam campos obrigatórios no frontend antes do envio.
- **SC-004**: Mensagens de erro de validação são exibidas em menos de 100ms após o clique em "Salvar" (sem latência de rede).
- **SC-005**: Nenhum estilo CSS inline de layout/espaçamento permanece nos componentes CRUD — verificado por inspeção de código.
- **SC-006**: 100% das listagens sem registros exibem estado vazio completo (ícone + mensagem + botão de ação).
- **SC-007**: Elementos de toast e alert não acumulam no DOM — verificado por teste de criação e dispensa consecutivos.
- **SC-008**: 100% das navegações internas não recarregam a página — verificado por análise de código.
- **SC-009**: 100% das listagens CRUD exibem skeleton screen durante carregamento inicial — verificado por teste visual.
- **SC-010**: Nenhum texto em páginas CRUD tem font-size abaixo de 14px (labels) ou 16px (body) — verificado por inspeção CSS.

## Clarifications

### Session 2026-05-22

- Q: Safe areas para dispositivos com notch? → A: Sim, adicionar env(safe-area-inset-*) nos containers sem padding (ListProdutoPage, ListUsuarioPage, ListMesaPage).
- Q: Comportamento do teclado móvel em formulários? → A: Manter comportamento atual — Ionic 8 gerencia scroll automático via ion-content com scroll-assist.
- Q: Tamanhos mínimos de fonte para mobile? → A: 14px para labels, 16px para body text.
- Q: Estados de carregamento em listas para conexões móveis? → A: Adicionar skeleton screens (ion-skeleton-text) nas listas durante carregamento.

## Assumptions

- Os utilitários `showToast`, `withLoading`, `createEmptyState`, `validateRequired` e `validatePositiveNumber` já existem em `shared/util.js` (implementados no spec `001-ux-shared-utilities`) e devem ser reutilizados.
- A funcionalidade de confirmação ao cancelar (descrita no Edge Cases e no item A4 do relatório UX) está fora do escopo desta especificação e será tratada em fase posterior.
- Melhorias de acessibilidade (aria-labels, foco, leitores de tela — itens A1, A2, A3 do relatório UX) estão fora do escopo desta especificação e serão tratadas em fase posterior.
- O suporte offline/service worker (item M5) está fora do escopo desta especificação.
- A função `presentToast` recriada em `connectedCallback` (item M8) será resolvida indiretamente pela adoção do utilitário `showToast` de `shared/util.js`.
