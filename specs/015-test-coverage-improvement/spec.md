# Feature Specification: Test Coverage Improvement

**Created**: 26/06/2026

**Status**: Draft

**Input**: Análise do relatório de cobertura de testes (`analysis/qa-test-improvement-plan.md`) — corrigir problemas críticos (P0) e altos (P1) de cobertura de testes no backend (NestJS) e frontend (Ionic + Vanilla JS).

## User Scenarios & Testing

### User Story 1 — Desenvolvedor valida autenticação JWT com testes automatizados (Priority: P0)

Como desenvolvedor, quero que o guard principal de autenticação (`JwtAuthGuard`) possua testes automatizados que cubram todas as variações de token (ausente, inválido, expirado) e fontes (header Authorization, cookie), para garantir que nenhuma regressão de segurança ocorra ao modificar o mecanismo de autenticação.

**Why this priority**: O `JwtAuthGuard` é o guard central de autenticação, usado por todas as rotas protegidas. Zero cobertura atual representa um risco de segurança crítico — qualquer alteração no guard pode quebrar a autenticação de todo o sistema sem ser detectada.

**Independent Test**: Executar suite de testes do `JwtAuthGuard` verificando que cada cenário (público, token ausente, token válido via header, token válido via cookie, token inválido, prioridade header sobre cookie) passa sem erros.

**Acceptance Scenarios**:

1. **Given** que o `JwtAuthGuard` recebe uma rota marcada como pública (`@Public()`), **When** `canActivate` é chamado, **Then** retorna `true` sem validar token
2. **Given** que uma requisição não possui token no header nem cookie, **When** `canActivate` é chamado em rota protegida, **Then** lança `UnauthorizedException`
3. **Given** que uma requisição possui token JWT válido no header `Authorization: Bearer <token>`, **When** `canActivate` é chamado, **Then** retorna `true` e o payload decodificado fica disponível na requisição
4. **Given** que uma requisição possui token JWT válido apenas no cookie, **When** `canActivate` é chamado, **Then** retorna `true` e o payload decodificado fica disponível na requisição
5. **Given** que uma requisição possui token JWT inválido ou expirado, **When** `canActivate` é chamado, **Then** lança `UnauthorizedException`
6. **Given** que uma requisição possui token tanto no header quanto no cookie, **When** `canActivate` é chamado, **Then** o token do header tem prioridade sobre o cookie
7. **Given** que o `JWT_SECRET` não está definido no ambiente, **When** `canActivate` é chamado, **Then** lança `UnauthorizedException`

---

### User Story 2 — Desenvolvedor verifica regras de negócio do módulo de usuários (Priority: P1)

Como desenvolvedor, quero que o `UsuarioService` tenha cobertura de testes sobre as novas regras de auditoria (`AuditService`) e auto-proteção de perfil, para garantir que ações sensíveis (criação, alteração de perfil, exclusão) sejam registradas e que um usuário não consiga se autopromover.

**Why this priority**: As regras de auditoria e auto-proteção de perfil foram adicionadas recentemente e a cobertura atual (72.97%) deixa lacunas em linhas críticas de negócio. Sem testes, uma alteração pode silenciosamente remover a auditoria de ações sensíveis.

**Independent Test**: Executar suite de testes do `UsuarioService` verificando que as chamadas ao `AuditService.log()` ocorrem nos momentos corretos e que `ForbiddenException`/`ConflictException` são lançadas nas condições adequadas.

**Acceptance Scenarios**:

