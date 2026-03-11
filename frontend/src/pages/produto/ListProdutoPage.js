import './ListProdutoPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout } from '../../shared/util.js';
import { api } from '../../services/api.js';

const pageName = 'Produtos';

class ListProdutoPage extends HTMLElement {
  async connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-produto-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    await this.fetchProdutos();
  }

  async fetchProdutos() {
    const container = this.querySelector('.list-produto-container');
    const loading = document.createElement('ion-loading');
    loading.message = 'Buscando produtos...';
    document.body.appendChild(loading);
    await loading.present();

    try {
      const produtos = await api.getProdutos();
      this.renderProdutos(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os produtos. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  renderProdutos(produtos) {
    const container = this.querySelector('.list-produto-container');
    if (produtos.length === 0) {
      container.innerHTML = `<p class="ion-text-center">Nenhum produto encontrado.</p>`;
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const productItems = produtos.map(produto => `
      <ion-item>
        <ion-label>
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <ion-icon
              name="${produto.status ? 'checkmark-circle' : 'close-circle'}"
              color="${produto.status ? 'success' : 'danger'}"
              style="flex-shrink: 0;"
            ></ion-icon>
            <span>${produto.dsc_produto}</span>
          </h2>
          <p>${formatCurrency(produto.valor_unit)}</p>
        </ion-label>

        <ion-buttons slot="end">
          <ion-button fill="clear">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `).join('');

    container.innerHTML = `
      <ion-list>${productItems}</ion-list>
    `;
  }
}

customElements.define('list-produto-page', ListProdutoPage);