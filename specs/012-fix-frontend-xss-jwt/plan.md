# Implementation Plan: Correções de Segurança no Frontend (XSS e JWT)

**Branch**: `012-fix-frontend-xss-jwt` | **Date**: 20/06/2026 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-fix-frontend-xss-jwt/spec.md`

## Summary

Implementar as 2 ações críticas/altas do relatório de segurança SAST do frontend: eliminar XSS substituindo `innerHTML` por `textContent`/DOM API em todas as páginas, e migrar armazenamento de JWT de `localStorage` para cookie httpOnly (com endpoint `/usuario/me` no backend e CSP como defense-in-depth).

## Technical Context

**Language/Version**: TypeScript 5.x (backend NestJS 11.x), JavaScript ES Modules (frontend Ionic 8.x + Vite 7.x)

**Primary Dependencies**: 
- Backend: `@nestjs/common`, `jsonwebtoken` (existentes), `cookie-parser` (novo)
- Frontend: `@ionic/core` (existente), `DOMPurify` (novo — opcional, se optar por sanitização em vez de DOM API pura)

**Storage**: MySQL 8.x via TypeORM — nenhuma alteração de schema necessária

**Testing**: Jest — backend (22 suites, 149 testes), frontend (20 suites, 216 testes)

**Target Platform**: Web browser + Android (Capacitor 8.x)

**Project Type**: Web application (NestJS backend + Ionic frontend)

**Performance Goals**: Nenhuma degradação perceptível — migração de innerHTML para DOM API pode ser ligeiramente mais verbosa mas não impacta performance de renderização

**Constraints**: 
- JWT httpOnly cookies exigem HTTPS em produção (ngrok já usa HTTPS; localhost precisa Secure=false)
- Cookies httpOnly não disparam evento `storage` — necessário BroadcastChannel para sync entre abas
- CSP não pode quebrar inline styles do Ionic (requer `'unsafe-inline'` para styles)

**Scale/Scope**: Apenas frontend + ajuste mínimo no backend (login + novo endpoint `/usuario/me`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — All endpoints MUST be defined via contracts/DTOs before implementation begins
   - ✅ **PASS**: Novo endpoint `GET /usuario/me` definido no spec (FR-009). DTO de resposta será criado.

2. **Modular Architecture** — Feature MUST fit into existing module structure or justify a new module
   - ✅ **PASS**: Alterações concentradas nos módulos existentes (`usuario` no backend, todas as páginas no frontend). CSP é adicionado ao `index.html`.

3. **Test-First** (NON-NEGOTIABLE) — Tests MUST be written and failing before implementation; coverage MUST NOT decrease
   - ✅ **PASS**: 216 testes frontend devem continuar passando. Testes para `/usuario/me` serão adicionados no backend.

4. **Full-Stack Consistency** — Data contracts MUST align between backend and frontend
   - ✅ **PASS**: Contrato do `/usuario/me` (id, perfil, usuario) alinhado entre resposta do backend e consumo no frontend.

5. **Security & Observability** — Auth, validation, and error handling requirements MUST be addressed
   - ✅ **PASS**: A feature *é* uma correção de segurança. httpOnly cookie + CSP + sanitização XSS atendem diretamente este princípio.

**GATE DECISION**: **PASS** — sem violações constitucionais.

## Project Structure

### Documentation (this feature)

```text
specs/012-fix-frontend-xss-jwt/
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
│   │       └── jwt-auth.guard.ts        # ALTERADO (ler cookie também)
│   └── modules/
│       └── usuario/
│           ├── usuario.controller.ts    # ALTERADO (set cookie no login + GET /me)
│           └── usuario.service.ts       # ALTERADO (método getMe())

frontend/
├── index.html                           # ALTERADO (adicionar CSP meta tag)
└── src/
    ├── main.js                          # ALTERADO (route guard com token validation)
    ├── services/
    │   └── api.js                       # ALTERADO (remover localStorage JWT)
    ├── shared/
    │   ├── Header.js                    # ALTERADO (renderização segura)
    │   └── util.js                      # ALTERADO (remover atob(), substituir por API /me)
    └── pages/
        ├── login/
        │   └── LoginPage.js             # ALTERADO (tratar cookie no login)
        ├── home/
        │   └── HomePage.js              # ALTERADO (innerHTML → textContent)
        ├── produto/
        │   ├── ListProdutoPage.js       # ALTERADO (innerHTML → textContent)
        │   ├── RegProdutoPage.js        # ALTERADO (innerHTML → textContent)
        │   └── UpdateProdutoPage.js     # ALTERADO (innerHTML → textContent)
        ├── usuario/
        │   ├── ListUsuarioPage.js       # ALTERADO (innerHTML → textContent)
        │   ├── RegUsuarioPage.js        # ALTERADO (innerHTML → textContent)
        │   └── UpdateUsuarioPage.js     # ALTERADO (innerHTML → textContent)
        ├── mesa/
        │   ├── ListMesaPage.js          # ALTERADO (innerHTML → textContent)
        │   ├── RegMesaPage.js           # ALTERADO (innerHTML → textContent)
        │   └── UpdateMesaPage.js        # ALTERADO (innerHTML → textContent)
        └── comanda/
            ├── ListComandaPage.js       # ALTERADO (innerHTML → textContent)
            ├── RegComandaPage.js        # ALTERADO (innerHTML → textContent)
            └── UpdateComandaPage.js     # ALTERADO (innerHTML → textContent)
```

## Complexity Tracking

Nenhuma violação constitucional — todas as alterações seguem os padrões existentes do projeto.

## Phases

### Phase 0: Research

Consolidado em `research.md`.

### Phase 1: Design & Contracts

Gerado: `data-model.md`, `contracts/`, `quickstart.md`

### Phase 2: Tasks

Gerado por `/speckit.tasks`.
