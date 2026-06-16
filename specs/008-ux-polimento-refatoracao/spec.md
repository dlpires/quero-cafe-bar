# Feature Specification: Polimento e Refatoração UX/UI

**Feature Branch**: `008-ux-polimento-refatoracao`

**Created**: 2026-06-12

**Status**: Draft

**Input**: Com base no arquivo @analysis/ux-14052026/implementation-plan.md e dos arquivos de apoio @analysis/ux-14052026/mobile-first-audit.md e @analysis/ux-14052026/ux-ui-audit.md Crie as especificações da fase 8 da implementação sugerida - polimento

## Clarifications

### Session 2026-06-12

- Q: As tarefas órfãs da Fase 3 (3.4 — corrigir grid `minmax(320px → 280px)` na HomePage; 3.8 — trocar `ion-select interface="popover"` por `action-sheet` na Home) devem ser absorvidas pela Fase 8 de Polimento? → A: Incluir ambas como User Story adicional na spec da Fase 8.
- Q: (Analysis fix I1) US6 descrevia 5 "arquivos CSS vazios" — pesquisa confirmou que os 5 arquivos têm conteúdo, sendo 4 duplicados e 1 com regras únicas válidas. → A: US6, FR-007, SC-004 e Assumptions atualizados de "vazios" para "duplicados". 4 arquivos removidos; `ListMesaPage.css` preservado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistência Visual com CSS Custom Properties (Priority: P1)

Como usuário da aplicação Quero Café Bar, quero que toda a interface tenha uma aparência visual consistente, com cores, espaçamentos e tipografia padronizados, para que eu tenha uma experiência coerente ao navegar entre as diferentes páginas (cozinha, produtos, usuários, mesas, comandas).

**Why this priority**: A falta de CSS custom properties é uma das causas-raiz dos problemas visuais da aplicação (MF12 do mobile-first audit). Sem um design system mínimo, cada página aplica estilos de forma inconsistente, gerando retrabalho e experiência fragmentada para o usuário. Esta é a fundação para toda consistência visual.

**Independent Test**: Pode ser testado inspecionando o `style.css` global e verificando se todas as páginas utilizam as mesmas variáveis CSS (`--app-spacing`, `--app-border-radius`, etc.) para espaçamentos e cores. A alteração de uma variável no tema deve refletir em todas as páginas.

**Acceptance Scenarios**:

1. **Given** que a aplicação não possui custom properties definidas, **When** o desenvolvedor define um conjunto de variáveis CSS no arquivo de estilo global, **Then** todas as páginas que referenciam essas variáveis passam a compartilhar os mesmos valores de cor, espaçamento e tipografia.
2. **Given** que as custom properties estão definidas, **When** um valor de cor primária é alterado na variável global, **Then** todos os componentes que usam essa variável refletem a mudança sem necessidade de editar CSS individual de cada página.
3. **Given** que um novo componente é criado, **When** o desenvolvedor utiliza as variáveis CSS existentes, **Then** o componente herda automaticamente a identidade visual da aplicação.

---

### User Story 2 - Código Limpo: Remoção de Estilos Inline (Priority: P1)

Como mantenedor da aplicação, quero que não existam estilos CSS inline (atributos `style` em elementos HTML), para que a base de código seja mais fácil de manter, o CSS seja cacheável pelo navegador e o design seja consistente. Atualmente há inline styles em `HomePage.js:82`, `ListProdutoPage.js:97-101`, `ListUsuarioPage.js:93-98` e `UpdateComandaPage.js:29-48` (problema M2 do UX audit e MF10 do mobile-first audit).

**Why this priority**: Estilos inline são o principal obstáculo à manutenibilidade e à consistência visual. Eles não são cacheáveis, não respondem a media queries, têm alta especificidade que dificulta sobrescrita, e violam o princípio de separação de responsabilidades. Resolver isso é pré-requisito para qualquer evolução futura do design.

**Independent Test**: Pode ser testado inspecionando o HTML renderizado de cada página e verificando que nenhum elemento possui atributo `style` inline. Todos os estilos visuais devem estar definidos exclusivamente em arquivos `.css`.

**Acceptance Scenarios**:

