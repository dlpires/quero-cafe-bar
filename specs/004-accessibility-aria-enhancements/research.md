# Research: Acessibilidade e ARIA — Fase 2

## 1. ARIA Labels em Botões de Ícone

**Decision**: Adicionar `aria-label` descritivo em todos os botões de ícone puro. Ícones decorativos emparelhados com texto visível receberão `aria-hidden="true"`.

**Rationale**:
- Zero atributos ARIA existentes no código frontend (confirmado por auditoria em 19 arquivos `.js`)
- 14 botões icon-only identificados (4 edit, 5 delete, 1 logout, 4 FAB add) sem qualquer label acessível
- ~38 ícones decorativos sem `aria-hidden` (menu, header, input icons, button icons, empty-state, status icons)
- WCAG critérios 2.5.3 (Label in Name) e 4.1.2 (Name, Role, Value) exigem que todo elemento interativo tenha nome acessível

**Alternatives considered**:
- `title` attribute: rejeitado porque não é consistentemente anunciado por leitores de tela
- `tooltip` via CSS: rejeitado por não ser acessível por teclado
- `aria-labelledby`: rejeitado por complexidade desnecessária quando o label é estático

**Files affected**: `Header.js`, `LoginPage.js`, `util.js`, `ListProdutoPage.js`, `ListUsuarioPage.js`, `ListMesaPage.js`, `ListComandaPage.js`, `UpdateComandaPage.js`, `HomePage.js`, mais todas as páginas Reg/Update com botões de formulário.

---

## 2. Gerenciamento de Foco

**Decision**: Chamar `focusFirstElement()` no `connectedCallback` de todas as páginas para posicionar o foco no primeiro elemento interativo. Centralizar a lógica de foco pós-navegação em `util.js`.

**Rationale**:
- `focusFirstElement()` já existe em `shared/util.js` com 4 testes unitários, mas só é chamado após validação falhar
- Nenhuma página gerencia foco ao carregar ou ao navegar de volta
- WCAG 2.4.3 (Focus Order) exige ordem de foco significativa
- `router.push(path, 'root')` não reposiciona foco automaticamente
- `window.addEventListener('urlChanged')` no `ion-router` pode ser usado como hook para foco pós-navegação

**Alternatives considered**:
- `autofocus` HTML: rejeitado porque não funciona em Web Components Ionic de forma confiável
- Foco manual em `componentWillLoad`: rejeitado porque páginas usam `connectedCallback`, não ciclo de vida Stencil
- `ion-nav` `viewWillEnter`: rejeitado porque as páginas atuais não implementam este hook

**Implementation plan**:
1. Adicionar `this.focusFirstElement()` ao final de cada `connectedCallback`
2. Registrar listener de `urlChanged` nas list pages para foco ao retornar de formulários
3. Substituir `window.location.href` no logout/401 por `router.push` para preservar contexto de foco

---

## 3. Mensagens de Erro Contextuais

**Decision**: Melhorar `api.js` para categorizar erros por código HTTP e retornar mensagens específicas. Atualizar pages para usar a mensagem do erro em vez de mensagens fixas. Adicionar tratamento de 409 (Conflict) no backend.

**Rationale**:
- `api.js` só diferencia 401 e AbortError; todo o resto usa fallback genérico
- 100% das páginas usam mensagens de erro fixas, ignorando a `message` real do backend
- Backend não lança `ConflictException` (409) em nenhum cenário (ex.: tentativa de cadastro duplicado)
- WCAG 3.3.1 (Error Identification) exige que erros sejam identificados claramente
- Heurística Nielsen #9 (Help Users Recognize, Diagnose, and Recover from Errors)

**Alternatives considered**:
- Mensagens de erro no backend em português vs inglês: decisão de manter português (consistente com o restante do sistema)
- Toast vs Alert para erros: manter toast (já usado em 8 pages) mas padronizar uso de `showToast()` do `util.js`

**Implementation plan**:
1. Adicionar mapeamento HTTP → mensagem amigável em `api.js` (400, 401, 403, 404, 409, 500, timeout, network)
2. Fazer pages exibirem `error.message` em vez de mensagens fixas
3. Adicionar `ConflictException` nos services onde duplicidade pode ocorrer (usuário, produto)
4. Consolidar uso de `showToast()` substituindo `ion-toast` manual na HomePage e UpdateComandaPage

---

## 4. Proteção Contra Auto-exclusão

**Decision**: Validar auto-exclusão no backend comparando `id` do parâmetro com `id` do token JWT. No frontend, desabilitar o botão de excluir para o próprio usuário e exibir mensagem específica.

**Rationale**:
- Não há proteção atual em nenhuma camada (frontend nem backend)
- Backend não tem guards, middlewares ou extração de JWT em nenhum endpoint
- JWT contém `{ id, perfil }` mas nunca é decodificado no frontend (só verifica `!!token`)
- Risco operacional: admin pode remover acidentalmente seu próprio acesso
- Solução mais segura e simples: validação server-side com extração JWT; validação client-side como bônus UX

**Alternatives considered**:
- Validar apenas no frontend: rejeitado — usuário malicioso pode chamar API diretamente
- Validar apenas no backend: aceito como mínimo, mas UI também será adaptada
- Remover usuário e recriar sessão: rejeitado — complexidade desnecessária, bloquear é mais seguro

**Implementation plan**:
1. Backend: extrair `id` do JWT via `jwt.verify()` no `UsuarioController.remove()`; comparar com `:id`; lançar `BadRequestException` se forem iguais
2. Frontend: decodificar JWT com `jwt_decode` (ou `JSON.parse(atob(token.split('.')[1]))`) para obter `id` do usuário logado
3. Frontend: comparar `usuario.id` com `loggedUserId` no render; se iguais, desabilitar botão ou ignorar clique com toast explicativo

---

## 5. Confirmação ao Cancelar Formulários

**Decision**: Implementar detecção de formulário sujo (dirty) comparando valores iniciais com atuais. Exibir `ion-alert` de confirmação apenas se houver alterações.

**Rationale**:
- Nenhuma página tem confirmação ao cancelar — todas navegam imediatamente
- Nenhuma página rastreia estado inicial do formulário
- Heurística Nielsen #3 (User Control and Freedom): usuário deve poder desfazer ações facilmente
- Especificação FR-006 e FR-007 definem comportamento específico

**Alternatives considered**:
- `beforeunload` event: rejeitado — não funciona em SPA com Ionic Router
- Salvamento automático (auto-save): rejeitado — complexidade excessiva para P3
- Sempre perguntar: rejeitado — FR-007 exige que formulários sem alterações naveguem sem confirmação

**Implementation plan**:
1. Armazenar `initialValues` (serialização dos campos) em cada página de formulário
2. Ao clicar Cancelar, comparar valores atuais com `initialValues`
3. Se diferente, exibir `ion-alert` com "Tem certeza? Os dados não salvos serão perdidos."
4. Se igual, navegar diretamente sem confirmação
5. Criar helper `hasFormChanges(container, initialData)` em `util.js`
