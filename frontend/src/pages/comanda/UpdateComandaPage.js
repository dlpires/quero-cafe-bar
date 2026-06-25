import './UpdateComandaPage.css';
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, focusFirstElement, hasFormChanges } from '../../shared/util.js';

const pageName = 'Editar Comanda';

class UpdateComandaPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
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

          <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">
            <ion-icon name="checkmark-circle" class="radio-icon"></ion-icon>
            Salvar Dados
          </ion-button>
        </form>

        <div class="itens-section">
          <h3>Itens da Comanda</h3>
          <div class="itens-container"></div>
          <ion-button expand="block" id="btn-add-item" class="ion-margin-top">
            <ion-icon name="add-circle" class="radio-icon"></ion-icon>
            Adicionar Item
          </ion-button>
        </div>

        <div class="ion-padding">
          <ion-button expand="block" id="btn-fechar-comanda" color="medium" class="ion-margin-top">
            <ion-icon name="lock-closed-outline" class="radio-icon"></ion-icon>
            Fechar Comanda
          </ion-button>
        </div>

        <div class="ion-padding">
          <ion-button expand="block" color="danger" id="btn-cancelar">
            <ion-icon name="close-circle" class="radio-icon"></ion-icon>
            Voltar
          </ion-button>
        </div>
      </ion-content>
    `;

    this.querySelector('#form-comanda').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.confirmCancel());
    this.querySelector('#btn-add-item').addEventListener('click', () => this.showAddItemModal());
    this.querySelector('#btn-fechar-comanda').addEventListener('click', () => this.confirmFecharComanda());

    if (this.comandaId) {
      await this.loadComandaData();
      await this.loadItens();
    }

    focusFirstElement(this);
  }

  async setComandaReadOnly() {
    const formElements = this.querySelectorAll('#id_mesa, #obs_comanda');
    formElements.forEach(el => el.disabled = true);
    const submitBtn = this.querySelector('#btn-submit');
    if (submitBtn) submitBtn.style.display = 'none';
    const addItemBtn = this.querySelector('#btn-add-item');
    if (addItemBtn) addItemBtn.style.display = 'none';
    const fecharBtn = this.querySelector('#btn-fechar-comanda');
    if (fecharBtn) fecharBtn.style.display = 'none';

    const statusBadge = document.createElement('ion-badge');
    statusBadge.color = 'medium';
    statusBadge.className = 'comanda-status-badge';
    statusBadge.textContent = 'Comanda Fechada';
    const form = this.querySelector('#form-comanda');
    form.parentNode.insertBefore(statusBadge, form.nextSibling);
  }

  async loadMesas() {
    try {
      const response = await api.getMesas();
      const mesas = response.data || response;
      const select = this.querySelector('#id_mesa');
      mesas.forEach(mesa => {
        const option = document.createElement('ion-select-option');
        option.value = mesa.id;
        option.textContent = `Mesa #${mesa.id} (${mesa.qtd_cadeiras} cadeiras)`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      await showToast(error.message, 'error', 5000);
    }
  }

  async loadComandaData() {
    try {
      await this.loadMesas();
      const comanda = await api.getComandaById(this.comandaId);
      this.comandaStatus = comanda.status;
      this.querySelector('#id_mesa').value = comanda.id_mesa;
      this.querySelector('#obs_comanda').value = comanda.obs_comanda || '';

      if (comanda.status === 'fechada') {
        await this.setComandaReadOnly();
      }
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
      await showToast(error.message, 'error', 5000);
    }
  }

  renderItens(itens) {
    const container = this.querySelector('.itens-container');
    container.textContent = '';

    if (itens.length === 0) {
      const emptyP = document.createElement('p');
      emptyP.className = 'ion-text-center';
      emptyP.textContent = 'Nenhum item na comanda.';
      container.appendChild(emptyP);
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const list = document.createElement('ion-list');
    container.appendChild(list);

    itens.forEach(item => {
      const total = item.qtd_item * item.valor_venda;
      const ionItem = document.createElement('ion-item');

      const label = document.createElement('ion-label');
      const h2 = document.createElement('h2');
      h2.textContent = item.produto?.dsc_produto || `Produto #${item.id_produto}`;
      label.appendChild(h2);
      const p = document.createElement('p');
      p.textContent = `Qtd: ${item.qtd_item} x ${formatCurrency(item.valor_venda)} = ${formatCurrency(total)}`;
      label.appendChild(p);
      ionItem.appendChild(label);

      const statusDiv = document.createElement('div');
      statusDiv.slot = 'end';
      statusDiv.className = 'item-status';

      const pgCheckbox = document.createElement('ion-checkbox');
      pgCheckbox.id = `statusPg-${item.id_produto}`;
      pgCheckbox.checked = item.statusPg;
      pgCheckbox.dataset.produto = item.id_produto;
      pgCheckbox.textContent = 'Pago';
      pgCheckbox.disabled = this.comandaStatus === 'fechada';
      pgCheckbox.addEventListener('ionChange', async (e) => {
        await this.updateItemStatus(item.id_produto, 'statusPg', e.detail.checked);
      });
      statusDiv.appendChild(pgCheckbox);

      const entCheckbox = document.createElement('ion-checkbox');
      entCheckbox.id = `statusEntrega-${item.id_produto}`;
      entCheckbox.checked = item.statusEntrega;
      entCheckbox.dataset.produto = item.id_produto;
      entCheckbox.textContent = 'Entregue';
      entCheckbox.disabled = this.comandaStatus === 'fechada';
      entCheckbox.addEventListener('ionChange', async (e) => {
        await this.updateItemStatus(item.id_produto, 'statusEntrega', e.detail.checked);
      });
      statusDiv.appendChild(entCheckbox);

      if (this.comandaStatus !== 'fechada') {
        const removeBtn = document.createElement('ion-button');
        removeBtn.fill = 'clear';
        removeBtn.color = 'danger';
        removeBtn.className = 'btn-remove-item';
        removeBtn.dataset.produto = item.id_produto;
        removeBtn.setAttribute('aria-label', `Excluir item ${item.produto?.dsc_produto || item.id_produto}`);
        removeBtn.addEventListener('click', async () => {
          await this.removeItem(item.id_produto);
        });
        const removeIcon = document.createElement('ion-icon');
        removeIcon.slot = 'icon-only';
        removeIcon.name = 'trash-outline';
        removeBtn.appendChild(removeIcon);
        statusDiv.appendChild(removeBtn);
      }

      ionItem.appendChild(statusDiv);
      list.appendChild(ionItem);
    });
  }

  async updateItemStatus(id_produto, field, value) {
    try {
      await api.updateItemComanda(this.comandaId, id_produto, { [field]: value });
      await this.loadItens();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      await showToast(error.message, 'error', 5000);
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
            await showToast(error.message, 'error', 5000);
          }
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  async showAddItemModal() {
    const loading = document.createElement('ion-loading');
    loading.message = 'Carregando...';
    document.body.appendChild(loading);
    await loading.present();

    let produtos;
    let itensAtuais;
    try {
      const produtosResponse = await api.getProdutos();
      produtos = produtosResponse.data || produtosResponse;
      itensAtuais = await api.getItensComanda(this.comandaId);
    } catch (error) {
      await loading.dismiss();
      console.error('Erro ao carregar dados:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Erro ao carregar dados. Tente novamente.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      return;
    }

    await loading.dismiss();

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
    modal.classList.add('add-item-modal');
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

  async confirmFecharComanda() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Fechar Comanda';
    alert.message = 'Tem certeza que deseja fechar esta comanda? Esta ação não pode ser desfeita.';
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Fechar',
        handler: async () => {
          try {
            await api.updateComanda(this.comandaId, { status: 'fechada' });
            await showToast('Comanda fechada com sucesso!', 'success', 3000);
            this.navigateBack();
          } catch (error) {
            console.error('Erro ao fechar comanda:', error);
            await showToast(error.message, 'error', 5000);
          }
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const id_mesa = formData.get('id_mesa');
    if (!id_mesa) {
      await showToast('O campo Mesa é obrigatório.', 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const comandaData = {
      id_mesa: parseInt(id_mesa),
      obs_comanda: formData.get('obs_comanda') || undefined,
    };

    const submitBtn = this.querySelector('ion-button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.updateComanda(this.comandaId, comandaData));
      await showToast('Registro atualizado com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao salvar comanda:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      await showToast(error.message, 'error', 5000);
    }
  }

  async confirmCancel() {
    const form = this.querySelector('#form-comanda');
    if (hasFormChanges(form)) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Descartar alterações?';
      alert.message = 'Há alterações não salvas. Deseja realmente cancelar?';
      alert.buttons = [
        { text: 'Continuar Editando', role: 'cancel' },
        { text: 'Descartar', handler: () => this.navigateBack() },
      ];
      document.body.appendChild(alert);
      await alert.present();
    } else {
      this.navigateBack();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/home', 'root');
  }
}

customElements.define('update-comanda-page', UpdateComandaPage);
