# Error Response Contract

## Formato da Resposta de Erro (Backend → Frontend)

O backend retorna erros no seguinte formato JSON, consistente com o `GlobalExceptionFilter` atual:

```typescript
interface ErrorResponse {
  statusCode: number;   // Código HTTP (400, 401, 403, 404, 409, 500)
  message: string;      // Mensagem descritiva em português
  timestamp: string;    // ISO 8601
}
```

### Exemplos por Código

| Código | Cenário | `message` |
|--------|---------|-----------|
| 400 | Dados inválidos (validação) | `"Dados invalidos: dsc_produto: dsc_produto must be a string"` |
| 400 | Auto-exclusão | `"Você não pode excluir seu próprio usuário"` |
| 401 | Credenciais inválidas | `"Usuário ou senha inválidos"` |
| 401 | Token expirado/inválido | `"Token inválido ou expirado"` |
| 403 | Sem permissão | `"Acesso não autorizado"` |
| 404 | Recurso não encontrado | `"Produto com ID 999 não encontrado"` |
| 409 | Conflito (duplicidade) | `"Já existe um registro com este nome"` |
| 500 | Erro interno | `"Erro interno do servidor"` |

## Frontend → Usuário

O frontend mapeia os códigos HTTP para mensagens amigáveis:

```javascript
const ERROR_MESSAGES = {
  400: 'Dados inválidos. Verifique as informações e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Registro não encontrado.',
  409: 'Este registro já existe. Verifique os dados e tente novamente.',
  500: 'Erro interno. Tente novamente em alguns instantes.',
  NETWORK: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  TIMEOUT: 'A requisição excedeu o tempo limite. Verifique sua conexão.',
};
```

### Regras de exibição:
1. Usar `showToast(message, 'error', 5000)` para erros de operações (CRUD)
2. Usar `ion-alert` para erros de carregamento de listas
3. Erro 401 redireciona para `/login` (já implementado em `api.js`)
4. Exibir `error.message` do backend quando disponível e específico, senão usar mensagem genérica do mapeamento
