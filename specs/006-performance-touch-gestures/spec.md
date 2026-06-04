# Feature Specification: Performance Mobile e Gestos Touch Nativos

**Feature Branch**: `006-performance-touch-gestures`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Implementação sugerida 5 do plano de melhorias UX/UI, contemplando Fase 5 (Performance Mobile) e Fase 6 (Gestos Touch Nativos)"

## Clarifications

### Session 2026-05-29

- Q: DOM pruning strategy for infinite scroll → A: Hybrid — virtual scroll for long entity lists (produto, usuario), simple DOM append for small lists (mesa, comanda)
- Q: Animation frame rate target for touch gestures → A: 60fps on mid-range mobile devices (Moto G54, Galaxy A54 class)
- Q: Lazy loading strategy — preloading behavior on mobile → A: Preload adjacent route in background after initial page render
- Q: Virtual scroll buffer size for low-end mobile → A: 2 screens buffer (1 above + 1 below viewport)
- Q: Performance observability on mobile → A: User Timing API marks + console warn on jank (lightweight, no external deps)

## User Scenarios & Testing

### User Story 1 - Navegação com rolagem infinita em listagens (Priority: P1)

Funcionários (garçons/admins) que gerenciam produtos, usuários, mesas e comandas precisam navegar por listas potencialmente grandes. Em vez de carregar todos os registros de uma vez — o que degrada a performance em dispositivos móveis — os itens devem carregar progressivamente conforme o usuário rola a tela.

**Why this priority**: Impacta diretamente a performance percebida em telas móveis com muitos registros, beneficiando todos os usuários em todas as listas CRUD.

**Independent Test**: Pode ser testado abrindo qualquer listagem (produtos, usuários, mesas ou comandas) com mais de 20 registros e rolando até o final — novos itens devem aparecer sem interrupção.

**Acceptance Scenarios**:

1. **Given** uma lista com mais de 20 registros, **When** o usuário rola até o final da lista, **Then** mais registros são carregados automaticamente sem interromper a navegação
2. **Given** uma lista com menos de 20 registros, **When** a lista termina, **Then** nenhum indicador de carregamento adicional aparece
3. **Given** um erro de rede durante o carregamento progressivo, **When** a requisição falha, **Then** uma mensagem amigável é exibida e o usuário pode tentar novamente

---

### User Story 2 - Swipe para excluir em listagens (Priority: P1)

Usuários de dispositivos móveis esperam poder deslizar itens para revelar ações contextuais. Em todas as listas CRUD, o gesto de swipe à esquerda deve revelar o botão de excluir, eliminando a necessidade de selecionar o item para encontrar a ação de deletar.

**Why this priority**: Gestos nativos são padrão de usabilidade mobile. Ausência de swipe-to-delete foi identificada como falha crítica na auditoria Mobile First (nota 10% em Gestos Touch).

**Independent Test**: Pode ser testado em qualquer listagem (produto, usuário, mesa) deslizando um item para a esquerda — o botão de excluir deve aparecer.

**Acceptance Scenarios**:

1. **Given** uma lista de itens, **When** o usuário desliza um item para a esquerda, **Then** o botão de excluir é revelado com ícone e cor de perigo
2. **Given** o botão de excluir visível via swipe, **When** o usuário toca no botão, **Then** uma confirmação é exibida antes de excluir

---

### User Story 3 - Pull-to-refresh em todas as listas (Priority: P1)

Usuários móveis esperam poder puxar a tela para baixo para recarregar dados. Todas as listas devem suportar o gesto de pull-to-refresh, recarregando os dados mais recentes sem necessidade de navegar para outra tela.

**Why this priority**: Gestos nativos de atualização são expectativa padrão em mobile. Ausência foi identificada como falha na auditoria (nota 10% em Gestos Touch).

**Independent Test**: Pode ser testado em qualquer listagem puxando a tela para baixo — um indicador de carregamento deve aparecer e os dados devem ser recarregados.

**Acceptance Scenarios**:

