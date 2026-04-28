import './UpdateProdutoPage.css';
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Editar Produto';

class UpdateProdutoPage extends HTMLElement {
  async connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    this.produtoId = urlParams.get('id');

    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-produto">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="dsc_produto" id="dsc_produto" label="Descrição do Produto" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="number" step="0.01" name="valor_unit" id="valor_unit" label="Valor Unitário (R$)" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label>Ativo</ion-label>
              <ion-toggle slot="end" name="status" id="status"></ion-toggle>
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

    if (this.produtoId) {
      await this.loadProdutoData();
    }
  }

  async loadProdutoData() {
    try {
      const produto = await api.getProdutoById(this.produtoId);
      this.querySelector('#dsc_produto').value = produto.dsc_produto;
      this.querySelector('#valor_unit').value = produto.valor_unit;
      this.querySelector('#status').checked = produto.status;
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os dados do produto.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      this.navigateBack();
    }
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
      if (this.produtoId) {
        await api.updateProduto(this.produtoId, produtoData);
      } else {
        await api.addProduto(produtoData);
      }
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível salvar o produto. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/produtos', 'root');
  }
}

customElements.define('update-produto-page', UpdateProdutoPage);