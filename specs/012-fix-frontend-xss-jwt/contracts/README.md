# Contracts: Correções de Segurança no Frontend (XSS e JWT)

**Date**: 20/06/2026 | **Plan**: [plan.md](plan.md)

## GET /usuario/me

Busca o perfil do usuário autenticado baseado no JWT contido no cookie httpOnly (ou header Authorization).

### Request

```
GET /usuario/me
Cookie: token=<JWT>  (ou Authorization: Bearer <JWT>)
```

### Response (200 OK)

```json
{
  "id": 1,
  "usuario": "admin",
  "perfil": 0
}
```

### Response (401 Unauthorized)

```json
{
  "message": "Token não fornecido",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## POST /usuario/login (alterado)

Login agora também seta cookie httpOnly além de retornar token no corpo.

### Request

```
POST /usuario/login
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "admin"
}
```

### Response (201 Created)

```
Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=7200; Path=/
Content-Type: application/json

{
  "token": "<JWT>",
  "id": 1,
  "usuario": "admin",
  "perfil": 0
}
```

## POST /usuario/logout (novo)

Limpa o cookie de autenticação.

### Request

```
POST /usuario/logout
Cookie: token=<JWT>
```

### Response (200 OK)

```
Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/

{
  "message": "Logout realizado com sucesso"
}
```

## Frontend API Service (api.js) — Interface Alterada

### Antes

```javascript
setToken(token) {
  localStorage.setItem('token', token);
}

getToken() {
  return localStorage.getItem('token');
}

// Em toda requisição:
headers: { Authorization: `Bearer ${token}` }
```

### Depois

```javascript
// setToken() e getToken() removidos
// Nenhum localStorage envolvendo token

// Em toda requisição autenticada:
fetch(url, {
  credentials: 'include',  // Envia cookie httpOnly automaticamente
  headers: { 'Content-Type': 'application/json' }
})

// Fallback: manter compatibilidade com Authorization header
// para ambientes de teste que não usam cookie
```

## CSP Meta Tag

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               connect-src 'self' http://localhost:3001 https://*.ngrok-free.dev;">
```
