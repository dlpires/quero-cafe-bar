import './ListProdutoPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, perfMeasureAsync, createPaginationState, getPageSize, renderPaginationBar, createListSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Produtos';

class ListProdutoPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.pagination = createPaginationState(getPageSize('produto'));
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
        <div class="list-produto-container"></div>
        <div class="pagination-bar-container"></div>
      </ion-content>
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
    if (window.location.pathname === '/produtos') {
      this.pagination.reset();
      await this.loadPage(1);
      focusFirstElement(this);
    }
  }

  async loadPage(page) {
    if (this.isLoading) return;
    this.isLoading = true;
    const container = this.querySelector('.list-produto-container');
    const paginationContainer = this.querySelector('.pagination-bar-container');

    try {
      const skip = (page - 1) * this.pagination.take;
      container.innerHTML = createListSkeleton(5);
      paginationContainer.innerHTML = '';

      const response = await perfMeasureAsync('produto:loadPage', () => api.getProdutos(skip, this.pagination.take));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.pagination.update(total);
      this.pagination.currentPage = page;
      this.renderItems();
      this.renderPaginationControls();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      await showToast('Erro ao carregar página. Tente novamente.', 'error', 3000);
      this.renderItems();
      this.renderPaginationControls();
    } finally {
      this.isLoading = false;
    }
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
    if (this.items.length === 0) {
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
      <ion-fab-button aria-label="Adicionar Produto">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    `;
    fab.addEventListener('click', () => {
      const router = document.querySelector('ion-router');
      router.push('/produto/register');
    });
    content.appendChild(fab);
  }

  renderItems() {
    const container = this.querySelector('.list-produto-container');
    if (!container) return;

    if (this.items.length === 0) {
      createEmptyState(container, {
        icon: 'file-tray-outline',
        message: 'Nenhum produto encontrado.',
        actionLabel: 'Cadastrar Produto',
        actionHandler: () => {
          const router = document.querySelector('ion-router');
          router.push('/produto/register');
        }
      });
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const itemsHtml = this.items.map(
      (produto) => `
      <ion-item-sliding>
        <ion-item>
          <ion-label>
            <h2 class="item-title">
              <ion-icon
                name="${produto.status ? 'checkmark-circle' : 'close-circle'}"
                color="${produto.status ? 'success' : 'danger'}"
                class="item-icon"
                aria-hidden="true"
              ></ion-icon>
              <span>${produto.dsc_produto}</span>
            </h2>
            <p>${formatCurrency(produto.valor_unit)}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button fill="clear" class="btn-edit" data-id="${produto.id}" aria-label="Editar ${produto.dsc_produto}">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option color="danger" class="btn-swipe-delete" data-id="${produto.id}" aria-label="Excluir ${produto.dsc_produto}">
            <ion-icon slot="start" name="trash-outline"></ion-icon>
            Excluir
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    `).join('');

    container.innerHTML = `<ion-list>${itemsHtml}</ion-list>`;

    container.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/produto/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-swipe-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir este produto?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            handler: async () => {
              try {
                await api.deleteProduto(id);
                await showToast('Produto excluído com sucesso!', 'success', 2000);
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

customElements.define('list-produto-page', ListProdutoPage);
