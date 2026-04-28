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

// Import Pages
import './pages/login/LoginPage.js';
import './pages/home/HomePage.js';

import './pages/produto/RegProdutoPage.js';
import './pages/produto/ListProdutoPage.js';
import './pages/produto/UpdateProdutoPage.js';

import './pages/usuario/RegUsuarioPage.js';
import './pages/usuario/ListUsuarioPage.js';
import './pages/usuario/UpdateUsuarioPage.js';

import './pages/mesa/RegMesaPage.js';
import './pages/mesa/ListMesaPage.js';
import './pages/mesa/UpdateMesaPage.js';

import './pages/comanda/RegComandaPage.js';
import './pages/comanda/ListComandaPage.js';
import './pages/comanda/UpdateComandaPage.js';

// Redirect to Login Page
// if (window.location.hash === '' || window.location.hash === '#/') {
//   window.location.hash = '#/login';
// }