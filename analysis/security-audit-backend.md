# Relatório de Auditoria de Segurança (SAST) — Backend NestJS

**Data:** 21/05/2026  
**Escopo:** `backend/` (NestJS 11.x + TypeORM + MySQL)  
**Tipo:** Análise Estática de Segurança

---

## Resumo Executivo

| Severidade | Quantidade |
|------------|-----------|
| **Crítica** | 4 |
| **Alta** | 4 |
| **Média** | 4 |
| **Baixa** | 2 |
| **Total** | **14** |

---

## 🔴 Críticas

### C-01: Ausência Total de Guards de Autenticação/Autorização

| Campo | Detalhe |
|-------|---------|
| **Localização** | Todos os controllers: `usuario.controller.ts`, `comanda.controller.ts`, `mesa.controller.ts`, `produto.controller.ts`, `comanda-item.controller.ts` |
| **Arquivos** | `src/modules/*/*.controller.ts` |

**Descrição:** O JWT é gerado em `usuario.controller.ts:62-64` durante o login, mas **NUNCA é validado**. Não existe nenhum Guard (`@UseGuards()`), middleware ou interceptor que verifique o token JWT em nenhuma rota protegida. Todas as 20+ rotas da API (CRUD de usuários, mesas, produtos, comandas) são **totalmente públicas e acessíveis sem qualquer autenticação**. Qualquer pessoa pode criar, ler, atualizar ou deletar qualquer recurso.

**Sugestão de Correção:**
```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token não fornecido');

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] });
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}

// Aplicar globalmente em main.ts:
// app.useGlobalGuards(new JwtAuthGuard());
```

---

### C-02: Senhas Armazenadas com Criptografia Reversível (AES) em vez de Hashing

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/modules/usuario/entities/usuario.entity.ts:15-18` |
| **Arquivos** | `usuario.entity.ts`, `encryption.transformer.ts`, `encryption.utils.ts`, `usuario.service.ts:66-68` |

**Descrição:** As senhas são criptografadas com AES-256-CTR (algoritmo **reversível**), não hashadas (bcrypt/argon2). Isso significa:
- Qualquer pessoa com acesso à `ENCRYPTION_KEY` pode **descriptografar todas as senhas** do banco.
- A comparação de senha é feita **decifrando a senha armazenada** e comparando com o plaintext (`usuario.service.ts:66-68`), uma prática insegura.
- Se o banco de dados for comprometido, todas as senhas são recuperáveis.
- CTR mode não oferece **autenticação/integridade** — um atacante pode modificar o ciphertext sem ser detectado.

**Sugestão de Correção:**
```typescript
// Usar bcrypt para hashing em vez de EncryptionTransformer
import * as bcrypt from 'bcrypt';

// No service, durante create:
const salt = await bcrypt.genSalt(10);
const hashedSenha = await bcrypt.hash(createUsuarioDto.senha, salt);

// No login:
const user = await this.usuarioRepository.findOne({ where: { usuario } });
const senhaValida = await bcrypt.compare(senha, user.senha);
if (!senhaValida) throw new UnauthorizedException('Usuário ou senha inválidos');

// Remover EncryptionTransformer da entity
@Column()
senha: string;  // Sem transformer, string já hashada
```

---

### C-03: Fallback de Segredos Hardcoded no Código Fonte

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/modules/usuario/usuario.controller.ts:61` e `src/common/encryption/encryption.utils.ts:9` |

**Descrição:** Dois segredos críticos possuem fallback hardcoded no código fonte versionado:
- `usuario.controller.ts:61`: `process.env.JWT_SECRET || 'dev-secret-change-in-production'` — Se a variável de ambiente `JWT_SECRET` não for carregada, o JWT será assinado com `'dev-secret-change-in-production'`.
- `encryption.utils.ts:9`: `process.env.ENCRYPTION_KEY || 'default_secret_key_32_characters'` — Se `ENCRYPTION_KEY` não estiver setada, usa a string `'default_secret_key_32_characters'` como chave de criptografia.

Isso permite que qualquer pessoa que leia o repositório forje tokens JWT ou descriptografe senhas.

**Sugestão de Correção:**
```typescript
// usuario.controller.ts - lançar erro se não estiver configurado
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
}

// encryption.utils.ts - lançar erro se não estiver configurado
const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey || encryptionKey.length < 32) {
  throw new Error('ENCRYPTION_KEY deve ter no mínimo 32 caracteres');
}
const secretKey = Buffer.from(encryptionKey, 'utf8');
```

---