1. **Given** que um usuário autenticado cria um novo usuário, **When** `create()` é chamado com `authenticatedUser`, **Then** um log de auditoria é registrado com tipo `CREATE`, recurso `usuario`, ID do recurso e dados do novo usuário
2. **Given** que um novo usuário é criado sem usuário autenticado (seed/anônimo), **When** `create()` é chamado sem `authenticatedUser`, **Then** nenhum log de auditoria é registrado
3. **Given** que um usuário não-Admin tenta alterar o próprio perfil, **When** `update()` é chamado com mesmo `id` do `authenticatedUser` e `perfil` diferente, **Then** lança `ForbiddenException` e nenhuma alteração é persistida
4. **Given** que um Admin altera o perfil de outro usuário, **When** `update()` é chamado com `perfil` diferente, **Then** a alteração é persistida e um log de auditoria é registrado com tipo `UPDATE`, incluindo `previousPerfil` e `newPerfil`
5. **Given** que um usuário tenta excluir a própria conta, **When** `remove()` é chamado com mesmo `id` do `authenticatedUser`, **Then** lança `ConflictException` e o registro não é removido
6. **Given** que um Admin exclui outro usuário, **When** `remove()` é chamado com `id` diferente do `authenticatedUser`, **Then** o registro é removido e um log de auditoria é registrado com tipo `DELETE`
7. **Given** que o campo `senha` é fornecido na atualização, **When** `update()` é chamado, **Then** a senha é criptografada com bcrypt antes de persistir

---

### User Story 3 — Desenvolvedor valida o ciclo de vida completo das páginas do frontend (Priority: P1)

Como desenvolvedor, quero que cada página do frontend (`ListProdutoPage`, `ListMesaPage`, `ListComandaPage`, `ListUsuarioPage`, `HomePage`, `LoginPage`) possua testes que executem o `connectedCallback` real (criando o custom element no DOM), para verificar que a página carrega dados da API, renderiza itens corretamente e trata erros com feedback visual.

**Why this priority**: Os testes atuais mockam as instâncias sem executar `connectedCallback`, resultando em cobertura real próxima de 0%. Isso significa que refatorações nas pages podem quebrar a renderização sem alerta.

**Independent Test**: Executar suite de testes de cada página verificando que o custom element é inserido no DOM, chama a API correspondente no `connectedCallback`, renderiza os dados retornados e exibe toast em caso de erro.

**Acceptance Scenarios**:

1. **Given** que uma página é inserida no DOM como custom element, **When** o `connectedCallback` é disparado, **Then** o método `loadPage` é chamado e a API correspondente é invocada
2. **Given** que a API retorna uma lista de registros, **When** a página renderiza os dados, **Then** os itens são criados com `document.createElement` (sem `innerHTML`) e exibidos no DOM com `textContent`
3. **Given** que a API retorna uma lista vazia, **When** a página renderiza, **Then** um estado vazio (`.empty-state`) é exibido
4. **Given** que a API lança um erro (falha de rede ou HTTP 500), **When** a página processa a resposta, **Then** um `ion-toast` com `color: "danger"` é exibido com a mensagem de erro
5. **Given** que a página contém uma lista de itens, **When** renderizada com dados mockados, **Then** o `textContent` de cada item contém o nome/descrição do registro (verificação contra XSS em `innerHTML`)

---

### User Story 5 — Desenvolvedor valida funções de autenticação do frontend (Priority: P2)

Como desenvolvedor, quero que o serviço de API (`api.js`) e as funções utilitárias (`util.js`) tenham cobertura de testes para os métodos de autenticação (`getMe`, `logout`, `getLoggedUser`, `getLoggedUserId`, `getLoggedUserProfile`), incluindo cache e navegação pós-logout, para garantir que o fluxo completo de login/logout funcione sem regressões.

**Why this priority**: Embora P2, estes módulos são dependências diretas de todas as páginas e do Header. Sem testes, alterações na camada de autenticação (ex: troca de cookie para header) podem quebrar o login/logout sem detecção.

**Independent Test**: Executar suites de `api.spec.js`, `util.spec.js` e `Header.spec.js` verificando chamadas de API, comportamento de cache, navegação e filtragem por perfil.

**Acceptance Scenarios**:

