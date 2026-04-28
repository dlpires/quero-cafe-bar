# AGENTS.md

## Project Overview
- **Name**: Quero Café Bar
- **Purpose**: Educational system for order management (products, tables, users, kitchen view).
- **Stack**: NestJS 11.x (Backend) + Ionic 8.x Vanilla JS + Vite (Frontend) + MySQL 8.x (DB).
- **Main Workflow**: Admin/Waiters manage products and tables, opening "comandas" (orders) for customers. Kitchen views orders and updates delivery status.

## Dev Commands

### Backend (NestJS)
```bash
cd backend
yarn install
yarn run start:dev      # dev server with watch (port 3001)
yarn run build          # production build
yarn run lint           # ESLint + Prettier
yarn run test           # Jest unit tests
yarn make:migration <name>  # Generate migration
yarn migrate             # Run migrations
yarn migrate:rollback     # Revert last migration
```

### Frontend (Ionic + Vite)
```bash
cd frontend
npm install              # Note: uses npm, not yarn
npm run dev              # dev server (Vite)
npm run build            # web build (outputs to dist/)
npm run build:prod       # production build
npx cap copy             # sync to Android
npx cap open android     # open Android Studio
npx cap run android      # run on device/emulator
npx cap build android    # build APK directly
```

## Architecture

- **Backend**: `backend/src/` - NestJS modules under `src/modules/`
  - Modules: `comanda`, `comanda-item`, `mesa`, `produto`, `usuario`
  - Entry: `src/main.ts`, root module: `src/app.module.ts`
  - Logic: Controllers handle routes, Services handle business logic, Entities define DB schema.
  - Config: `src/config/orm.config.ts` (TypeORM + MySQL)

- **Frontend**: `frontend/src/` - Vanilla JS with Ionic web components
  - Entry: `src/main.js`
  - API service: `src/services/api.js` (singleton with JWT auth)
  - Pages: `src/pages/` (login, home/cozinha, produto, usuario, mesa, comanda)
    - Pages are **Custom Elements** (Web Components) extending `HTMLElement`
    - Home page = Kitchen view with delivery status updates
  - Environments: `src/environments/environment.js` (dev), `environment.prod.js`
  - Shared: `src/shared/Header.js` (menu + header), `src/shared/util.js`

## Available Subagents

Currently, no custom subagents or commands are configured in `.opencode/commands/`.

Built-in agent types available:
| Agent Type | Function | Model |
|------------|----------|-------|
| `explore` | Fast codebase exploration, file search, code patterns | opencode/big-pickle |
| `general` | General-purpose research and multi-step tasks | opencode/big-pickle |
| `qa-ionic` | Unit test analyzer/generator for Ionic/Angular/React | opencode/big-pickle |

## Important Quirks

- **Package managers differ**: Backend uses `yarn`, frontend uses `npm`
- **Port configuration**: Frontend calls `localhost:3001`, backend defaults to `3000` (set `PORT=3001` in backend `.env`)
- **DB migrations required**: `synchronize: false` - always use `yarn make:migration` before `yarn migrate`
- **CORS enabled**: Backend allows all origins (`*`) in `main.ts` - configure for production
- **ESLint rule**: `prettier/prettier` uses `endOfLine: "auto"` - do not change line endings manually
- **Ionic loading**: Vite copies Ionic from `node_modules/@ionic/core/dist/ionic/` to `dist/` via `vite-plugin-static-copy`
- **Mobile Development**: Uses Capacitor 8.x for Android. Backend URL in `environment.prod.js` uses `ngrok` or `10.0.2.2` for emulator access.
- **Authentication**: JWT-based. Token stored in `localStorage` and sent in `Authorization: Bearer <token>` header.
- **Kitchen View**: Home page displays all comandas with item delivery status (red = pending, green = delivered).

## Prerequisites

- Node.js >= 18.x
- MySQL 8.x (or compatible)
- Yarn (backend)
- npm (frontend)
- Java JDK + Android Studio (for mobile builds)
