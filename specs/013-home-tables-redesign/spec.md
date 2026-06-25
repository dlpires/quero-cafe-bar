# Feature Specification: Home Tables Redesign

**Created**: 25/06/2026

**Status**: Draft

**Input**: Alterar o formato da página inicial (/home) para exibir a lista de mesas em vez de comandas abertas, com duas visualizações (lista ou cards), status de disponibilidade, e direcionamento para abertura/edição de comandas.

## User Scenarios & Testing

### User Story 1 - Garçom visualiza mesas e abre nova comanda (Priority: P1)

Como garçom, quero visualizar rapidamente todas as mesas do estabelecimento na página inicial, identificando quais estão disponíveis ou ocupadas, para poder abrir uma nova comanda para uma mesa livre.

**Por que esta prioridade**: O fluxo principal de trabalho do garçom começa com a visualização das mesas — a home page é o ponto de partida para todo atendimento.

**Independent Test**: Pode ser testado acessando a página inicial e verificando se as mesas são exibidas com seu número, status visual (disponível/indisponível), e se ao clicar em uma mesa disponível o sistema redireciona para a página de abertura de comanda.

**Acceptance Scenarios**:

1. **Dado** que um garçom acessa a página inicial, **Quando** a lista de mesas é carregada, **Então** todas as mesas cadastradas são exibidas com seu número identificador
2. **Dado** que uma mesa está disponível (sem comanda aberta), **Quando** a página é renderizada, **Então** a mesa é exibida com indicador visual verde e texto "Disponível"
3. **Dado** que o garçom clica em uma mesa disponível, **Quando** a ação é confirmada, **Então** o sistema redireciona para a página de abertura de comanda com a mesa já selecionada
4. **Dado** que uma mesa possui comanda aberta, **Quando** a página é renderizada, **Então** a mesa é exibida com indicador visual de cor diferente (ex: azul/laranja) e texto indicando comanda ativa

---

### User Story 2 - Garçom gerencia comanda aberta de uma mesa (Priority: P1)

Como garçom, quero clicar em uma mesa que já possui comanda aberta para visualizar seus itens, atualizar status de entrega e pagamento, e adicionar novos itens.

**Por que esta prioridade**: Após abrir uma comanda, o garçom precisa atualizar o status dos itens durante o serviço — este é o segundo fluxo mais frequente.

**Independent Test**: Pode ser testado clicando em uma mesa com comanda aberta e verificando se o sistema redireciona para a página de edição de comanda com os itens carregados.

**Acceptance Scenarios**:

1. **Dado** que uma mesa possui comanda aberta, **Quando** o garçom clica nesta mesa na página inicial, **Então** o sistema redireciona para a página de edição da comanda
2. **Dado** que o garçom está na página de edição da comanda, **Quando** ele altera o status de entrega de um item, **Então** o sistema atualiza o status e exibe confirmação visual
3. **Dado** que o garçom está na página de edição da comanda, **Quando** ele marca um item como pago, **Então** o sistema registra o pagamento e exibe confirmação visual
4. **Dado** que o garçom está na página de edição da comanda, **Quando** ele adiciona um novo item, **Então** o item é incluído na comanda e exibido na lista

---

### User Story 3 - Usuário alterna entre visualizações de mesa (Priority: P2)

Como usuário, quero alternar entre visualização em cards (padrão) e visualização em lista para escolher o formato mais adequado ao meu fluxo de trabalho.

**Por que esta prioridade**: A alternância de visualização melhora usabilidade, mas não impacta o fluxo core de abertura/gestão de comandas.

**Independent Test**: Pode ser testado clicando no botão de alternância de visualização e verificando se o layout muda de cards para lista e vice-versa.

**Acceptance Scenarios**:

1. **Dado** que o usuário acessa a página inicial, **Quando** a página carrega, **Então** a visualização padrão é em cards com o número da mesa em destaque
2. **Dado** que o usuário está na visualização em cards, **Quando** ele clica no botão "Visualizar como Lista", **Então** as mesas são exibidas em formato de lista vertical
3. **Dado** que o usuário está na visualização em lista, **Quando** ele clica no botão "Visualizar como Cards", **Então** as mesas voltam a ser exibidas em formato de cards

---

### Edge Cases

- Nenhuma mesa cadastrada: exibir mensagem informativa "Nenhuma mesa cadastrada" com ação para cadastrar nova mesa
- Todas as mesas ocupadas: exibir normalmente cada mesa com seu status ocupado; todas devem estar com indicador de comanda ativa
- Todas as mesas disponíveis: exibir normalmente sem indicadores de comanda; ao clicar, direcionar para abertura de comanda
- Mesa com múltiplas comandas abertas: considerar apenas a comanda mais recente como ativa (cenário de contorno)
- Alternância de visualização durante carregamento: manter o estado da visão atual até que os dados sejam carregados
- Mudança de status em tempo real (outro garçom abriu comanda): a lista deve refletir o estado atual ao recarregar

