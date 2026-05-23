# Feature Specification: Acessibilidade e ARIA — Fase 2

**Feature Branch**: `004-accessibility-aria-enhancements`

**Created**: 2026-05-22

**Status**: Draft

**Input**: User description: "Implementação 3 (Fase 2) do plano de melhorias UX/UI — Acessibilidade e ARIA. Inclui atributos ARIA em botões de ícone, gerenciamento de foco, mensagens de erro contextuais, proteção contra auto-exclusão e confirmação ao cancelar formulários."

## Clarifications

### Session 2026-05-22

- Q: O escopo de mensagens de erro deve incluir apenas o frontend ou também alterar o backend? → A: Frontend + Backend — melhorar mensagens de erro em ambas as camadas.
- Q: A acessibilidade mobile inclui o app Android nativo (Capacitor) ou apenas versão web? → A: Apenas web responsivo (desktop e mobile browsers). App Android nativo está fora de escopo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação por Leitor de Tela (Priority: P1)

Usuários que utilizam leitores de tela (como NVDA no Windows, VoiceOver no macOS) conseguem identificar corretamente todos os botões de ação na aplicação — logout, editar, excluir, marcar entrega — porque cada botão de ícone puro possui um `aria-label` descritivo.

**Why this priority**: Este é o bloqueio WCAG mais grave identificado (falha nos critérios 2.5.3 e 4.1.2 da WCAG). Sem `aria-label`, o leitor de tela anuncia apenas "botão" ou lê o nome do ícone, sem contexto de ação.

**Independent Test**: Pode ser testado independentemente abrindo a ferramenta de inspeção de acessibilidade do navegador (Chrome DevTools > Accessibility) ou utilizando um leitor de tela (NVDA no Windows, VoiceOver no macOS) para verificar que cada botão de ícone anuncia sua ação corretamente.

**Acceptance Scenarios**:

1. **Given** que um usuário está na página de listagem de produtos, **When** o leitor de tela foca no botão de editar (create-outline), **Then** o anúncio deve ser "Editar [nome do registro]" em vez de apenas "botão".
2. **Given** que um usuário está na página de listagem de usuários, **When** o leitor de tela foca no botão de excluir (trash-outline), **Then** o anúncio deve ser "Excluir [nome do registro]".
3. **Given** que um usuário está no menu lateral, **When** o leitor de tela percorre os itens do menu, **Then** os ícones decorativos devem ser ignorados (aria-hidden="true") e apenas o texto da navegação deve ser anunciado.
4. **Given** que um usuário está na cozinha (Home), **When** o leitor de tela foca no botão de marcar item como entregue, **Then** o anúncio deve ser "Marcar [nome do item] como entregue".

---

### User Story 2 - Navegação por Teclado e Foco (Priority: P1)

Usuários que navegam exclusivamente por teclado conseguem identificar sua posição atual na página, porque o foco é movido para o topo da página ao navegar entre telas.

**Why this priority**: O critério WCAG 2.4.3 (Ordem de Foco) exige que o foco siga uma ordem significativa. Atualmente, ao navegar entre páginas, o foco permanece onde estava ou retorna ao início do DOM sem controle, desorientando usuários de teclado.

**Independent Test**: Pode ser testado navegando entre páginas usando apenas a tecla Tab e verificando se o foco começa do topo da nova página.

**Acceptance Scenarios**:

1. **Given** que um usuário está no final de uma listagem e clica em "Novo", **When** a página de cadastro carrega, **Then** o foco deve estar no primeiro campo do formulário.
2. **Given** que um usuário salva um registro, **When** é redirecionado de volta à listagem, **Then** o foco deve estar no topo da página (primeiro elemento focável).

---

### User Story 3 - Mensagens de Erro Contextuais (Priority: P2)

Usuários recebem mensagens de erro específicas ao realizar operações na aplicação, com descrição clara do problema baseada no código de status HTTP retornado.

**Why this priority**: Erros genéricos ("Tente novamente mais tarde") violam a heurística de Nielsen #9 (Ajuda a Diagnosticar Erros) e o critério WCAG 3.3.1 (Identificação de Erro). Mensagens específicas reduzem a frustração e permitem ação corretiva.

**Independent Test**: Pode ser testado provocando erros específicos (ex.: criar registro duplicado para 409, enviar token inválido para 401) e verificando se a mensagem corresponde ao tipo de erro.

**Acceptance Scenarios**:

1. **Given** que um usuário tenta salvar um registro com dados inválidos, **When** o servidor retorna erro 409 (Conflito), **Then** o toast deve exibir "Este registro já existe. Verifique os dados e tente novamente."
2. **Given** que um usuário tenta uma ação sem autenticação, **When** o servidor retorna erro 401 (Não autorizado), **Then** o usuário deve ser redirecionado ao login com a mensagem "Sua sessão expirou. Faça login novamente."
3. **Given** que ocorre um erro interno do servidor, **When** o servidor retorna erro 500, **Then** o toast deve exibir "Erro interno. Tente novamente em alguns instantes."

---

### User Story 4 - Proteção Contra Auto-exclusão (Priority: P2)

Usuários não conseguem excluir a si mesmos da lista de usuários, evitando bloqueio acidental do próprio acesso ao sistema.

**Why this priority**: A capacidade de auto-exclusão representa um risco operacional grave. Um administrador pode acidentalmente remover seu próprio acesso sem possibilidade de recuperação imediata.

**Independent Test**: Pode ser testado logando como um usuário, navegando até a lista de usuários e tentando excluir o próprio registro.

**Acceptance Scenarios**:

