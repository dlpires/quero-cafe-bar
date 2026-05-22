# Quickstart: Frontend Route Protection

## What needs to be done

Implement route protection so unauthenticated users cannot access protected pages.

## Files to create

### `frontend/src/services/auth.js`

```js
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function requireAuth() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return false;
  }
  return true;
}

export function redirectToLogin() {
  localStorage.removeItem('token');
  const router = document.querySelector('ion-router');
  if (router) {
    router.push('/login', 'root');
  }
}

export function redirectToHome() {
  const router = document.querySelector('ion-router');
  if (router) {
    router.push('/home', 'root');
  }
}
```

## Files to modify

### 1. `frontend/src/main.js`

Add global navigation guard after all imports:

```js
import { isAuthenticated } from './services/auth.js';

// Global navigation guard
(async function setupRouteGuard() {
  await customElements.whenDefined('ion-router');
  const router = document.querySelector('ion-router');
  if (!router) return;

  router.addEventListener('ionRouteDidChange', async (ev) => {
    const toPath = ev.detail?.to?.pathname;
    if (!toPath) return;

    const authenticated = !!localStorage.getItem('token');

    if (toPath !== '/login' && !authenticated) {
      await router.push('/login', 'root');
    } else if (toPath === '/login' && authenticated) {
      await router.push('/home', 'root');
    }
  });
})();
```

### 2. Each protected page (13 pages)

Add at the top of each file:
```js
import { requireAuth } from '../../services/auth.js';
```

Add at the start of `connectedCallback()`:
```js
if (!requireAuth()) return;
```

**Pages list** (alphabetically by module):
- `frontend/src/pages/comanda/ListComandaPage.js`
- `frontend/src/pages/comanda/RegComandaPage.js`
- `frontend/src/pages/comanda/UpdateComandaPage.js`
- `frontend/src/pages/home/HomePage.js`
- `frontend/src/pages/mesa/ListMesaPage.js`
- `frontend/src/pages/mesa/RegMesaPage.js`
- `frontend/src/pages/mesa/UpdateMesaPage.js`
- `frontend/src/pages/produto/ListProdutoPage.js`
- `frontend/src/pages/produto/RegProdutoPage.js`
- `frontend/src/pages/produto/UpdateProdutoPage.js`
- `frontend/src/pages/usuario/ListUsuarioPage.js`
- `frontend/src/pages/usuario/RegUsuarioPage.js`
- `frontend/src/pages/usuario/UpdateUsuarioPage.js`

## Tests to create / update

### Create: `frontend/src/services/auth.spec.js`

Test the `auth.js` service:
- `isAuthenticated()` returns true/false based on localStorage
- `requireAuth()` redirects when not authenticated
- `redirectToLogin()` pushes to `/login`
- `redirectToHome()` pushes to `/home`

### Create: `frontend/src/services/__mocks__/auth.js`

Mock for auth module (if needed by page tests):
```js
export const isAuthenticated = jest.fn(() => true);
export const requireAuth = jest.fn(() => true);
export const redirectToLogin = jest.fn();
export const redirectToHome = jest.fn();
```

### Update: Each page spec file that tests protected pages

Mock `auth.js` at the top:
```js
jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}));
```

## Verification

1. `cd frontend && npm test` — all 105+ tests must pass
2. Manual: open app without token → should redirect to `/login`
3. Manual: login → should go to `/home`
4. Manual: logged in → go to `/login` → should redirect to `/home`
5. Manual: remove token while navigating → should redirect to `/login` on next nav