1. **Given** que a HomePage possui `style="text-align: center; margin-top: 50px;"` no empty state, **When** o estilo é migrado para uma classe CSS `.empty-state { text-align: center; margin-top: 50px; }`, **Then** a aparência visual permanece idêntica e o atributo `style` é removido do HTML.
2. **Given** que ListProdutoPage possui inline styles nas células de preço (`style="font-weight: bold; white-space: nowrap;"`), **When** esses estilos são movidos para a classe `.list-produto-price`, **Then** o HTML fica limpo e o comportamento visual não se altera.
3. **Given** que UpdateComandaPage possui inline styles extensos nos cards de itens (`style="background: var(--ion-color-light); border-radius: ..."`), **When** os estilos são extraídos para classes CSS reutilizáveis (`.item-card`, `.item-card-entregue`), **Then** os cards mantêm a aparência atual e o código JS fica significativamente mais enxuto.

---

### User Story 3 - Gerenciamento de Memória: Limpeza de Toast e Alert (Priority: P2)

Como usuário da aplicação, quero que toasts e alerts de feedback sejam removidos do DOM após serem dispensados, para que o uso prolongado da aplicação não cause acúmulo de elementos fantasma que degradam a performance e consomem memória desnecessariamente (problema M6 do UX audit).

**Why this priority**: O acúmulo de elementos no DOM ao longo do tempo causa degradação progressiva de performance — cada vez mais lento para animações, transições e renderização. Em dispositivos mobile com recursos limitados, esse vazamento de memória pode causar travamentos. Embora não seja visível imediatamente, o impacto acumulativo é significativo.

**Independent Test**: Pode ser testado abrindo o DevTools e monitorando a contagem de nós DOM enquanto se realiza uma sequência de operações (salvar produto, editar mesa, excluir usuário). Após cada operação, o número de nós deve retornar ao patamar anterior, sem crescimento contínuo. Nenhum elemento `ion-toast` ou `ion-alert` deve permanecer no DOM após ser fechado.

**Acceptance Scenarios**:

1. **Given** que um toast de sucesso é exibido após salvar um produto, **When** o toast termina sua animação de saída, **Then** o elemento `ion-toast` é removido do DOM (não apenas oculto).
2. **Given** que um alert de confirmação de exclusão é exibido e o usuário cancela, **When** o alert é fechado, **Then** o elemento `ion-alert` é removido do DOM.
3. **Given** que o usuário realiza 20 operações consecutivas que geram toasts/alerts, **When** todas as operações são concluídas, **Then** não há resíduos de componentes de feedback no DOM.

---

### User Story 4 - Escopo de Função: Extrair `presentToast` da Página de Login (Priority: P2)

Como mantenedor da aplicação, quero que utilitários de feedback como `presentToast` sejam definidos em escopo de módulo e não recriados dentro de `connectedCallback`, para que múltiplas renderizações da página não criem múltiplas instâncias da mesma função, reduzindo o consumo de memória (problema M8 do UX audit).

**Why this priority**: A definição de funções dentro do `connectedCallback` é um anti-padrão que causa overhead desnecessário a cada renderização e dificulta o reaproveitamento de código. Embora o impacto em performance seja pequeno para uma única página, estabelecer o padrão correto no Login serve de exemplo para todas as demais páginas.

**Independent Test**: Pode ser testado verificando que a função `presentToast` está definida no escopo do módulo (fora da classe) e que o `LoginPage.connectedCallback` apenas referencia a função, sem redeclará-la. Navegar para a página de login múltiplas vezes deve resultar em uma única definição da função.

**Acceptance Scenarios**:

1. **Given** que a `presentToast` está atualmente definida dentro do `connectedCallback` da LoginPage, **When** a função é extraída para o escopo do módulo, **Then** a funcionalidade de exibir toast na página de login permanece idêntica.
2. **Given** que a `presentToast` está no escopo do módulo, **When** o `connectedCallback` é chamado múltiplas vezes (ex: navegando para outras páginas e voltando), **Then** uma única instância da função existe, sem recriação.
3. **Given** que o utilitário `showToast` de `shared/util.js` (Fase 0) já existe, **When** a LoginPage precisa exibir um toast, **Then** ela utiliza `showToast` do utilitário compartilhado em vez de sua própria implementação.

---

### User Story 5 - Correção de Bug: Toggle com Valor `null` (Priority: P3)