## Requirements

### Functional Requirements

- **FR-001**: The home page MUST display a list of active tables (mesas with status=true) instead of open comandas
- **FR-002**: Each table MUST display its number (ID) prominently
- **FR-003**: Each table MUST display its availability status: "Disponível" (green) when no active comanda exists, or "Comanda Ativa" (orange) when a comanda is open
- **FR-004**: System MUST determine table availability by checking the comanda `status` field — a table is "Disponivel" only if all its comandas have status "fechada" or no comandas exist. A table with at least one comanda with status "aberta" is considered to have an active comanda.
- **FR-005**: Clicking a table with status "Disponível" MUST redirect the user to the comanda creation page (RegComandaPage) with that table pre-selected
- **FR-006**: Clicking a table with an active comanda MUST redirect the user to that comanda's edit page (UpdateComandaPage)
- **FR-007**: System MUST provide two visualization modes: card view (default) and list view
- **FR-008**: Card view MUST display each table as a card showing the table number prominently and its status with color coding
- **FR-009**: List view MUST display tables in a vertical list format showing table number, number of chairs, and status
- **FR-010**: System MUST provide a toggle control for the user to switch between card and list views
- **FR-011**: The selected view mode MUST persist across sessions via localStorage (key `home-view-mode`, default `"cards"`)
- **FR-012**: System MUST show the total count of tables and the count of available tables
- **FR-013**: System MUST allow pull-to-refresh to reload the table list
- **FR-014**: When no tables exist, the system MUST display an empty state with a message and action to register a new table
- **FR-015**: Pagination MUST be supported if the number of tables exceeds the configured page size (default: 8 for card view, 10 for list view, using existing `calculateResponsivePageSize` pattern)
- **FR-016**: The update comanda page MUST provide an action to "Fechar Comanda" (set status to "fechada"), which returns the table to "Disponível" state
- **FR-017**: Once a comanda has status "fechada", no new items may be added to it — it becomes read-only
- **FR-018**: The existing kitchen view (comandas with delivery status) MUST be moved to a new `/cozinha` route, preserving all current functionality and behavior

### Key Entities

- **Mesa (Table)**: Existing entity with id, qtd_cadeiras, status (active/inactive). Must now expose or derive availability status (has active comanda).
- **Comanda (Order)**: Existing entity, now with a new `status` field ("aberta"/"fechada"). Used to determine if a table has an active comanda. The most recent comanda with status "aberta" for a table determines active status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can see all tables on the home page immediately upon navigation, with no more than 2 seconds load time
- **SC-002**: Each table correctly displays its availability status (green for available, distinct color for active comanda)
- **SC-003**: Clicking an available table navigates to RegComandaPage with that table pre-selected in less than 1 second
- **SC-004**: Clicking a table with active comanda navigates to UpdateComandaPage with comanda data loaded in less than 2 seconds
- **SC-005**: User can toggle between card and list views with a single click, and the toggle responds immediately
- **SC-006**: The total table count and available table count are displayed and match the actual data
- **SC-007**: Empty state renders correctly when no tables are registered

## Clarifications

### Session 2026-06-25

- Q: Quando uma comanda é considerada "fechada/inativa"? → A: Adicionar campo `status` na entidade Comanda com valores "aberta"/"fechada". Mesa fica "Disponível" quando todas as comandas estão "fechadas" ou não existem comandas para ela. Requer migração de BD e ação UI para fechar comanda.
- Q: Onde fica o painel da cozinha (atual /home)? → A: Mover para nova rota `/cozinha` com o mesmo conteúdo e funcionalidade atuais.
- Q: Mesas inativas (status=false) devem aparecer na home? → A: Exibir apenas mesas ativas (status=true). Mesas inativas ficam restritas à página `/mesas`.

**Q2 (Comanda lookup)**: Can a table have multiple open comandas simultaneously?
- **Default**: Assume a table has at most one active (non-finished) comanda at a time. Use the most recent open comanda if multiple exist.

**Q3 (Visualization persistence)**: Should the selected view mode be remembered across sessions?
- **Default**: Store preference in localStorage with key `home-view-mode` — default to `"cards"`.

## Assumptions

- Backend already has an endpoint to list mesas (GET /mesa) that returns id, qtd_cadeiras, status
- Backend will need a new `status` column on the comandas table ("aberta"/"fechada") via migration, and a new endpoint or field to indicate if each mesa has an active comanda
- RegComandaPage will be updated to accept a mesa ID parameter (`?id_mesa=N`) for pre-selection
- The existing UpdateComandaPage accepts a comanda ID parameter to load comanda data
- The `/home` route currently maps to `home-page` custom element — this element will be fully rewritten
- Pagination configuration from the existing ListMesaPage should be reused for the home page table list
- Existing test infrastructure (Jest + custom element mocking) will continue to be used
