# Feature Specification: User Permissions Profiles

**Created**: 25/06/2026

**Status**: Draft

**Input**: User description: "Agora quero mexer nos perfis e permissões de cada usuário. Tem dois perfis hoje, porém seriam 3 perfis: Administrador, atendente e cozinha. O perfil Administrador terá acesso total a todas as rotas de frontend e backend, já o perfil Atendente terá acesso a tela de home, mesas, produtos e comandas apenas, e a cozinha acesso apenas a cozinha (sendo a cozinha sua página inicial, para ver o painel). Os itens que os perfis não tem acesso, deve ter um hide no menu, para não ter acesso."

## User Scenarios & Testing

### User Story 1 - Administrador gerencia o sistema com acesso completo (Priority: P1)

Como Administrador, quero ter acesso a todas as funcionalidades do sistema — home, produtos, mesas, comandas, usuários e cozinha — para poder gerenciar integralmente o estabelecimento, incluindo criação e edição de usuários de todos os perfis.

**Why this priority**: O administrador precisa de visibilidade completa para configurar e supervisionar todo o sistema. Sem este perfil, não é possível gerenciar os demais usuários.

**Independent Test**: Pode ser testado fazendo login como Administrador e verificando que todos os itens do menu estão visíveis e que todas as rotas são acessíveis, incluindo a página de usuários.

**Acceptance Scenarios**:

1. **Given** que um usuário com perfil Administrador faz login, **When** o menu lateral é renderizado, **Then** todos os itens do menu são exibidos (Home, Produtos, Usuários, Mesas, Comandas, Cozinha)
2. **Given** que um Administrador está logado, **When** ele tenta acessar qualquer rota do sistema, **Then** a rota é carregada com sucesso
3. **Given** que um Administrador acessa a página de usuários, **When** ele cadastra ou edita um usuário, **Then** ele pode selecionar qualquer perfil (Administrador, Atendente, Cozinha)

---

### User Story 2 - Atendente gerencia mesas, produtos e comandas (Priority: P1)

Como Atendente, quero acessar as páginas de home (mesas), produtos, mesas e comandas para realizar o atendimento aos clientes no salão, sem acesso à administração de usuários ou ao painel da cozinha.

**Why this priority**: O atendente é o perfil operacional principal responsável pelo fluxo de atendimento (abrir comandas, gerenciar mesas, consultar produtos).

**Independent Test**: Pode ser testado fazendo login como Atendente e verificando que os itens Home, Produtos, Mesas e Comandas estão visíveis no menu, enquanto Usuários e Cozinha estão ocultos.

**Acceptance Scenarios**:

1. **Given** que um usuário com perfil Atendente faz login, **When** o menu lateral é renderizado, **Then** apenas os itens Home, Produtos, Mesas e Comandas são exibidos
2. **Given** que um Atendente está logado, **When** ele tenta acessar a rota `/usuarios` ou `/cozinha` diretamente pela URL, **Then** o sistema redireciona para a home ou exibe uma mensagem de acesso negado
3. **Given** que um Atendente está na página de produtos, **When** ele tenta criar, editar ou excluir um produto, **Then** o sistema exibe uma mensagem de permissão negada ou oculta os botões de ação

---

### User Story 3 - Cozinha visualiza o painel de pedidos (Priority: P1)

Como usuário da Cozinha, quero acessar exclusivamente o painel da cozinha (visualização de comandas com status de entrega) para preparar os pedidos, sem acesso a outras funcionalidades do sistema.

**Why this priority**: A cozinha é um perfil operacional focado exclusivamente na produção — qualquer acesso a mais poderia causar distrações ou alterações indevidas.

**Independent Test**: Pode ser testado fazendo login como Cozinha e verificando que apenas o item Cozinha aparece no menu, e que a rota `/cozinha` é a página inicial (home) desse perfil.

**Acceptance Scenarios**:

