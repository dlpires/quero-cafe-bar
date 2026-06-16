import './HomePage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, createPaginationState, calculateResponsivePageSize, renderPaginationBar, createCardSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Cozinha';

class HomePage extends HTMLElement {
  constructor() {
    super();
    this.comandas = [];
    this.isLoading = false;
    this.pagination = createPaginationState(calculateResponsivePageSize('home'));
  }

  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="home-container">
          <div class="comandas-grid-container"></div>
        </div>
      </ion-content>
      <ion-footer>
        <div class="pagination-bar-container"></div>
      </ion-footer>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    await this.loadPage(1);

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
      this.pagination.reset();
      await this.loadPage(1);
      focusFirstElement(this);
    }
  }

  async loadPage(page) {
    if (this.isLoading) return;
    this.isLoading = true;
    const gridContainer = this.querySelector('.comandas-grid-container');
    const paginationContainer = this.querySelector('.pagination-bar-container');

    try {
      const skip = (page - 1) * this.pagination.take;
      gridContainer.innerHTML = createCardSkeleton(4);
      paginationContainer.innerHTML = '';

      const response = await api.getComandas(skip, this.pagination.take);
      this.comandas = response.data || response;
      const total = response.total != null ? response.total : this.comandas.length;
      this.pagination.update(total);
      this.pagination.currentPage = page;
      this.renderComandas();
      this.renderPaginationControls();
      gridContainer.scrollTop = 0;
    } catch (error) {
      console.error('Erro ao buscar comandas:', error);
      gridContainer.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os pedidos. Tente novamente.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  nextPage() { this.loadPage(this.pagination.currentPage + 1); }
  prevPage() { this.loadPage(this.pagination.currentPage - 1); }

  renderPaginationControls() {
    const container = this.querySelector('.pagination-bar-container');
    if (this.comandas.length === 0) {
      container.innerHTML = '';
      return;
    }
    const barHtml = renderPaginationBar(this.pagination);
    container.innerHTML = barHtml;

    container.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => this.prevPage());
    container.querySelector('[data-action="next-page"]')?.addEventListener('click', () => this.nextPage());
  }

  renderComandas() {
    const gridContainer = this.querySelector('.comandas-grid-container');
    if (this.comandas.length === 0) {
      createEmptyState(gridContainer, {
        icon: 'restaurant-outline',
        message: 'Nenhum pedido pendente.',
        actionLabel: '',
        actionHandler: null
      });
      return;
    }

    gridContainer.innerHTML = `
      <div class="comandas-grid">
        ${this.comandas.map(comanda => this.renderComandaCard(comanda)).join('')}
      </div>
    `;

    gridContainer.querySelectorAll('.item-status-select').forEach(select => {
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

    const itensHtml = comanda.itens.map(item => {
      const statusText = item.statusEntrega ? 'Entregue' : 'Pendente';
      return `
      <ion-item lines="none" class="comanda-item ${item.statusEntrega ? 'item-delivered' : 'item-pending'}">
        <ion-label class="item-label">
          <h2 class="item-name">${item.produto.dsc_produto}</h2>
          <p class="item-qty">Quantidade: ${item.qtd_item}</p>
        </ion-label>
        <ion-select
          class="item-status-select"
          slot="end"
          data-id-comanda="${comanda.id}"
          data-id-produto="${item.id_produto}"
          value="${item.statusEntrega.toString()}"
          interface="action-sheet"
          aria-label="Status de ${item.produto.dsc_produto}: ${statusText}"
        >
          <ion-select-option value="false">Pendente</ion-select-option>
          <ion-select-option value="true">Entregue</ion-select-option>
        </ion-select>
      </ion-item>
      `;
    }).join('');

    return `
      <ion-card class="comanda-card" data-comanda-id="${comanda.id}" role="region" aria-labelledby="comanda-title-${comanda.id}">
        <ion-card-header>
          <ion-card-title id="comanda-title-${comanda.id}">Comanda #${comanda.id} — Mesa: ${comanda.mesa.id}</ion-card-title>
          <ion-icon name="${statusIcon}" color="${statusColor}" class="card-status-icon" aria-hidden="true"></ion-icon>
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
    const selects = cardElement.querySelectorAll('.item-status-select');
    const allEntregues = Array.from(selects).every(select => select.value === 'true');
    const icon = cardElement.querySelector('.card-status-icon');
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
