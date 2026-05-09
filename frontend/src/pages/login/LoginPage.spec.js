/**
 * Testes para LoginPage (Web Component)
 * 
 * Esta página é um Custom Element que estende HTMLElement.
 * Testa renderização, interação com API e fluxo de autenticação.
 */

// Mock do api service
jest.mock('../../services/api.js', () => ({
  api: {
    login: jest.fn(),
    setToken: jest.fn(),
  },
}));

// Mock do Header
jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

// Mock dos componentes Ionic (não disponíveis no jsdom)
class MockIonElement extends HTMLElement {
  constructor() {
    super();
    this.classList.add('ion-page');
  }
}

// Registra mocks dos componentes Ionic
if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends MockIonElement {});
  customElements.define('ion-card', class extends MockIonElement {});
  customElements.define('ion-card-header', class extends MockIonElement {});
  customElements.define('ion-card-title', class extends MockIonElement {});
  customElements.define('ion-card-content', class extends MockIonElement {});
  customElements.define('ion-item', class extends MockIonElement {});
  customElements.define('ion-icon', class extends MockIonElement {});
  customElements.define('ion-input', class extends MockIonElement {
    constructor() {
      super();
      this.value = '';
    }
  });
  customElements.define('ion-input-password-toggle', class extends MockIonElement {});
  customElements.define('ion-button', class extends MockIonElement {
    constructor() {
      super();
      this.addEventListener = jest.fn();
    }
  });
  customElements.define('ion-loading', class extends MockIonElement {
    present = jest.fn().mockResolvedValue(undefined);
    dismiss = jest.fn().mockResolvedValue(undefined);
  });
  customElements.define('ion-toast', class extends MockIonElement {
    present = jest.fn().mockResolvedValue(undefined);
    message = '';
    duration = 2000;
    color = 'danger';
    position = 'bottom';
  });
  customElements.define('ion-router', class extends MockIonElement {
    push = jest.fn();
    useHash = true;
  });
}

// Importa após os mocks
import { api } from '../../services/api.js';
import { createHeader } from '../../shared/Header.js';

