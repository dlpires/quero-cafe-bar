# Quickstart — Correções de Segurança no Backend

## Pré-requisitos

- Node.js >= 18.x
- Yarn >= 1.22
- MySQL 8.x rodando

## Passos para Implementação

### 1. Instalar Novas Dependências

```bash
cd backend
yarn add @nestjs/throttler bcrypt helmet
yarn add -D @types/bcrypt
yarn remove crypto
```

### 2. Criar JwtAuthGuard

Arquivo: `src/common/guards/jwt-auth.guard.ts`

Guard global que valida token JWT em todas as rotas (exceto login). Usa `jsonwebtoken.verify()` com algoritmo HS256 explícito.

### 3. Aplicar Guard + CORS + Helmet em `main.ts`

- Adicionar `app.useGlobalGuards(new JwtAuthGuard())`
- Substituir `app.enableCors({ origin: '*' })` por configuração baseada em `CORS_ORIGIN`
- Adicionar `app.use(helmet())`

### 4. Configurar Rate Limiting em `app.module.ts`

Adicionar `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])` aos imports e `APP_GUARD: ThrottlerGuard` aos providers.

### 5. Substituir AES por bcrypt em `usuario.module.ts` e `usuario.service.ts`

- Instalar `bcrypt`
- Em `usuario.service.ts`: criar/registrar: `const hashed = await bcrypt.hash(senha, 10)`
- Em `usuario.service.ts`: login: `const valida = await bcrypt.compare(senha, user.senha)`
- Remover `EncryptionTransformer` da entity `usuario.entity.ts`
- Se não usado por outros módulos, remover `src/common/encryption/` inteiro

### 6. Remover Fallbacks Hardcoded

- `usuario.controller.ts`: Substituir `process.env.JWT_SECRET || 'dev-secret-...'` por validação com throw
- `encryption.utils.ts`: Substituir `process.env.ENCRYPTION_KEY || 'default_...'` por validação com throw

### 7. Ajustar Configurações Adicionais

- `orm.config.ts`: `logging` condicional por ambiente
- `orm.config.ts`: `extra.connectionLimit` lendo `MAX_CONNECTION_POOL_SIZE`
- `orm.config.ts`: `ssl` condicional por `DB_SSL`

### 8. Gerar Migration

```bash
yarn make:migration MigratePasswordToBcrypt
yarn migrate
```

### 9. Configurar Seed de Admin Padrão

Adicione ao `.env` para ativar o seed automático do administrador padrão:

```bash
SEED_ADMIN=true
```

> ⚠️ **Apenas na primeira execução pós-migration**. Após criar o admin, a flag pode ser removida ou mantida (o seed é idempotente).

### 10. Rodar Testes

```bash
yarn test          # 163 testes existentes devem continuar passando
yarn test:cov      # Verificar cobertura
yarn lint          # ESLint + Prettier
```

## Verificação Manual

```bash
# Testar rota sem token (deve retornar 401)
curl http://localhost:3001/usuario

# Testar login
curl -X POST http://localhost:3001/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}'

# Testar rota com token válido
curl http://localhost:3001/usuario \
  -H "Authorization: Bearer <token>"

# Testar rate limit
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3001/usuario/login \
    -H "Content-Type: application/json" \
    -d '{"usuario":"admin","senha":"errada"}'
done
# 11ª requisição deve retornar 429

# Verificar headers de segurança
curl -I http://localhost:3001/
# Deve conter X-Content-Type-Options, X-Frame-Options, etc.

# Verificar seed do admin padrão
# (após iniciar com SEED_ADMIN=true e banco vazio)
curl -X POST http://localhost:3001/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin"}'
# Deve retornar 201 com token JWT
```
