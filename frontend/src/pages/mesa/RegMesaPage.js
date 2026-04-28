import './RegMesaPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Cadastrar Mesa';

class RegMesaPage extends HTMLElement {
  connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-mesa">
          <ion-list>
            <ion-item>
              <ion-input type="number" name="qtd_cadeiras" label="Quantidade de Cadeiras" label-placement="floating" required></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Ativa</ion-label>
              <ion-toggle slot="end" name="status" checked></ion-toggle>
            </ion-item>
          </ion-list>
          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top">Salvar Mesa</ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">Cancelar</ion-button>
          </div>
        </form>
      </ion-content>
    `;
    this.querySelector('#form-mesa').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.navigateBack());
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const mesaData = {
      qtd_cadeiras: parseInt(formData.get('qtd_cadeiras')),
      status: formData.get('status') === 'on'
    };

    try {
      await api.addMesa(mesaData);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao cadastrar mesa:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível cadastrar a mesa.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/mesas', 'root');
  }
}

customElements.define('reg-mesa-page', RegMesaPage);
