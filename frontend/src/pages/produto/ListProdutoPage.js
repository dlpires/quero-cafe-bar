import './ListProdutoPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, perfMeasureAsync } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { createVirtualScrollState, calculateVisibleRange, getVisibleItems } from '../../shared/virtual-scroll.js';

const pageName = 'Produtos';
const ITEM_HEIGHT = 72;
const PAGE_SIZE = 20;

class ListProdutoPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.hasMore = true;
    this.virtualState = createVirtualScrollState(ITEM_HEIGHT, 2);
    this.skeleton = null;
  }

  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <ion-refresher slot="fixed">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <div class="list-produto-container"></div>
        <ion-infinite-scroll>
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();

    const content = this.querySelector('ion-content');
    content.addEventListener('ionScroll', (ev) => {
      this.virtualState.scrollTop = ev.detail.scrollTop;
      this.virtualState.viewportHeight = ev.detail.contentHeight || content.offsetHeight;
      this.renderVisibleItems();
    });

    content.addEventListener('ionInfinite', async (ev) => {
      await this.loadMore(ev);
    });

    content.addEventListener('ionRefresh', async (ev) => {
      await this.refreshData(ev);
    });

    this.virtualState.viewportHeight = content.offsetHeight || window.innerHeight;
    await this.fetchInitialData();

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
      await this.refreshData();
      focusFirstElement(this);
    }
  }

  async fetchInitialData() {
    const container = this.querySelector('.list-produto-container');
    this.skeleton = container;
    this.renderSkeleton(container);
    this.items = [];
    this.hasMore = true;
    this.virtualState.allItems = [];

    try {
      const response = await perfMeasureAsync('produto:fetchInitial', () => api.getProdutos(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      container.innerHTML = '';
      this.skeleton = null;
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os produtos. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  async loadMore(event) {
    if (this.isLoading || !this.hasMore) {
      if (event) event.target.complete();
      return;
    }
    this.isLoading = true;
    try {
      const response = await perfMeasureAsync('produto:loadMore', () => api.getProdutos(this.items.length, PAGE_SIZE));
      const newItems = response.data || response;
      const total = response.total != null ? response.total : this.items.length + newItems.length;
      this.items.push(...newItems);
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao carregar mais produtos:', error);
      await showToast('Erro ao carregar mais produtos. Verifique sua conexão.', 'error', 3000);
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  async refreshData(event) {
    this.items = [];
    this.hasMore = true;
    this.virtualState.allItems = [];
    this.virtualState.scrollTop = 0;

    try {
      const response = await perfMeasureAsync('produto:refresh', () => api.getProdutos(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      await showToast('Erro ao atualizar. Tente novamente.', 'error', 3000);
      this.virtualState.allItems = this.items;
      this.renderVisibleItems();
    } finally {
      if (event) event.target.complete();
    }
  }

  updateInfiniteScroll() {
    const scroll = this.querySelector('ion-infinite-scroll');
    if (scroll) {
      scroll.disabled = !this.hasMore;
    }
  }

  renderSkeleton(container) {
    container.innerHTML = `
      <div class="virtual-scroll-viewport" style="position:relative;overflow:hidden;">
        <ion-list>
          ${[1,2,3,4,5].map(() => `
            <ion-item>
              <ion-label>
                <h3><ion-skeleton-text animated style="width: 50%"></ion-skeleton-text></h3>
                <p><ion-skeleton-text animated style="width: 80%"></ion-skeleton-text></p>
              </ion-label>
            </ion-item>
          `).join('')}
        </ion-list>
      </div>
    `;
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

  renderVisibleItems() {
    const container = this.querySelector('.list-produto-container');
    if (!container) return;

    if (this.items.length === 0) {
      this.skeleton = null;
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

    this.skeleton = null;
    const visibleItems = getVisibleItems(this.virtualState);
    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const itemsHtml = visibleItems.map(
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

    container.innerHTML = `
      <div class="virtual-scroll-viewport" style="position:relative;overflow:hidden;height:${this.virtualState.containerHeight}px;">
        <ion-list style="transform:translateY(${this.virtualState.offsetY}px);">
          ${itemsHtml}
        </ion-list>
      </div>
    `;

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
                await this.refreshData();
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
