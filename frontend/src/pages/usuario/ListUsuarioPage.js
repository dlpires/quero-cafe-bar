import './ListUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, getLoggedUserId, perfMeasureAsync } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { createVirtualScrollState, calculateVisibleRange, getVisibleItems } from '../../shared/virtual-scroll.js';

const pageName = 'Usuários';
const ITEM_HEIGHT = 72;
const PAGE_SIZE = 20;

class ListUsuarioPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.hasMore = true;
    this.virtualState = createVirtualScrollState(ITEM_HEIGHT, 2);
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
        <div class="list-usuario-container"></div>
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
    if (window.location.pathname === '/usuarios') {
      await this.refreshData();
      focusFirstElement(this);
    }
  }

  async fetchInitialData() {
    const container = this.querySelector('.list-usuario-container');
    this.renderSkeleton(container);
    this.items = [];
    this.hasMore = true;
    this.virtualState.allItems = [];

    try {
      const response = await perfMeasureAsync('usuario:fetchInitial', () => api.getUsuarios(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao buscar usuarios:', error);
      container.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os usuarios. Tente novamente mais tarde.';
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
      const response = await perfMeasureAsync('usuario:loadMore', () => api.getUsuarios(this.items.length, PAGE_SIZE));
      const newItems = response.data || response;
      const total = response.total != null ? response.total : this.items.length + newItems.length;
      this.items.push(...newItems);
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao carregar mais usuarios:', error);
      await showToast('Erro ao carregar mais usuarios. Verifique sua conexão.', 'error', 3000);
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
      const response = await perfMeasureAsync('usuario:refresh', () => api.getUsuarios(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.virtualState.allItems = this.items;
      calculateVisibleRange(this.virtualState);
      this.renderVisibleItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao atualizar usuarios:', error);
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
      <div class="virtual-scroll-viewport">
        <ion-list>
          ${[1,2,3,4,5].map(() => `
            <ion-item>
              <ion-label>
                <h3><ion-skeleton-text animated class="skeleton-w-50"></ion-skeleton-text></h3>
                <p><ion-skeleton-text animated class="skeleton-w-80"></ion-skeleton-text></p>
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
      <ion-fab-button aria-label="Adicionar Usuário">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    `;
    fab.addEventListener('click', () => {
      const router = document.querySelector('ion-router');
      router.push('/usuario/register');
    });
    content.appendChild(fab);
  }

  renderVisibleItems() {
    const container = this.querySelector('.list-usuario-container');
    if (!container) return;

    if (this.items.length === 0) {
      createEmptyState(container, {
        icon: 'people-outline',
        message: 'Nenhum usuario encontrado.',
        actionLabel: 'Cadastrar Usuário',
        actionHandler: () => {
          const router = document.querySelector('ion-router');
          router.push('/usuario/register');
        }
      });
      return;
    }

    const loggedUserId = getLoggedUserId();
    const visibleItems = getVisibleItems(this.virtualState);
    const itemsHtml = visibleItems.map((usuario) => {
      const isSelf = loggedUserId !== null && parseInt(loggedUserId) === usuario.id;
      return `
      <ion-item-sliding>
        <ion-item>
          <ion-label>
            <h2 class="item-title">
              <ion-icon
                name="${usuario.perfil === 0 ? 'shield-checkmark-outline' : 'person-outline'}"
                color="medium"
                aria-hidden="true"
              ></ion-icon>
              <span>${usuario.nome}</span>
            </h2>
            <p>${usuario.usuario}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button fill="clear" class="btn-edit" data-id="${usuario.id}" aria-label="Editar ${usuario.nome}">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
        ${isSelf ? '' : `
        <ion-item-options side="end">
          <ion-item-option color="danger" class="btn-swipe-delete" data-id="${usuario.id}" aria-label="Excluir ${usuario.nome}">
            <ion-icon slot="start" name="trash-outline"></ion-icon>
            Excluir
          </ion-item-option>
        </ion-item-options>
        `}
      </ion-item-sliding>
    `}).join('');

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
        router.push(`/usuario/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-swipe-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir este usuario?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            handler: async () => {
              try {
                await api.deleteUsuario(id);
                await showToast('Usuário excluído com sucesso!', 'success', 2000);
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

customElements.define('list-usuario-page', ListUsuarioPage);
