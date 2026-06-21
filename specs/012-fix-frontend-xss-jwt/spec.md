# Feature Specification: Correções de Segurança no Frontend (XSS e JWT)

**Feature Branch**: `012-fix-frontend-xss-jwt`

**Created**: 20/06/2026

**Status**: Draft

**Input**: Ações críticas e altas do relatório de auditoria de segurança (SAST) do frontend Ionic: eliminar vulnerabilidade de XSS via innerHTML e migrar armazenamento de JWT de localStorage para cookies httpOnly.

## User Scenarios & Testing

### User Story 1 - Administrador gerencia dados sem risco de XSS (Priority: P1)

Como administrador do sistema, quero que os dados cadastrados (produtos, usuários, mesas, comandas) sejam exibidos de forma segura, sem que scripts maliciosos embutidos nesses dados possam ser executados no navegador.

**Por que esta prioridade**: Qualquer pessoa que possa cadastrar dados (produtos, observações, etc.) pode inserir um payload XSS que roubará tokens de administradores ou modificará a interface para todos os usuários.

**Independent Test**: Pode ser testado cadastrando um produto com nome contendo `<img src=x onerror=alert('XSS')>` e verificando se ao visualizar a listagem o alerta NÃO é exibido e o texto é mostrado literalmente.

**Acceptance Scenarios**:

1. **Dado** que um usuário cadastra um produto com o nome `<script>alert('xss')</script>`, **Quando** a listagem de produtos é renderizada, **Então** o nome é exibido como texto literal `<script>alert('xss')</script>` sem executar o script
2. **Dado** que um usuário cadastra uma comanda com observação `<img src=x onerror=alert('xss')>`, **Quando** a comanda é visualizada na cozinha, **Então** a observação é exibida como texto literal sem executar o evento onerror
3. **Dado** que um administrador visualiza a lista de usuários, **Quando** um nome de usuário contém caracteres HTML especiais (`&<>`), **Então** esses caracteres são exibidos corretamente como texto escapado
4. **Dado** que um atacante tenta injetar HTML via campo de formulário, **Quando** o dado é enviado à API e posteriormente exibido, **Então** o HTML é tratado como texto seguro e não renderizado

---

### User Story 2 - Sessão do usuário protegida contra roubo via XSS (Priority: P1)

Como usuário autenticado, quero que meu token de sessão não possa ser roubado mesmo que um atacante consiga executar scripts na página.

**Por que esta prioridade**: Com a vulnerabilidade XSS (US1), um atacante pode executar `localStorage.getItem('token')` e enviar o token para um servidor externo, assumindo a sessão do usuário. Mover o token para cookie httpOnly impede esse ataque.

**Independent Test**: Pode ser testado verificando que após o login, o token JWT não está acessível via `localStorage.getItem('token')` e não pode ser lido por `document.cookie` (cookie marcado como httpOnly).

**Acceptance Scenarios**:

1. **Dado** que um usuário faz login com sucesso, **Quando** a resposta do login é processada, **Então** o token JWT é armazenado em um cookie httpOnly (não no localStorage) e não é acessível via JavaScript
2. **Dado** que um script malicioso tenta ler o token via `localStorage.getItem('token')`, **Quando** o token foi migrado para cookie, **Então** o JavaScript não encontra o token no localStorage
3. **Dado** que um script malicioso tenta ler `document.cookie`, **Quando** o cookie possui flag httpOnly, **Então** o cookie não é exposto ao JavaScript
4. **Dado** que um usuário faz logout, **Quando** a ação é confirmada, **Então** o cookie httpOnly é removido e a sessão é encerrada

---

### Edge Cases

- Token expirado: usuário com cookie httpOnly expirado deve ser redirecionado ao login ao tentar qualquer ação na API (tratado pelo 401 handler existente em api.js)
- Múltiplas abas: sincronização de logout entre abas via evento `storage` não funciona mais (cookies httpOnly não disparam storage event) — migrar para verificação periódica ou BroadcastChannel API
- Cache de Service Worker: requisições autenticadas com cookie devem ser tratadas corretamente pelo cache `networkFirst`
- ngrok e cookies cross-origin: cookies httpOnly com Secure exigem HTTPS — ambiente ngrok já usa HTTPS, mas ambiente dev local (localhost:3001) precisa de configuração adequada
- Perfil do usuário no frontend: com JWT em cookie httpOnly, `getLoggedUserId()` e `getLoggedUserProfile()` em util.js (que usam atob() sem verificação) não funcionam mais — frontend deve obter perfil via API

