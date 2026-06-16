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

    const comandaItems = this.comandasWithDetails.map((comanda) => `
      <ion-item>
        <ion-label>
          <h2 class="item-title">
            <ion-icon
              name="${comanda.todosPagos ? 'checkmark-circle' : 'cash-outline'}"
              color="${comanda.todosPagos ? 'success' : 'warning'}"
              class="item-icon"
              aria-hidden="true"
            ></ion-icon>
            <span>Comanda #${comanda.id}</span>
          </h2>
          <p>Mesa: ${comanda.id_mesa}</p>
          <p>Itens: ${comanda.qtdItens} | Total: ${formatCurrency(comanda.valorTotal)}</p>
          <p>
            <ion-icon name="${comanda.todosPagos ? 'checkmark-circle' : 'close-circle'}" color="${comanda.todosPagos ? 'success' : 'danger'}" aria-hidden="true"></ion-icon>
            <span class="status-text">${comanda.todosPagos ? 'Pago' : 'Não Pago'}</span>
            <ion-icon name="${comanda.todosEntregues ? 'checkmark-circle' : 'close-circle'}" color="${comanda.todosEntregues ? 'success' : 'danger'}" class="status-text-separator" aria-hidden="true"></ion-icon>
            <span class="status-text">${comanda.todosEntregues ? 'Entregue' : 'Não Entregue'}</span>
          </p>
        </ion-label>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="btn-edit" data-id="${comanda.id}" aria-label="Editar Comanda ${comanda.id}">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${comanda.id}" aria-label="Excluir Comanda ${comanda.id}">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `).join('');

    container.innerHTML = `<ion-list>${comandaItems}</ion-list>`;

    container.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/comanda/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir esta comanda?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            handler: async () => {
              try {
                await api.deleteComanda(id);
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
    });
  }
}

customElements.define('list-comanda-page', ListComandaPage);