1. **Given** que um usuário com perfil Cozinha faz login, **When** o menu lateral é renderizado, **Then** apenas o item Cozinha é exibido
2. **Given** que um usuário Cozinha faz login, **When** o login é concluído, **Then** o sistema redireciona automaticamente para a rota `/cozinha`
3. **Given** que um usuário Cozinha está logado, **When** ele tenta acessar qualquer outra rota (ex: `/produtos`, `/mesas`, `/usuarios`), **Then** o sistema redireciona para `/cozinha` ou exibe uma mensagem de acesso negado

---

### User Story 4 - Sistema impede acesso não autorizado a rotas (Priority: P2)

Como sistema, quero garantir que nenhum usuário consiga acessar funcionalidades para as quais não tem permissão, tanto via menu quanto via digitação direta da URL, para proteger a integridade dos dados e as operações do estabelecimento.

**Why this priority**: A segurança por camadas (menu + rota) evita que usuários mal-intencionados ou curiosos acessem áreas restritas.

**Independent Test**: Pode ser testado tentando acessar rotas restritas diretamente pela URL estando logado com perfil sem permissão.

**Acceptance Scenarios**:

1. **Given** que um Atendente está logado, **When** ele digita `/usuarios` na barra de endereços, **Then** o sistema redireciona para a home ou exibe "Acesso negado"
2. **Given** que um usuário Cozinha está logado, **When** ele digita `/produtos` na barra de endereços, **Then** o sistema redireciona para `/cozinha` ou exibe "Acesso negado"
3. **Given** que um Administrador está logado, **When** ele acessa qualquer rota diretamente, **Then** a rota é carregada sem restrições

---

### Edge Cases

- Usuário sem perfil definido (perfil null/undefined): tratar como perfil inválido e redirecionar para login com mensagem de erro
- Token JWT expirado ou inválido: redirecionar para login independentemente do perfil
- Perfil numérico inválido (ex: valor 3 ou -1): tratar como acesso negado e redirecionar para home
- Criação de novo usuário: apenas Administradores podem criar usuários de qualquer perfil; Atendentes e Cozinha não devem ter acesso à tela de cadastro de usuários
- Alteração de perfil de um usuário existente: apenas Administradores podem alterar o perfil de outros usuários
- Múltiplas abas/navegadores: o perfil é verificado a cada requisição via token JWT — mudanças de perfil só valem após novo login
- Auto-alteração de perfil: usuário não-Admin tenta alterar seu próprio perfil via requisição direta à API — backend deve rejeitar com HTTP 403, mesmo que o usuário seja o proprietário do recurso
- Ações sensíveis sem registro: alteração de perfil ou exclusão de registro sem log de auditoria — impossível rastrear responsável em caso de uso indevido

## Requirements

### Functional Requirements

- **FR-001**: System MUST define three user profiles: Administrador (0), Atendente (1), Cozinha (2)
- **FR-002**: Administrador profile MUST have access to ALL system routes and features
- **FR-003**: Atendente profile MUST have read-only access to produtos and mesas (list and detail views), and full CRUD access to comandas
- **FR-004**: Cozinha profile MUST have access ONLY to the cozinha (kitchen) route, and within it, MUST be able to update comanda-item delivery status (mark as delivered)
- **FR-005**: The sidebar menu MUST be dynamically filtered: only items the user's profile has permission to access are displayed
- **FR-006**: Direct URL access to restricted routes MUST be blocked — system MUST redirect the user to their home page (the default page for their profile) and/or display an access denied message
- **FR-007**: After login, Cozinha profile users MUST be redirected to `/cozinha` instead of `/home`
- **FR-008**: Only Administrador profile users MAY access the user management pages (list, register, edit users)
- **FR-009**: Only Administrador profile users MAY create or edit users with any profile (Atendente or Cozinha)
- **FR-010**: The backend MUST enforce profile-based access control on all protected endpoints, returning HTTP 403 when a user attempts an action outside their permitted scope
- **FR-011**: Backend endpoints related to user management (CRUD usuário) MUST be restricted to Administrador profile only
- **FR-012**: The frontend route guard (/main.js ionRouteDidChange) MUST check the user's profile in addition to the authentication flag
- **FR-013**: The user registration form MUST include the new Cozinha profile as an option
- **FR-014**: Backend JWT token MUST continue to include the `perfil` field in its payload for frontend consumption
- **FR-015**: System MUST refresh user profile data on each new login to ensure permissions reflect the latest profile assignment
- **FR-016**: The backend MUST prevent non-Administrador users from altering their own `perfil` field via any endpoint (self-profile change prevention)
- **FR-017**: The system MUST log sensitive actions to a persistent audit trail: user creation/deletion, profile changes, and record deletions — including the actor's user ID, action type, timestamp, and affected resource