1. **Given** que `api.getMe()` é chamado com token válido, **When** a API retorna 200 com dados do usuário, **Then** retorna os dados do usuário logado
2. **Given** que `api.getMe()` é chamado sem token, **When** a API retorna 401, **Then** lança erro "Sessão expirada"
3. **Given** que `api.logout()` é chamado, **When** a API retorna 200, **Then** retorna mensagem de confirmação
4. **Given** que `getLoggedUser()` é chamado sem cache, **When** a API retorna dados, **Then** os dados são cacheados e retornados
5. **Given** que `getLoggedUser()` é chamado com cache populado, **When** a função é invocada novamente, **Then** retorna do cache sem chamar a API
6. **Given** que a API falha em `getLoggedUser()`, **When** a promise é rejeitada, **Then** retorna `null`
7. **Given** que `clearLoggedUserCache()` é chamado, **When** `getLoggedUser()` é invocado depois, **Then** recarrega dados da API
8. **Given** que `getLoggedUserId()` ou `getLoggedUserProfile()` são chamados, **When** `getLoggedUser()` retorna dados, **Then** extraem o campo correspondente; quando retorna `null`, retornam `null`
9. **Given** que `logout()` é chamado, **When** a API confirma, **Then** limpa `localStorage`, limpa cache e navega para `/login`
10. **Given** que `createHeader()` é chamado com `ion-nav` presente, **When** o menu é injetado, **Then** um `ion-menu` é criado sem duplicação
11. **Given** que o perfil do usuário é conhecido, **When** o menu é renderizado, **Then** apenas itens permitidos para o perfil são exibidos
12. **Given** que `createHeader()` é chamado para página de Login, **When** o header é gerado, **Then** não contém botão de menu nem ícone de logout

### User Story 4 — Desenvolvedor verifica tratamento de erros em endpoints do backend (Priority: P1)

Como desenvolvedor, quero que os serviços (`ProdutoService`, `AuditService`) tenham cobertura de testes para casos de borda — registro não encontrado, valores padrão em paginação — para garantir respostas HTTP consistentes (404, 200) independentemente dos dados.

**Why this priority**: A ausência de testes para `NotFoundException` em `ProdutoService` e para valores padrão em `AuditService.findAll()` pode levar a erros 500 inesperados em produção quando um ID inexistente é fornecido ou quando a paginação é omitida.

**Independent Test**: Executar suite de testes dos serviços verificando que `NotFoundException` é lançada ao atualizar/excluir registros inexistentes e que `AuditService.findAll()` usa valores padrão corretos.

**Acceptance Scenarios**:

1. **Given** que um produto com ID inexistente é solicitado para atualização, **When** `update()` é chamado, **Then** lança `NotFoundException`
2. **Given** que um produto com ID inexistente é solicitado para exclusão, **When** `remove()` é chamado, **Then** lança `NotFoundException`
3. **Given** que `findAll()` do `AuditService` é chamado sem parâmetros, **When** a consulta é executada, **Then** usa `skip: 0` e `take: 50` como padrão
4. **Given** que `findAll()` do `AuditService` é chamado com parâmetros explícitos, **When** a consulta é executada, **Then** usa os parâmetros fornecidos
5. **Given** que não existem logs de auditoria, **When** `findAll()` é chamado, **Then** retorna lista vazia e total 0

---

### Edge Cases

- Token JWT sem o prefixo "Bearer " no header: rejeitar com `UnauthorizedException`
- Cookie `token` presente mas com valor vazio: tratar como token ausente
- Múltiplos tokens no header `Authorization` (ex: dois headers): usar o primeiro
- Usuário autenticado mas sem propriedade `id`: `AuditService.log()` não deve quebrar
- `UsuarioService.update()` com DTO vazio (sem campos para alterar): persistir sem alterações, sem chamar bcrypt nem auditoria
- Páginas do frontend com perfil de acesso restrito (ex: Cozinha tentando acessar `/usuarios`): verificar que a página não carrega dados e redireciona
- Páginas do frontend com `api` retornando status HTTP 401: redirecionar para `/login`
- `getLoggedUser()` com cache expirado: recarregar dados da API
- `logout()` quando `api.logout()` falha (rejeita promise): ainda deve limpar sessão local e redirecionar

## Requirements

### Functional Requirements

