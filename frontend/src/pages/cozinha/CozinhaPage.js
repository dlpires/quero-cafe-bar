import './CozinhaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, createPaginationState, calculateResponsivePageSize, renderPaginationBar, createCardSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Cozinha';

class CozinhaPage extends HTMLElement {
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
    if (window.location.pathname === '/cozinha') {
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

    const grid = document.createElement('div');
    grid.className = 'comandas-grid';
    gridContainer.textContent = '';
    gridContainer.appendChild(grid);

    this.comandas.forEach(comanda => {
      const card = document.createElement('ion-card');
      card.className = 'comanda-card';
      card.dataset.comandaId = comanda.id;
      card.role = 'region';
      card.setAttribute('aria-labelledby', `comanda-title-${comanda.id}`);

      const header = document.createElement('ion-card-header');
      const title = document.createElement('ion-card-title');
      title.id = `comanda-title-${comanda.id}`;
      title.textContent = `Comanda #${comanda.id} — Mesa: ${comanda.mesa.id}`;
      header.appendChild(title);

      const todosEntregues = comanda.itens.length > 0 && comanda.itens.every(item => item.statusEntrega);
      const statusIcon = document.createElement('ion-icon');
      statusIcon.name = todosEntregues ? 'checkmark-circle' : 'time-outline';
      statusIcon.color = todosEntregues ? 'success' : 'warning';
      statusIcon.className = 'card-status-icon';
      statusIcon.setAttribute('aria-hidden', 'true');
      header.appendChild(statusIcon);
      card.appendChild(header);

      const content = document.createElement('ion-card-content');
      card.appendChild(content);

      comanda.itens.forEach(item => {
        const ionItem = document.createElement('ion-item');
        ionItem.setAttribute('lines', 'none');
        ionItem.className = `comanda-item ${item.statusEntrega ? 'item-delivered' : 'item-pending'}`;

        const label = document.createElement('ion-label');
        label.className = 'item-label';
        const nameEl = document.createElement('h2');
        nameEl.className = 'item-name';
        nameEl.textContent = item.produto.dsc_produto;
        label.appendChild(nameEl);
        const qtyEl = document.createElement('p');
        qtyEl.className = 'item-qty';
        qtyEl.textContent = `Quantidade: ${item.qtd_item}`;
        label.appendChild(qtyEl);
        ionItem.appendChild(label);

        const select = document.createElement('ion-select');
        select.className = 'item-status-select';
        select.slot = 'end';
        select.dataset.idComanda = comanda.id;
        select.dataset.idProduto = item.id_produto;
        select.value = item.statusEntrega.toString();
        select.interface = 'action-sheet';
        const statusText = item.statusEntrega ? 'Entregue' : 'Pendente';
        select.setAttribute('aria-label', `Status de ${item.produto.dsc_produto}: ${statusText}`);

        const optPendente = document.createElement('ion-select-option');
        optPendente.value = 'false';
        optPendente.textContent = 'Pendente';
        select.appendChild(optPendente);

        const optEntregue = document.createElement('ion-select-option');
        optEntregue.value = 'true';
        optEntregue.textContent = 'Entregue';
        select.appendChild(optEntregue);

        select.addEventListener('ionChange', async (e) => {
          const idComanda = select.dataset.idComanda;
          const idProduto = select.dataset.idProduto;
          const newStatus = e.detail.value === 'true';
          await this.updateItemEntrega(idComanda, idProduto, newStatus, card);
          ionItem.classList.remove('item-pending', 'item-delivered');
          ionItem.classList.add(newStatus ? 'item-delivered' : 'item-pending');
        });

        ionItem.appendChild(select);
        content.appendChild(ionItem);
      });

      grid.appendChild(card);
    });
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

customElements.define('cozinha-page', CozinhaPage);
