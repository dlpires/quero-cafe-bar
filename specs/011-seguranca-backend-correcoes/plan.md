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
│   │   └── guards/
│   │       └── jwt-auth.guard.ts     # NOVO
│   │   └── encryption/
│   │       └── encryption.utils.ts   # ALTERADO (remover fallback)
│   │       └── encryption.transformer.ts  # REMOVIDO
│   ├── modules/
│   │   └── usuario/
│   │       ├── entities/
│   │       │   └── usuario.entity.ts  # ALTERADO (remover EncryptionTransformer)
│   │       ├── usuario.controller.ts  # ALTERADO (algoritmo explícito, fallback removido)
│   │       └── usuario.service.ts     # ALTERADO (bcrypt no lugar de decrypt)
│   ├── app.module.ts                  # ALTERADO (adicionar ThrottlerModule)
│   ├── main.ts                        # ALTERADO (CORS restrito, Helmet)
│   └── config/
│       └── orm.config.ts              # ALTERADO (logging condicional, pool size, SSL opcional)
└── test/                              # NOVOS testes
```

## Complexity Tracking

> Ações prioritárias (itens 1-5) são correções diretas sem complexidade adicional.

| Violação | Por que Necessário | Alternativa Mais Simples Rejeitada |
|----------|-------------------|-----------------------------------|
| (Resolvido — constituição v1.0.1) | — | — |
