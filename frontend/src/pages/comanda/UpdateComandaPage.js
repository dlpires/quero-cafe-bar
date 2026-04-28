import './UpdateComandaPage.css';
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Editar Comanda';

class UpdateComandaPage extends HTMLElement {
  async connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    this.comandaId = urlParams.get('id');

    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-comanda">
          <ion-list>
            <ion-item>
              <ion-select name="id_mesa" id="id_mesa" label="Selecionar Mesa" label-placement="floating" required>
                <div slot="label">Selecionar Mesa</div>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-input type="text" name="obs_comanda" id="obs_comanda" label="Observação" label-placement="floating"></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" type="submit" class="ion-margin-top">
            <ion-icon name="checkmark-circle" style="margin-right: 8px;"></ion-icon>
            Salvar Dados
          </ion-button>
        </form>

        <div class="itens-section">
          <h3>Itens da Comanda</h3>
          <div class="itens-container"></div>
          <ion-button expand="block" id="btn-add-item" class="ion-margin-top">
            <ion-icon name="add-circle" style="margin-right: 8px;"></ion-icon>
            Adicionar Item
          </ion-button>
        </div>

        <div class="ion-padding">
          <ion-button expand="block" color="danger" id="btn-cancelar">
            <ion-icon name="close-circle" style="margin-right: 8px;"></ion-icon>
            Voltar
          </ion-button>
        </div>
      </ion-content>
    `;

    this.querySelector('#form-comanda').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.navigateBack());
    this.querySelector('#btn-add-item').addEventListener('click', () => this.showAddItemModal());

    if (this.comandaId) {
      await this.loadComandaData();
      await this.loadItens();
    }
  }

  async loadMesas() {
    try {
      const mesas = await api.getMesas();
      const select = this.querySelector('#id_mesa');
      mesas.forEach(mesa => {
        const option = document.createElement('ion-select-option');
        option.value = mesa.id;
        option.textContent = `Mesa #${mesa.id} (${mesa.qtd_cadeiras} cadeiras)`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    }
  }

  async loadComandaData() {
    try {
      await this.loadMesas();
      const comanda = await api.getComandaById(this.comandaId);
      this.querySelector('#id_mesa').value = comanda.id_mesa;
      this.querySelector('#obs_comanda').value = comanda.obs_comanda || '';
    } catch (error) {
      console.error('Erro ao carregar comanda:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os dados da comanda.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      this.navigateBack();
    }
  }

  async loadItens() {
    try {
      const itens = await api.getItensComanda(this.comandaId);
      this.renderItens(itens);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  }

  renderItens(itens) {
    const container = this.querySelector('.itens-container');
    if (itens.length === 0) {
      container.innerHTML = '<p class="ion-text-center">Nenhum item na comanda.</p>';
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const itensHtml = itens.map(item => {
      const total = item.qtd_item * item.valor_venda;
      return `
        <ion-item>
          <ion-label>
            <h2>${item.produto?.dsc_produto || `Produto #${item.id_produto}`}</h2>
            <p>Qtd: ${item.qtd_item} x ${formatCurrency(item.valor_venda)} = ${formatCurrency(total)}</p>
          </ion-label>
          <div slot="end" class="item-status">
            <ion-checkbox id="statusPg-${item.id_produto}" ${item.statusPg ? 'checked' : ''} data-produto="${item.id_produto}" @ionChange="${() => this.toggleStatusPg(item.id_produto)}">Pago</ion-checkbox>
            <ion-checkbox id="statusEntrega-${item.id_produto}" ${item.statusEntrega ? 'checked' : ''} data-produto="${item.id_produto}" @ionChange="${() => this.toggleStatusEntrega(item.id_produto)}">Entregue</ion-checkbox>
            <ion-button fill="clear" color="danger" class="btn-remove-item" data-produto="${item.id_produto}">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
          </div>
        </ion-item>
      `;
    }).join('');

    container.innerHTML = `<ion-list>${itensHtml}</ion-list>`;

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id_produto = parseInt(btn.getAttribute('data-produto'));
        await this.removeItem(id_produto);
      });
    });

    container.querySelectorAll('ion-checkbox[id^="statusPg-"]').forEach(checkbox => {
      checkbox.addEventListener('ionChange', async (e) => {
        const id_produto = parseInt(e.target.getAttribute('data-produto'));
        await this.updateItemStatus(id_produto, 'statusPg', e.detail.checked);
      });
    });

    container.querySelectorAll('ion-checkbox[id^="statusEntrega-"]').forEach(checkbox => {
      checkbox.addEventListener('ionChange', async (e) => {
        const id_produto = parseInt(e.target.getAttribute('data-produto'));
        await this.updateItemStatus(id_produto, 'statusEntrega', e.detail.checked);
      });
    });
  }

  async toggleStatusPg(id_produto) {
    const itens = await api.getItensComanda(this.comandaId);
    const item = itens.find(i => i.id_produto === id_produto);
    if (item) {
      await this.updateItemStatus(id_produto, 'statusPg', !item.statusPg);
    }
  }

  async toggleStatusEntrega(id_produto) {
    const itens = await api.getItensComanda(this.comandaId);
    const item = itens.find(i => i.id_produto === id_produto);
    if (item) {
      await this.updateItemStatus(id_produto, 'statusEntrega', !item.statusEntrega);
    }
  }

  async updateItemStatus(id_produto, field, value) {
    try {
      await api.updateItemComanda(this.comandaId, id_produto, { [field]: value });
      await this.loadItens();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async removeItem(id_produto) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar';
    alert.message = 'Deseja remover este item da comanda?';
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Remover',
        handler: async () => {
          try {
            await api.deleteItemComanda(this.comandaId, id_produto);
            await this.loadItens();
          } catch (error) {
            console.error('Erro ao remover item:', error);
          }
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  async showAddItemModal() {
    const produtos = await api.getProdutos();
    const itensAtuais = await api.getItensComanda(this.comandaId);
    const idsExistentes = itensAtuais.map(i => i.id_produto);
    const produtosDisponiveis = produtos.filter(p => p.status && !idsExistentes.includes(p.id));

    if (produtosDisponiveis.length === 0) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Aviso';
      alert.message = 'Não há produtos disponíveis para adicionar.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      return;
    }

    const modal = document.createElement('ion-modal');
    modal.style.cssText = '--width: 90%; --height: 80%;';
    modal.innerHTML = `
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Adicionar Item</ion-title>
          <ion-buttons slot="end">
            <ion-button id="btn-close-modal">Fechar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form id="form-add-item">
          <ion-list>
            <ion-item>
              <ion-select name="id_produto" id="id_produto" label="Selecionar Produto" label-placement="floating" required>
                <div slot="label">Selecionar Produto</div>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input type="number" name="qtd_item" id="qtd_item" label="Quantidade" label-placement="floating" value="1" min="1" required></ion-input>
            </ion-item>
          </ion-list>
          <ion-button expand="block" type="submit" class="ion-margin-top">
            Adicionar
          </ion-button>
        </form>
      </ion-content>
    `;

    document.body.appendChild(modal);
    await modal.present();

    const selectProduto = modal.querySelector('#id_produto');
    produtosDisponiveis.forEach(produto => {
      const option = document.createElement('ion-select-option');
      option.value = produto.id;
      option.textContent = `${produto.dsc_produto} - R$ ${produto.valor_unit}`;
      selectProduto.appendChild(option);
    });

    modal.querySelector('#btn-close-modal').addEventListener('click', () => modal.dismiss());
    modal.querySelector('#form-add-item').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const id_produto = parseInt(formData.get('id_produto'));
      const produtoSelecionado = produtosDisponiveis.find(p => p.id === id_produto);
      const valor_venda = produtoSelecionado ? produtoSelecionado.valor_unit : 0;

      const itemData = {
        id_comanda: parseInt(this.comandaId),
        id_produto: id_produto,
        qtd_item: parseInt(formData.get('qtd_item')),
        valor_venda: valor_venda,
        statusPg: false,
        statusEntrega: false
      };

      try {
        await api.addItemComanda(itemData);
        await modal.dismiss();
        await this.loadItens();
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
        const alert = document.createElement('ion-alert');
        alert.header = 'Erro';
        alert.message = 'Não foi possível adicionar o item.';
        alert.buttons = ['OK'];
        document.body.appendChild(alert);
        await alert.present();
      }
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const comandaData = {
      id_mesa: parseInt(formData.get('id_mesa')),
      obs_comanda: formData.get('obs_comanda') || undefined,
    };

    try {
      await api.updateComanda(this.comandaId, comandaData);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao salvar comanda:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível salvar a comanda.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/comandas', 'root');
  }
}

customElements.define('update-comanda-page', UpdateComandaPage);