import './ListMesaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Mesas';

class ListMesaPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-mesa-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    this.renderFabButton();
    await this.fetchMesas();

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
    if (window.location.pathname === '/mesas') {
      this.fetchMesas();
    }
  }

  async fetchMesas() {
    const container = this.querySelector('.list-mesa-container');
    this.renderSkeleton(container);

    try {
      const mesas = await api.getMesas();
      this.renderMesas(mesas);
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
    fab.innerHTML = `<ion-fab-button><ion-icon name="add"></ion-icon></ion-fab-button>`;
    fab.addEventListener('click', () => {
      const router = document.querySelector('ion-router');
      router.push('/mesa/register');
    });
    content.appendChild(fab);
  }

  renderMesas(mesas) {
    const container = this.querySelector('.list-mesa-container');
    if (mesas.length === 0) {
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

    const mesaItems = mesas.map(mesa => `
      <ion-item>
        <ion-label>
          <h2 class="item-title">
            <ion-icon
              name="${mesa.status ? 'checkmark-circle' : 'close-circle'}"
              color="${mesa.status ? 'success' : 'danger'}"
              class="item-icon"
            ></ion-icon>
            <span>Mesa #${mesa.id}</span>
          </h2>
          <p>Cadeiras: ${mesa.qtd_cadeiras}</p>
        </ion-label>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="btn-edit" data-id="${mesa.id}">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${mesa.id}">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `).join('');

    container.innerHTML = `<ion-list>${mesaItems}</ion-list>`;

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        document.querySelector('ion-router').push(`/mesa/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
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
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Mesa excluída com sucesso!';
                  toast.duration = 2000;
                  toast.color = 'success';
                  document.body.appendChild(toast);
                  await toast.present();
                  await this.fetchMesas();
                } catch (error) {
                  console.error('Erro ao excluir:', error);
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Erro ao excluir mesa. Tente novamente.';
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

customElements.define('list-mesa-page', ListMesaPage);
