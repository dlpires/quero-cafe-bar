# Feature Specification: Redesign dos Cartões da Visão Cozinha

**Feature Branch**: `009-home-card-redesign`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Preciso refatorar os redesenhar os cartões do /home, onde ele em qualquer tamanho de tela está muito poluido e corta a quantidade de cada produto da comanda."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização Clara de Produtos e Quantidades (Priority: P1)

Como atendente da cozinha, preciso visualizar o nome de cada produto e sua quantidade sem que a informação seja cortada ou truncada, independentemente do tamanho da tela do dispositivo (tablet, celular ou monitor).

**Why this priority**: É o problema principal relatado — a quantidade dos produtos está sendo cortada, comprometendo a função essencial da tela de cozinha que é informar o que precisa ser preparado e em qual quantidade.

**Independent Test**: Pode ser testado exibindo uma comanda com pelo menos 3 itens, onde um item tem nome longo (ex: "Hambúrguer Artesanal Completo") e quantidade alta (ex: x15). Em qualquer largura de tela entre 320px e 1920px, todas as quantidades devem estar 100% visíveis, sem rolagem horizontal no card.

**Acceptance Scenarios**:

1. **Given** uma comanda com produto de nome longo (30+ caracteres) e quantidade de 2 dígitos, **When** a tela de cozinha é exibida em dispositivo móvel de 360px de largura, **Then** o nome do produto é truncado com reticências e a quantidade permanece totalmente visível.
2. **Given** uma comanda com múltiplos itens, **When** visualizada em tablet (768px) ou desktop (1920px), **Then** o nome do produto é exibido por completo e a quantidade permanece visível em todos os itens.
3. **Given** uma comanda com itens, **When** o usuário aplica zoom de até 200% no navegador, **Then** as quantidades dos produtos não são cortadas e os cards mantêm usabilidade.

---

### User Story 2 - Identificação Rápida do Status de Entrega (Priority: P1)

Como atendente da cozinha, preciso identificar rapidamente quais itens de cada comanda já foram entregues e quais estão pendentes, com indicadores visuais que não poluam a interface.

**Why this priority**: A função principal da tela é gerenciar status de entrega. O design atual polui a interface com fundos coloridos que cansam a vista e prejudicam a legibilidade.

**Independent Test**: Pode ser testado exibindo uma comanda mista (2 itens entregues e 2 pendentes). O usuário deve conseguir diferenciar o status de cada item em menos de 2 segundos de observação, sem fadiga visual após 5 minutos de uso contínuo.

**Acceptance Scenarios**:

1. **Given** uma comanda com itens pendentes e entregues, **When** a tela é exibida, **Then** itens pendentes e entregues são visualmente distintos por um indicador sutil (ex: borda lateral colorida ou ponto de status), sem fundos coloridos que prejudiquem a leitura.
2. **Given** uma comanda onde todos os itens foram entregues, **When** a tela é exibida, **Then** o card exibe um indicador global claro (ícone de conclusão) no cabeçalho.
3. **Given** o atendente está usando a tela por mais de 5 minutos, **When** observa-se o padrão de uso, **Then** o layout não causa fadiga visual (sem efeito "zebrado" agressivo de cores alternadas).

---

### User Story 3 - Atualização de Status com Toque Preciso (Priority: P2)

Como atendente da cozinha, preciso alterar o status de entrega de um item com um toque preciso, sem risco de selecionar o item errado por touch targets pequenos ou botões muito próximos.

**Why this priority**: Essencial para evitar erros operacionais na cozinha, mas depende da correção do layout (P1) para ser efetivo.

**Independent Test**: Pode ser testado em um dispositivo touch real (tablet ou celular). O usuário consegue tocar no controle de status de qualquer item sem acionar acidentalmente o item adjacente. A área tocável do seletor de status tem no mínimo 44x44px.

**Acceptance Scenarios**:

1. **Given** uma comanda com 5 itens, **When** o atendente toca no controle de status do terceiro item, **Then** apenas o status do terceiro item é alterado, sem afetar itens adjacentes.
2. **Given** o controle de status (dropdown/select), **When** medido em qualquer dispositivo, **Then** a área tocável tem no mínimo 44px de altura e 44px de largura.
3. **Given** o atendente está usando luvas (comum em cozinhas), **When** interage com o controle de status, **Then** o touch target é grande o suficiente para ser acionado com precisão mesmo com luvas.

---

### User Story 4 - Layout Responsivo em Todos os Dispositivos (Priority: P2)

Como atendente da cozinha, preciso que a tela funcione adequadamente em qualquer dispositivo disponível na cozinha — desde um celular pequeno até um monitor widescreen, sem scroll horizontal indesejado.

**Why this priority**: A cozinha pode usar diferentes dispositivos (tablet fixo na parede, celular do atendente, monitor no balcão). O layout atual tem problemas em telas menores que 320px de largura útil.

**Independent Test**: Pode ser testado redimensionando o navegador de 320px a 1920px de largura. Em nenhuma largura o layout causa scroll horizontal. Os cards se reorganizam adequadamente no grid, mantendo legibilidade.

**Acceptance Scenarios**:

1. **Given** a tela de cozinha, **When** visualizada em dispositivo com 320px de largura, **Then** os cards ocupam 100% da largura disponível (coluna única) sem causar scroll horizontal.
2. **Given** a tela de cozinha, **When** visualizada em tablet com 768px de largura, **Then** os cards se organizam em 2 colunas com espaçamento adequado.
3. **Given** a tela de cozinha, **When** visualizada em monitor com 1920px de largura, **Then** os cards se organizam em grid de múltiplas colunas (3 a 4), sem desperdício excessivo de espaço.

---

### User Story 5 - Navegação Acessível por Leitor de Tela (Priority: P3)