- **FR-001**: The `JwtAuthGuard` test suite MUST cover: public routes, missing token, valid token via header, valid token via cookie, invalid/expired token, header priority over cookie, and missing `JWT_SECRET` environment variable
- **FR-002**: The `UsuarioService` test suite MUST cover audit logging on `create()`, `update()`, and `remove()` when an `authenticatedUser` is provided, and MUST verify no audit log is created when `authenticatedUser` is absent
- **FR-003**: The `UsuarioService` test suite MUST cover self-profile-change prevention (non-Admin user updating own `perfil` throws `ForbiddenException`)
- **FR-004**: The `UsuarioService` test suite MUST verify that password updates use bcrypt hashing before persisting
- **FR-005**: The `UsuarioService` test suite MUST verify self-deletion prevention (user deleting own account throws `ConflictException`)
- **FR-006**: Each frontend page (`ListProdutoPage`, `ListMesaPage`, `ListComandaPage`, `ListUsuarioPage`, `HomePage`, `LoginPage`) MUST have tests that create the custom element and verify `connectedCallback` triggers the API call
- **FR-007**: Each frontend page test suite MUST verify that `loadPage` renders items using DOM API (`createElement` + `textContent`), not `innerHTML`
- **FR-015**: The `Header.js` and `util.js` `createEmptyState` function MUST be refactored to use DOM API (`createElement` + `textContent` + `appendChild`) instead of `innerHTML`
- **FR-016**: The `Header.spec.js` test suite MUST verify that menu items are rendered using DOM API and do not contain `innerHTML` patterns
- **FR-017**: The `util.spec.js` test suite MUST verify that `createEmptyState` renders using DOM API without `innerHTML`
- **FR-018**: The `api.spec.js` test suite MUST cover `getMe()` happy path (200) and error path (401), and `logout()` happy path
- **FR-019**: The `util.spec.js` test suite MUST cover `getLoggedUser()` with cache miss, cache hit, API failure, and `clearLoggedUserCache()`
- **FR-020**: The `util.spec.js` test suite MUST cover `getLoggedUserId()` and `getLoggedUserProfile()` return values for both success and failure scenarios
- **FR-021**: The `util.spec.js` test suite MUST cover `logout()` async flow: calls `api.logout()`, clears `localStorage`, clears cache, navigates to `/login`
- **FR-022**: The `Header.spec.js` test suite MUST cover menu injection with `ion-nav`, duplicate menu prevention, profile-based filtering (admin, waiter, undefined), and Login page header without menu button
- **FR-023**: The `_cachedUser` in `util.js` MUST have a TTL (time-to-live) of 5 minutes, after which `getLoggedUser()` MUST re-fetch data from the API
- **FR-024**: The `util.spec.js` test suite MUST verify that cached user data expires after the TTL and that a subsequent call to `getLoggedUser()` triggers a new API request
- **FR-025**: The `logout()` function in `util.js` MUST remove the residual `user_perfil` key from `localStorage`, and the test suite MUST verify that only expected keys (`logged_in`, `user_perfil`) are cleaned upon logout
- **FR-008**: Each frontend page MUST verify that empty API responses render an empty state (`.empty-state`)
- **FR-009**: Each frontend page MUST verify that API errors display a danger `ion-toast`
- **FR-010**: The `ProdutoService` test suite MUST cover `NotFoundException` when updating or deleting non-existent products
- **FR-011**: The `AuditService` test suite MUST cover `findAll()` default parameter values (`skip: 0`, `take: 50`)
- **FR-012**: All test suites MUST achieve the following minimum coverage targets: Backend Statements ≥85%, Backend Branches ≥70%, Backend Functions ≥85%; Frontend Statements ≥70%, Frontend Branches ≥60%, Frontend Functions ≥65%
- **FR-013**: The `jwt-auth.guard.spec.ts` file MUST achieve 100% statement and branch coverage
- **FR-014**: All existing test suites MUST continue to pass after new tests are added (no regressions)

### Key Entities

