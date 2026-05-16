# AGENTS.md

## Project Overview
- **Name**: Quero Café Bar
- **Purpose**: Educational system for order management (products, tables, users, kitchen view).
- **Stack**: NestJS 11.x (Backend) + Ionic 8.x Vanilla JS + Vite 7.x (Frontend) + MySQL 8.x (DB).
- **Main Workflow**: Admin/Waiters manage products and tables, opening "comandas" (orders) for customers. Kitchen views orders and updates delivery status.
- **Workflow Automation**: Speckit-based pipeline — constitution → spec → plan → tasks → implement.

## Dev Commands

### Backend (NestJS)
```bash
cd backend
yarn install
yarn run start:dev        # dev server with watch (port 3001)
yarn run build            # production build
yarn run lint             # ESLint + Prettier (--fix)
yarn run test             # Jest unit tests (24 suites, 163 tests)
yarn run test:cov         # Jest with coverage report
yarn make:migration <name>  # Generate migration
yarn migrate              # Run migrations
yarn migrate:rollback     # Revert last migration
```

### Frontend (Ionic + Vite)
```bash
cd frontend
npm install               # Note: uses npm, not yarn
npm run dev               # Vite dev server (port 5173)
npm run build             # web build (outputs to dist/)
npm run build:prod        # production build (--mode production)
npm run test              # Jest unit tests (8 suites, 105 tests)
npm run test:watch        # Jest in watch mode
npm run test:coverage     # Jest with coverage report
npx cap copy              # sync web build to Android
npx cap open android      # open Android Studio
npx cap run android       # run on device/emulator
npx cap build android     # build APK directly
```

## Architecture

- **Backend**: `backend/src/` — NestJS modules under `src/modules/`
  - Modules: `comanda`, `comanda-item`, `mesa`, `produto`, `usuario`
  - Entry: `src/main.ts`, root module: `src/app.module.ts`
  - Logic: Controllers handle routes, Services handle business logic, Entities define DB schema.
  - Config: `src/config/orm.config.ts` (TypeORM + MySQL)
  - Global: `ValidationPipe` (whitelist + forbidNonWhitelisted + transform), `GlobalExceptionFilter`

- **Frontend**: `frontend/src/` — Vanilla JS (ES Modules) with Ionic web components
  - Entry: `src/main.js`
  - API service: `src/services/api.js` (singleton with JWT auth)
  - Pages: `src/pages/` (login, home/cozinha, produto, usuario, mesa, comanda)
    - Pages are **Custom Elements** (Web Components) extending `HTMLElement`
    - Home page = Kitchen view with delivery status updates (red = pending, green = delivered)
  - Environments: `src/environments/environment.js` (dev), `environment.prod.js`
  - Shared: `src/shared/Header.js` (menu + header), `src/shared/util.js` (toast, loading, validation, focus, logout)

## Available Subagents

Custom subagents configured in `.opencode/agents/`:

| Agent Type | Function | Role | Model |
|------------|----------|------|-------|
| `exception-treatment-agent` | Audits error handling (try-catch coverage, HTTP status consistency) | plan | opencode/big-pickle |
| `qa-agent` | Generates and analyzes unit tests (NestJS services/controllers + Ionic pages) | build | opencode/big-pickle |
| `security-audit-agent` | SAST analysis: SQL injection, hardcoded secrets, CORS, dependency vulnerabilities | plan | opencode/big-pickle |
| `ux-agent` | UX/UI audit: WCAG/WCAG accessibility, mobile-first design, touch targets | plan | opencode/big-pickle |

Built-in agent types also available:

| Agent Type | Function | Model |
|------------|----------|-------|
| `explore` | Fast codebase exploration, file search, code patterns | opencode/big-pickle |
| `general` | General-purpose research and multi-step tasks | opencode/big-pickle |

### Agent Details

**`exception-treatment-agent`** — Escaneia services/controllers no NestJS em busca de promessas sem catch adequado. Verifica consistência de status HTTP (400, 401, 403, 404, 500). No frontend, checa tratamento de falhas de rede e erros de API com feedback ao usuário (toast/alert).

**`qa-agent`** — Gera suites com `Test.createTestingModule` (NestJS) mockando TypeORM repositories. No frontend, cria testes de renderização de Web Components e interação DOM. Inclui Happy Path e Edge Cases.

**`security-audit-agent`** — Varre queries TypeORM por SQL injection, busca credenciais hardcoded, analisa implementação de Guards/CORS, verifica armazenamento de tokens JWT no localStorage. Checa `package.json` por dependências obsoletas.

