# Quickstart: Correções de Segurança no Frontend (XSS e JWT)

## Pré-requisitos

- Node.js >= 18.x
- Yarn >= 1.22 (backend)
- npm >= 9.x (frontend)

## Passos para Implementação

### 1. Instalar Novas Dependências

```bash
# Backend
cd backend
yarn add cookie-parser
yarn add -D @types/cookie-parser

# Frontend
cd ../frontend
npm install dompurify
```

### 2. Backend: Adicionar cookie-parser ao main.ts

```typescript
// backend/src/main.ts
import * as cookieParser from 'cookie-parser';

// Após app.set(), antes de app.enableCors():
app.use(cookieParser());
```

### 3. Backend: Alterar login para setar cookie httpOnly

Em `backend/src/modules/usuario/usuario.controller.ts`:

```typescript
@Post('login')
@HttpCode(HttpStatus.CREATED)
@Throttle({ default: { limit: 10, ttl: 60000 } })
async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
  const result = await this.usuarioService.login(loginDto);

  // Setar cookie httpOnly
  response.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000, // 2h
    path: '/',
  });

  return result;
}
```

### 4. Backend: Criar endpoint GET /usuario/me

Em `backend/src/modules/usuario/usuario.controller.ts`:

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Request() req) {
  return this.usuarioService.findById(req.user.id);
}
```

### 5. Backend: Adaptar JwtAuthGuard para ler cookie

Em `backend/src/common/guards/jwt-auth.guard.ts`, modificar a extração do token para ler também do cookie:

```typescript
const authHeader = request.headers.authorization;
const cookieToken = request.cookies?.token;
const token = authHeader?.replace('Bearer ', '') || cookieToken;
```

### 6. Backend: Criar endpoint POST /usuario/logout

Em `backend/src/modules/usuario/usuario.controller.ts`:

```typescript
@Post('logout')
@UseGuards(JwtAuthGuard)
logout(@Res({ passthrough: true }) response: Response) {
  response.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return { message: 'Logout realizado com sucesso' };
}
```

### 7. Frontend: Remover localStorage JWT de api.js

Remover `setToken()`, `getToken()`, e qualquer referência a `localStorage` relacionada a token. Adicionar `credentials: 'include'` em todas as requisições.

### 8. Frontend: Substituir innerHTML por textContent (TODAS as páginas)

Para cada arquivo em `frontend/src/pages/*/*.js` e `frontend/src/shared/`:

- Identificar atribuições `innerHTML` que usam dados da API
- Substituir por `document.createElement()` + `textContent`
- Exceção: estruturas HTML fixas (sem interpolação de dados) podem manter innerHTML

### 9. Frontend: Substituir atob() por chamada /usuario/me

Em `frontend/src/shared/util.js`:

- Remover `getLoggedUserId()` e `getLoggedUserProfile()` que usam `atob()`
- Criar nova função assíncrona que chama `GET /usuario/me` e retorna { id, usuario, perfil }

### 10. Frontend: Adicionar CSP ao index.html

Adicionar meta tag CSP no `<head>` do `frontend/index.html`.

### 11. Frontend: Adicionar BroadcastChannel para sync entre abas

Em `frontend/src/services/auth.js`, adicionar:

```javascript
const channel = new BroadcastChannel('auth');
channel.onmessage = (event) => {
  if (event.data === 'logout') {
    logout();
  }
};

// No logout, notificar outras abas:
channel.postMessage('logout');
```

### 12. Rodar Testes

```bash
cd backend && yarn test          # 149 testes devem continuar passando
cd ../frontend && npm test       # 216 testes — podem precisar de ajustes no mock do token
cd ../backend && yarn lint       # ESLint + Prettier
```

## Verificação Manual

```bash
# 1. Verificar que login seta cookie
curl -v -X POST http://localhost:3001/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}' 2>&1 | grep Set-Cookie

# 2. Verificar /usuario/me com cookie
curl http://localhost:3001/usuario/me \
  -b "token=<token>"  # (substituir pelo token do login)

# 3. Verificar XSS - cadastrar produto com script e ver listagem
curl -X POST http://localhost:3001/produto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"dsc_produto":"<script>alert(1)</script>","vl_produto":10,"img_produto":"","status_produto":1}'

# Depois abrir o frontend e verificar que o script não executa

# 4. Verificar CSP presente
curl -I http://localhost:5173/ | grep Content-Security-Policy
```