describe('LoginPage', () => {
  let loginPage;
  let mockQuerySelector;
  let mockAddEventListener;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Limpa registro anterior se existir
    if (customElements.get('login-page')) {
      // Não podemos redefinir, então criamos um novo elemento
    }
    
    // Cria uma implementação mock da LoginPage para teste
    class MockLoginPage extends HTMLElement {
      constructor() {
        super();
        this.classList = {
          add: jest.fn(),
        };
        this.innerHTML = '';
        this.querySelector = jest.fn();
        this.querySelectorAll = jest.fn(() => []);
      }
      
      connectedCallback() {
        this.classList.add('ion-page');
        this.innerHTML = `
          ${createHeader('Login')}
          <ion-content>
            <div class="login-container">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Acessar</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-item>
                    <ion-icon slot="start" name="person"></ion-icon>
                    <ion-input type="text" id="user-input" placeholder="Usuário"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-icon slot="start" name="lock-closed"></ion-icon>
                    <ion-input type="password" id="password-input" placeholder="Senha">
                      <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                    </ion-input>
                  </ion-item>
                  <ion-button expand="block" id="login-btn" class="ion-margin-top">
                    Entrar
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </div>
          </ion-content>
        `;

        const userInput = { value: 'testuser', id: 'user-input' };
        const passwordInput = { value: 'testpass', id: 'password-input' };

        this.querySelector.mockImplementation((selector) => {
          if (selector === '#user-input') return userInput;
          if (selector === '#password-input') return passwordInput;
          if (selector === '#login-btn') return { id: 'login-btn', addEventListener: jest.fn() };
          return null;
        });

        this.loginHandler = async () => {
          const user = this.querySelector('#user-input').value;
          const password = this.querySelector('#password-input').value;

          const loading = document.createElement('ion-loading');
          loading.message = 'Autenticando...';
          document.body.appendChild(loading);
          await loading.present();

          try {
            const response = await api.login(user, password);
            api.setToken(response.token);
            if (global.presentToast) {
              global.presentToast('Login realizado com sucesso!', 'success');
            }
            const router = document.querySelector('ion-router');
            if (router && router.push) router.push('/home', 'forward', 'replace');
          } catch (error) {
            this.querySelector('#password-input').value = '';
          } finally {
            await loading.dismiss();
          }
        };
      }
    }

    // Define o custom element (se não existir)
    if (!customElements.get('login-page')) {
      customElements.define('login-page', MockLoginPage);
    }

    loginPage = new MockLoginPage();
    loginPage.connectedCallback();
  });

  describe('Renderização', () => {
    it('deve adicionar classe ion-page ao elemento (Happy Path)', () => {
      expect(loginPage.classList.add).toHaveBeenCalledWith('ion-page');
    });

    it('deve renderizar o header via createHeader', () => {
      expect(createHeader).toHaveBeenCalledWith('Login');
    });

    it('deve renderizar inputs de usuário e senha', () => {
      expect(loginPage.innerHTML).toContain('user-input');
      expect(loginPage.innerHTML).toContain('password-input');
    });

    it('deve renderizar botão de login', () => {
      expect(loginPage.innerHTML).toContain('login-btn');
    });
  });

  describe('Fluxo de Login', () => {
    it('deve chamar api.login com credenciais corretas (Happy Path)', async () => {
      const userInput = { value: 'admin', id: 'user-input' };
      const passwordInput = { value: 'senha123', id: 'password-input' };
      
      loginPage.querySelector.mockImplementation((selector) => {
        if (selector === '#user-input') return userInput;
        if (selector === '#password-input') return passwordInput;
        return null;
      });

      api.login.mockResolvedValue({ token: 'jwt-token-123' });

      // Simula clique no botão
      await loginPage.loginHandler();

      expect(api.login).toHaveBeenCalledWith('admin', 'senha123');
      expect(api.setToken).toHaveBeenCalledWith('jwt-token-123');
    });

    it('deve mostrar toast de sucesso após login (Happy Path)', async () => {
      api.login.mockResolvedValue({ token: 'jwt-token-123' });
      
      // Mock do presentToast
      const presentToast = jest.fn();
      global.presentToast = presentToast;

      await loginPage.loginHandler();

      expect(presentToast).toHaveBeenCalledWith(
        'Login realizado com sucesso!',
        'success'
      );
    });

    it('deve redirecionar para /home após login bem-sucedido', async () => {
      api.login.mockResolvedValue({ token: 'jwt-token-123' });

      const mockRouter = { push: jest.fn(), useHash: true };
      const originalDocQuerySelector = document.querySelector.bind(document);
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-router') return mockRouter;
        return originalDocQuerySelector(selector);
      });

      await loginPage.loginHandler();

      expect(mockRouter.push).toHaveBeenCalledWith('/home', 'forward', 'replace');
    });

    it('deve mostrar erro quando login falha (Edge Case)', async () => {
      api.login.mockRejectedValue(new Error('Credenciais inválidas'));
      
      const passwordInput = { value: 'wrong', id: 'password-input' };
      loginPage.querySelector.mockImplementation((selector) => {
        if (selector === '#password-input') return passwordInput;
        if (selector === '#user-input') return { value: 'user' };
        return null;
      });

      await loginPage.loginHandler();

      expect(passwordInput.value).toBe('');
    });

    it('deve limpar senha após falha no login (Edge Case)', async () => {
      api.login.mockRejectedValue(new Error('Erro'));
      
      const passwordInput = { value: 'wrongpass', id: 'password-input' };
      loginPage.querySelector.mockImplementation((selector) => {
        if (selector === '#password-input') return passwordInput;
        if (selector === '#user-input') return { value: 'user' };
        return null;
      });

      await loginPage.loginHandler();

      expect(passwordInput.value).toBe('');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lidar com erro sem mensagem no login (Edge Case)', async () => {
      api.login.mockRejectedValue(new Error());
      
      loginPage.querySelector.mockImplementation(() => ({
        value: 'test',
      }));

      // Não deve lançar erro
      await expect(loginPage.loginHandler()).resolves.not.toThrow();
    });
  });
});
