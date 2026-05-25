# Feature Specification: Frontend Route Protection (Auth Guard)

**Feature Branch**: `002-proteger-rotas-frontend`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "Preciso agora estar protegendo as rotas do frontend, para que não acesse outras páginas sem estar logado no sistema."

## User Scenarios & Testing

### User Story 1 - Bloquear acesso não autenticado (Priority: P1)

Um usuário não logado (sem sessão válida) tenta acessar qualquer página do sistema que não seja a página de login — deve ser redirecionado automaticamente para o login, sem ver conteúdo ou realizar operações.

**Why this priority**: É a funcionalidade central — sem ela, o sistema não tem controle de acesso algum. Protege dados e impede uso não autorizado.

**Independent Test**: Abrir o navegador em uma janela anônima/privada, digitar diretamente a URL de qualquer página protegida (ex: `/home`, `/produtos`, `/comandas`, `/usuarios`, `/mesas`). O sistema deve redirecionar para `/login` e não exibir conteúdo protegido.

**Acceptance Scenarios**:

1. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar `/home` diretamente, **Then** o sistema redireciona para `/login` sem exibir conteúdo do Home.
2. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar `/produtos` diretamente, **Then** o sistema redireciona para `/login` sem exibir listagem de produtos.
3. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar `/usuarios` diretamente, **Then** o sistema redireciona para `/login` sem exibir listagem de usuários.
4. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar `/mesas` diretamente, **Then** o sistema redireciona para `/login` sem exibir listagem de mesas.
5. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar `/comandas` diretamente, **Then** o sistema redireciona para `/login` sem exibir listagem de comandas.
6. **Given** um usuário sem sessão autenticada, **When** ele tenta acessar qualquer rota de cadastro/edição (`/produto/register`, `/usuario/edit`, etc.), **Then** o sistema redireciona para `/login`.

---

### User Story 2 - Redirecionar usuário logado do login para Home (Priority: P2)

Um usuário já autenticado (com sessão ativa) acessa a página de login — deve ser redirecionado automaticamente para a página inicial (`/home`), pois já possui sessão ativa.

**Why this priority**: Melhora a experiência do usuário evitando que ele veja a tela de login desnecessariamente quando já está logado.

**Independent Test**: Fazer login normalmente, depois digitar manualmente a URL `/login` na barra de endereços. O sistema deve redirecionar para `/home`.

**Acceptance Scenarios**:

1. **Given** um usuário com sessão ativa, **When** ele acessa a tela de login, **Then** o sistema redireciona automaticamente para a tela inicial.
2. **Given** um usuário autenticado que recarrega a página estando na tela de login, **When** a página termina de carregar, **Then** o sistema redireciona para a tela inicial.

---

### User Story 3 - Proteção contra remoção do token durante uso (Priority: P2)

Um usuário que está navegando no sistema tem sua sessão invalidada (ex: expiração, logout em outra aba) — deve ser redirecionado para o login na próxima navegação ou interação.

**Why this priority**: Garante que a proteção não seja apenas no carregamento inicial, mas também durante o uso ativo da aplicação.

**Independent Test**: Fazer login, navegar para qualquer tela protegida, remover os dados de sessão, e então tentar navegar para outra tela via menu. O sistema deve redirecionar para login.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado navegando no sistema, **When** a sessão é invalidada e ele tenta navegar para outra tela via menu, **Then** o sistema redireciona para a tela de login.
2. **Given** um usuário autenticado, **When** uma requisição ao servidor retorna não autorizado, **Then** o sistema redireciona para `/login`.

---

### Edge Cases

- O que acontece quando a sessão expirou? O servidor rejeita a requisição, e o sistema redireciona para o login.
- O que acontece quando o token de sessão é inválido? O servidor rejeita e o sistema redireciona para o login.
- O que acontece se o usuário acessar a raiz (`/`)? O sistema redireciona para a página de login.
- O que acontece se o usuário acessar a rota de logout? O sistema redireciona para a página de login.

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE verificar se o usuário possui uma sessão válida antes de permitir acesso a qualquer funcionalidade protegida.
- **FR-002**: Sistema DEVE redirecionar usuários não autenticados para a página de login (`/login`) ao tentar acessar qualquer rota protegida.
- **FR-003**: Sistema DEVE redirecionar usuários autenticados da página de login (`/login`) para a página inicial (`/home`).
- **FR-004**: Sistema DEVE verificar a validade da sessão do usuário em cada acesso a tela protegida, impedindo exibição de dados e execução de operações quando não autenticado, através de guarda global de navegação e verificação no carregamento de cada página.
- **FR-005**: Sistema DEVE manter compatibilidade com o mecanismo de sessão existente no sistema.
- **FR-006**: Página de login DEVE ser a única rota publicamente acessível sem autenticação.

### Key Entities

- **Sessão do Usuário**: Representa a identidade do usuário autenticado no sistema. Estabelecida pelo backend após validação de credenciais.
- **Tela Protegida**: Qualquer tela do sistema que não seja a de login — requer sessão ativa para acesso.
- **Tela Pública**: Apenas a tela de login — acessível sem autenticação.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuários não autenticados são redirecionados para o login em menos de 1 segundo ao tentar acessar qualquer rota protegida.
- **SC-002**: Usuários autenticados acessando `/login` são redirecionados para `/home` sem perceber conteúdo da página de login.
- **SC-003**: Nenhuma operação do sistema é executada por telas protegidas quando o usuário não está autenticado.
- **SC-004**: 100% das rotas protegidas (excluindo `/login`) redirecionam corretamente usuários não autenticados — verificado por teste funcional em cada rota.
- **SC-005**: Nenhum conteúdo ou informação do sistema é inserido no DOM da página protegida antes da conclusão do redirecionamento para `/login`, verificado por teste de renderização condicional.

## Assumptions

- O sistema já possui um mecanismo de sessão que armazena as credenciais do usuário após o login.
- O sistema de navegação e menu existentes serão mantidos sem alterações estruturais.
- A tela de login já existe e funciona corretamente.
- O tratamento de respostas de sessão inválida vindo do servidor já existe e redireciona para o login — será mantido como complemento.
- Não há necessidade de controle de acesso por perfil (ex: administrador vs garçom) neste momento — apenas verificar se o usuário está autenticado ou não.
