# AGENTS.md

## Project Overview
- **Name**: Quero Café Bar
- **Purpose**: Educational system for order management (products, tables, users).
- **Stack**: NestJS (Backend) + Ionic Vanilla JS (Frontend) + MySQL (DB).
- **Main Workflow**: Admin/Waiters manage products and tables, opening "comandas" (orders) for customers.

## Dev Commands

### Backend (NestJS)
```bash
cd backend
yarn install
yarn run start:dev      # dev server with watch
yarn run lint            # ESLint + Prettier
yarn run test            # Jest unit tests
yarn make:migration <name>  # Generate migration
yarn migrate             # Run migrations
yarn migrate:rollback     # Revert last migration
```

### Frontend (Ionic + Vite)
```bash
cd frontend
npm install              # Note: uses npm, not yarn
npm run dev              # dev server
npm run build            # web build (outputs to dist/)
npm run build:prod       # production build
npx cap copy             # sync to Android
npx cap open android     # open Android Studio
npx cap run android      # run on device/emulator
```

## Architecture

- **Backend**: `backend/src/` - NestJS modules under `src/modules/`
  - Modules: `comanda`, `comanda-item`, `mesa`, `produto`, `usuario`
  - Entry: `src/main.ts`, root module: `src/app.module.ts`
  - Logic: Controllers handle routes, Services handle business logic, Entities define DB schema.

- **Frontend**: `frontend/src/` - Vanilla JS with Ionic web components
  - State: Managed via a singleton `api.js` service and local storage for JWT.
  - Database config: `src/config/orm.config.ts` (TypeORM + MySQL)
  - Migrations: `src/database/migrations/`

- **Frontend**: `frontend/src/` - Vanilla JS with Ionic web components
  - Entry: `src/main.js`
  - API service: `src/services/api.js`
  - Environments: `src/environments/environment.js` (dev), `environment.prod.js`

## Important Quirks

- **Package managers differ**: Backend uses `yarn`, frontend uses `npm`
- **Port mismatch**: Frontend calls `localhost:3001`, backend defaults to `3000` (set `PORT=3001` in backend `.env`)
- **DB migrations required**: `synchronize: false` - always use `yarn make:migration` before `yarn migrate`
- **CORS enabled**: Backend allows all origins (`*`) in `main.ts`
- **ESLint rule**: `prettier/prettier` uses `endOfLine: "auto"` - do not change line endings manually
- **Ionic loaded from CDN/Local**: Vite copies Ionic from `node_modules/@ionic/core/dist/ionic/` to `dist/`.
- **Mobile Development**: Uses Capacitor for Android. Backend URL in `environment.prod.js` often uses `ngrok` or `10.0.2.2` for emulator access.
- **Authentication**: JWT-based. Token stored in `localStorage` and sent in `Authorization: Bearer <token>` header.