### Key Entities

- **Usuário (User)**: Existing entity with `perfil` field (number). Current values: 0=Administrador, 1=Atendente. New value: 2=Cozinha. No structural changes needed — only new permitted value.
- **No new entities** are required. The access control relies on the existing `perfil` field in the JWT token and the user entity.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Administrador can see all 6 menu items and access all routes without restriction
- **SC-002**: Atendente sees exactly 4 menu items (Home, Produtos, Mesas, Comandas) and cannot access Usuários or Cozinha routes
- **SC-003**: Cozinha sees exactly 1 menu item (Cozinha) and is redirected to `/cozinha` upon login; cannot access any other route
- **SC-004**: Direct URL access to restricted routes returns a redirect or "Acesso negado" message in under 1 second
- **SC-005**: Backend returns HTTP 403 for unauthorized endpoint access
- **SC-006**: New users can be registered with any of the three profiles, but only by Administrators
- **SC-007**: Logout clears the cached profile so a different user login reflects the correct permissions

## Clarifications

### Session 2026-06-25

- Q: Quais operações CRUD o Atendente pode realizar em produtos e mesas? → A: Apenas leitura (visualizar listagem e detalhes). CRUD completo apenas em comandas.
- Q: A Cozinha pode modificar comanda-items? → A: Sim, apenas atualizar o status de entrega (marcar como entregue). Não pode criar ou excluir itens.
- Q: Um usuário não-Admin pode alterar o próprio perfil? → A: Não. O backend deve rejeitar qualquer alteração de perfil por usuários que não sejam Administradores, inclusive auto-alteração via PATCH /usuario/:id.
- Q: Deve haver logging de auditoria para ações sensíveis? → A: Sim. Registrar em log persistente: criação/alteração/exclusão de usuários, alteração de perfil e exclusão de registros, com ID do autor, ação, timestamp e recurso afetado.

## Security Audit Recommendations

The following security recommendations were identified during specification review and should be addressed during implementation:

- **Backend RolesGuard**: Implement a `@Roles()` decorator and `RolesGuard` to enforce profile-based access on every protected endpoint
- **Frontend XSS Prevention**: Replace `innerHTML` usage with safe DOM manipulation (`createElement` + `textContent`) or use DOMPurify sanitization
- **Profile validation**: Validate that `perfil` in create/update DTOs is within allowed range (0, 1, 2)
- **Token security**: Ensure `JWT_SECRET` is strong and unique per environment; consider short-lived access tokens with refresh tokens for production

## Assumptions

- The existing backend JWT auth guard will be extended with profile/role checking logic
- The existing menu in `Header.js` will be refactored to conditionally render items based on user profile
- The existing frontend route navigation guard in `main.js` will be extended to check profile permissions
- The Cozinha route (`/cozinha`) already exists from the previous spec (013) and contains the kitchen panel view
- Profile values remain as numbers (0, 1, 2) for backward compatibility with existing database records
- Existing Atendente users (perfil=1) will automatically have the correct permissions defined in this spec without data migration
- No database schema changes are required — only the `perfil` field's range of valid values expands
