# Implementation Plan: Frontend Route Protection (Auth Guard)

**Branch**: `002-proteger-rotas-frontend` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-frontend-route-guard/spec.md`

## Summary

Proteger todas as rotas do frontend contra acesso não autenticado, exceto a página de login. Implementar verificação de sessão em duas camadas: (1) guarda global no `ion-router` via evento `ionRouteDidChange` e (2) verificação no `connectedCallback()` de cada página protegida. Redirecionar usuários logados da página de login para o home.

## Technical Context

**Language/Version**: JavaScript (ES Modules) — Ionic 8.x + Vite 7.x + Vanilla JS Web Components

**Primary Dependencies**: Ionic 8.x Web Components (`ion-router`, `ion-nav`)

**Storage**: Web `localStorage` para persistência do token de sessão (já implementado no sistema)

**Testing**: Jest (já configurado no frontend — 8 suites, 105 testes)

**Target Platform**: Web browsers (Chrome, Firefox, Edge, Safari) + Android via Capacitor

**Project Type**: Single Page Application (Vanilla JS + Ionic Web Components)

**Performance Goals**: Redirecionar usuários não autenticados em < 1s; zero flash de conteúdo protegido

**Constraints**: 
- `ion-router` com `use-hash="false"` (History API)
- Token armazenado em `localStorage` com chave `token`
- Sessão validada por JWT (24h expiry) — backend já implementado

**Scale/Scope**: 13 páginas protegidas + 1 página pública (login)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitutional Gates (from Quero Café Bar Constitution v1.0.0):**

1. **API-First** — Esta feature é puramente frontend (roteamento). Nenhum novo endpoint de API é necessário. O endpoint de login existente já gerencia autenticação. ✅ Sem violação.

2. **Modular Architecture** — A solução se encaixa na estrutura existente: novo arquivo `src/services/auth.js` (consistente com `api.js`). As páginas existentes são modificadas minimamente. ✅ Sem violação.

3. **Test-First** (NON-NEGOTIABLE) — Testes devem ser escritos para o novo `auth.js` e para o comportamento de redirecionamento. Cobertura não pode diminuir. ✅ Sem violação (exige atenção).

4. **Full-Stack Consistency** — Nenhum contrato de dados é alterado. A validação de sessão é apenas no frontend (roteamento). ✅ Sem violação.

5. **Security & Observability** — Esta feature fortalece diretamente a segurança: bloqueia acesso não autenticado a todas as rotas protegidas. ✅ Fortalece o princípio.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-route-guard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── main.js                              # Adicionar guarda global (ionRouteDidChange)
│   ├── services/
│   │   ├── api.js                           # Existente — mantido como complemento (tratamento 401)
│   │   └── auth.js                          # NOVO — serviço de autenticação centralizado
│   └── pages/
│       ├── login/LoginPage.js               # Pública — sem alterações
│       ├── home/HomePage.js                  # + requireAuth()
│       ├── produto/
│       │   ├── ListProdutoPage.js            # + requireAuth()
│       │   ├── RegProdutoPage.js             # + requireAuth()
│       │   └── UpdateProdutoPage.js          # + requireAuth()
│       ├── usuario/
│       │   ├── ListUsuarioPage.js            # + requireAuth()
│       │   ├── RegUsuarioPage.js             # + requireAuth()
│       │   └── UpdateUsuarioPage.js          # + requireAuth()
│       ├── mesa/
│       │   ├── ListMesaPage.js               # + requireAuth()
│       │   ├── RegMesaPage.js                # + requireAuth()
│       │   └── UpdateMesaPage.js             # + requireAuth()
│       └── comanda/
│           ├── ListComandaPage.js            # + requireAuth()
│           ├── RegComandaPage.js             # + requireAuth()
│           └── UpdateComandaPage.js          # + requireAuth()
```

**Structure Decision**: Fronend-only — single project layout. Novo arquivo `auth.js` em `services/` (mesmo padrão de `api.js`). Modificações mínimas em cada página (1 linha + import).

## Complexity Tracking

Nenhuma violação constitucional identificada. Feature de baixa complexidade — sem necessidade de justificativa de complexidade.
