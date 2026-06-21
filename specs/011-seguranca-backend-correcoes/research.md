# Research — Correções de Segurança no Backend

## Descobertas Consolidadas

### 1. Guard de Autenticação JWT

**Decisão**: Criar `JwtAuthGuard` como guard global injetado em `main.ts` via `app.useGlobalGuards()`.

**Racional**: A auditoria C-01 confirma que todas as 20+ rotas estão desprotegidas. Um guard global evita esquecimento em controllers individuais. A rota de login (`POST /usuario/login`) é a única exceção — pode ser tratada com `@SkipAuth()` decorator customizado ou configurando o guard para ignorar rotas específicas via `SetMetadata`.

**Alternativas Consideradas**:
- `@UseGuards(JwtAuthGuard)` em cada controller individual — Rejeitado: propenso a erro humano em novos controllers.
- Middleware de função — Rejeitado: menos integrado com o ecossistema NestJS (DI, decorators).
- Interceptor — Rejeitado: Interceptors são mais adequados para transformação de response, não validação de request.

**Detalhes Técnicos**:
- Usar `jsonwebtoken.verify()` com `{ algorithms: ['HS256'] }` para prevenir algorithm confusion.
- Extrair token do header `Authorization: Bearer <token>`.
- Injetar payload decodificado no `request.user` para uso em controllers.
- Retornar `UnauthorizedException` com mensagens descritivas (PT-BR) para token ausente, inválido, ou expirado.

### 2. Substituir AES-256-CTR por bcrypt

**Decisão**: Migrar de `EncryptionTransformer` (AES-256-CTR) para bcrypt com salt rounds = 10.

**Racional**: AES é reversível — qualquer pessoa com a `ENCRYPTION_KEY` descriptografa todas as senhas (C-02). bcrypt é hash unilateral, padrão OWASP para armazenamento de senhas. O custo computacional (salt rounds 10) é aceitável para login (~100ms) e insignificante para cadastro.

**Alternativas Consideradas**:
- Argon2 — Rejeitado: exigiria dependência adicional (`argon2`) sem ganho significativo para este projeto educacional.
- Manter AES com GCM (M-02) — Rejeitado: ainda reversível, não resolve o problema fundamental.
- PBKDF2 — Rejeitado: bcrypt é mais resistente a ataques de GPU/ASIC.

**Estratégia de Migração**:
1. Adicionar campo temporário `senha_bcrypt` ou detectar formato na entidade.
2. No login, verificar formato: se AES antigo → converter para bcrypt na primeira autenticação bem-sucedida.
3. Após migração total (ou prazo definido), remover lógica de fallback AES.
4. Remover `EncryptionTransformer` da entity, `encryption.utils.ts` se não usado para outros fins.

**Detalhes Técnicos**:
- Instalar `bcrypt` (pacote npm nativo com bindings C++).
- Substituir `@Column({ type: 'varchar', transformer: new EncryptionTransformer() })` por `@Column()` simples.
- Em `usuario.service.ts`, usar `bcrypt.hash(senha, salt)` no create e `bcrypt.compare(senha, user.senha)` no login.
- Se `encryption.utils.ts` não for usado por outros módulos, remover o arquivo inteiro.

### 3. Remover Fallbacks Hardcoded de Secrets

**Decisão**: Substituir fallbacks `|| 'dev-secret-...'` por validação rigorosa com throw de erro.

**Racional**: C-03 classifica como crítico — fallbacks permitem que qualquer pessoa com acesso ao repositório forje tokens ou descriptografe senhas.

**Alternativas Consideradas**:
- Manter fallback apenas em dev — Rejeitado: `NODE_ENV` pode ser manipulada.
- Usar `ConfigModule` do NestJS — Rejeitado: mudança maior que o necessário; validação inline resolve.

**Detalhes Técnicos**:
- `usuario.controller.ts`: `const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not configured');`
- `encryption.utils.ts`: `const encryptionKey = process.env.ENCRYPTION_KEY; if (!encryptionKey || encryptionKey.length < 32) throw new Error(...)`
- Considerar validação no bootstrap (`main.ts` ou `app.module` lifecycle hook) para falhar rápido na inicialização.

### 4. Rate Limiting no Login

**Decisão**: Usar `@nestjs/throttler` com configuração global (10 req/min) e `@SkipThrottle()` para rotas não sensíveis.

**Racional**: C-04 — sem proteção, atacante pode realizar força bruta ilimitada. `@nestjs/throttler` é a solução oficial do NestJS, integrada com DI e decorators.

**Alternativas Consideradas**:
- `express-rate-limit` — Rejeitado: menos integrado com NestJS.
- Implementação manual com Redis — Rejeitado: complexidade desnecessária para o porte do projeto.

**Detalhes Técnicos**:
- Configurar globalmente em `app.module.ts` com `ttl: 60000, limit: 10`.
- Endpoint de login é o principal afetado; demais rotas podem ser excluídas com `@SkipThrottle()` se necessário.
- Armazenamento padrão (memória) é suficiente — não requer Redis.

### 5. Restringir CORS

**Decisão**: Substituir `origin: '*'` por `process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']`.

**Racional**: A-01 — CORS aberto expõe API a ataques CSRF e vazamento. Em produção, apenas domínios conhecidos devem ser permitidos.

**Alternativas Consideradas**:
- Manter `*` em dev e restringir em produção via `NODE_ENV` — Rejeitado: a variável de ambiente `CORS_ORIGIN` já resolve ambos os cenários de forma explícita.

**Detalhes Técnicos**:
- `credentials: true` para permitir cookies/sessões (futuro).
- `methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'` explícito.
- `optionsSuccessStatus: 204` para compatibilidade com navegadores legados.

### 6. Itens Adicionais (não prioritários)

#### Helmet
**Decisão**: Adicionar `helmet` como middleware global em `main.ts`.
**Racional**: B-01 — baixo esforço, alto impacto para headers de segurança HTTP (X-XSS-Protection, X-Frame-Options, etc.).

#### Logging SQL Condicional
**Decisão**: `logging: process.env.NODE_ENV === 'production' ? ['error'] : true`
**Racional**: M-03 — evita vazamento de dados em logs de produção.

#### Pool de Conexões
**Decisão**: Adicionar `extra: { connectionLimit: Number(process.env.MAX_CONNECTION_POOL_SIZE) || 10 }` ao `orm.config.ts`.
**Racional**: B-02 — variável já existe no `.env` mas não é lida.

#### Remover Pacote `crypto`
**Decisão**: Remover dependência `crypto: 1.0.1` do `package.json`.
**Racional**: M-04 — pacote obsoleto e desnecessário (módulo nativo do Node.js).
