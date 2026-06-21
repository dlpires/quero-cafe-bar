# Research: Correções de Segurança no Frontend (XSS e JWT)

**Date**: 20/06/2026 | **Plan**: [plan.md](plan.md)

## Research Questions

### 1. Como eliminar XSS via innerHTML em um projeto Ionic Vanilla JS?

**Decision**: Substituir `innerHTML` por `textContent` + `document.createElement()` para dados da API. Usar DOMPurify apenas se estruturas HTML complexas forem necessárias (ex: renderização de rich text).

**Rationale**: O projeto usa Ionic Web Components (Vanilla JS), não React/Vue. A abordagem mais segura e sem dependências é criar elementos DOM programaticamente com `document.createElement()` e popular com `textContent`. Isso é consistente com o padrão de componentes Web já utilizado no projeto.

**Alternatives considered**:
- DOMPurify: Boa opção, mas adiciona dependência externa. Melhor evitar se possível.
- innerHTML com sanitização manual: Propenso a erros, não recomendado.
- lit-html ou template libraries: Overhead desnecessário para o escopo do projeto.

### 2. Como migrar JWT de localStorage para cookie httpOnly?

**Decision**: 
- Backend: Usar `cookie-parser` + `res.cookie()` no login para setar cookie httpOnly com o JWT
- Frontend: Remover `localStorage.setItem/getItem/removeItem('token')`, enviar `credentials: 'include'` nas requisições
- Novas dependências: `cookie-parser` no backend

**Rationale**: Cookies httpOnly não são acessíveis via JavaScript, eliminando o vetor de roubo via XSS. O backend já possui o JwtAuthGuard (feature 011) que pode ser estendido para ler tanto do header Authorization quanto do cookie.

**Alternatives considered**:
- Session storage: Também vulnerável a XSS, não resolve o problema.
- In-memory storage: Perde o token ao recarregar a página, UX ruim.
- Service Worker storage: Complexo e não suportado em todos os navegadores.

### 3. Como implementar GET /usuario/me no backend?

**Decision**: Adicionar rota `GET /usuario/me` no `UsuarioController`, protegida pelo `JwtAuthGuard`. O método no service busca o usuário pelo `id` extraído do token JWT (já decodificado pelo guard e injetado em `request.user`).

**Rationale**: Reutiliza a lógica existente de autenticação JWT. O guard já decodifica o token e coloca o payload em `request.user`. Basta criar um controller method que retorna `{ id, perfil, usuario }`.

### 4. Como configurar CSP sem quebrar o Ionic?

**Decision**: 
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:3001 https://*.ngrok-free.dev;">
```

**Rationale**: O Ionic usa Shadow DOM com estilos inline, então `style-src 'unsafe-inline'` é obrigatório. `connect-src` precisa incluir a URL da API. `script-src 'self'` sem `'unsafe-inline'` já funciona pois os scripts são arquivos externos (Vite bundle).

### 5. Como sincronizar logout entre abas sem storage event?

**Decision**: Usar `BroadcastChannel` API para notificar outras abas sobre logout.

**Rationale**: Cookies httpOnly não disparam `storage` event. `BroadcastChannel` é uma API moderna que permite comunicação entre contextos de mesma origem. Alternativa: verificação periódica via `setInterval` no servidor (menos eficiente).

**Alternatives considered**:
- setInterval com HEAD request: Consome recursos de rede desnecessariamente.
- SharedWorker: Suporte limitado em navegadores mobile.
- Cookie polling: Complexo e ineficiente.
