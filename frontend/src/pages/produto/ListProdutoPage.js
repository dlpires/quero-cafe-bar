import './ListProdutoPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, perfMeasureAsync, createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton, getLoggedUserProfile } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Produtos';

class ListProdutoPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.userPerfil = null;
    this.pagination = createPaginationState(calculateResponsivePageSize('produto'));
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
      </ion-content>
      <ion-footer>
        <div class="pagination-bar-container"></div>
      </ion-footer>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    try {
      this.userPerfil = await getLoggedUserProfile();
    } catch {
      this.userPerfil = null;
    }
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
    if (this.userPerfil !== 0) return;
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
    const isAdmin = this.userPerfil === 0;

    if (this.items.length === 0) {
      createEmptyState(container, {
        icon: 'file-tray-outline',
        message: 'Nenhum produto encontrado.',
        actionLabel: isAdmin ? 'Cadastrar Produto' : '',
        actionHandler: isAdmin ? () => {
          const router = document.querySelector('ion-router');
          router.push('/produto/register');
        } : null
      });
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const list = document.createElement('ion-list');
    container.textContent = '';
    container.appendChild(list);

    this.items.forEach(produto => {
      const sliding = document.createElement('ion-item-sliding');

      const ionItem = document.createElement('ion-item');

      const label = document.createElement('ion-label');
      const titleDiv = document.createElement('h2');
      titleDiv.className = 'item-title';

      const icon = document.createElement('ion-icon');
      icon.name = produto.status ? 'checkmark-circle' : 'close-circle';
      icon.color = produto.status ? 'success' : 'danger';
      icon.className = 'item-icon';
      icon.setAttribute('aria-hidden', 'true');
      titleDiv.appendChild(icon);

      const span = document.createElement('span');
      span.textContent = produto.dsc_produto;
      titleDiv.appendChild(span);
      label.appendChild(titleDiv);

      const p = document.createElement('p');
      p.textContent = formatCurrency(produto.valor_unit);
      label.appendChild(p);
      ionItem.appendChild(label);

      if (isAdmin) {
        const buttons = document.createElement('ion-buttons');
        buttons.slot = 'end';
        const editBtn = document.createElement('ion-button');
        editBtn.fill = 'clear';
        editBtn.className = 'btn-edit';
        editBtn.dataset.id = produto.id;
        editBtn.setAttribute('aria-label', `Editar ${produto.dsc_produto}`);
        editBtn.addEventListener('click', () => {
          document.querySelector('ion-router').push(`/produto/edit?id=${produto.id}`);
        });
        const editIcon = document.createElement('ion-icon');
        editIcon.slot = 'icon-only';
        editIcon.name = 'create-outline';
        editBtn.appendChild(editIcon);
        buttons.appendChild(editBtn);
        ionItem.appendChild(buttons);
        sliding.appendChild(ionItem);

        const options = document.createElement('ion-item-options');
        options.side = 'end';
        const deleteOpt = document.createElement('ion-item-option');
        deleteOpt.color = 'danger';
        deleteOpt.className = 'btn-swipe-delete';
        deleteOpt.dataset.id = produto.id;
        deleteOpt.setAttribute('aria-label', `Excluir ${produto.dsc_produto}`);
        const deleteIcon = document.createElement('ion-icon');
        deleteIcon.slot = 'start';
        deleteIcon.name = 'trash-outline';
        deleteOpt.appendChild(deleteIcon);
        deleteOpt.append(' Excluir');
        deleteOpt.addEventListener('click', async () => {
          const alert = document.createElement('ion-alert');
          alert.header = 'Confirmar';
          alert.message = 'Deseja realmente excluir este produto?';
          alert.buttons = [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Excluir',
              handler: async () => {
                try {
                  await api.deleteProduto(produto.id);
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
        options.appendChild(deleteOpt);
        sliding.appendChild(options);
      }

      list.appendChild(sliding);
    });
  }
}

customElements.define('list-produto-page', ListProdutoPage);
