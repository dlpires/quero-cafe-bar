import './RegProdutoPage.css';
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Cadastrar Produto';

class RegProdutoPage extends HTMLElement {
  connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-produto">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="dsc_produto" label="Descrição do Produto" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="number" step="0.01" name="valor_unit" label="Valor Unitário (R$)" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label>Ativo</ion-label>
              <ion-toggle slot="end" name="status" checked></ion-toggle>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top">
              <ion-icon name="checkmark-circle" style="margin-right: 8px;"></ion-icon>
              Salvar Produto
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" style="margin-right: 8px;"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-produto').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.navigateBack());
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const produtoData = {
      dsc_produto: formData.get('dsc_produto'),
      valor_unit: parseFloat(formData.get('valor_unit')),
      status: formData.get('status') === 'on',
    };

    try {
      await api.addProduto(produtoData);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível cadastrar o produto. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    window.history.back();
  }
}

customElements.define('reg-produto-page', RegProdutoPage);