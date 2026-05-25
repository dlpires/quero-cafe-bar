import './ListUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, getLoggedUserId } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Usuários';

class ListUsuarioPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-usuario-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();
    await this.fetchUsuarios();

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
      await this.fetchUsuarios();
      focusFirstElement(this);
    }
  }

  async fetchUsuarios() {
    const container = this.querySelector('.list-usuario-container');
    this.renderSkeleton(container);

    try {
      const usuarios = await api.getUsuarios();
      this.renderUsuarios(usuarios);
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


  renderUsuarios(usuarios) {
    const container = this.querySelector('.list-usuario-container');
    if (usuarios.length === 0) {
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
    const userItems = usuarios.map(usuario => {
      const isSelf = loggedUserId !== null && parseInt(loggedUserId) === usuario.id;
      return `
      <ion-item>
        <ion-label>
          <h2 class="item-title">
            <ion-icon
              name="${usuario.status ? 'checkmark-circle' : 'close-circle'}"
              color="${usuario.status ? 'success' : 'danger'}"
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
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${usuario.id}" data-self="${isSelf}" aria-label="${isSelf ? 'Você não pode excluir seu próprio usuário' : 'Excluir ' + usuario.nome}">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `}).join('');

    container.innerHTML = `
      <ion-list>${userItems}</ion-list>
    `;

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/usuario/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const isSelf = btn.getAttribute('data-self') === 'true';
        if (isSelf) {
          await showToast('Você não pode excluir seu próprio usuário.', 'warning', 3000);
          return;
        }
        
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
                  await this.fetchUsuarios();
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
