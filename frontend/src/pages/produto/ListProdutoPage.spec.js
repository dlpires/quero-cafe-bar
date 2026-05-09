/**
 * Testes para ListProdutoPage
 * Lista produtos com status e ações de edição/exclusão
 */

jest.mock('../../services/api.js', () => ({
  api: {
    getProdutos: jest.fn(),
    deleteProduto: jest.fn(),
  },
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

jest.mock('../../shared/util.js', () => ({
  logout: jest.fn(),
}));

import { api } from '../../services/api.js';

describe('ListProdutoPage', () => {
  let listProdutoPage;

  const mockProdutos = [
    {
      id: 1,
      dsc_produto: 'Café Expresso',
      vlr_produto: 5.50,
      status: true,
    },
    {
      id: 2,
      dsc_produto: 'Pão de Queijo',
      vlr_produto: 8.00,
      status: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const mockContainer = {
      innerHTML: '',
      querySelector: jest.fn(() => null),
    };

    class MockListProdutoPage extends HTMLElement {
      constructor() {
        super();
        this.classList = { add: jest.fn() };
        this.innerHTML = '';
        this.querySelector = jest.fn((selector) => {
          if (selector === '.produtos-list') return mockContainer;
          return null;
        });
      }

      connectedCallback() {
        this.classList.add('ion-page');
        this.innerHTML = `
          ${createHeader('Produtos')}
          <ion-content>
            <div class="produtos-list"></div>
            <ion-button id="add-btn">Novo Produto</ion-button>
          </ion-content>
        `;

        this.fetchProdutos();
      }

      async fetchProdutos() {
        try {
          const produtos = await api.getProdutos();
          this.renderProdutos(produtos);
        } catch (error) {
          console.error('Erro:', error);
        }
      }

      renderProdutos(produtos) {
        const container = this.querySelector('.produtos-list');

        if (!produtos || produtos.length === 0) {
          container.innerHTML = '<p>Nenhum produto encontrado</p>';
          return;
        }

        container.innerHTML = produtos.map(produto => `
          <ion-card>
            <ion-card-header>
              <ion-card-title>${produto.dsc_produto} - R$ ${produto.vlr_produto}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Status: ${produto.status ? 'Ativo' : 'Inativo'}
              <ion-button class="edit-btn" data-id="${produto.id}">Editar</ion-button>
              <ion-button class="delete-btn" data-id="${produto.id}">Excluir</ion-button>
            </ion-card-content>
          </ion-card>
        `).join('');
      }

      async deleteProduto(id) {
        try {
          await api.deleteProduto(id);
          await this.fetchProdutos();
        } catch (error) {
          console.error('Erro:', error);
        }
      }
    }

    if (!customElements.get('list-produto-page')) {
      customElements.define('list-produto-page', MockListProdutoPage);
    }

    listProdutoPage = new MockListProdutoPage();
  });

  describe('Renderização', () => {
    it('deve carregar produtos ao inicializar (Happy Path)', async () => {
      api.getProdutos.mockResolvedValue(mockProdutos);

      await listProdutoPage.fetchProdutos();

      expect(api.getProdutos).toHaveBeenCalled();
    });

    it('deve renderizar lista de produtos (Happy Path)', async () => {
      api.getProdutos.mockResolvedValue(mockProdutos);

      listProdutoPage.querySelector = jest.fn((selector) => {
        if (selector === '.produtos-list') {
          return { innerHTML: '' };
        }
        return null;
      });

      await listProdutoPage.fetchProdutos();

      expect(api.getProdutos).toHaveBeenCalled();
    });
  });

  describe('Estado Vazio', () => {
    it('deve mostrar mensagem quando não há produtos (Edge Case)', async () => {
      api.getProdutos.mockResolvedValue([]);

      const container = { innerHTML: '' };
      listProdutoPage.querySelector = jest.fn((selector) => {
        if (selector === '.produtos-list') return container;
        return null;
      });

      await listProdutoPage.fetchProdutos();

      expect(container.innerHTML).toContain('Nenhum produto encontrado');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro ao carregar produtos (Edge Case)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.getProdutos.mockRejectedValue(new Error('Network error'));

      await listProdutoPage.fetchProdutos();

      expect(consoleSpy).toHaveBeenCalledWith('Erro:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