**`ux-agent`** — Analisa hierarquia visual, contraste de cores, atributos ARIA, navegabilidade por teclado, touch targets (mín. 44x44px), e feedback de sistema (toasts, loadings, alerts).

## Custom Slash Commands

Commands configured in `.opencode/commands/`:

| Command | Function | Agent | Model |
|---------|----------|-------|-------|
| `analyze-coverage` | Analisa relatório de cobertura e sugere novos testes | plan | ollama/qwen2.5-coder:14b |
| `review-changes` | Revisa mudanças recentes do git e sugere melhorias | — | — |
| `run-tests` | Executa testes, analisa falhas e fornece correções | build | ollama/qwen2.5-coder:14b |
| `update-docs` | Sincroniza AGENTS.md e README.md com estado atual do projeto | build | ollama/qwen2.5-coder:7b |

### Speckit Pipeline Commands

These implement a structured feature development workflow (constitution → spec → plan → tasks → implement):

| Command | Function |
|---------|----------|
| `speckit.constitution` | Cria ou atualiza a constituição do projeto (princípios base) |
| `speckit.specify` | Cria spec.md a partir de descrição em linguagem natural |
| `speckit.clarify` | Identifica pontos subespecificados na spec e faz perguntas direcionadas |
| `speckit.plan` | Gera plan.md, research.md, data-model.md, contracts/ a partir da spec |
| `speckit.tasks` | Gera tasks.md com dependências ordenadas entre fases |
| `speckit.checklist` | Gera checklist personalizado para validação de requisitos |
| `speckit.analyze` | Análise cruzada de consistência entre spec, plan e tasks |
| `speckit.implement` | Executa tarefas em fases com verificação de testes |
| `speckit.taskstoissues` | Converte tarefas em issues do GitHub |

### Git Speckit Commands

| Command | Function |
|---------|----------|
| `speckit.git.initialize` | Inicializa repositório git |
| `speckit.git.commit` | Cria commit estruturado |
| `speckit.git.remote` | Configura remote do GitHub |
| `speckit.git.validate` | Valida estado do repositório |
| `speckit.git.feature` | Gerencia branch de feature |

## Important Quirks

- **Package managers differ**: Backend uses `yarn`, frontend uses `npm`
- **Port configuration**: Frontend calls `localhost:3001`, backend defaults to `3000` — **set `PORT=3001` in `backend/.env`**
- **DB migrations required**: `synchronize: false` — always use `yarn make:migration` before `yarn migrate`
- **CORS enabled**: Backend allows all origins (`*`) in `main.ts` — restrict in production
- **ESLint rule**: `prettier/prettier` uses `endOfLine: "auto"` — do not change line endings manually
- **Ionic loading**: Vite copies Ionic from `node_modules/@ionic/core/dist/ionic/` to `dist/` via `vite-plugin-static-copy`
- **Mobile Development**: Capacitor 8.x for Android. Backend URL in `environment.prod.js` uses `ngrok` or `10.0.2.2` for emulator access.
- **Authentication**: JWT-based using `jsonwebtoken` (signed with `JWT_SECRET`, 24h expiry). Token stored in localStorage, sent as `Authorization: Bearer <token>`.
- **Password encryption**: AES-256-CTR via `EncryptionTransformer` (TypeORM column transformer) — transparent encrypt/decrypt at ORM level.
- **Global validation**: `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — unknown fields rejected with 400.
- **Global exception filter**: `GlobalExceptionFilter` catches unhandled errors and returns sanitized 500 responses.
- **Kitchen View**: Home page displays comandas with item delivery status (red = pending, green = delivered).
- **Shared Utilities**: `src/shared/util.js` exports `showToast`, `withLoading`, `createEmptyState`, `validateRequired`, `validatePositiveNumber`, `focusFirstElement`, `logout`.
- **ngrok dev header**: `ngrok-skip-browser-warning` only sent when `environment.production === false` — gated in `api.js`.

## Test Status

```bash
# Backend — 24 suites, 163 tests passing
cd backend && yarn test

# Frontend — 8 suites, 105 tests passing
cd frontend && npm test
```

## Prerequisites

- Node.js >= 18.x
- MySQL 8.x (or compatible)
- Yarn >= 1.22 (backend)
- npm >= 9.x (frontend)
- Java JDK 17+ + Android Studio (for mobile builds)

<!-- SPECKIT START -->
For additional context about the current feature (UX Foundation — Shared
Utilities & Fixes), read specs/001-ux-shared-utilities/plan.md
<!-- SPECKIT END -->
