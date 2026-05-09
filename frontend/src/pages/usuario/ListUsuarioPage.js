import './ListUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout } from '../../shared/util.js';
import { api } from '../../services/api.js';

const pageName = 'Usuários';

class ListUsuarioPage extends HTMLElement {
  async connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-usuario-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
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

  onRouteChange() {
    if (window.location.pathname === '/usuarios') {
      this.fetchUsuarios();
    }
  }

  async fetchUsuarios() {
    const container = this.querySelector('.list-usuario-container');
    const loading = document.createElement('ion-loading');
    loading.message = 'Buscando usuarios...';
    document.body.appendChild(loading);
    await loading.present();

    try {
      const usuarios = await api.getUsuarios();
      this.renderUsuarios(usuarios);
    } catch (error) {
      console.error('Erro ao buscar usuarios:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os usuarios. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  renderFabButton() {
    const content = this.querySelector('ion-content');
    const fab = document.createElement('ion-fab');
    fab.vertical = 'bottom';
    fab.horizontal = 'end';
    fab.slot = 'fixed';

    fab.innerHTML = `
      <ion-fab-button>
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    `;

    fab.addEventListener('click', () => {
      window.location.href = '/usuario/register';
    });

    content.appendChild(fab);
  }


  renderUsuarios(usuarios) {
    const container = this.querySelector('.list-usuario-container');
    if (usuarios.length === 0) {
      container.innerHTML = `<p class="ion-text-center">Nenhum usuario encontrado.</p>`;
      return;
    }

    const userItems = usuarios.map(usuario => `
      <ion-item>
        <ion-label>
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <ion-icon
              name="${usuario.perfil == 0 ? 'restaurant' : 'person'}"
              color="${usuario.perfil == 0 ? 'primary' : 'secondary'}"
              style="flex-shrink: 0;"
            ></ion-icon>
            <span>${usuario.nome}</span>
          </h2>
          <p>${usuario.usuario}</p>
        </ion-label>

        <ion-buttons slot="end">
          <ion-button fill="clear" class="btn-edit" data-id="${usuario.id}">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${usuario.id}">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `).join('');

    container.innerHTML = `
      <ion-list>${userItems}</ion-list>
    `;

    // Adiciona eventos para os botões de edição
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/usuario/edit?id=${id}`);
      });
    });

    // Adiciona eventos para os botões de exclusão
    container.querySelectorAll('.btn-delete').forEach(btn => {
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
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Usuário excluído com sucesso!';
                  toast.duration = 2000;
                  toast.color = 'success';
                  document.body.appendChild(toast);
                  await toast.present();
                  await this.fetchUsuarios();
                } catch (error) {
                  console.error('Erro ao excluir:', error);
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Erro ao excluir usuário. Tente novamente.';
                  toast.duration = 3000;
                  toast.color = 'danger';
                  document.body.appendChild(toast);
                  await toast.present();
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