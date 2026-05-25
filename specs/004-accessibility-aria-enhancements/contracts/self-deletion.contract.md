# Self-Deletion Protection Contract

## Visão Geral

Impede que um usuário exclua seu próprio registro, evitando bloqueio acidental do acesso ao sistema.

## Backend — Validação Server-Side

### Endpoint: `DELETE /usuario/:id`

**Validação adicional**: O backend deve extrair o `id` do token JWT e compará-lo com o `id` do parâmetro.

```typescript
// UsuarioController.remove — validação JWT
@Delete(':id')
async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = jwt.verify(token, process.env.JWT_SECRET) as { id: number };
  if (payload.id === id) {
    throw new BadRequestException('Você não pode excluir seu próprio usuário');
  }
  return await this.usuarioService.remove(id);
}
```

**Resposta quando auto-exclusão detectada**:
```json
{
  "statusCode": 400,
  "message": "Você não pode excluir seu próprio usuário",
  "timestamp": "2026-05-25T20:00:00.000Z"
}
```

## Frontend — Validação Client-Side

### Decodificação do JWT
```javascript
function getLoggedUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.id;
}
```

### Renderização do Botão
- Comparar `usuario.id` com `loggedUserId`
- Se iguais: desabilitar botão de excluir OU ignorar clique com toast explicativo
- Se diferentes: comportamento normal (botão habilitado + confirmação)

## Fluxo Completo

```
Usuário → clica Excluir
  ↓
Frontend: usuario.id === loggedUserId?
  ├── Sim → toast "Você não pode excluir seu próprio usuário" (sem chamar API)
  └── Não → confirmação → chama DELETE /usuario/:id
                        ↓
              Backend: payload.id === id?
                ├── Sim → 400 "Você não pode excluir seu próprio usuário"
                └── Não → 200 exclusão bem-sucedida
```
