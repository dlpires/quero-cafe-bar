import './style.css'

// Load Ionic
(async () => {
  const ionicPath = '/ionic.esm.js';
  await import(/* @vite-ignore */ ionicPath);
})();

// Core CSS required for Ionic components to work properly
import '@ionic/core/css/core.css';

// Basic CSS for apps built with Ionic
import '@ionic/core/css/normalize.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';

// Optional CSS utils that can be commented out
import '@ionic/core/css/padding.css';
import '@ionic/core/css/float-elements.css';
import '@ionic/core/css/text-alignment.css';
import '@ionic/core/css/text-transformation.css';
import '@ionic/core/css/flex-utils.css';
import '@ionic/core/css/display.css';

// Static imports for all pages
import './pages/login/LoginPage.js';
import './pages/home/HomePage.js';
import './pages/cozinha/CozinhaPage.js';
import './pages/produto/ListProdutoPage.js';
import './pages/produto/RegProdutoPage.js';
import './pages/produto/UpdateProdutoPage.js';
import './pages/usuario/ListUsuarioPage.js';
import './pages/usuario/RegUsuarioPage.js';
import './pages/usuario/UpdateUsuarioPage.js';
import './pages/mesa/ListMesaPage.js';
import './pages/mesa/RegMesaPage.js';
import './pages/mesa/UpdateMesaPage.js';
import './pages/comanda/ListComandaPage.js';
import './pages/comanda/RegComandaPage.js';
import './pages/comanda/UpdateComandaPage.js';

import { showToast } from './shared/util.js';
import { setupSessionSync } from './services/auth.js';

function getUserPerfil() {
  const stored = localStorage.getItem('user_perfil');
  return stored !== null ? parseInt(stored, 10) : null;
}

const PAGE_PROFILES = {
  '/usuarios': [0],
  '/usuario': [0],
  '/produtos': [0],
  '/produto': [0],
  '/mesas': [0],
  '/mesa': [0],
  '/comandas': [0, 1],
  '/comanda': [0, 1],
  '/cozinha': [0, 1, 2],
  '/home': [0, 1, 2],
};

function getBasePath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const base = parts.length > 0 ? `/${parts[0]}` : '';
  return base;
}

// Global navigation guard
(async function setupRouteGuard() {
  await customElements.whenDefined('ion-router');
  const router = document.querySelector('ion-router');
  if (!router) return;

  setupSessionSync();

  router.addEventListener('ionRouteDidChange', async (ev) => {
    const toPath = ev.detail?.to?.pathname;
    if (!toPath) return;

    const authenticated = !!localStorage.getItem('logged_in');

    if (toPath !== '/login' && !authenticated) {
      await router.push('/login', 'root');
      return;
    }

    if (toPath === '/login' && authenticated) {
      const perfil = getUserPerfil();
      const redirect = perfil === 2 ? '/cozinha' : '/home';
      await router.push(redirect, 'root');
      return;
    }

    const base = getBasePath(toPath);
    const allowed = PAGE_PROFILES[base];
    if (allowed) {
      const perfil = getUserPerfil();
      if (perfil !== null && !allowed.includes(perfil)) {
        await showToast('Você não tem permissão para acessar esta página.', 'error', 3000);
        const redirect = perfil === 2 ? '/cozinha' : '/home';
        await router.push(redirect, 'root');
      }
    }
  });
})();