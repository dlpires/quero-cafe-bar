# Implementation Plan: Correções de Segurança no Backend

**Branch**: `011-seguranca-backend-correcoes` | **Date**: 18/06/2026 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-seguranca-backend-correcoes/spec.md`

## Summary

Implementar as 5 ações prioritárias do relatório de auditoria de segurança (SAST) no backend NestJS: guards JWT em todas as rotas, substituição do EncryptionTransformer (AES reversível) por bcrypt para hashing de senhas, remoção de fallbacks hardcoded de secrets, rate limiting no endpoint de login, e restrição de CORS para origins específicas.

## Technical Context

**Language/Version**: TypeScript 5.x (NestJS 11.x)

**Primary Dependencies**: `@nestjs/jwt` (ou `jsonwebtoken`), `bcrypt`, `@nestjs/throttler`, `helmet`

**Storage**: MySQL 8.x via TypeORM (senha armazenada como hash bcrypt string)

**Testing**: Jest (suporte existente no projeto — 163 testes)

**Target Platform**: Node.js 18+ (servidor Linux/Windows)

**Project Type**: Web API (NestJS backend)

**Performance Goals**: Middleware de autenticação JWT < 5ms por requisição; rate limiting com overhead < 1ms

**Constraints**: Tokens JWT expiram em 2h (alterado de 24h). Rate limit: 10 req/min no login. CORS restrito por env var.

**Scale/Scope**: Apenas backend — sem alterações no frontend. Todos os controllers atuais (`usuario`, `produto`, `mesa`, `comanda`, `comanda-item`) são afetados pela adição do guard global.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — All endpoints MUST be defined via contracts/DTOs before implementation begins
   - ✅ **PASS**: Nenhum novo endpoint — apenas proteção dos existentes. DTOs já definidos.

2. **Modular Architecture** — Feature MUST fit into existing module structure or justify a new module
   - ✅ **PASS**: Novos guards/common modules se encaixam na estrutura existente (`src/common/guards/`). Rate limiting e CORS são configurados globalmente em `main.ts` e `app.module.ts`.

3. **Test-First** (NON-NEGOTIABLE) — Tests MUST be written and failing before implementation; coverage MUST NOT decrease
   - ✅ **PASS**: 163 testes existentes no backend devem continuar passando. Novos testes para guard JWT, bcrypt, rate limiting, e CORS serão adicionados.

4. **Full-Stack Consistency** — Data contracts MUST align between backend and frontend
   - ✅ **PASS**: Nenhuma alteração nos contratos de dados entre frontend e backend. O campo `senha` continua na response de criação de usuário (como hash bcrypt).

5. **Security & Observability** — Auth, validation, and error handling requirements MUST be addressed
   - ✅ **RESOLVIDO**: Constituição atualizada para v1.0.1 — Principle V alterado de AES-256-CTR para bcrypt. JWT expiry agora configurável via `JWT_EXPIRES_IN` (default 2h).
   - ✅ **Demais requisitos**: Guards JWT, rate limiting, CORS restrito, e remoção de fallbacks atendem aos requisitos de segurança.

**GATE DECISION**: **PASS** — constituição já reflete bcrypt e JWT expiry configurável.

## Project Structure

### Documentation (this feature)

```text
specs/011-seguranca-backend-correcoes/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — research findings
├── data-model.md        # Phase 1 — data model
├── quickstart.md        # Phase 1 — implementation guide
├── contracts/           # Phase 1 — interface contracts
└── tasks.md             # (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts        # NOVO
│   │   ├── encryption/
│   │   │   └── encryption.utils.ts      # ALTERADO (remover fallback)
│   │   │   └── encryption.transformer.ts # REMOVIDO
│   │   └── seed/
│   │       └── seed.service.ts           # NOVO — seed de admin padrão
│   ├── modules/
│   │   └── usuario/
│   │       ├── entities/
│   │       │   └── usuario.entity.ts    # ALTERADO (remover EncryptionTransformer)
│   │       ├── usuario.controller.ts    # ALTERADO (algoritmo explícito, fallback removido)
│   │       └── usuario.service.ts       # ALTERADO (bcrypt + seedAdminIfNeeded)
│   ├── app.module.ts                    # ALTERADO (ThrottlerModule + SeedService)
│   ├── main.ts                          # ALTERADO (CORS restrito, Helmet, seed)
│   └── config/
│       └── orm.config.ts                # ALTERADO (logging condicional, pool size, SSL opcional)
└── test/                                # NOVOS testes
```

## Fase 9: Seed de Administrador Padrão

**Purpose**: Criar mecanismo para gerar usuário admin padrão na inicialização, resolvendo o bootstrap do sistema pós-migração.

**Motivação**: Com o `JwtAuthGuard` global protegendo todas as rotas (incluindo `POST /usuario`), não é possível criar o primeiro usuário administrador sem já estar autenticado. O seed automático quebra esse ciclo.

### Detalhes da Implementação

1. **`seedAdminIfNeeded()` em `UsuarioService`**: Método que verifica se existe algum usuário com `perfil: 0` (Admin). Se não existir, cria o usuário `admin`/`admin` com hash bcrypt, usando o repositório diretamente para evitar validações de duplicidade do `create()`.

2. **`SeedService` em `src/common/seed/seed.service.ts`**: Serviço dedicado para operações de seed. Injeta `UsuarioService` e expõe método `seed()` que:
   - Verifica `process.env.SEED_ADMIN === 'true'` (flag de controle)
   - Chama `usuarioService.seedAdminIfNeeded()`
   - Loga o resultado
   - É facilmente extensível para outros seeds no futuro (mesas, produtos, etc.)

3. **Registro em `AppModule`**: `SeedService` adicionado como provider em `AppModule` para ser resolvível via `app.get()`.

4. **Chamada em `main.ts`**: `app.get(SeedService).seed()` executado **antes** de `app.listen()`, garantindo que o seed ocorra antes do servidor aceitar requisições.

5. **Controle via `.env`**: `SEED_ADMIN=true` deve ser adicionado ao `.env` para ativar o seed. Sem essa variável, nenhum seed ocorre. Após o primeiro seed bem-sucedido, a flag pode ser removida (ou mantida — o seed é idempotente).

### Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/common/seed/seed.service.ts` | CRIAR |
| `src/modules/usuario/usuario.service.ts` | ALTERAR (add seedAdminIfNeeded + fix undefined where) |
| `src/modules/comanda/comanda.service.ts` | ALTERAR (fix undefined where) |
| `src/modules/produto/produto.service.ts` | ALTERAR (fix undefined where) |
| `src/modules/mesa/mesa.service.ts` | ALTERAR (fix undefined where) |
| `src/app.module.ts` | ALTERAR (add SeedService provider) |
| `src/main.ts` | ALTERAR (chamar seed) |
| `.env.example` | ALTERAR (add SEED_ADMIN) |

## Fase 10: Correção de Undefined no Where do TypeORM

**Purpose**: Corrigir o padrão `{ skip, take, ...where } = dto` que propaga `undefined` para o TypeORM, impedindo o carregamento de `relations` aninhadas.

**Detalhes da Implementação**: Substituir `const { skip, take, ...where } = dto` por `const { skip, take, ...whereRaw } = dto` seguido de `Object.fromEntries(Object.entries(whereRaw).filter(([_, v]) => v !== undefined))` nos 4 services que usam o padrão.

**Arquivos Afetados**: `comanda.service.ts`, `produto.service.ts`, `mesa.service.ts`, `usuario.service.ts`

## Complexity Tracking

> Ações prioritárias (itens 1-5) são correções diretas sem complexidade adicional.

| Violação | Por que Necessário | Alternativa Mais Simples Rejeitada |
|----------|-------------------|-----------------------------------|
| (Resolvido — constituição v1.0.1) | — | — |
