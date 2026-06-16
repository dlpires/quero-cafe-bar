# Feature Specification: Controle de Paginação para Listas

**Feature Branch**: `010-list-pagination`

**Created**: 2026-06-15

**Status**: Implemented

**Input**: User description: "Preciso criar uma spec para fazer um controle de paginação para todas as listas do projeto (usuários, produtos, mesas, comandas e os cards de comandas), de forma a deixar sem barra de rolagem nas páginas (apenas entre os cards de /home)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação Paginada nas Listas CRUD (Priority: P1)

Como usuário do sistema (administrador ou garçom), quero navegar pelas listas de usuários, produtos, mesas e comandas por meio de controles de paginação (botões de avançar/retroceder e indicação de página atual), de modo que a página caiba inteira na tela sem barra de rolagem vertical.

**Why this priority**: As listas CRUD são as telas mais operacionais do sistema. Eliminar a barra de rolagem melhora a experiência em tablets e dispositivos com telas menores, além de tornar a navegação mais previsível para o usuário.

**Independent Test**: Pode ser testado acessando qualquer uma das listas (usuários, produtos, mesas ou comandas) e verificando que: (a) apenas uma página de registros é exibida por vez, (b) controles de paginação estão visíveis no rodapé, (c) nenhuma barra de rolagem vertical aparece na tela, e (d) a troca de página carrega os registros corretos.

**Acceptance Scenarios**:

1. **Given** que existem 45 produtos cadastrados, **When** o usuário acessa a tela de produtos, **Then** os primeiros N produtos são exibidos (conforme tamanho da página definido), os controles de paginação indicam "Página 1 de X", e a página não possui barra de rolagem vertical.
2. **Given** que o usuário está na página 1 da lista de produtos, **When** o usuário clica no botão "Próxima", **Then** a página 2 é carregada com os próximos N produtos e os controles são atualizados.
3. **Given** que o usuário está na última página, **When** o controle de paginação é exibido, **Then** o botão "Próxima" aparece desabilitado.
4. **Given** que o usuário está na primeira página, **When** o controle de paginação é exibido, **Then** o botão "Anterior" aparece desabilitado.
5. **Given** que existe apenas 1 página de registros (poucos dados), **When** o usuário acessa a lista, **Then** os registros são exibidos normalmente e os controles de paginação ficam ocultos ou desabilitados.

---

### User Story 2 - Paginação nos Cards da Cozinha (Priority: P2)

Como cozinheiro(a), quero visualizar os cards de comandas ativas com controle de paginação, podendo navegar entre páginas de cards, mantendo a possibilidade de rolar dentro de cada página caso os cards não caibam na altura da tela.

**Why this priority**: A visão da cozinha é a segunda tela mais usada. Diferente das listas CRUD, os cards ocupam mais espaço visual e a rolagem entre cards é aceitável. O controle de paginação garante que um grande volume de comandas não trave a interface.

**Independent Test**: Pode ser testado acessando a tela /home com mais de uma página de comandas e verificando que: (a) os cards são exibidos em páginas, (b) controles de paginação aparecem abaixo do grid de cards, (c) é possível rolar verticalmente entre os cards dentro de uma mesma página, e (d) a troca de página atualiza os cards corretamente.

**Acceptance Scenarios**:

1. **Given** que existem 30 comandas ativas, **When** o cozinheiro acessa a tela da cozinha, **Then** a primeira página de cards é exibida e os controles de paginação indicam que há mais páginas disponíveis.
2. **Given** que o cozinheiro está visualizando os cards da página atual, **When** ele clica em "Próxima", **Then** os cards da página seguinte são carregados e a tela rola para o topo do grid de cards.
3. **Given** que o conteúdo de cards de uma página excede a altura da tela, **When** o cozinheiro visualiza a página, **Then** é possível rolar verticalmente entre os cards sem que a página inteira role (apenas o grid de cards rola internamente).

---

### User Story 3 - Indicador de Total de Registros (Priority: P3)

Como usuário do sistema, quero ver o total de registros encontrados para cada lista, para ter noção do volume de dados sem precisar navegar por todas as páginas.

**Why this priority**: É uma informação complementar que melhora a usabilidade, mas não é essencial para o funcionamento da paginação.

**Independent Test**: Pode ser testado acessando qualquer lista e verificando que o texto "Total: X registro(s)" está visível próximo aos controles de paginação.

