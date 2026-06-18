# Data Model — Correções de Segurança no Backend

## Entidades Alteradas

### Usuario

| Campo | Tipo (Antigo) | Tipo (Novo) | Descrição |
|-------|---------------|-------------|-----------|
| `senha` | `varchar` c/ `EncryptionTransformer` (AES-256-CTR ciphertext) | `varchar` (bcrypt hash string) | Senha armazenada como hash bcrypt, prefixo `$2b$10$...` |

**Mudanças**:
- Removido `@Column({ type: 'varchar', transformer: new EncryptionTransformer() })`
- Substituído por `@Column()` simples — string já hashada pelo bcrypt
- Coluna no banco: `senha varchar(255)` (bcrypt hash tem ~60 caracteres)

**Estratégia de Migração**:
1. Criar migration que adiciona coluna temporária `senha_migrada` (varchar) ou converte in-place
2. No login, detectar formato AES (presença de `:` separando iv:authTag:ciphertext) vs bcrypt (prefixo `$2b$`)
3. Se AES antigo → autenticar normalmente → re-hash com bcrypt → salvar novo hash → remover registro AES antigo
4. Após período de transição, remover lógica de fallback AES e `EncryptionTransformer`

## Novas Entidades / Configurações

Nenhuma nova entidade de banco de dados. As seguintes configurações são alteradas em nível de código:

### Rate Limiting (ThrottlerModule)

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `ttl` | 60000 ms (1 minuto) | Janela de tempo do rate limit |
| `limit` | 10 requisições | Máximo de requisições por janela |
| Armazenamento | Memória (padrão) | Suficiente para single-instância |

### CORS

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `origin` | `process.env.CORS_ORIGIN?.split(',')` | Múltiplas origens separadas por vírgula |
| Fallback | `['http://localhost:5173']` | Usado se `CORS_ORIGIN` não definido |
| `credentials` | `true` | Permite cookies/sessões |
| `methods` | `GET,HEAD,PUT,PATCH,POST,DELETE` | Métodos HTTP permitidos |

### JWT

| Parâmetro | Valor (Antigo) | Valor (Novo) |
|-----------|----------------|--------------|
| Algoritmo | Não especificado (padrão HS256) | `HS256` (explícito) |
| Expiração | `24h` | `2h` |

### Logging ORM

| Parâmetro | Valor (Antigo) | Valor (Novo) |
|-----------|----------------|--------------|
| `logging` | `true` (todas queries) | `['error']` em produção, `true` em dev |
