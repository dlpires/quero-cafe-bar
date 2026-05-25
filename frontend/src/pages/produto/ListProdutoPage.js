import './ListProdutoPage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Produtos';

class ListProdutoPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content>
        <div class="list-produto-container"></div>
      </ion-content>
    `;

    this.querySelector('#logout-btn').addEventListener('click', logout);
    focusFirstElement(this);
    this.renderFabButton();
    await this.fetchProdutos();

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
      await this.fetchProdutos();
      focusFirstElement(this);
    }
  }

  async fetchProdutos() {
    const container = this.querySelector('.list-produto-container');
    this.renderSkeleton(container);

    try {
      const produtos = await api.getProdutos();
      this.renderProdutos(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      container.innerHTML = '';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os produtos. Tente novamente mais tarde.';
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


  renderProdutos(produtos) {
    const container = this.querySelector('.list-produto-container');
    if (produtos.length === 0) {
      createEmptyState(container, {
        icon: 'file-tray-outline',
        message: 'Nenhum produto encontrado.',
        actionLabel: 'Cadastrar Produto',
        actionHandler: () => {
          const router = document.querySelector('ion-router');
          router.push('/produto/register');
        }
      });
      return;
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const productItems = produtos.map(produto => `
      <ion-item>
        <ion-label>
          <h2 class="item-title">
            <ion-icon
              name="${produto.status ? 'checkmark-circle' : 'close-circle'}"
              color="${produto.status ? 'success' : 'danger'}"
              class="item-icon"
              aria-hidden="true"
            ></ion-icon>
            <span>${produto.dsc_produto}</span>
          </h2>
          <p>${formatCurrency(produto.valor_unit)}</p>
        </ion-label>

        <ion-buttons slot="end">
          <ion-button fill="clear" class="btn-edit" data-id="${produto.id}" aria-label="Editar ${produto.dsc_produto}">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" class="btn-delete" data-id="${produto.id}" aria-label="Excluir ${produto.dsc_produto}">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `).join('');

    container.innerHTML = `
      <ion-list>${productItems}</ion-list>
    `;

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const router = document.querySelector('ion-router');
        router.push(`/produto/edit?id=${id}`);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = 'Deseja realmente excluir este produto?';
        alert.buttons = [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
              handler: async () => {
                try {
                  await api.deleteProduto(id);
                  await showToast('Produto excluído com sucesso!', 'success', 2000);
                  await this.fetchProdutos();
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

customElements.define('list-produto-page', ListProdutoPage);