**Acceptance Scenarios**:

1. **Given** que existem 73 usuários cadastrados, **When** o usuário acessa a lista de usuários, **Then** o texto "Total: 73 registros" é exibido junto aos controles de paginação.
2. **Given** que uma busca por nome retorna 0 resultados, **When** a lista é exibida, **Then** o texto "Nenhum registro encontrado" aparece no lugar dos controles de paginação.

---

### Edge Cases

- O que acontece quando o usuário aplica um filtro e o número de resultados é menor que o tamanho da página?
- Como o sistema se comporta quando o backend está indisponível durante a troca de página?
- O que acontece se o usuário estiver na página 5 e aplicar um filtro que retorna apenas 1 página de resultados?
- Como a interface se comporta em tablets na orientação paisagem vs. retrato em relação ao número de itens exibidos por página?
- O que acontece quando um registro é excluído da página atual — a lista é recarregada ou a página fica com menos itens?
- Como o sistema lida com a navegação entre páginas quando múltiplos usuários estão editando a mesma lista concorrentemente?

## Clarifications

### Session 2026-06-15

- Q: When the user clicks "Próxima" or "Anterior", what visual feedback should appear while the next page loads? → A: Skeleton loader (gray placeholder boxes matching list item shapes)
- Q: Where exactly should the pagination controls be positioned and what visual style should they follow? → A: Sticky bottom bar inside the list area, with minimum 48px touch targets, using Ionic's default button styling
- Q: How should the internal scroll work in the kitchen card grid? → A: The grid container itself scrolls internally (`.card-grid` with `overflow-y: auto`), pagination controls stay fixed below

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: As páginas de listagem de usuários, produtos, mesas e comandas NÃO devem exibir barra de rolagem vertical na tela; todo o conteúdo visível deve caber no viewport.
- **FR-002**: Cada página de listagem deve exibir controles de paginação em uma barra fixa (sticky) na parte inferior da área de listagem, contendo: botão "Anterior", indicador de página atual/total (ex: "Página 1 de 5"), e botão "Próxima", com touch targets mínimos de 48px e estilização baseada nos botões padrão do Ionic.
- **FR-003**: O botão "Anterior" deve ficar desabilitado quando o usuário está na primeira página.
- **FR-004**: O botão "Próxima" deve ficar desabilitado quando o usuário está na última página.
- **FR-005**: A troca de página deve atualizar apenas a área de listagem, sem recarregar o cabeçalho ou menu lateral da aplicação.
- **FR-006**: A tela da cozinha (/home) deve exibir os cards de comandas com controles de paginação, porém com permissão de rolagem vertical interna no container do grid de cards (`.card-grid` com `overflow-y: auto`) quando o conteúdo exceder a altura disponível; os controles de paginação permanecem fixos abaixo do grid.
- **FR-007**: A tela da cozinha deve rolar automaticamente para o topo do grid de cards ao trocar de página.
- **FR-008**: O total de registros da lista deve ser exibido próximo aos controles de paginação (ex: "Total: 42 registros").
- **FR-009**: Quando não houver registros (lista vazia), os controles de paginação devem ser ocultados e uma mensagem de "Nenhum registro encontrado" deve ser exibida.
- **FR-010**: Durante a transição entre páginas, a área de listagem deve exibir um skeleton loader (placeholders cinza no formato dos itens da lista) enquanto aguarda a resposta do backend, substituindo o conteúdo anterior.
- **FR-011**: Quando houver apenas uma página de registros, os controles de paginação devem ser ocultados, mas o total de registros deve permanecer visível.
- **FR-012**: A paginação deve ser preservada ao alternar entre as páginas do menu; ao retornar para uma lista, ela deve recarregar da primeira página.
- **FR-013**: O tamanho de página (número de itens por página) deve ser definido de forma que o conteúdo caiba no viewport sem barra de rolagem, considerando resoluções mínimas de 768px de altura (tablet em paisagem).
- **FR-014**: O tamanho de página deve ser calculado dinamicamente com base na altura da janela (`window.innerHeight`), descontando as alturas fixas do cabeçalho (56px), rodapé de paginação (52px) e padding do container (32px), e dividindo pela altura média dos itens da lista, respeitando os limites mínimo de 3 e máximo de 50 itens.

### Key Entities