Como atendente com deficiência visual, preciso que a tela de cozinha seja navegável por leitor de tela, com cada card e item corretamente identificado e com status anunciado.

**Why this priority**: Requisito de acessibilidade importante para inclusão, mas não bloqueia a funcionalidade principal.

**Independent Test**: Pode ser testado com um leitor de tela (ex: NVDA ou VoiceOver). Navegando pela tela, o leitor anuncia cada card como "Comanda X, Mesa Y", cada item com seu nome, quantidade e status (pendente/entregue).

**Acceptance Scenarios**:

1. **Given** um leitor de tela ativo, **When** o foco chega a um card de comanda, **Then** o leitor anuncia "Comanda [N], Mesa [M]" e o status geral (completa ou pendente).
2. **Given** um leitor de tela ativo, **When** o foco chega a um item da comanda, **Then** o leitor anuncia o nome do produto, a quantidade e o status atual (pendente/entregue).
3. **Given** um leitor de tela ativo, **When** o status de um item é alterado, **Then** o leitor anuncia a mudança de forma clara.

---

### Edge Cases

- O que acontece quando uma comanda não tem itens (comanda vazia)?
- Como a tela se comporta quando há 50+ comandas pendentes simultaneamente?
- O que ocorre quando o nome do produto tem mais de 100 caracteres?
- Como o layout se adapta quando a quantidade do produto tem 3 ou mais dígitos (ex: x100)?
- Como a tela se comporta em dispositivos com densidade de pixels muito alta (4K) com scaling de sistema?
- O que acontece quando o texto do sistema está configurado com fonte grande (acessibilidade do dispositivo)?
- Como o card se comporta quando um produto tem o nome igual à largura exata do card, causando possível truncamento no meio de uma palavra?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir o nome do produto e sua quantidade em cada item do card, com truncamento inteligente (reticências) apenas no nome do produto quando necessário, mantendo a quantidade sempre 100% visível.
- **FR-002**: O sistema DEVE usar indicadores visuais sutis (borda lateral colorida ou ponto de status) para diferenciar itens pendentes de entregues, em vez de fundos coloridos que poluem a interface.
- **FR-003**: O sistema DEVE exibir um ícone de status global no cabeçalho de cada card indicando se a comanda está totalmente entregue ou possui pendências.
- **FR-004**: O sistema DEVE garantir que o controle de alteração de status (dropdown/seletor) tenha área tocável mínima de 44x44 pixels em todos os dispositivos.
- **FR-005**: O sistema DEVE reorganizar os cards em grid responsivo: 1 coluna em telas até 480px, 2 colunas entre 481px e 900px, 3 ou mais colunas acima de 901px.
- **FR-006**: O sistema DEVE evitar scroll horizontal em qualquer largura de tela a partir de 320px, ajustando o padding e margens do container conforme necessário.
- **FR-007**: O sistema DEVE associar cada card de comanda a um role semântico (role="region") com aria-labelledby vinculado ao título da comanda.
- **FR-008**: O sistema DEVE anunciar via leitor de tela: nome do produto, quantidade e status (pendente/entregue) para cada item.
- **FR-009**: O sistema DEVE manter todos os estados visuais (pendente, entregue) com contraste de cor mínimo de 4.5:1 (WCAG AA) entre texto e fundo.
- **FR-010**: O sistema DEVE exibir mensagem de estado vazio ("Nenhum pedido pendente") quando não houver comandas a exibir, mantendo a mesma consistência visual do restante da página.

### Key Entities *(include if feature involves data)*

- **Comanda (Order)**: Representa um pedido associado a uma mesa. Atributos relevantes: identificador, mesa associada, lista de itens, status global de entrega.
- **Item da Comanda (Order Item)**: Representa um produto dentro de uma comanda. Atributos relevantes: nome do produto, quantidade, status de entrega (pendente/entregue), identificador do produto.
- **Mesa (Table)**: Representa a mesa física do estabelecimento. Atributo relevante: número ou identificador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de teste (larguras de 320px a 1920px), a quantidade de cada produto é exibida completamente, sem corte ou truncamento.
- **SC-002**: O usuário consegue identificar o status de entrega de qualquer item em menos de 2 segundos de observação.
- **SC-003**: Nenhum scroll horizontal é necessário em qualquer largura de tela igual ou superior a 320px.
- **SC-004**: Todos os controles interativos (dropdowns de status) possuem área tocável de no mínimo 44x44 pixels, conforme diretrizes WCAG 2.1.
- **SC-005**: O contraste de cores entre texto e fundo atinge no mínimo 4.5:1 para todos os estados visuais (pendente e entregue), conforme WCAG AA.
- **SC-006**: O layout não causa fadiga visual perceptível após 5 minutos de uso contínuo (avaliado qualitativamente por teste com usuários).
- **SC-007**: Navegação por leitor de tela anuncia corretamente card, mesa, itens e status em 100% dos cards renderizados.

## Assumptions

- Os dispositivos utilizados na cozinha possuem telas com largura mínima de 320px (equivalente a smartphones básicos).
- A equipe de cozinha utiliza majoritariamente tablets e celulares em orientação retrato; monitores widescreen são cenário secundário.
- O framework Ionic já utilizado no projeto continuará sendo a base de componentes visuais.
- O sistema de autenticação JWT e proteção de rota existentes permanecem inalterados.
- Os dados exibidos (comandas, itens, status) são fornecidos pelo backend existente sem alterações na API.
- O número típico de comandas pendentes simultâneas é de até 30; cenários acima disso são raros mas devem ser suportados.
- A interface de alteração de status continuará usando dropdown/select como controle primário, podendo ser complementada com alternativas mais diretas (ex: toggle).
