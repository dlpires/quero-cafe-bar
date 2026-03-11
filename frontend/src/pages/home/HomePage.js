import './HomePage.css'
import { createHeader } from '../../shared/Header.js';
import { logout } from '../../shared/util.js';

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

    this.querySelector('#logout-btn').addEventListener('click', logout);
  }
}

customElements.define('home-page', HomePage);