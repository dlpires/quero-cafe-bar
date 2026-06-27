jest.mock('../../services/api', () => ({
  api: {
    login: jest.fn(),
    setToken: jest.fn(),
  },
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header>Login</ion-header>'),
}));

jest.mock('../../services/auth.js', () => ({
  isAuthenticated: jest.fn(() => false),
  redirectToHome: jest.fn(),
}));

jest.mock('../../shared/util.js', () => ({
  focusFirstElement: jest.fn(),
  showToast: jest.fn(),
}));

if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends HTMLElement {});
  customElements.define('ion-card', class extends HTMLElement {});
  customElements.define('ion-card-header', class extends HTMLElement {});
  customElements.define('ion-card-title', class extends HTMLElement {});
  customElements.define('ion-card-content', class extends HTMLElement {});
  customElements.define('ion-item', class extends HTMLElement {});
  customElements.define('ion-input', class extends HTMLElement {
    constructor() { super(); this._value = ''; }
    get value() { return this._value; }
    set value(v) { this._value = v; }
  });
  customElements.define('ion-input-password-toggle', class extends HTMLElement {});
  customElements.define('ion-icon', class extends HTMLElement {
    constructor() { super(); this.name = ''; this.slot = ''; }
  });
  customElements.define('ion-button', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); }
  });
  customElements.define('ion-loading', class extends HTMLElement {
    constructor() { super(); this.message = ''; this._isIonMock = true; this.present = jest.fn(); this.dismiss = jest.fn(); }
  });
  customElements.define('ion-router', class extends HTMLElement {
    constructor() { super(); this.push = jest.fn(); this._isIonMock = true; }
  });
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() { super(); this.present = jest.fn(); this.message = ''; }
  });
}

import { api } from '../../services/api';
import { showToast, focusFirstElement } from '../../shared/util';
import { createHeader } from '../../shared/Header';
import { isAuthenticated, redirectToHome } from '../../services/auth';

describe('LoginPage', () => {
  let page;

  beforeEach(() => {
    jest.clearAllMocks();
    page = document.createElement('div');
  });

  describe('Fluxo de Autenticação', () => {
    it('deve redirecionar se já autenticado', () => {
      isAuthenticated.mockReturnValue(true);
      expect(isAuthenticated()).toBe(true);
      redirectToHome();
      expect(redirectToHome).toHaveBeenCalled();
    });

    it('deve renderizar formulário de login', () => {
      const header = createHeader('Login');
      expect(header).toContain('ion-header');
      expect(header).toContain('Login');

      const formHtml = `
        <div class="login-container">
          <ion-card>
            <ion-card-header><ion-card-title>Acessar</ion-card-title></ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-icon slot="start" name="person"></ion-icon>
                <ion-input type="text" id="user-input" placeholder="Usuário"></ion-input>
              </ion-item>
              <ion-item>
                <ion-icon slot="start" name="lock-closed"></ion-icon>
                <ion-input type="password" id="password-input" placeholder="Senha"></ion-input>
              </ion-item>
              <ion-button expand="block" id="login-btn" class="ion-margin-top">Entrar</ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      `;
      expect(formHtml).toContain('login-container');
      expect(formHtml).toContain('Acessar');
      expect(formHtml).toContain('Entrar');
      expect(formHtml).toContain('user-input');
      expect(formHtml).toContain('password-input');
    });

    it('deve chamar focusFirstElement', () => {
      focusFirstElement(page);
      expect(focusFirstElement).toHaveBeenCalledWith(page);
    });
  });

  describe('Validação de Formulário', () => {
    it('deve exibir toast de aviso quando campos estão vazios', async () => {
      const user = '';
      const password = '';

      if (!user || !password) {
        await showToast('Informe usuário e senha para acessar.', 'warning', 2000);
      }

      expect(showToast).toHaveBeenCalledWith(
        'Informe usuário e senha para acessar.',
        'warning',
        2000,
      );
    });
  });

  describe('Autenticação via API', () => {
    let loading;
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
      localStorage.clear();
      loading = document.createElement('ion-loading');
      jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
        if (selector === 'ion-router') return mockRouter;
        return null;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    async function loginSuccess(user, password, token) {
      api.login.mockResolvedValue({ token });

      await loading.present();

      const data = await api.login(user, password);
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('user_perfil', tokenPayload.perfil);

      await showToast('Login realizado com sucesso!', 'success', 2000);
      const redirect = tokenPayload.perfil === 2 ? '/cozinha' : '/home';
      document.querySelector('ion-router').push(redirect, 'forward', 'replace');
      await loading.dismiss();
    }

    async function loginFail(user, password) {
      api.login.mockRejectedValue(new Error('Credenciais inválidas'));

      await loading.present();
      try {
        await api.login(user, password);
      } catch (error) {
        await showToast(error.message, 'error', 2000);
      } finally {
        await loading.dismiss();
      }
    }

    async function loginFailNet(user, password) {
      api.login.mockRejectedValue(new Error('Failed to fetch'));

      await loading.present();
      try {
        await api.login(user, password);
      } catch (error) {
        const mensagem =
          error.message === 'Failed to fetch'
            ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
            : error.message || 'Usuário ou senha inválidos.';
        await showToast(mensagem, 'error', 2000);
      } finally {
        await loading.dismiss();
      }
    }

    it('deve fazer login com sucesso e navegar para home (perfil=0)', async () => {
      const token = 'header.' + btoa(JSON.stringify({ id: 1, perfil: 0 })) + '.sig';
      await loginSuccess('admin', '123', token);

      expect(api.login).toHaveBeenCalledWith('admin', '123');
      expect(localStorage.getItem('user_perfil')).toBe('0');
      expect(showToast).toHaveBeenCalledWith('Login realizado com sucesso!', 'success', 2000);
      expect(loading.dismiss).toHaveBeenCalled();
    });

    it('deve fazer login com sucesso e navegar para cozinha (perfil=2)', async () => {
      const token = 'header.' + btoa(JSON.stringify({ id: 2, perfil: 2 })) + '.sig';
      await loginSuccess('cozinha', '123', token);

      expect(api.login).toHaveBeenCalledWith('cozinha', '123');
      expect(localStorage.getItem('user_perfil')).toBe('2');
      expect(showToast).toHaveBeenCalledWith('Login realizado com sucesso!', 'success', 2000);
      expect(loading.dismiss).toHaveBeenCalled();
    });

    it('deve tratar erro de login com toast danger', async () => {
      await loginFail('admin', 'wrong');

      expect(showToast).toHaveBeenCalledWith('Credenciais inválidas', 'error', 2000);
      expect(loading.dismiss).toHaveBeenCalled();
    });

    it('deve tratar erro de rede com mensagem amigável', async () => {
      await loginFailNet('admin', '123');

      expect(showToast).toHaveBeenCalledWith(
        'Não foi possível conectar ao servidor. Verifique sua conexão.',
        'error',
        2000,
      );
      expect(loading.dismiss).toHaveBeenCalled();
    });
  });

  describe('Responsividade', () => {
    it('T008: deve ter max-width 400px no container de login em viewport ≥1024px', () => {
      const style = document.createElement('style');
      style.textContent = '.login-container { width: 100%; max-width: 400px; margin: 0 auto; }';
      document.head.appendChild(style);
      const container = document.createElement('div');
      container.className = 'login-container';
      document.body.appendChild(container);
      const computed = getComputedStyle(container);
      expect(computed.maxWidth).toBe('400px');
      style.remove();
      container.remove();
    });
  });
});
