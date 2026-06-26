import './LoginPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { isAuthenticated, redirectToHome } from '../../services/auth.js';
import { focusFirstElement, showToast } from '../../shared/util.js';

const pageName = 'Login';

class LoginPage extends HTMLElement {
  connectedCallback() {
    if (isAuthenticated()) {
      redirectToHome();
      return;
    }
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
          <div class="login-container">
              <ion-card>
              <ion-card-header>
                  <ion-card-title>Acessar</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                  <ion-item counter="true">
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

    // Referências e Lógica (Movido para dentro do componente)
    const userInput = this.querySelector('#user-input');
    const passwordInput = this.querySelector('#password-input');
    const loginBtn = this.querySelector('#login-btn');

    loginBtn.addEventListener('click', async () => {
      const user = userInput.value?.trim();
      const password = passwordInput.value?.trim();

      // Validação no frontend antes de chamar a API
      if (!user || !password) {
        await showToast('Informe usuário e senha para acessar.', 'warning', 2000);
        return;
      }

      // Cria e exibe o Loading
      const loading = document.createElement('ion-loading');
      loading.message = 'Autenticando...';
      
      document.body.appendChild(loading);
      await loading.present();

      try {
        const data = await api.login(user, password);
        const perfil = (() => {
          try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem('user_perfil', payload.perfil);
            return payload.perfil;
          } catch {
            return null;
          }
        })();

        await showToast('Login realizado com sucesso!', 'success', 2000);
        const redirect = perfil === 2 ? '/cozinha' : '/home';
        document.querySelector('ion-router').push(redirect, 'forward', 'replace');
      } catch (error) {
        const mensagem =
          error.message === 'Failed to fetch'
            ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
            : error.message || 'Usuário ou senha inválidos.';
        await showToast(mensagem, 'error', 2000);
        passwordInput.value = '';
      } finally {
        await loading.dismiss();
      }
    });

    focusFirstElement(this);
  }
}

customElements.define('login-page', LoginPage);