Como usuário que cadastra ou edita produtos e mesas, quero que o campo de status (ativo/inativo via toggle) funcione corretamente mesmo quando eu não interajo com ele, para que o sistema não interprete erroneamente um toggle não tocado como "desativado" (problema B3 do UX audit).

**Why this priority**: O bug atual (`formData.get('status') === 'on'`) faz com que um toggle que nunca foi tocado retorne `null` — que é diferente de `'on'` — e seja tratado como desativado, potencialmente desativando um produto que deveria permanecer ativo. Afeta apenas telas de cadastro/edição, mas pode causar perda de dados.

**Independent Test**: Pode ser testado editando um produto ativo sem tocar no toggle de status e salvando. O produto deve permanecer ativo. Também pode ser testado criando um novo produto sem interagir com o toggle — o comportamento padrão deve ser aplicado corretamente.

**Acceptance Scenarios**:

1. **Given** que um usuário edita um produto que está ativo e não toca no toggle de status, **When** o formulário é submetido, **Then** o produto permanece com status ativo (o valor `null` do toggle não é interpretado como `false`).
2. **Given** que um usuário cria uma nova mesa e não interage com o toggle de status, **When** o formulário é submetido, **Then** a mesa é criada com o status padrão correto (ativo).
3. **Given** que um usuário explicitamente desativa o toggle de status, **When** o formulário é submetido, **Then** o status é salvo como desativado corretamente.

---

### User Story 6 - Arquivos CSS Duplicados (Priority: P3)

Como mantenedor da aplicação, quero que não existam arquivos CSS duplicados com regras idênticas entre páginas de cadastro e edição, para que não haja código repetido e o código-fonte seja limpo. Pesquisa confirmou que os 5 arquivos apontados pela auditoria como "vazios" (problema MF9 do mobile-first audit) na verdade contêm regras CSS — o problema real é **duplicação**: `RegProdutoPage.css` ≡ `UpdateProdutoPage.css` (89B idênticos) e `RegMesaPage.css` ≡ `UpdateMesaPage.css` (34B idênticos), com regras cross-module repetidas em até 5 arquivos.

**Why this priority**: Arquivos duplicados violam o princípio DRY e tornam a manutenção frágil — uma alteração de estilo precisa ser feita em múltiplos locais. As regras duplicadas já foram migradas para `style.css` (US1), portanto a remoção é segura. O impacto é pequeno (4 arquivos a remover), mas a correção é trivial.

**Independent Test**: Pode ser testado executando `npm run build` sem erros e verificando que os 4 arquivos duplicados foram removidos do diretório `pages/` e suas importações limpas dos respectivos `.js`. O arquivo `ListMesaPage.css` (290B, regras únicas de listagem) é preservado.

**Acceptance Scenarios**:

1. **Given** que existem 4 arquivos CSS duplicados no projeto (`RegProdutoPage.css` ≡ `UpdateProdutoPage.css` com 89B idênticos; `RegMesaPage.css` ≡ `UpdateMesaPage.css` com 34B idênticos), **When** os arquivos são removidos e suas importações são limpas dos respectivos `.js`, **Then** não há arquivos CSS duplicados no diretório `pages/` e o build é bem-sucedido.
2. **Given** que um arquivo CSS duplicado foi removido, **When** a página correspondente é carregada, **Then** nenhum erro 404 é registrado no console (as importações foram limpas) e os estilos são herdados de `style.css` (onde as regras foram consolidadas no US1).

---

### User Story 7 - Correções Residuais de Layout Mobile na Cozinha (Priority: P2)

Como usuário da visão de cozinha, quero que o grid de comandas não cause scroll horizontal em aparelhos pequenos (ex: iPhone SE com 320px de largura) e que o seletor de item de entrega use a interface nativa mobile (`action-sheet`) em vez de `popover`, para que a experiência de uso da cozinha seja confortável em qualquer tamanho de tela. Estes são os problemas MF3 (grid overflow) e MF8 (popover inadequado para mobile) do mobile-first audit, originalmente alocados à Fase 3 (tarefas 3.4 e 3.8) mas sem cobertura em spec anterior.

