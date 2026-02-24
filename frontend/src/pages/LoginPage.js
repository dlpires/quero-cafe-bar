import './LoginPage.css'
import { createHeader } from '../shared/Header.js';

const pageName = 'Login';

class LoginPage extends HTMLElement {
  connectedCallback() {
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
      const user = userInput.value;
      const password = passwordInput.value;

      // Cria e exibe o Loading de 5 segundos
      const loading = document.createElement('ion-loading');
      loading.message = 'Autenticando...';
      loading.duration = 5000;
      
      document.body.appendChild(loading);
      await loading.present();
      await loading.onDidDismiss(); // Aguarda o tempo acabar

      // Validação Mockada
      if (user === 'admin' && password === 'admin') {
        await presentToast('Login realizado com sucesso!', 'success');        
        // Navegação usando o ion-router. 'replace' impede o usuário de voltar para a tela de login.
        document.querySelector('ion-router').push('/home', 'forward', 'replace');
      } else {
        await presentToast('Usuário ou senha inválidos.');
        passwordInput.value = '';
      }
    });

    // Função para exibir alertas (Toast)
    async function presentToast(message, color = 'danger') {
        const toast = document.createElement('ion-toast');
        toast.message = message;
        toast.duration = 2000;
        toast.color = color;
        toast.position = 'bottom';

        document.body.appendChild(toast);
        return toast.present();
    }
  }
}

customElements.define('login-page', LoginPage);