- **Paginação**: Representa o estado atual da navegação em uma lista — página atual, total de páginas, total de registros, e tamanho da página. Aplicável a cada entidade listável do sistema (usuários, produtos, mesas, comandas).
- **Lista**: Conjunto paginado de registros de uma entidade específica, exibido com controles de navegação entre páginas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhuma das páginas de listagem (usuários, produtos, mesas, comandas) exibe barra de rolagem vertical em viewports com altura >= 768px.
- **SC-002**: O tempo de troca entre páginas é inferior a 2 segundos em condições normais de rede.
- **SC-003**: O usuário consegue identificar em qual página está e quantas páginas existem sem ambiguidade (indicador "Página X de Y" visível).
- **SC-004**: 100% das listas do sistema (usuários, produtos, mesas, comandas e cozinha) possuem controles de paginação funcionais.
- **SC-005**: A interface mantém usabilidade em tablets com resolução mínima de 1024x768 (paisagem) sem overflow de conteúdo.

## Implementation History

### Session 2026-06-16 — Responsive Page Size

**Bug descoberto**: Os tamanhos de página fixos (10, 10, 8, 6, 8) eram maiores que o espaço disponível no viewport para a maioria das resoluções de tablet (768px de altura), fazendo com que os itens vazassem para baixo do footer, violando SC-001 (sem barra de rolagem).

**Solução implementada**: Substituição dos valores fixos por um cálculo responsivo (`calculateResponsivePageSize`):

```
itensPorPagina = Math.floor((window.innerHeight - 56 - 52 - 32) / itemHeight)
```

Onde:
- 56px = altura do `ion-header`
- 52px = altura do `ion-footer` (barra de paginação)
- 32px = padding vertical do container da lista (16px top + 16px bottom)
- `itemHeight` = 80px (produto/usuario/mesa), 120px (comanda), 200px (home/cards)

Retorna entre 3 (mínimo) e 50 (máximo) itens por página.

**Adicionado à spec**: FR-014

**Arquivos modificados**:
- `frontend/src/shared/util.js` — adicionados `PAGE_LAYOUT`, `calculateResponsivePageSize`, constantes `HEADER_HEIGHT`, `FOOTER_HEIGHT`, `CONTAINER_PADDING`
- `frontend/src/pages/produto/ListProdutoPage.js` — trocado `getPageSize('produto')` → `calculateResponsivePageSize('produto')`
- `frontend/src/pages/usuario/ListUsuarioPage.js` — idem
- `frontend/src/pages/mesa/ListMesaPage.js` — idem
- `frontend/src/pages/comanda/ListComandaPage.js` — idem
- `frontend/src/pages/home/HomePage.js` — idem
- Arquivos `.spec.js` correspondentes — atualizados mocks e imports

**Testes**: 216 testes passando (20 suites), nenhuma regressão.

### Session 2026-06-15 — Initial Implementation

- Shared pagination utilities criadas em `util.js`: `createPaginationState`, `getPageSize`, `renderPaginationBar`, `createListSkeleton`, `createCardSkeleton`
- 5 páginas de lista refatoradas para usar paginação com botões (Anterior/Próxima) + indicador de página + total de registros
- Skeleton loader durante transições de página
- Listas CRUD com `ion-content-no-scroll` (sem scroll vertical)
- Home page com scroll interno no grid de cards
- Testes de paginação, navegação, estados vazio/erro e responsividade adicionados

## Assumptions

- O backend já fornece suporte a paginação via parâmetros `skip` e `take` nos endpoints de listagem, retornando o `total` de registros no formato `PaginatedResponse`.
- ~~O tamanho de página (take) será definido por um valor fixo por tipo de lista (produto/usuario: 10, mesa: 8, comanda: 6, home: 8), calculado para caber no viewport sem scroll em resolução mínima de 768px de altura.~~ *(Substituído durante implementação — ver Implementation History)*
- A paginação substituirá o infinite scroll existente nas páginas de usuários e produtos, e será adicionada às páginas de mesas e comandas que atualmente não possuem paginação visível (apenas infinite scroll).
- As páginas de formulário (criação/edição) não são afetadas por esta especificação; apenas as telas de listagem.
- O cabeçalho e menu lateral são fixos e não fazem parte da área de conteúdo paginável.
- A resolução mínima alvo para ausência de scroll é 1024x768 (tablet em paisagem), cobrindo o caso de uso principal do sistema em tablets Android.