**Why this priority**: O scroll horizontal na cozinha (grid `minmax(320px, 1fr)` quebra telas <352px) é um problema funcional que impede a visualização completa dos cards. Já o `popover` em mobile é uma violação de UX — a interface `action-sheet` é o padrão recomendado para seletores em dispositivos touch. Ambas as correções são triviais (uma linha cada) e impactam diretamente a usabilidade da página mais crítica do sistema.

**Independent Test**: Pode ser testado redimensionando o navegador para 320px de largura e verificando que o grid de comandas não causa barra de rolagem horizontal. A troca do seletor pode ser validada abrindo a cozinha em um dispositivo mobile real ou emulador e confirmando que o `ion-select` abre como action-sheet nativo ao toque.

**Acceptance Scenarios**:

1. **Given** que a HomePage usa `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, **When** o valor 320px é reduzido para 280px, **Then** telas de 320px de largura (iPhone SE) exibem o grid em 1 coluna sem scroll horizontal, enquanto telas maiores continuam com layout multi-coluna.
2. **Given** que o `ion-select` de item-entrega na cozinha usa `interface="popover"`, **When** o atributo é alterado para `interface="action-sheet"`, **Then** ao tocar no seletor em um dispositivo mobile, as opções aparecem como action-sheet deslizante na parte inferior da tela (compatível com interação touch).
3. **Given** que ambas as correções foram aplicadas, **When** a cozinha é acessada em um iPhone SE (320px), **Then** todos os cards de comanda são visíveis sem necessidade de scroll horizontal e o seletor de entrega funciona com interação nativa.

---

### Edge Cases

- O que acontece se uma página usa uma CSS custom property que não foi definida no tema global? O navegador usará o valor fallback ou herdará do elemento pai.
- Como o garbage collection de toast/alert se comporta quando múltiplos toasts são disparados em rápida sucessão? O sistema deve permitir empilhamento e limpar cada um individualmente após seu próprio dismiss.
- Como tratar toggles que já existem no DOM com `checked` definido via atributo HTML vs. os que são setados dinamicamente? O `formData.get()` deve distinguir entre toggle não interagido (`null`) e toggle explicitamente desmarcado (`'off'` ou ausente).
- O que acontece com usuários de leitores de tela quando estilos inline são migrados para classes CSS? Os leitores de tela não são afetados, pois classes CSS não alteram a semântica do HTML. A migração é neutra para acessibilidade.
- Se um arquivo CSS for preenchido (em vez de removido), como garantir que os estilos não conflitem com outras páginas? Usar classes com prefixo do nome da página (ex: `.reg-produto-*`).
- O grid `minmax(280px, 1fr)` é suficiente para telas ainda menores (ex: smartwatches ou feature phones com ~240px)? Sim — telas <280px são extremamente raras e o card mínimo de comanda não acomodaria conteúdo legível abaixo desse limite. O valor 280px é o menor funcional sem comprometer a legibilidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema deve prover um conjunto de CSS custom properties globais (cores, espaçamentos, tipografia, bordas) no arquivo de estilo raiz da aplicação, acessíveis por todas as páginas.
- **FR-002**: O sistema deve eliminar todos os atributos `style` inline do HTML renderizado, migrando os estilos para classes CSS em arquivos `.css` dedicados.
- **FR-003**: O sistema deve remover do DOM todo elemento `ion-toast` e `ion-alert` imediatamente após o evento de dismiss (desaparecimento), utilizando o evento `ionToastDidDismiss` / `ionAlertDidDismiss`.
- **FR-004**: O sistema deve garantir que a função de exibição de toast na página de login esteja definida em escopo de módulo, não recriada dentro do `connectedCallback`.
- **FR-005**: O sistema deve preferencialmente utilizar o utilitário compartilhado `showToast` de `shared/util.js` (Fase 0) em vez de implementações locais de toast em qualquer página.
- **FR-006**: O sistema deve tratar corretamente o valor `null` retornado por `formData.get('status')` quando o toggle de status não foi interagido pelo usuário, assumindo o comportamento padrão apropriado ao contexto (ativo para novos registros, valor atual para edições).
- **FR-007**: O sistema não deve possuir arquivos CSS duplicados com regras idênticas entre páginas de cadastro e edição no diretório `pages/` — arquivos duplicados devem ser removidos e suas importações limpas dos respectivos arquivos JavaScript, após a migração das regras comuns para `style.css`.
- **FR-008**: As CSS custom properties definidas devem cobrir no mínimo: cor primária, cor de sucesso, cor de alerta, cor de perigo, cor de fundo, espaçamento padrão, raio de borda padrão, e família de fontes.
- **FR-009**: O grid de comandas na página inicial (cozinha) deve usar `minmax(280px, 1fr)` em vez de `minmax(320px, 1fr)`, garantindo que telas a partir de 320px de largura (iPhone SE) não apresentem scroll horizontal.
- **FR-010**: O seletor de item de entrega (`ion-select`) na página inicial (cozinha) deve utilizar `interface="action-sheet"` em vez de `interface="popover"`, garantindo interação otimizada para touch em dispositivos mobile.

### Key Entities

- **CSS Custom Properties**: Variáveis definidas no escopo `:root` que representam os tokens de design da aplicação — cores, espaçamentos, tipografia e bordas — consumidas por todas as páginas para garantir consistência visual.
- **Toast/Alert Lifecycle**: Componentes efêmeros de feedback ao usuário que possuem um ciclo de vida gerenciado: criação (append ao DOM) → apresentação (present) → ocultação (dismiss) → remoção (remove do DOM).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A aplicação possui zero atributos `style` inline nos elementos HTML de todas as páginas (100% dos estilos em classes CSS).
- **SC-002**: Após 50 operações consecutivas que geram toasts ou alerts, a contagem de nós no DOM é igual ou inferior à contagem inicial (sem acúmulo de componentes de feedback).
- **SC-003**: O arquivo `style.css` global contém pelo menos 8 CSS custom properties documentadas cobrindo cores, espaçamentos e tipografia.
- **SC-004**: Nenhum arquivo CSS duplicado (com regras idênticas) existe no diretório `pages/` — os 4 arquivos originalmente duplicados (`RegProdutoPage.css`, `UpdateProdutoPage.css`, `RegMesaPage.css`, `UpdateMesaPage.css`) foram removidos.
- **SC-005**: O toggle de status em formulários de cadastro/edição funciona corretamente em 100% dos casos, inclusive quando o usuário não interage com ele (nenhum falso-positivo de desativação).
- **SC-006**: O Lighthouse Best Practices score não regride após as alterações desta fase (mantém-se estável ou melhora).
- **SC-007**: A página inicial (cozinha) não apresenta barra de rolagem horizontal quando visualizada em viewport de 320px de largura (iPhone SE), com todos os cards de comanda totalmente visíveis.

## Assumptions

- As fases anteriores (Fase 0 — Utilitários Compartilhados, Fase 1 — Feedback e Validação, Fase 2 — Acessibilidade e ARIA, Fase 3 — Layout e Espaçamento Mobile) já foram implementadas e seus artefatos estão disponíveis. Em particular, assume-se que `shared/util.js` já exporta `showToast()` e `withLoading()`.
- As tarefas 3.4 (correção do grid `minmax`) e 3.8 (`interface="action-sheet"`) da Fase 3 não foram cobertas por specs anteriores e foram absorvidas por esta Fase 8 como User Story 7 — são correções de uma linha cada no escopo da HomePage.
- O framework Ionic 8.x continuará sendo a base de componentes UI, e suas variáveis CSS internas (`--ion-color-*`, `--ion-padding-*`) podem ser referenciadas ou sobrescritas pelas custom properties definidas.
- Os navegadores suportam CSS Custom Properties (suporte universal desde 2016, todos os browsers modernos).
- Os arquivos CSS a serem removidos são os 4 duplicados identificados na auditoria e confirmados via pesquisa: `RegProdutoPage.css` ≡ `UpdateProdutoPage.css` (89B idênticos) e `RegMesaPage.css` ≡ `UpdateMesaPage.css` (34B idênticos). `ListMesaPage.css` (290B, regras únicas) é preservado.
- A decisão de remover vs. preencher cada arquivo CSS vazio será tomada com base na necessidade real da página. Páginas que já usam `ion-padding` e classes do Ionic podem não precisar de CSS adicional.
- A LoginPage utilizará o `showToast` do utilitário compartilhado como substituto da `presentToast` local, mas se houver necessidade de comportamento diferente, a função local será movida para escopo de módulo em vez de ser removida.
