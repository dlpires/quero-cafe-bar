import './HomePage.css'
import { createHeader } from '../shared/Header.js';

const pageName = 'Home';

class HomePage extends HTMLElement {
  connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="home-container">
          <ion-card>
              <ion-card-header>
                  <ion-card-title>Bem vindo!</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                Você está na página principal da aplicação.
              </ion-card-content>
          </ion-card>
        </div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', () => {
      // 1. Limpa cache/token
        localStorage.clear();
        
        // 2. Redireciona via browser (Isso mata qualquer erro de 'n is not a function')
        // No modo Hash, usamos #/login. No modo normal, apenas /login
        const useHash = document.querySelector('ion-router').useHash;
        window.location.href = useHash ? '#/login' : '/login';
        
        // 3. Força o recarregamento para limpar o estado do JS
        window.location.reload();
    });
  }
}

customElements.define('home-page', HomePage);