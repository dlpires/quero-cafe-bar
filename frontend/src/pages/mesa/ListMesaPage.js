import './ListMesaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, perfMeasureAsync } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Mesas';
const PAGE_SIZE = 20;

class ListMesaPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.hasMore = true;
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
        <div class="list-mesa-container"></div>
        <ion-infinite-scroll>
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();

    const content = this.querySelector('ion-content');
    content.addEventListener('ionInfinite', async (ev) => {
      await this.loadMore(ev);
    });

    content.addEventListener('ionRefresh', async (ev) => {
      await this.refreshData(ev);
    });

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
    if (window.location.pathname === '/mesas') {
      await this.refreshData();
      focusFirstElement(this);
    }
  }

  async fetchInitialData() {
    const container = this.querySelector('.list-mesa-container');
    this.renderSkeleton(container);
    this.items = [];
    this.hasMore = true;

    try {
      const response = await perfMeasureAsync('mesa:fetchInitial', () => api.getMesas(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.renderItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      container.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar as mesas.';
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
      const response = await perfMeasureAsync('mesa:loadMore', () => api.getMesas(this.items.length, PAGE_SIZE));
      const newItems = response.data || response;
      const total = response.total != null ? response.total : this.items.length + newItems.length;
      this.items.push(...newItems);
      this.hasMore = this.items.length < total;
      this.renderItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao carregar mais mesas:', error);
      await showToast('Erro ao carregar mais mesas. Verifique sua conexão.', 'error', 3000);
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  async refreshData(event) {
    this.items = [];
    this.hasMore = true;

    try {
      const response = await perfMeasureAsync('mesa:refresh', () => api.getMesas(0, PAGE_SIZE));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.hasMore = this.items.length < total;
      this.renderItems();
      this.updateInfiniteScroll();
    } catch (error) {
      console.error('Erro ao atualizar mesas:', error);
      await showToast('Erro ao atualizar. Tente novamente.', 'error', 3000);
      this.renderItems();
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
      <ion-list>
        ${[1,2,3].map(() => `
          <ion-item>
            <ion-label>
              <h3><ion-skeleton-text animated style="width: 50%"></ion-skeleton-text></h3>
              <p><ion-skeleton-text animated style="width: 80%"></ion-skeleton-text></p>
            </ion-label>
          </ion-item>
        `).join('')}
      </ion-list>
    `;
  }

  renderFabButton() {
    const content = this.querySelector('ion-content');
    const fab = document.createElement('ion-fab');
    fab.vertical = 'bottom';
    fab.horizontal = 'end';
    fab.slot = 'fixed';
    fab.innerHTML = `<ion-fab-button aria-label="Adicionar Mesa"><ion-icon name="add"></ion-icon></ion-fab-button>`;
    fab.addEventListener('click', () => {
      const router = document.querySelector('ion-router');
      router.push('/mesa/register');
    });
    content.appendChild(fab);
  }

  renderItems() {
    const container = this.querySelector('.list-mesa-container');
    if (!container) return;

    if (this.items.length === 0) {
      createEmptyState(container, {
        icon: 'grid-outline',
        message: 'Nenhuma mesa encontrada.',
        actionLabel: 'Cadastrar Mesa',
        actionHandler: () => {
          const router = document.querySelector('ion-router');
          router.push('/mesa/register');
        }
      });
      return;
    }

    const mesaItems = this.items.map((mesa) => `
      <ion-item-sliding>
        <ion-item>
          <ion-label>
            <h2 class="item-title">
              <ion-icon
                name="${mesa.status ? 'checkmark-circle' : 'close-circle'}"
                color="${mesa.status ? 'success' : 'danger'}"
                class="item-icon"
                aria-hidden="true"
              ></ion-icon>
              <span>Mesa #${mesa.id}</span>
            </h2>
            <p>Cadeiras: ${mesa.qtd_cadeiras}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button fill="clear" class="btn-edit" data-id="${mesa.id}" aria-label="Editar Mesa ${mesa.id}">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option color="danger" class="btn-swipe-delete" data-id="${mesa.id}" aria-label="Excluir Mesa ${mesa.id}">
            <ion-icon slot="start" name="trash-outline"></ion-icon>
            Excluir
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    `).join('');

    container.innerHTML = `<ion-list>${mesaItems}</ion-list>`;

    container.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        document.querySelector('ion-router').push(`/mesa/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-swipe-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir esta mesa?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            handler: async () => {
              try {
                await api.deleteMesa(id);
                await showToast('Mesa excluída com sucesso!', 'success', 2000);
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

customElements.define('list-mesa-page', ListMesaPage);