### C-04: Sem Proteção Contra Brute-Force no Login

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/modules/usuario/usuario.controller.ts:55-66` — Rota `POST /usuario/login` |

**Descrição:** O endpoint de login não possui nenhum mecanismo de rate limiting, account lockout ou atraso progressivo. Um atacante pode realizar ataques de força bruta/dicionário ilimitados contra senhas de usuários. Não há captcha, limitação por IP ou bloqueio após tentativas falhas.

**Sugestão de Correção:**
```bash
# Instalar: yarn add @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minuto
      limit: 10,    // máximo 10 requisições
    }]),
    // ... outros módulos
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

---

## 🟠 Altas

### A-01: CORS Totalmente Aberto (`origin: '*'`)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/main.ts:12-17` |

**Descrição:** `app.enableCors({ origin: '*' })` permite que qualquer domínio faça requisições à API. Em produção, isso expõe todos os endpoints a ataques CSRF e vazamento de dados para origins maliciosas. Combinado com a ausência de autenticação, qualquer site pode interagir com a API.

**Sugestão de Correção:**
```typescript
// src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

---

### A-02: Algoritmo JWT Não Explicitamente Definido (Algorithm Confusion)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/modules/usuario/usuario.controller.ts:62-64` |

**Descrição:** `jwt.sign({ id: user.id, perfil: user.perfil }, secret, { expiresIn: '24h' })` não especifica o algoritmo explicitamente. Embora o padrão seja HS256, a biblioteca `jsonwebtoken` é suscetível a ataques de confusão de algoritmo se um dia for adicionada verificação sem `algorithms`. Além disso, `expiresIn` está hardcoded como `'24h'` — um prazo muito longo para tokens de acesso.

**Sugestão de Correção:**
```typescript
const token = jwt.sign(
  { id: user.id, perfil: user.perfil },
  secret,
  {
    algorithm: 'HS256',
    expiresIn: '2h',   // reduzir para 2 horas
  },
);
```

---

### A-03: Informação de Versão Vazada no Health Check

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/app.service.ts:6-11` e `src/app.controller.ts:8-11` |

**Descrição:** A rota `GET /` (raiz) expõe o nome e versão da aplicação obtidos do `package.json`. Isso auxilia atacantes a identificar versões específicas de dependências com vulnerabilidades conhecidas.

**Sugestão de Correção:**
```typescript
// app.service.ts
getServiceHealthCheck(): any {
  return {
    health: 'ok',
    timestamp: new Date().toISOString(),
  };
}
```

---

### A-04: SSL/TLS Não Configurado para Conexão MySQL

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/config/orm.config.ts:8-19` |

**Descrição:** A configuração do TypeORM não especifica SSL para a conexão MySQL. Em ambientes de produção ou com banco remoto, os dados trafegam em texto puro entre a aplicação e o banco de dados, permitindo ataques man-in-the-middle.

**Sugestão de Correção:**
```typescript
// orm.config.ts
const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT,
  } : undefined,
  extra: {
    connectionLimit: Number(process.env.MAX_CONNECTION_POOL_SIZE) || 10,
  },
  // ...
};
```

---

## 🟡 Médias

### M-01: Endpoint de Busca por Username Permite Enumeração de Usuários

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/modules/usuario/usuario.controller.ts:43-48` — `GET /usuario/usuario/:usuario` |

**Descrição:** O endpoint `GET /usuario/usuario/:usuario` retorna 404 se o usuário existe e 404 se não existe (embora use a mesma mensagem, o simples fato do endpoint existir permite que um atacante confirme a existência de usuários). Combinado com a ausência de autenticação, qualquer pessoa pode enumerar todos os usuários do sistema.

**Sugestão de Correção:**
- Remover este endpoint ou protegê-lo com autenticação (`@UseGuards(JwtAuthGuard)`).
- Se o endpoint for necessário, retornar o mesmo status tanto para existência quanto para inexistência.

---

### M-02: AES-256-CTR sem Autenticação (Integridade)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/common/encryption/encryption.utils.ts:7` — algoritmo `aes-256-ctr` |

**Descrição:** O modo CTR (Counter) é um modo de cifra de fluxo que **não garante integridade**. Um atacante com acesso ao banco de dados pode modificar o ciphertext das senhas sem ser detectado. Para senhas, o ideal é hashing (bcrypt), mas se criptografia for necessária, deve-se usar `aes-256-gcm` que oferece autenticação integrada.

**Sugestão de Correção:**
```typescript
// encryption.utils.ts (se ainda assim quiser criptografar em vez de hashar)
const algorithm = 'aes-256-gcm';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (hash: string): string => {
  const [ivHex, authTagHex, encryptedHex] = hash.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Formato inválido');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
```

---

