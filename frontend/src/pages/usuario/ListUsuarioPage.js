import './ListUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, getLoggedUserId, getLoggedUserProfile, perfMeasureAsync, createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Usuários';

class ListUsuarioPage extends HTMLElement {
  constructor() {
    super();
    this.items = [];
    this.isLoading = false;
    this.pagination = createPaginationState(calculateResponsivePageSize('usuario'));
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
        <div class="list-usuario-container"></div>
      </ion-content>
      <ion-footer>
        <div class="pagination-bar-container"></div>
      </ion-footer>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    const perfil = await getLoggedUserProfile();
    if (perfil !== 0) {
      await showToast('Você não tem permissão para acessar esta página.', 'error', 3000);
      document.querySelector('ion-router')?.push('/home', 'root');
      return;
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
    if (window.location.pathname === '/usuarios') {
      this.pagination.reset();
      await this.loadPage(1);
      focusFirstElement(this);
    }
  }

  async loadPage(page) {
    if (this.isLoading) return;
    this.isLoading = true;
    const container = this.querySelector('.list-usuario-container');
    const paginationContainer = this.querySelector('.pagination-bar-container');

    try {
      const skip = (page - 1) * this.pagination.take;
      container.innerHTML = createListSkeleton(5);
      paginationContainer.innerHTML = '';

      const response = await perfMeasureAsync('usuario:loadPage', () => api.getUsuarios(skip, this.pagination.take));
      this.items = response.data || response;
      const total = response.total != null ? response.total : this.items.length;
      this.pagination.update(total);
      this.pagination.currentPage = page;
      await this.renderItems();
      this.renderPaginationControls();
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      await showToast('Erro ao carregar página. Tente novamente.', 'error', 3000);
      await this.renderItems();
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

  async renderItems() {
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

    const list = document.createElement('ion-list');
    container.textContent = '';
    container.appendChild(list);

    const loggedUserId = await getLoggedUserId();
    this.items.forEach(usuario => {
      const isSelf = loggedUserId !== null && parseInt(loggedUserId) === usuario.id;
      const sliding = document.createElement('ion-item-sliding');

      const ionItem = document.createElement('ion-item');

      const label = document.createElement('ion-label');
      const titleDiv = document.createElement('h2');
      titleDiv.className = 'item-title';

      const icon = document.createElement('ion-icon');
      icon.name = usuario.perfil === 0 ? 'shield-checkmark-outline' : 'person-outline';
      icon.color = 'medium';
      icon.setAttribute('aria-hidden', 'true');
      titleDiv.appendChild(icon);

      const span = document.createElement('span');
      span.textContent = usuario.nome;
      titleDiv.appendChild(span);
      label.appendChild(titleDiv);

      const userP = document.createElement('p');
      userP.textContent = usuario.usuario;
      label.appendChild(userP);
      ionItem.appendChild(label);

      const buttons = document.createElement('ion-buttons');
      buttons.slot = 'end';
      const editBtn = document.createElement('ion-button');
      editBtn.fill = 'clear';
      editBtn.className = 'btn-edit';
      editBtn.dataset.id = usuario.id;
      editBtn.setAttribute('aria-label', `Editar ${usuario.nome}`);
      editBtn.addEventListener('click', () => {
        document.querySelector('ion-router').push(`/usuario/edit?id=${usuario.id}`);
      });
      const editIcon = document.createElement('ion-icon');
      editIcon.slot = 'icon-only';
      editIcon.name = 'create-outline';
      editBtn.appendChild(editIcon);
      buttons.appendChild(editBtn);
      ionItem.appendChild(buttons);
      sliding.appendChild(ionItem);

      if (!isSelf) {
        const options = document.createElement('ion-item-options');
        options.side = 'end';
        const deleteOpt = document.createElement('ion-item-option');
        deleteOpt.color = 'danger';
        deleteOpt.className = 'btn-swipe-delete';
        deleteOpt.dataset.id = usuario.id;
        deleteOpt.setAttribute('aria-label', `Excluir ${usuario.nome}`);
        const deleteIcon = document.createElement('ion-icon');
        deleteIcon.slot = 'start';
        deleteIcon.name = 'trash-outline';
        deleteOpt.appendChild(deleteIcon);
        deleteOpt.append(' Excluir');
        deleteOpt.addEventListener('click', async () => {
          const alert = document.createElement('ion-alert');
          alert.header = 'Confirmar';
          alert.message = 'Deseja realmente excluir este usuario?';
          alert.buttons = [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Excluir',
              handler: async () => {
                try {
                  await api.deleteUsuario(usuario.id);
                  await showToast('Usuário excluído com sucesso!', 'success', 2000);
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

customElements.define('list-usuario-page', ListUsuarioPage);
