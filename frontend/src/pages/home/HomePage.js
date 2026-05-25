import './HomePage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Cozinha';

class HomePage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="home-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    await this.fetchComandas();

    window.addEventListener('popstate', () => this.onRouteChange());
    this._routeListener = () => this.onRouteChange();
    document.querySelector('ion-router').addEventListener('urlChanged', this._routeListener);
  }

  disconnectedCallback() {
    if (this._routeListener) {
      document.querySelector('ion-router').removeEventListener('urlChanged', this._routeListener);
    }
  }

  async onRouteChange() {
    if (window.location.pathname === '/home') {
      await this.fetchComandas();
      focusFirstElement(this);
    }
  }

  async fetchComandas() {
    const container = this.querySelector('.home-container');
    this.renderSkeleton(container);

    try {
      const comandas = await api.getComandas();
      this.renderComandas(comandas);
    } catch (error) {
      console.error('Erro ao buscar comandas:', error);
      container.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os pedidos. Tente novamente.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  renderSkeleton(container) {
    container.innerHTML = `
      <div class="comandas-grid">
        ${[1,2,3].map(() => `
          <ion-card>
            <ion-card-header>
              <ion-card-title><ion-skeleton-text animated style="width: 70%"></ion-skeleton-text></ion-card-title>
            </ion-card-header>
            <ion-card-content>
              ${[1,2].map(() => `
                <ion-item lines="none">
                  <ion-label>
                    <h3><ion-skeleton-text animated style="width: 60%"></ion-skeleton-text></h3>
                  </ion-label>
                  <ion-skeleton-text animated style="width: 80px; height: 24px" slot="end"></ion-skeleton-text>
                </ion-item>
              `).join('')}
            </ion-card-content>
          </ion-card>
        `).join('')}
      </div>
    `;
  }

  renderComandas(comandas) {
    const container = this.querySelector('.home-container');
    if (comandas.length === 0) {
      createEmptyState(container, {
        icon: 'restaurant-outline',
        message: 'Nenhum pedido pendente.',
        actionLabel: '',
        actionHandler: null
      });
      return;
    }

    container.innerHTML = `
      <div class="comandas-grid">
        ${comandas.map(comanda => this.renderComandaCard(comanda)).join('')}
      </div>
    `;

    container.querySelectorAll('.item-entrega-select').forEach(select => {
      select.addEventListener('ionChange', async (e) => {
        const id_comanda = select.dataset.idComanda;
        const id_produto = select.dataset.idProduto;
        const statusEntrega = e.detail.value === 'true';
        await this.updateItemEntrega(id_comanda, id_produto, statusEntrega, select.closest('ion-card'));

        const ionItem = select.closest('ion-item');
        if (ionItem) {
          ionItem.classList.remove('item-pending', 'item-delivered');
          ionItem.classList.add(statusEntrega ? 'item-delivered' : 'item-pending');
        }
      });
    });
  }

  renderComandaCard(comanda) {
    const todosEntregues = comanda.itens.length > 0 && comanda.itens.every(item => item.statusEntrega);
    const statusIcon = todosEntregues ? 'checkmark-circle' : 'time-outline';
    const statusColor = todosEntregues ? 'success' : 'warning';

    const itensHtml = comanda.itens.map(item => `
      <ion-item lines="none" class="item-entrega ${item.statusEntrega ? 'item-delivered' : 'item-pending'}">
        <ion-label>
          <h3 class="item-produto-nome">${item.produto.dsc_produto} <ion-badge color="primary">x${item.qtd_item}</ion-badge></h3>
        </ion-label>
        <ion-select
          class="item-entrega-select"
          data-id-comanda="${comanda.id}"
          data-id-produto="${item.id_produto}"
          value="${item.statusEntrega.toString()}"
          interface="popover"
          slot="end"
          aria-label="Status de entrega do item ${item.produto.dsc_produto}"
        >
          <ion-select-option value="false">Pendente</ion-select-option>
          <ion-select-option value="true">Entregue</ion-select-option>
        </ion-select>
      </ion-item>
    `).join('');

    return `
      <ion-card class="comanda-card" data-comanda-id="${comanda.id}">
        <ion-card-header>
          <ion-card-title>
            <div class="card-header-content">
              <span>Comanda #${comanda.id}</span>
              <span>Mesa: ${comanda.mesa.id}</span>
              <ion-icon name="${statusIcon}" color="${statusColor}" class="status-icon" aria-hidden="true"></ion-icon>
            </div>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          ${itensHtml}
        </ion-card-content>
      </ion-card>
    `;
  }

  async updateItemEntrega(id_comanda, id_produto, statusEntrega, cardElement) {
    try {
      await api.updateItemComanda(id_comanda, id_produto, { statusEntrega });
      this.updateCardStatusIcon(cardElement);
      await showToast('Status do item atualizado!', 'success', 2000);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      await showToast(error.message, 'error', 5000);
    }
  }

  updateCardStatusIcon(cardElement) {
    const selects = cardElement.querySelectorAll('.item-entrega-select');
    const allEntregues = Array.from(selects).every(select => select.value === 'true');
    const icon = cardElement.querySelector('.status-icon');
    if (allEntregues) {
      icon.name = 'checkmark-circle';
      icon.color = 'success';
    } else {
      icon.name = 'time-outline';
      icon.color = 'warning';
    }
  }
}

customElements.define('home-page', HomePage);
