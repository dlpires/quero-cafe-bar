import './style.css'

// Load Ionic
(async () => {
  // Set the path to a variable to
  // prevent Vite from analyzing in dev
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
import './pages/LoginPage.js';
import './pages/HomePage.js';

// Redirect to Login Page
if (window.location.hash === '' || window.location.hash === '#/') {
  window.location.hash = '#/login';
}