1. **Given** uma lista carregada, **When** o usuário puxa a tela para baixo além do limite, **Then** um indicador visual de refresh aparece e os dados são recarregados
2. **Given** o pull-to-refresh em andamento, **When** o carregamento termina, **Then** o indicador desaparece e a lista exibe os dados atualizados
3. **Given** uma falha de rede durante pull-to-refresh, **When** a requisição falha, **Then** uma mensagem de erro é exibida e os dados anteriores permanecem visíveis

---

### User Story 4 - Lazy loading de páginas para carregamento inicial rápido (Priority: P2)

Ao acessar o aplicativo pela primeira vez, o usuário não deve esperar o carregamento de todas as páginas. Apenas o código necessário para a tela inicial deve ser baixado; as demais páginas são carregadas sob demanda conforme o usuário navega.

**Why this priority**: Impacta a percepção de velocidade na primeira carga (Lighthouse Performance). Essencial para usuários em conexões móveis lentas.

**Independent Test**: Pode ser testado medindo o tamanho do bundle inicial antes e depois da implementação — páginas não utilizadas não devem estar no bundle principal.

**Acceptance Scenarios**:

1. **Given** o aplicativo carregando pela primeira vez, **When** o bundle inicial é baixado, **Then** ele não contém código de páginas além da página inicial e login
2. **Given** um usuário navega para uma página não carregada, **When** a rota é acessada, **Then** a página é carregada sob demanda sem interromper a experiência do usuário

---

### User Story 5 - Cache de assets via service worker (Priority: P3)

Usuários que acessam o aplicativo repetidamente devem experimentar carregamentos mais rápidos em visitas subsequentes graças ao cache de assets estáticos (CSS, JS, ícones, fontes) via service worker.

**Why this priority**: Melhora a experiência em visitas repetidas e prepara o app para futura instalação como PWA.

**Independent Test**: Pode ser testado carregando o app, verificando no painel "Application > Service Workers" do navegador se o service worker está registrado e se assets estão em cache.

**Acceptance Scenarios**:

1. **Given** o service worker registrado, **When** o navegador faz uma requisição de asset estático, **Then** o asset é servido do cache em visitas subsequentes
2. **Given** uma nova versão do app deployada, **When** o service worker detecta mudanças, **Then** ele atualiza o cache em background

### Edge Cases

- O que acontece quando o usuário faz swipe rápido em múltiplos itens consecutivamente?
- Como o sistema se comporta quando a API retorna menos registros que o tamanho da página no infinite scroll?
- O que acontece se o service worker falhar ao registrar em navegadores que não suportam a API?
- Como o pull-to-refresh se comporta quando a lista está vazia (empty state)?
- O swipe-to-delete funciona corretamente quando o item já está sendo editado?

## Requirements

### Functional Requirements

