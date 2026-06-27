export function isAuthenticated() {
  return !!localStorage.getItem('logged_in');
}

export function requireAuth() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return false;
  }
  return true;
}

export function redirectToLogin() {
  localStorage.removeItem('logged_in');
  import('../shared/util.js').then(({ clearLoggedUserCache }) => {
    clearLoggedUserCache();
  });
  const router = document.querySelector('ion-router');
  if (router) {
    router.push('/login', 'root');
  }
}

export function redirectToHome() {
  const stored = localStorage.getItem('user_perfil');
  const perfil = stored !== null ? parseInt(stored, 10) : null;
  const redirect = perfil === 2 ? '/cozinha' : '/home';
  const router = document.querySelector('ion-router');
  if (router) {
    router.push(redirect, 'root');
  }
}

export function setupSessionSync() {
  window.addEventListener('storage', (event) => {
    if (event.key === 'logged_in' && !event.newValue) {
      redirectToLogin();
    }
  });

  try {
    const channel = new BroadcastChannel('auth');
    channel.onmessage = (event) => {
      if (event.data === 'logout') {
        redirectToLogin();
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel not supported in this browser');
  }
}
