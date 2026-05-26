# Responsividade com Media Queries

## Descrição

A aplicação atualmente não possui **nenhuma media query** em seus 13 arquivos CSS, resultando em um layout que não se adapta a diferentes tamanhos de tela. Esta especificação define a adição de breakpoints responsivos para garantir que o aplicativo funcione adequadamente em smartphones pequenos (320px), smartphones médios (375px), smartphones grandes (414px), tablets (768px) e desktops (1024px).

Os principais componentes a serem adaptados são:

- **Grid da cozinha** (HomePage): adaptação do número de colunas por viewport
- **Tela de login** (LoginPage): container com largura máxima em desktop
- **Listagens CRUD** (Produto, Usuário, Mesa, Comanda): cards lado a lado em desktop
- **Formulários CRUD** (Registro e Atualização): layout otimizado para tablet e desktop

---

## Atores

- **Garçons e Administradores**: utilizam o sistema em diferentes dispositivos (smartphone, tablet, desktop)
- **Cozinha**: visualiza pedidos prioritariamente em dispositivos maiores (tablet/desktop)

---

## User Stories

### US-R01: Grid adaptável da cozinha

Como um membro da cozinha, quero que o grid de comandas se adapte ao meu dispositivo para que eu possa visualizar o máximo de pedidos possível sem precisar scrollar horizontalmente.

**Cenário principal**: Cozinheiro acessa a página inicial em um tablet (768px) e vê as comandas organizadas em 2 colunas, ocupando toda a largura da tela sem scroll horizontal.

**Cenário secundário**: Cozinheiro acessa a página inicial em um smartphone pequeno (320px) e vê as comandas em 1 coluna, cada card ocupando a largura total disponível.

### US-R02: Login responsivo

Como um garçom, quero que a tela de login tenha uma largura adequada em desktop para que eu não precise mover o olho por uma distância grande entre o label e o campo.

**Cenário principal**: Garçom acessa a tela de login em um monitor desktop (1366px) e vê o formulário centralizado com largura máxima de 400px.

**Cenário secundário**: Garçom acessa a tela de login em um smartphone (375px) e vê o formulário ocupando a largura total da tela (comportamento atual).

### US-R03: Listagens adaptáveis

Como um administrador, quero que as listagens de produtos, usuários, mesas e comandas exibam os cards lado a lado em desktop para que eu possa visualizar mais registros por vez sem precisar scrollar tanto.

**Cenário principal**: Administrador acessa a lista de produtos em um desktop (1024px) e vê os cards organizados em 3 colunas.

**Cenário secundário**: Administrador acessa a lista de produtos em um smartphone (375px) e vê os cards em lista vertical (comportamento atual).

### US-R04: Formulários otimizados

Como um usuário do sistema, quero que os formulários de cadastro e edição tenham um layout confortável em tablet e desktop para que os campos não fiquem excessivamente largos e difíceis de preencher.

**Cenário principal**: Administrador acessa o formulário de cadastro de produto em um tablet (768px) e vê o formulário centralizado com largura máxima controlada.

**Cenário secundário**: Administrador acessa o formulário de cadastro de produto em um smartphone (375px) e vê o formulário ocupando a largura total (comportamento atual).

---

## Requisitos Funcionais

### RF-R01: Grid responsivo da cozinha

O grid de comandas na HomePage deve se adaptar ao viewport:

| Viewport | Comportamento |
|----------|--------------|
| ≤360px (smartphones pequenos) | 1 coluna |
| 361px–767px (smartphones médios/grandes) | Manter comportamento atual com `repeat(auto-fill, minmax(280px, 1fr))` |
| ≥768px (tablets) | 2 colunas |
| ≥1024px (desktops) | 3 colunas |
| ≥1400px (desktops wide) | 4 colunas |

### RF-R02: Login centralizado em desktop

A tela de login deve ter seu conteúdo centralizado e com largura máxima em desktop:

| Viewport | Comportamento |
|----------|--------------|
| <1024px | Manter layout atual de largura total |
| ≥1024px | Container de login com `max-width: 400px` centralizado horizontalmente |

### RF-R03: Cards lado a lado em listagens

