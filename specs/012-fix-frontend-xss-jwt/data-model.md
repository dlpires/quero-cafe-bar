# Data Model: Correções de Segurança no Frontend (XSS e JWT)

**Date**: 20/06/2026 | **Plan**: [plan.md](plan.md)

Nenhuma entidade nova no banco de dados. As únicas mudanças são no formato de transporte do JWT e no comportamento do frontend.

## Resposta do Endpoint GET /usuario/me

```typescript
{
  id: number;        // ID do usuário
  usuario: string;   // Nome de usuário (login)
  perfil: number;    // 0 = Admin, 1 = Waiter
}
```

## Cookie JWT

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| Nome | `token` | Nome do cookie |
| Valor | JWT string | Token assinado com JWT_SECRET |
| httpOnly | `true` (produção), `false` (dev local) | Inacessível via JavaScript |
| Secure | `true` (produção), `false` (dev local) | Apenas HTTPS |
| SameSite | `Strict` | Previne CSRF |
| MaxAge | 7200 (2h) | Expiração do token |
| Path | `/` | Disponível para toda a API |

## Fluxo de Autenticação (pós-mudança)

1. **Login**: Frontend envia POST `/usuario/login` → Backend valida credenciais → Retorna JWT no corpo da resposta E seta cookie httpOnly
2. **Requisições autenticadas**: Frontend envia `credentials: 'include'` → Backend lê JWT do cookie (fallback: header Authorization) → JwtAuthGuard valida → Request prossegue
3. **Logout**: Frontend chama POST `/usuario/logout` → Backend limpa o cookie (res.cookie com maxAge=0)
4. **Perfil do usuário**: Frontend chama GET `/usuario/me` → Backend retorna `{ id, usuario, perfil }` baseado no JWT do cookie
5. **Token expirado**: Backend retorna 401 → Frontend redireciona para `/login`
6. **Cross-tab sync**: Aba A faz logout → Backend limpa cookie → Aba A envia mensagem via BroadcastChannel → Aba B recebe e redireciona para `/login`
