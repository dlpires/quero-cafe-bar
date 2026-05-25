import './ListComandaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Comandas';

class ListComandaPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-comanda-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();
    await this.fetchComandas();

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
      await this.fetchComandas();
      focusFirstElement(this);
    }
  }

  async fetchComandas() {
    const container = this.querySelector('.list-comanda-container');
    this.renderSkeleton(container);

    try {
      const comandas = await api.getComandas();
      const comandasWithDetails = await Promise.all(
        comandas.map(async (comanda) => {
          const itens = await api.getItensComanda(comanda.id);
          const qtdItens = itens.length;
          const valorTotal = itens.reduce((sum, item) => sum + (item.qtd_item * item.valor_venda), 0);
          const todosPagos = itens.length > 0 && itens.every(item => item.statusPg);
          const todosEntregues = itens.length > 0 && itens.every(item => item.statusEntrega);
          return { ...comanda, qtdItens, valorTotal, todosPagos, todosEntregues };
        })
      );
      this.renderComandas(comandasWithDetails);
    } catch (error) {
      console.error('Erro ao buscar comandas:', error);
      container.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar as comandas. Tente novamente mais tarde.';
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

  renderComandas(comandas) {
    const container = this.querySelector('.list-comanda-container');
    if (comandas.length === 0) {
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
    }

    const comandaItems = comandas.map(comanda => `
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

    container.innerHTML = `
      <ion-list>${comandaItems}</ion-list>
    `;

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/comanda/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
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
                  await this.fetchComandas();
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
