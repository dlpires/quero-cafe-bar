import './ListComandaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, perfMeasureAsync, createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Comandas';

class ListComandaPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.pagination = createPaginationState(calculateResponsivePageSize('comanda'));
    this.comandasWithDetails = [];
  }

  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-content-no-scroll">
        <ion-refresher slot="fixed">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <div class="list-comanda-container"></div>
      </ion-content>
      <ion-footer>
        <div class="pagination-bar-container"></div>
      </ion-footer>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();

    const content = this.querySelector('ion-content');
    content.addEventListener('ionRefresh', async (ev) => {
      await this.refreshData(ev);
    });

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
    if (window.location.pathname === '/comandas') {
      this.pagination.reset();
      await this.loadPage(1);
      focusFirstElement(this);
    }
  }

  async loadPage(page) {
    if (this.isLoading) return;
    this.isLoading = true;
    const container = this.querySelector('.list-comanda-container');
    const paginationContainer = this.querySelector('.pagination-bar-container');

    try {
      const skip = (page - 1) * this.pagination.take;
      container.innerHTML = createListSkeleton(4);
      paginationContainer.innerHTML = '';

      const response = await perfMeasureAsync('comanda:loadPage', () => api.getComandas(skip, this.pagination.take));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.pagination.update(total);
      this.pagination.currentPage = page;
      await this.enrichComandas();
      this.renderItems();
      this.renderPaginationControls();
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      await showToast('Erro ao carregar página. Tente novamente.', 'error', 3000);
      this.renderItems();
      this.renderPaginationControls();
    } finally {
      this.isLoading = false;
    }
  }

  async enrichComandas() {
    this.comandasWithDetails = await Promise.all(
      this.items.map(async (comanda) => {
        try {
          const itens = await api.getItensComanda(comanda.id);
          const qtdItens = itens.length;
          const valorTotal = itens.reduce((sum, item) => sum + (item.qtd_item * item.valor_venda), 0);
          const todosPagos = itens.length > 0 && itens.every(item => item.statusPg);
          const todosEntregues = itens.length > 0 && itens.every(item => item.statusEntrega);
          return { ...comanda, qtdItens, valorTotal, todosPagos, todosEntregues };
        } catch {
          return { ...comanda, qtdItens: 0, valorTotal: 0, todosPagos: false, todosEntregues: false };
        }
      })
    );
  }

  nextPage() { this.loadPage(this.pagination.currentPage + 1); }
  prevPage() { this.loadPage(this.pagination.currentPage - 1); }

  async refreshData(event) {
    this.pagination.reset();
    await this.loadPage(1);
    if (event) event.target.complete();
  }

  renderPaginationControls() {
    const container = this.querySelector('.pagination-bar-container');
    if (this.comandasWithDetails.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = renderPaginationBar(this.pagination);

    container.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => this.prevPage());
    container.querySelector('[data-action="next-page"]')?.addEventListener('click', () => this.nextPage());
  }

  renderFabButton() {
    const content = this.querySelector('ion-content');
    const fab = document.createElement('ion-fab');
    fab.vertical = 'bottom';
    fab.horizontal = 'end';
    fab.slot = 'fixed';
    fab.innerHTML = `
      <ion-fab-button aria-label="Nova Comanda">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    `;
    fab.addEventListener('click', () => {
      const router = document.querySelector('ion-router');
      router.push('/comanda/register');
    });
    content.appendChild(fab);
  }

  renderItems() {
    const container = this.querySelector('.list-comanda-container');
    if (!container) return;

    if (this.comandasWithDetails.length === 0) {
      createEmptyState(container, {
        icon: 'receipt-outline',
        message: 'Nenhuma comanda encontrada.',
        actionLabel: 'Abrir Comanda',
        actionHandler: () => {
          const router = document.querySelector('ion-router');
          router.push('/comanda/register');
        }
      });
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const list = document.createElement('ion-list');
    container.textContent = '';
    container.appendChild(list);

    this.comandasWithDetails.forEach(comanda => {
      const ionItem = document.createElement('ion-item');

      const label = document.createElement('ion-label');
      const titleDiv = document.createElement('h2');
      titleDiv.className = 'item-title';

      const statusIcon = document.createElement('ion-icon');
      statusIcon.name = comanda.todosPagos ? 'checkmark-circle' : 'cash-outline';
      statusIcon.color = comanda.todosPagos ? 'success' : 'warning';
      statusIcon.className = 'item-icon';
      statusIcon.setAttribute('aria-hidden', 'true');
      titleDiv.appendChild(statusIcon);

      const titleSpan = document.createElement('span');
      titleSpan.textContent = `Comanda #${comanda.id}`;
      titleDiv.appendChild(titleSpan);
      label.appendChild(titleDiv);

      const mesaP = document.createElement('p');
      mesaP.textContent = `Mesa: ${comanda.id_mesa}`;
      label.appendChild(mesaP);

      const itensP = document.createElement('p');
      itensP.textContent = `Itens: ${comanda.qtdItens} | Total: ${formatCurrency(comanda.valorTotal)}`;
      label.appendChild(itensP);

      const statusP = document.createElement('p');

      const pgIcon = document.createElement('ion-icon');
      pgIcon.name = comanda.todosPagos ? 'checkmark-circle' : 'close-circle';
      pgIcon.color = comanda.todosPagos ? 'success' : 'danger';
      pgIcon.setAttribute('aria-hidden', 'true');
      statusP.appendChild(pgIcon);

      const pgText = document.createElement('span');
      pgText.className = 'status-text';
      pgText.textContent = comanda.todosPagos ? 'Pago' : 'Não Pago';
      statusP.appendChild(pgText);

      const entIcon = document.createElement('ion-icon');
      entIcon.name = comanda.todosEntregues ? 'checkmark-circle' : 'close-circle';
      entIcon.color = comanda.todosEntregues ? 'success' : 'danger';
      entIcon.className = 'status-text-separator';
      entIcon.setAttribute('aria-hidden', 'true');
      statusP.appendChild(entIcon);

      const entText = document.createElement('span');
      entText.className = 'status-text';
      entText.textContent = comanda.todosEntregues ? 'Entregue' : 'Não Entregue';
      statusP.appendChild(entText);

      label.appendChild(statusP);
      ionItem.appendChild(label);

      const buttons = document.createElement('ion-buttons');
      buttons.slot = 'end';

      const editBtn = document.createElement('ion-button');
      editBtn.fill = 'clear';
      editBtn.className = 'btn-edit';
      editBtn.dataset.id = comanda.id;
      editBtn.setAttribute('aria-label', `Editar Comanda ${comanda.id}`);
      editBtn.addEventListener('click', () => {
        document.querySelector('ion-router').push(`/comanda/edit?id=${comanda.id}`);
      });
      const editIcon = document.createElement('ion-icon');
      editIcon.slot = 'icon-only';
      editIcon.name = 'create-outline';
      editBtn.appendChild(editIcon);
      buttons.appendChild(editBtn);

      const deleteBtn = document.createElement('ion-button');
      deleteBtn.fill = 'clear';
      deleteBtn.color = 'danger';
      deleteBtn.className = 'btn-delete';
      deleteBtn.dataset.id = comanda.id;
      deleteBtn.setAttribute('aria-label', `Excluir Comanda ${comanda.id}`);
      const deleteIcon = document.createElement('ion-icon');
      deleteIcon.slot = 'icon-only';
      deleteIcon.name = 'trash-outline';
      deleteBtn.appendChild(deleteIcon);
      deleteBtn.addEventListener('click', async () => {
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir esta comanda?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            handler: async () => {
              try {
                await api.deleteComanda(comanda.id);
                await showToast('Comanda excluída com sucesso!', 'success', 2000);
                this.pagination.reset();
                await this.loadPage(1);
              } catch (error) {
                console.error('Erro ao excluir:', error);
                await showToast(error.message, 'error', 5000);
              }
            }
          }
        ];
        document.body.appendChild(alert);
        await alert.present();
      });
      buttons.appendChild(deleteBtn);

      ionItem.appendChild(buttons);
      list.appendChild(ionItem);
    });
  }
}

customElements.define('list-comanda-page', ListComandaPage);
