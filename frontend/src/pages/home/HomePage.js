import './HomePage.css'
import { createHeader } from '../../shared/Header.js';
import { logout } from '../../shared/util.js';
import { api } from '../../services/api.js';

const pageName = 'Cozinha';

class HomePage extends HTMLElement {
  async connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="home-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    await this.fetchComandas();
  }

  async fetchComandas() {
    const container = this.querySelector('.home-container');
    const loading = document.createElement('ion-loading');
    loading.message = 'Carregando pedidos...';
    document.body.appendChild(loading);
    await loading.present();

    try {
      const comandas = await api.getComandas();
      this.renderComandas(comandas);
    } catch (error) {
      console.error('Erro ao buscar comandas:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os pedidos. Tente novamente.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  renderComandas(comandas) {
    const container = this.querySelector('.home-container');
    if (comandas.length === 0) {
      container.innerHTML = `<p class="ion-text-center">Nenhum pedido pendente.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="comandas-grid">
        ${comandas.map(comanda => this.renderComandaCard(comanda)).join('')}
      </div>
    `;

    container.querySelectorAll('.item-entrega-select').forEach(select => {
      select.addEventListener('ionChange', async (e) => {
        const id_comanda = select.dataset.idComanda;
        const id_produto = select.dataset.idProduto;
        const statusEntrega = e.detail.value === 'true';
        await this.updateItemEntrega(id_comanda, id_produto, statusEntrega, select.closest('ion-card'));

        const ionItem = select.closest('ion-item');
        if (ionItem) {
          ionItem.classList.remove('item-pending', 'item-delivered');
          ionItem.classList.add(statusEntrega ? 'item-delivered' : 'item-pending');
        }
      });
    });
  }

  renderComandaCard(comanda) {
    const todosEntregues = comanda.itens.length > 0 && comanda.itens.every(item => item.statusEntrega);
    const statusIcon = todosEntregues ? 'checkmark-circle' : 'time-outline';
    const statusColor = todosEntregues ? 'success' : 'warning';

    const itensHtml = comanda.itens.map(item => `
      <ion-item lines="none" class="item-entrega ${item.statusEntrega ? 'item-delivered' : 'item-pending'}">
        <ion-label>
          <h3 style="padding: 5px">${item.produto.dsc_produto} <ion-badge color="primary">x${item.qtd_item}</ion-badge></h3>
        </ion-label>
        <ion-select
          class="item-entrega-select"
          data-id-comanda="${comanda.id}"
          data-id-produto="${item.id_produto}"
          value="${item.statusEntrega.toString()}"
          interface="popover"
          slot="end"
        >
          <ion-select-option value="false">Pendente</ion-select-option>
          <ion-select-option value="true">Entregue</ion-select-option>
        </ion-select>
      </ion-item>
    `).join('');

    return `
      <ion-card class="comanda-card" data-comanda-id="${comanda.id}">
        <ion-card-header>
          <ion-card-title>
            <div class="card-header-content">
              <span>Comanda #${comanda.id}</span>
              <span>Mesa: ${comanda.mesa.id}</span>
              <ion-icon name="${statusIcon}" color="${statusColor}" class="status-icon"></ion-icon>
            </div>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          ${itensHtml}
        </ion-card-content>
      </ion-card>
    `;
  }

  async updateItemEntrega(id_comanda, id_produto, statusEntrega, cardElement) {
    try {
      await api.updateItemComanda(id_comanda, id_produto, { statusEntrega });
      this.updateCardStatusIcon(cardElement);
      const toast = document.createElement('ion-toast');
      toast.message = 'Status do item atualizado!';
      toast.duration = 2000;
      toast.color = 'success';
      document.body.appendChild(toast);
      await toast.present();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      const toast = document.createElement('ion-toast');
      toast.message = 'Erro ao atualizar status. Tente novamente.';
      toast.duration = 2000;
      toast.color = 'danger';
      document.body.appendChild(toast);
      await toast.present();
    }
  }

  updateCardStatusIcon(cardElement) {
    const selects = cardElement.querySelectorAll('.item-entrega-select');
    const allEntregues = Array.from(selects).every(select => select.value === 'true');
    const icon = cardElement.querySelector('.status-icon');
    if (allEntregues) {
      icon.name = 'checkmark-circle';
      icon.color = 'success';
    } else {
      icon.name = 'time-outline';
      icon.color = 'warning';
    }
  }
}

customElements.define('home-page', HomePage);