- **JwtAuthGuard** (`common/guards/jwt-auth.guard.ts`): Guard de autenticação global. Nenhuma alteração na entidade — apenas cobertura de testes.
- **UsuarioService** (`modules/usuario/usuario.service.ts`): Serviço de gerenciamento de usuários com auditoria. Testes devem cobrir as novas linhas de auditoria e permissões.
- **ProdutoService** (`modules/produto/produto.service.ts`): Serviço de produtos. Testes de borda para registros inexistentes.
- **AuditService** (`modules/audit/audit.service.ts`): Serviço de auditoria. Testes de branch coverage para `findAll()` com valores padrão.
- **Frontend Pages** (`pages/*/`): Cada página é um custom element. Testes devem executar o ciclo de vida real (connectedCallback).
- **api.js** (`services/api.js`): Serviço singleton de API com métodos `getMe()` e `logout()`.
- **util.js** (`shared/util.js`): Funções utilitárias assíncronas `getLoggedUser()`, `getLoggedUserId()`, `getLoggedUserProfile()`, `logout()`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `JwtAuthGuard` test suite achieves 100% statement and branch coverage with all 7 scenarios passing
- **SC-002**: `UsuarioService` achieves ≥85% statement coverage, covering all audit log calls and profile protection rules
- **SC-003**: Each frontend page (6 pages) has a test suite that executes `connectedCallback` and verifies API calls, rendering, empty state, and error handling
- **SC-004**: Backend overall statement coverage rises from 69.22% to ≥85%
- **SC-005**: Backend branch coverage rises from 40.42% to ≥70%
- **SC-013**: Backend function coverage rises from 65.46% to ≥85%
- **SC-014**: Frontend function coverage rises from 19.19% to ≥65%
- **SC-006**: Frontend overall statement coverage rises from 10.31% to ≥70%
- **SC-007**: Frontend branch coverage rises from 19.82% to ≥60%
- **SC-008**: No regressions — all existing 163 backend tests and 221 frontend tests continue to pass
- **SC-009**: `ProdutoService` and `AuditService` achieve 100% branch coverage for their `findAll()` and `remove()`/`update()` methods
- **SC-010**: `api.spec.js` achieves 100% coverage of `getMe()` and `logout()` method behavior
- **SC-011**: `util.spec.js` achieves ≥90% coverage covering all async auth functions, cache behavior, and logout navigation
- **SC-012**: `Header.spec.js` achieves ≥90% coverage covering menu injection, deduplication, profile filtering, and Login page header

## Assumptions

- Existing test infrastructure (Jest, TestingModule, mocks) is adequate — no new testing frameworks are needed
- The test patterns proposed in `analysis/qa-test-improvement-plan.md` are the reference implementation approach
- Backend tests use `@nestjs/testing` `Test.createTestingModule` pattern
- Frontend tests use `document.createElement` with Custom Elements registry for page lifecycle testing
- `api.js` and `util.js` tests use `jest.mock` for dependency isolation
- The coverage thresholds (≥85% backend statements, ≥70% frontend statements) are measured by Jest's `--coverage` flag with Istanbul/LCOV reporter
- All new tests are placed alongside their source files following the existing `*.spec.*` naming convention

## Clarifications

### Session 2026-06-26

- Q: Deve incluir refatoração de `innerHTML` residual em `Header.js` e `util.js:createEmptyState`? → A: Sim. Ambos devem ser refatorados para `createElement` + `textContent` + `appendChild`, com testes que verifiquem a ausência de `innerHTML`, alinhado com as correções XSS dos commits recentes.
- Q: Deve incluir `api.spec.js`, `util.spec.js` e `Header.spec.js` (P2) no escopo? → A: Sim. Os três devem ser incluídos no escopo desta spec, com cobertura completa dos métodos de autenticação assíncronos, cache, navegação pós-logout e filtragem de menu por perfil.
- Q: Deve adicionar TTL ao cache `_cachedUser`? → A: Sim. Adicionar TTL de 5 minutos para expiração automática do cache, evitando perfil desatualizado entre abas sem complexidade adicional.
- Q: Deve incluir metas de cobertura de Functions no Success Criteria? → A: Sim. Adicionar Backend Functions ≥85% e Frontend Functions ≥65% no Success Criteria, consistentes com FR-012 e as métricas alvo do plano de análise.
- Q: Deve remover a chave residual `user_perfil` do `localStorage` no logout? → A: Sim. Remover a linha residual e adicionar teste que verifica a limpeza de chaves no logout.