### M-03: Logging de SQL Ativado em Produção

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/config/orm.config.ts:18` — `logging: true` |

**Descrição:** Com `logging: true`, todas as queries SQL (incluindo dados sensíveis) são logadas no console. Em produção, isso pode vazar dados de usuários, senhas (criptografadas) e estrutura do banco para logs que podem ser acessados por operadores ou sistemas de terceiros.

**Sugestão de Correção:**
```typescript
// orm.config.ts
logging: process.env.DB_LOGGING === 'true' ? ['error', 'warn'] : ['error'],
// Ou desabilitar em produção:
// logging: process.env.NODE_ENV === 'production' ? ['error'] : true,
```

---

### M-04: Dependência `crypto` como Pacote npm (Obsoleto)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `package.json:34` — `"crypto": "1.0.1"` |

**Descrição:** O pacote npm `crypto` (versão 1.0.1) é um **pacote obsoleto** que contém apenas `require('crypto')` do Node.js. Ele não faz nada além de reexportar o módulo nativo. Isso é desnecessário e pode causar confusão, além de ser um vetor de supply chain se o pacote for maliciosamente atualizado. O Node.js já possui o módulo `crypto` nativo.

**Sugestão de Correção:**
```bash
yarn remove crypto
```
E alterar os imports em `encryption.utils.ts` de:
```typescript
import * as crypto from 'crypto';
```
(O módulo nativo do Node.js é carregado automaticamente sem necessidade de dependência)

---

## 🟢 Baixas

### B-01: Ausência de Helmet (Segurança de Headers HTTP)

| Campo | Detalhe |
|-------|---------|
| **Localização** | `src/main.ts` — middleware HTTP |

**Descrição:** Não há uso do middleware `helmet` para configurar headers de segurança HTTP como `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-XSS-Protection`, etc.

**Sugestão de Correção:**
```bash
yarn add helmet
```

```typescript
// main.ts
import helmet from 'helmet';
// ...
app.use(helmet());
```

---

### B-02: Tamanho do Pool de Conexões Não Aplicado à Configuração

| Campo | Detalhe |
|-------|---------|
| **Localização** | `.env:7` — `MAX_CONNECTION_POOL_SIZE=30` não utilizado em `orm.config.ts` |

**Descrição:** A variável `MAX_CONNECTION_POOL_SIZE=30` está definida no `.env` mas **nunca é lida** pela configuração do TypeORM. O pool de conexões usará o valor padrão do MySQL (geralmente 10), ou nenhum limite, o que pode causar exaustão de conexões.

**Sugestão de Correção:**
```typescript
// orm.config.ts
extra: {
  connectionLimit: Number(process.env.MAX_CONNECTION_POOL_SIZE) || 10,
},
```

---

## Checklist de Conformidade

| Requisito | Status | Observação |
|-----------|--------|------------|
| SQL Injection em queries TypeORM | ✅ **Ok** | Nenhuma query raw nos services |
| Mass Assignment Protection | ✅ **Ok** | `ValidationPipe` com `whitelist` + `forbidNonWhitelisted` |
| Guards de Autenticação | ❌ **Crítico** | Totalmente ausente |
| Guards de Autorização (RBAC) | ❌ **Crítico** | Totalmente ausente |
| CORS Restrito | ❌ **Alta** | `origin: '*'` |
| JWT com algoritmo explícito | ❌ **Alta** | Falta `algorithm: 'HS256'` |
| Hashing de senhas (bcrypt) | ❌ **Crítico** | Usa AES reversível |
| Rate Limiting / Brute Force | ❌ **Crítico** | Totalmente ausente |
| Helmet (HTTP headers) | ❌ **Baixa** | Não implementado |
| SSL/TLS no banco | ❌ **Alta** | Não configurado |
| Sanitização de erros | ✅ **Ok** | `GlobalExceptionFilter` adequado |
| .env no .gitignore | ✅ **Ok** | `.env` incluído no `.gitignore` |
| Secrets hardcoded no código | ❌ **Crítico** | Fallbacks em `usuario.controller.ts` e `encryption.utils.ts` |
| Pacote `crypto` obsoleto | ❌ **Média** | Remover dependência desnecessária |

---

## Pontos Fortes Identificados

- Uso de TypeORM com `ValidationPipe` configurado corretamente (`whitelist`, `forbidNonWhitelisted`, `transform`) previne SQL Injection e Mass Assignment.
- `GlobalExceptionFilter` sanitiza erros internos adequadamente sem vazar detalhes.
- `.gitignore` protege o `.env` de versionamento.
- Nenhuma query raw encontrada nos services — todo acesso a banco é feito via TypeORM Repository.

## Ação Prioritária Recomendada

1. Implementar Guards de autenticação JWT em todas as rotas
2. Substituir o EncryptionTransformer por bcrypt para hashing de senhas
3. Remover fallbacks hardcoded de secrets no código
4. Adicionar rate limiting ao endpoint de login
5. Restringir CORS para origins específicas em produção
