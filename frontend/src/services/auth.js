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

export function setupSessionSync() {
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' && !event.newValue) {
      redirectToLogin();
    }
  });
}
