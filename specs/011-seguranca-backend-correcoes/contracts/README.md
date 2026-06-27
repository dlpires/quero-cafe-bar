# Contratos de Interface — Correções de Segurança no Backend

## Visão Geral

As alterações de segurança **não modificam a assinatura dos endpoints da API**. Todos os paths, métodos, request/response bodies, e status codes de sucesso permanecem idênticos. As mudanças estão no comportamento de **autenticação** (proteção de rotas) e **segurança** (CORS, rate limiting, headers HTTP).

## Endpoints Protegidos por Autenticação

### Comportamento Anterior (inseguro)

Todas as rotas (inclusive CRUD de usuários, mesas, produtos, comandas) eram acessíveis sem qualquer token JWT.

### Novo Comportamento (corrigido)

| Rota | Método | Autenticação | Observação |
|------|--------|-------------|------------|
| `/usuario/login` | POST | ❌ Público | Única rota sem autenticação |
| `/usuario` | POST | ✅ JWT Obrigatório | Admin cria usuários |
| `/usuario` | GET | ✅ JWT Obrigatório | Lista usuários |
| `/usuario/:id` | GET | ✅ JWT Obrigatório | Detalhe usuário |
| `/usuario/:id` | PUT | ✅ JWT Obrigatório | Atualiza usuário |
| `/usuario/:id` | DELETE | ✅ JWT Obrigatório | Remove usuário |
| `/usuario/usuario/:usuario` | GET | ✅ JWT Obrigatório | Busca por username |
| `/produto/*` | ALL | ✅ JWT Obrigatório | CRUD produtos |
| `/mesa/*` | ALL | ✅ JWT Obrigatório | CRUD mesas |
| `/comanda/*` | ALL | ✅ JWT Obrigatório | CRUD comandas |
| `/comanda-item/*` | ALL | ✅ JWT Obrigatório | CRUD itens |
| `/` (health) | GET | ❌ Público | Health check sem info de versão |

### Respostas de Erro (Autenticação)

| Cenário | HTTP Status | Body |
|---------|-------------|------|
| Token ausente | `401 Unauthorized` | `{ "message": "Token não fornecido", "error": "Unauthorized", "statusCode": 401 }` |
| Token inválido/expirado | `401 Unauthorized` | `{ "message": "Token inválido ou expirado", "error": "Unauthorized", "statusCode": 401 }` |
| Token sem prefixo Bearer | `401 Unauthorized` | `{ "message": "Token não fornecido", "error": "Unauthorized", "statusCode": 401 }` |

### Header de Autenticação

**Request**:
```
Authorization: Bearer <jwt_token>
```

**Token JWT Payload**:
```json
{
  "id": 1,
  "perfil": 0,
  "iat": 1718726400,
  "exp": 1718733600
}
```

## Rate Limiting

### Endpoint de Login

| Cenário | HTTP Status | Body |
|---------|-------------|------|
| Até 10 req/min | `200` / `401` (normal) | Resposta normal |
| Após 10 req/min | `429 Too Many Requests` | `{ "message": "Too Many Requests", "statusCode": 429 }` |

## CORS

### Comportamento Anterior

```
Access-Control-Allow-Origin: *
```

### Novo Comportamento

| Ambiente | CORS_ORIGIN | Comportamento |
|----------|-------------|---------------|
| Desenvolvimento (sem env var) | Não definido | Apenas `http://localhost:5173` |
| Produção | `https://app.exemplo.com` | Apenas `https://app.exemplo.com` |
| Produção (múltiplas origens) | `https://app.exemplo.com,https://admin.exemplo.com` | Ambas as origens |

Headers de resposta:
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: <default>
```

## Headers de Segurança (Helmet)

Headers HTTP adicionados globalmente:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-XSS-Protection: 0
Content-Security-Policy: ...
```

## Health Check

### Comportamento Anterior

```json
{
  "name": "quero-cafe-bar",
  "version": "1.0.0",
  "description": "..."
}
```

### Novo Comportamento

```json
{
  "health": "ok",
  "timestamp": "2026-06-18T19:00:00.000Z"
}
```
