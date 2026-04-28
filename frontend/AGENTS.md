# Frontend AGENTS.md

## Commands

```bash
npm install              # Note: uses npm, not yarn
npm run dev              # dev server
npm run build            # web build (outputs to dist/)
npm run build:prod       # production build

# Capacitor (Android)
npx cap add android      # first time only
npx cap copy             # sync web build to Android
npx cap open android     # open Android Studio
npx cap run android      # run on device/emulator
npx cap build android    # build APK directly
```

## Important

- **Package manager**: Uses `npm`, NOT `yarn` (different from backend)
- **Ionic loaded from CDN**: Vite copies from `node_modules/@ionic/core/dist/ionic/` to `dist/` via `vite-plugin-static-copy`
- **API URL**: Configured in `src/environments/environment.js` (default: `http://localhost:3001`)
- **Build output**: `dist/` folder (used by Capacitor)

## Technical Structure

- `src/main.js` - Entry point, imports all pages
- `src/services/api.js` - API client (singleton `api` export)
- `src/pages/` - Page components (login, home, produto, usuario, mesa, comanda)
  - Pages are defined as **Custom Elements** (Web Components) extending `HTMLElement`.
  - Logic usually resides in `connectedCallback`.
  - Navigation is handled by `ion-router` and `ion-nav`.
- `src/environments/` - Environment configs (dev vs prod)

## Capacitor Config

- `capacitor.config.json`: appId `com.example.querocafebar`, webDir `dist`
- Allows navigation to `localhost` and `*.ngrok-free.dev`

## Common Patterns
- **Header**: `src/shared/Header.js` dynamically injects the `ion-menu` and `ion-header`.
- **Forms**: Uses `FormData` to extract values from Ionic inputs (`ion-input`, `ion-select`).
- **Feedback**: Uses `ion-toast`, `ion-alert`, and `ion-loading` for UX.