## Requirements

### Functional Requirements

- **FR-001**: System MUST render all user-provided text data as safe text, never interpreting HTML tags or entities
- **FR-002**: System MUST NOT use `innerHTML` to render any data retrieved from the API — all existing `innerHTML` assignments must be converted to `textContent` or DOM creation methods
- **FR-003**: Backend MUST set JWT token as an httpOnly, SameSite=Strict cookie in the login response. The Secure flag MUST be `true` in production (`NODE_ENV === 'production'`) and `false` in local development (HTTP, localhost) — use `secure: process.env.NODE_ENV === 'production'`
- **FR-004**: Frontend MUST stop storing or reading JWT from localStorage — all authenticated requests must rely on the httpOnly cookie sent automatically by the browser
- **FR-005**: Backend MUST read JWT from `request.cookies.token` as the primary source, with `Authorization: Bearer <token>` header as a fallback for testing and non-cookie environments. The JwtAuthGuard MUST check both locations, prioritizing the cookie.
- **FR-006**: Frontend logout MUST clear the JWT cookie via an API endpoint (since httpOnly cookies cannot be deleted by JavaScript)
- **FR-007**: Cross-tab session sync MUST still work after migrating to httpOnly cookies — use BroadcastChannel API or server-side token validation fallback
- **FR-008**: System MUST handle local dev environment (localhost, HTTP) with cookies that do NOT require Secure flag or domain restriction
- **FR-009**: Backend MUST expose an authenticated `GET /usuario/me` endpoint that returns the current user's id, perfil, and usuario name based on the JWT cookie
- **FR-010**: Frontend MUST replace `getLoggedUserId()` and `getLoggedUserProfile()` in `util.js` — instead of decoding JWT with atob(), call the `/usuario/me` API endpoint to obtain user identity and profile
- **FR-011**: Frontend MUST include a Content-Security-Policy meta tag in `index.html` to restrict script sources, style sources, and API connection origins as defense-in-depth against XSS

### Key Entities

No new entities. Changes affect existing auth flow:
- **JWT Token**: Migrated from localStorage to httpOnly cookie (backend-set) to prevent XSS-based theft
- **User Session**: Session lifecycle managed via cookie expiry instead of manual token handling on frontend

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can log in, navigate all pages, and perform all CRUD operations without any change in UX or behavior
- **SC-002**: After login, `localStorage.getItem('token')` returns null — token is not stored in JavaScript-accessible storage
- **SC-003**: No `innerHTML` assignment with API data remains in the codebase — all dynamic content rendering uses `textContent` or `document.createElement`
- **SC-004**: All 216 frontend tests continue to pass without modification
- **SC-005**: Logout clears server-side session and cookie is invalidated
- **SC-006**: Cross-tab logout sync still functions (user logging out in one tab is redirected to login in other tabs)
- **SC-007**: `getLoggedUserId()` and `getLoggedUserProfile()` no longer use atob() — user profile is obtained via `/usuario/me` API call
- **SC-008**: CSP meta tag is present in `index.html` and does not break existing functionality

## Clarifications

### Session 2026-06-20

- Q: M-01 (atob JWT decoding without verification) deve ser adicionado à spec? → A: Sim — criar endpoint /me no backend e substituir atob() por chamada API no frontend
- Q: M-02 (CSP ausente) deve ser adicionado à spec? → A: Sim — adicionar CSP meta tag no index.html como defense-in-depth

## Assumptions

- Backend already has JWT auth guard implemented (feature 011) and can be extended to set cookies
- Backend has `@nestjs/throttler`, `helmet`, and CORS restriction already in place (feature 011)
- The backend login route already returns a JWT token and can be modified to additionally set a cookie
- DOMPurify library can be added as a frontend dependency if sanitization is preferred over full DOM API migration
- The project uses httpOnly cookies in production (HTTPS) and non-httpOnly session cookies in local dev (HTTP)
- Frontend service worker (`sw.js`) will handle cookie-based auth correctly with `credentials: 'include'` on fetch requests