As páginas de listagem (Produto, Usuário, Mesa, Comanda) devem exibir os registros em uma grade de colunas em desktop:

| Viewport | Comportamento |
|----------|--------------|
| <768px | Manter layout atual de lista vertical |
| ≥768px (tablet/desktop) | Grid de 2 colunas com `gap: 16px` |
| ≥1024px (desktop) | Grid de 3 colunas |
| ≥1400px (desktop wide) | Grid de 4 colunas |

### RF-R04: Formulários confortáveis em telas maiores

Os formulários de cadastro e edição (RegProduto, RegUsuario, RegMesa, RegComanda e suas variações de Update) devem ter largura controlada em telas maiores:

| Viewport | Comportamento |
|----------|--------------|
| <768px | Manter layout atual de largura total |
| ≥768px (tablet/desktop) | `max-width: 600px` centralizado, mantendo campos em coluna única |

---

## Critérios de Sucesso

- **CS-R01**: O grid da cozinha exibe o número correto de colunas em cada breakpoint (1 coluna ≤360px, 2 colunas ≥768px, 3 colunas ≥1024px, 4 colunas ≥1400px)
- **CS-R02**: A tela de login exibe o formulário centralizado com largura máxima de 400px em viewports ≥1024px
- **CS-R03**: As listagens CRUD exibem registros em grid de 2 colunas em viewports ≥768px, 3 colunas em ≥1024px e 4 colunas em ≥1400px
- **CS-R04**: Os formulários CRUD têm largura máxima de 600px centralizados em viewports ≥768px
- **CS-R05**: Não há overflow horizontal ou conteúdo cortado em nenhum dos breakpoints testados (320px, 375px, 414px, 768px, 1024px, 1400px)
- **CS-R06**: Todos os botões e inputs permanecem funcionais (touch targets ≥44px efetivos) em todas as resoluções
- **CS-R07**: Navegação entre páginas e submissão de formulários funcionam sem quebras visuais em todos os breakpoints

---

## Entidades Envolvidas

- **HomePage.css**: grid da cozinha, cards de comanda
- **LoginPage.css**: container de login
- **ListProdutoPage.css**, **ListUsuarioPage.css**, **ListMesaPage.css**, **ListComandaPage.css**: listagens CRUD
- **RegProdutoPage.css**, **UpdateProdutoPage.css**: formulário de produto
- **RegUsuarioPage.css**, **UpdateUsuarioPage.css**: formulário de usuário
- **RegMesaPage.css**, **UpdateMesaPage.css**: formulário de mesa
- **RegComandaPage.css**, **UpdateComandaPage.css**: formulário de comanda

---

## Premissas

- A Fase 3 (Layout e Espaçamento Mobile) já foi concluída, garantindo que todos os containers tenham padding adequado e o grid da HomePage use `minmax(280px, 1fr)` em vez de `minmax(320px, 1fr)`
- O Ionic Framework já fornece responsividade base para componentes individuais; as media queries aqui especificadas complementam o layout customizado
- O projeto não possui design system próprio; cores e espaçamentos seguem os defaults do Ionic
- Os breakpoints seguem convenção mobile-first (`min-width`) exceto onde especificado otherwise

---

## Fora do Escopo

- Alterações em JavaScript, HTML, ou lógica de negócio — esta fase é **exclusivamente CSS**
- Componentes de performance como `ion-infinite-scroll` (Fase 5) ou gestos touch como `ion-item-sliding` e `ion-refresher` (Fase 6)

## Clarificações

### Sessão 2026-05-25

- Q1: Qual é o escopo exato desta fase? → A: Exclusivamente CSS (media queries e ajustes de layout). Sem alterações em JS, HTML ou lógica de negócio.
- Q2: Qual o comportamento em telas ultra-wide (>1920px)? → A: Adicionar breakpoint ≥1400px com 4 colunas para grid da cozinha e listagens.

---

## Dependências

- **Fase 3** (Layout e Espaçamento Mobile): obrigatória — os padding de container, correção do grid `minmax` e a correção `margin: 10px` são pré-requisitos para as media queries funcionarem corretamente
