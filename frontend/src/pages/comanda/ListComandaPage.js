import './ListComandaPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout } from '../../shared/util.js';
import { api } from '../../services/api.js';

const pageName = 'Comandas';

class ListComandaPage extends HTMLElement {
  async connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-comanda-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
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

  onRouteChange() {
    if (window.location.pathname === '/comandas') {
      this.fetchComandas();
    }
  }

  async fetchComandas() {
    const container = this.querySelector('.list-comanda-container');
    const loading = document.createElement('ion-loading');
    loading.message = 'Buscando comandas...';
    document.body.appendChild(loading);
    await loading.present();

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
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar as comandas. Tente novamente mais tarde.';
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
      window.location.href = '/comanda/register';
    });

    content.appendChild(fab);
  }

  renderComandas(comandas) {
    const container = this.querySelector('.list-comanda-container');
    if (comandas.length === 0) {
      container.innerHTML = `<p class="ion-text-center">Nenhuma comanda encontrada.</p>`;
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const comandaItems = comandas.map(comanda => `
      <ion-item>
        <ion-label>
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <ion-icon
              name="${comanda.todosPagos ? 'checkmark-circle' : 'cash-outline'}"
              color="${comanda.todosPagos ? 'success' : 'warning'}"
              style="flex-shrink: 0;"
            ></ion-icon>
            <span>Comanda #${comanda.id}</span>
          </h2>
          <p>Mesa: ${comanda.id_mesa}</p>
          <p>Itens: ${comanda.qtdItens} | Total: ${formatCurrency(comanda.valorTotal)}</p>
          <p>
            <ion-icon name="${comanda.todosPagos ? 'checkmark-circle' : 'close-circle'}" color="${comanda.todosPagos ? 'success' : 'danger'}"></ion-icon>
            <span style="margin-left: 4px;">${comanda.todosPagos ? 'Pago' : 'Não Pago'}</span>
            <ion-icon name="${comanda.todosEntregues ? 'checkmark-circle' : 'close-circle'}" color="${comanda.todosEntregues ? 'success' : 'danger'}" style="margin-left: 12px;"></ion-icon>
            <span style="margin-left: 4px;">${comanda.todosEntregues ? 'Entregue' : 'Não Entregue'}</span>
          </p>
        </ion-label>

        <ion-buttons slot="end">
          <ion-button fill="clear" class="btn-edit" data-id="${comanda.id}">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${comanda.id}">
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
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Comanda excluída com sucesso!';
                  toast.duration = 2000;
                  toast.color = 'success';
                  document.body.appendChild(toast);
                  await toast.present();
                  await this.fetchComandas();
                } catch (error) {
                  console.error('Erro ao excluir:', error);
                  const toast = document.createElement('ion-toast');
                  toast.message = 'Erro ao excluir comanda. Tente novamente.';
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

customElements.define('list-comanda-page', ListComandaPage);