- **FR-001**: Listagens (produto, usuário, mesa, comanda) DEVEM carregar registros progressivamente à medida que o usuário rola a tela, em lotes de tamanho fixo
- **FR-001a**: Listagens de entidades com muitos registros (produto, usuário) DEVEM usar técnica de virtual scroll — apenas itens visíveis + buffer de 2 telas (1 acima + 1 abaixo da viewport) permanecem no DOM; itens fora desse limite são removidos
- **FR-001b**: Listagens de entidades com poucos registros esperados (mesa, comanda) PODEM usar append simples no DOM sem necessidade de virtual scroll
- **FR-002**: Listagens DEVEM exibir um indicador visual de carregamento enquanto mais registros estão sendo buscados
- **FR-003**: Ao atingir o final dos dados disponíveis, o indicador de infinite scroll DEVE ser desativado e não deve tentar carregar mais itens
- **FR-004**: Cada item em listagens (produto, usuário, mesa) DEVE suportar gesto de swipe à esquerda para revelar ação de excluir — comanda fica excluída pois a cozinha não realiza exclusão de pedidos na listagem
- **FR-005**: Ao tocar no botão de excluir revelado por swipe, uma confirmação DEVE ser exibida antes da exclusão
- **FR-006**: Todas as listagens DEVEM suportar gesto de pull-to-refresh para recarregar dados completos
- **FR-007**: Durante o pull-to-refresh, um indicador visual DEVE ser exibido e a interação com a lista DEVE permanecer suave
- **FR-008**: Após o pull-to-refresh, os dados exibidos DEVEM refletir o estado mais recente do servidor
- **FR-009**: O bundle JavaScript inicial NÃO DEVE incluir código de todas as páginas; páginas DEVEM ser carregadas sob demanda
- **FR-009a**: Após o carregamento inicial de uma página, a rota adjacente mais provável (ex.: registro após listagem) DEVE ser pré-carregada em segundo plano para reduzir latência percebida na navegação
- **FR-010**: Assets estáticos (CSS, JS, imagens, fontes, ícones Ionic) DEVEM ser cacheados via service worker para carregamento mais rápido em visitas repetidas
- **FR-011**: O service worker DEVE atualizar o cache em background quando uma nova versão dos assets é detectada
- **FR-012**: Em caso de falha de rede durante infinite scroll ou pull-to-refresh, uma mensagem de erro amigável DEVE ser exibida, e os dados existentes NÃO DEVEM ser removidos
- **FR-013**: O infinite scroll, pull-to-refresh e swipe DEVEM registrar marcos de performance via User Timing API (`performance.mark`/`measure`) para permitir diagnóstico de jank durante desenvolvimento
- **FR-014**: Se uma operação touch ou scroll ultrapassar 16ms (60fps budget), um aviso DEVE ser emitido no console em ambiente de desenvolvimento

### Key Entities

As entidades envolvidas são as mesmas já existentes no sistema — nenhuma nova entidade é necessária:

- **Produto**: Itens do cardápio. Listagens precisam de infinite scroll (com virtual scroll) e swipe-to-delete.
- **Usuario**: Funcionários (admin/garçom). Listagens precisam de infinite scroll (com virtual scroll) e swipe-to-delete.
- **Mesa**: Mesas do estabelecimento. Listagens precisam de infinite scroll (append simples) e swipe-to-delete.
- **Comanda**: Pedidos abertos por mesa. Listagens precisam de infinite scroll (append simples) e pull-to-refresh (na cozinha).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Listas com mais de 50 registros carregam progressivamente a 60fps (sem congelamento) em dispositivos mid-range — o usuário pode começar a interagir com os primeiros itens enquanto o restante carrega
- **SC-002**: O bundle JavaScript inicial é reduzido em pelo menos 40% em relação ao estado atual, excluindo o código de páginas não utilizadas na rota inicial
- **SC-003**: Lighthouse Performance score ≥ 80 em simulação de dispositivo móvel (3G slow, CPU throttling 4x)
- **SC-004**: Usuários conseguem excluir itens via swipe em todas as listas em até 2 gestos (swipe + toque em confirmar)
- **SC-005**: Usuários conseguem recarregar dados em qualquer lista em até 1 gesto (pull-to-refresh)
- **SC-006**: Gestos touch (swipe, pull-to-refresh) devem manter 60fps em dispositivos mid-range durante a animação, sem conflitar com scroll vertical da página — scroll continua funcionando normalmente ao deslizar para cima/baixo sem movimento lateral significativo

## Assumptions

- O Ionic Framework 8.x fornece os componentes `ion-infinite-scroll`, `ion-item-sliding` e `ion-refresher` que serão utilizados — seus comportamentos padrão de acessibilidade e touch são suficientes
- O infinite scroll carregará 20 registros por lote como tamanho de página padrão
- O service worker fará cache apenas de assets estáticos (estratégia "cache-first" para assets, "network-first" para dados da API)
- Navegadores modernos (Chrome, Firefox, Safari, Edge) suportam a API de service worker; navegadores sem suporte continuarão funcionando sem cache
- O lazy loading será implementado via importação dinâmica no roteador — cada página é um módulo separado
- O pré-carregamento da rota adjacente será feito com `import()` em segundo plano, sem bloquear a renderização inicial
- Gestos touch não precisam ser implementados manualmente pois o Ionic já abstrai os eventos touch nativos
- Usuários em dispositivos desktop podem usar as ações via clique/clique direito como alternativa aos gestos touch
