export function logout() {
    // 1. Limpa cache/token
    localStorage.clear();
    
    // 2. Redireciona via browser (Isso mata qualquer erro de 'n is not a function')
    // No modo Hash, usamos #/login. No modo normal, apenas /login
    const useHash = document.querySelector('ion-router')?.useHash ?? true;
    window.location.href = useHash ? '#/login' : '/login';
}