1. **Given** que um usuário administrador está na lista de usuários, **When** ele tenta excluir o registro que corresponde ao seu próprio usuário logado, **Then** o sistema deve exibir uma mensagem de erro informando que não é possível excluir a si mesmo.
2. **Given** que um usuário está na lista de usuários, **When** ele tenta excluir outro usuário, **Then** a exclusão deve prosseguir normalmente (após confirmação).

---

### User Story 5 - Confirmação ao Cancelar (Priority: P3)

Usuários que preenchem formulários de cadastro/edição e clicam em Cancelar recebem uma confirmação antes de perder os dados não salvos.

**Why this priority**: Perder dados preenchidos por engano viola a heurística de Nielsen #3 (Controle e Liberdade do Usuário). Embora seja um incômodo menor que os problemas de acessibilidade, afeta a confiança do usuário no sistema.

**Independent Test**: Pode ser testado preenchendo campos de um formulário e clicando em Cancelar — deve aparecer um diálogo de confirmação.

**Acceptance Scenarios**:

1. **Given** que um usuário preencheu ao menos um campo de um formulário de cadastro, **When** ele clica em Cancelar, **Then** um alerta deve perguntar "Tem certeza? Os dados não salvos serão perdidos."
2. **Given** que um usuário não alterou nenhum campo de um formulário, **When** ele clica em Cancelar, **Then** a navegação de volta deve ocorrer sem confirmação.

---

### Edge Cases

- O que acontece se um botão de ícone também contém texto? O `aria-label` deve ser suplementar, não redundante.
- Como o sistema lida com itens de menu que não têm ícone? Devem ser ignorados pela regra de aria-hidden.
- O que acontece se o usuário logado não está mais na lista de usuários (foi excluído por outro admin)? A proteção de auto-exclusão deve verificar pelo ID armazenado no token JWT, não pela presença na lista.
- Como lidar com formulários pré-preenchidos (edição) ao clicar em Cancelar? O alerta de confirmação deve considerar qualquer alteração como dado não salvo, comparando com os valores iniciais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todos os botões de ícone puro (sem texto visível) DEVEM possuir um atributo `aria-label` descrevendo a ação. Isso inclui botões de logout, editar, excluir e marcar entrega.
- **FR-002**: Ícones decorativos no menu lateral DEVEM ter `aria-hidden="true"` para serem ignorados por leitores de tela.
- **FR-003**: Ao navegar entre páginas, o foco do teclado DEVE ser movido para o topo da nova página (primeiro elemento interativo ou container principal).
- **FR-004**: Mensagens de erro EXIBIDAS ao usuário DEVEM ser específicas ao código de status HTTP retornado (pelo menos para 400, 401, 403, 404, 409 e 500).
- **FR-005**: O sistema NÃO DEVE permitir que um usuário exclua seu próprio registro. A verificação DEVE usar o ID do usuário armazenado no token JWT.
- **FR-006**: Ao clicar em Cancelar em formulários de cadastro/edição com dados alterados, o sistema DEVE exibir um diálogo de confirmação antes de navegar de volta.
- **FR-007**: Formulários sem alterações (Cancelar sem dados modificados) DEVEM navegar de volta sem confirmação.
- **FR-008**: Mensagens de erro DEVEM ser tratadas em ambas as camadas: o backend DEVE retornar mensagens descritivas por código de status, e o frontend DEVE exibi-las com tratamento amigável por categoria de erro (400, 401, 403, 404, 409, 500).

### Key Entities

Nenhuma nova entidade de dados é introduzida por esta especificação. As alterações são puramente na camada de apresentação (frontend). As entidades existentes (usuário, produto, mesa, comanda) permanecem inalteradas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lighthouse Accessibility score ≥ 90 ao auditar todas as páginas principais (login, listagens, formulários, cozinha) em ambiente web (desktop e mobile viewports).
- **SC-002**: Navegação por teclado funcional em 100% das páginas — usuário consegue acessar todos os botões e campos usando apenas Tab, Enter e Space.
- **SC-003**: Leitor de tela (NVDA ou VoiceOver) consegue identificar corretamente a ação de todos os botões de ícone — nenhum botão de ação é anunciado apenas como "botão".
- **SC-004**: Usuário não consegue excluir a si mesmo em nenhum cenário — a operação é bloqueada com feedback visual.
- **SC-005**: Mensagens de erro específicas ao código de status são exibidas em pelo menos 4 categorias de erro (erro de autenticação, conflito, não encontrado, erro interno).
- **SC-006**: Alerta de confirmação é exibido ao cancelar formulários com dados alterados — zero relatos de perda acidental de dados.

## Assumptions

- Leitor de tela padrão será usado para validação (NVDA no Windows, VoiceOver no macOS). O app Android nativo (Capacitor) está fora de escopo — a validação mobile será feita via navegador mobile (Chrome DevTools com emulação de dispositivos).
- Os atributos ARIA seguem as especificações WAI-ARIA 1.2.
- A verificação de auto-exclusão usa o ID do usuário do token JWT armazenado no `localStorage`.
- A funcionalidade de confirmação ao cancelar será implementada via `ion-alert` (já utilizado em outras partes da aplicação).
- As mensagens de erro específicas serão tratadas em ambas as camadas: o backend deve retornar mensagens descritivas por código HTTP, e o frontend deve exibi-las com tratamento contextual.
- O foco pós-navegação será gerenciado via JavaScript (não por comportamento nativo do Ionic).
- Os testes de acessibilidade web serão realizados em Chrome DevTools (Lighthouse + painel Accessibility), não sendo escopo deste projeto a aquisição de ferramentas de auditoria pagas.
- Dependência: As funções utilitárias `focusFirstElement()` e `showToast()` (definidas na Fase 0 das melhorias) devem estar disponíveis em `shared/util.js`.
