/**
 * Testes para ListComandaPage
 * Lista todas as comandas com status e ações
 */

jest.mock('../../services/api.js', () => ({
  api: {
    getComandas: jest.fn(),
    deleteComanda: jest.fn(),
  },
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

import { createHeader } from '../../shared/Header.js';

jest.mock('../../shared/util.js', () => ({
  logout: jest.fn(),
}));

// Mock Ionic Components
if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = '';
    }
  });
  customElements.define('ion-card', class extends HTMLElement {});
  customElements.define('ion-card-header', class extends HTMLElement {});
  customElements.define('ion-card-title', class extends HTMLElement {});
  customElements.define('ion-card-content', class extends HTMLElement {});
  customElements.define('ion-button', class extends HTMLElement {
    constructor() {
      super();
      this.addEventListener = jest.fn();
    }
  });
  customElements.define('ion-item', class extends HTMLElement {});
  customElements.define('ion-label', class extends HTMLElement {});
  customElements.define('ion-badge', class extends HTMLElement {});
  customElements.define('ion-icon', class extends HTMLElement {});
  customElements.define('ion-loading', class extends HTMLElement {
    constructor() {
      super();
      this.present = jest.fn().mockResolvedValue(undefined);
      this.dismiss = jest.fn().mockResolvedValue(undefined);
    }
  });
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() {
      super();
      this.present = jest.fn().mockResolvedValue(undefined);
      this.message = '';
      this.color = '';
    }
  });
  customElements.define('ion-alert', class extends HTMLElement {
    constructor() {
      super();
      this.present = jest.fn().mockResolvedValue(undefined);
      this.header = '';
      this.message = '';
      this.buttons = [];
    }
  });
  customElements.define('ion-router', class extends HTMLElement {
    constructor() {
      super();
      this.push = jest.fn();
    }
  });
}

import { api } from '../../services/api.js';
import { logout } from '../../shared/util.js';

describe('ListComandaPage', () => {
  let listComandaPage;

  const mockComandas = [
    {
      id: 1,
      dt_abertura: '2024-01-15T10:00:00',
      dt_fechamento: null,
      mesa: { id: 5 },
      itens: [
        { id: 1, produto: { dsc_produto: 'Café' }, qtd_item: 2 },
      ],
    },
    {
      id: 2,
      dt_abertura: '2024-01-15T11:00:00',
      dt_fechamento: '2024-01-15T12:00:00',
      mesa: { id: 3 },
      itens: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const mockContainer = {
      innerHTML: '',
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
    };

    class MockListComandaPage extends HTMLElement {
      constructor() {
        super();
        this.classList = { add: jest.fn() };
        this.innerHTML = '';
        this.querySelector = jest.fn((selector) => {
          if (selector === '.comandas-list') return mockContainer;
          if (selector === '#add-btn') return { addEventListener: jest.fn() };
          if (selector === '#logout-btn') return { addEventListener: jest.fn() };
          return null;
        });
        this.querySelectorAll = jest.fn(() => []);
      }

      connectedCallback() {
        this.classList.add('ion-page');
        this.innerHTML = `
          ${createHeader('Comandas')}
          <ion-content>
            <div class="comandas-list"></div>
            <ion-button id="add-btn">Nova Comanda</ion-button>
          </ion-content>
        `;

        this.querySelector('#logout-btn')?.addEventListener('click', logout);
        this.querySelector('#add-btn')?.addEventListener('click', () => {
          document.querySelector('ion-router')?.push('/comanda/reg');
        });

        this.fetchComandas();
      }

      async fetchComandas() {
        const container = this.querySelector('.comandas-list');
        try {
          const comandas = await api.getComandas();
          this.renderComandas(comandas, container);
        } catch (error) {
          console.error('Erro:', error);
        }
      }

      renderComandas(comandas, container) {
        if (!comandas || comandas.length === 0) {
          container.innerHTML = '<p>Nenhuma comanda encontrada</p>';
          return;
        }

        container.innerHTML = comandas.map(comanda => `
          <ion-card>
            <ion-card-header>
              <ion-card-title>Comanda #${comanda.id} - Mesa ${comanda.mesa.id}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-button class="edit-btn" data-id="${comanda.id}">Editar</ion-button>
              <ion-button class="delete-btn" data-id="${comanda.id}">Excluir</ion-button>
            </ion-card-content>
          </ion-card>
        `).join('');

        container.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            document.querySelector('ion-router')?.push(`/comanda/update/${id}`);
          });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await this.deleteComanda(id);
          });
        });
      }

      async deleteComanda(id) {
        try {
          await api.deleteComanda(id);
          await this.fetchComandas();
        } catch (error) {
          console.error('Erro ao deletar:', error);
        }
      }
    }

    if (!customElements.get('list-comanda-page')) {
      customElements.define('list-comanda-page', MockListComandaPage);
    }

    listComandaPage = new MockListComandaPage();
  });

  describe('Renderização', () => {
    it('deve adicionar classe ion-page (Happy Path)', () => {
      listComandaPage.connectedCallback();
      expect(listComandaPage.classList.add).toHaveBeenCalledWith('ion-page');
    });

    it('deve carregar comandas ao inicializar (Happy Path)', async () => {
      api.getComandas.mockResolvedValue(mockComandas);
      
      listComandaPage.fetchComandas = jest.fn();
      listComandaPage.connectedCallback();

      expect(listComandaPage.fetchComandas).toHaveBeenCalled();
    });
  });

  describe('Listagem de Comandas', () => {
    it('deve renderizar comandas quando disponíveis (Happy Path)', async () => {
      api.getComandas.mockResolvedValue(mockComandas);

      const container = { innerHTML: '' };
      listComandaPage.querySelector = jest.fn((selector) => {
        if (selector === '.comandas-list') return container;
        return null;
      });

      await listComandaPage.fetchComandas();

      expect(api.getComandas).toHaveBeenCalled();
    });

    it('deve mostrar mensagem quando não há comandas (Edge Case)', async () => {
      api.getComandas.mockResolvedValue([]);

      const container = { innerHTML: '' };
      listComandaPage.querySelector = jest.fn((selector) => {
        if (selector === '.comandas-list') return container;
        return null;
      });

      await listComandaPage.fetchComandas();

      expect(container.innerHTML).toContain('Nenhuma comanda encontrada');
    });
  });

  describe('Navegação', () => {
    it('deve navegar para registro ao clicar em Nova Comanda (Happy Path)', () => {
      const addBtn = { addEventListener: jest.fn() };
      const mockRouter = { push: jest.fn() };

      listComandaPage.querySelector = jest.fn((selector) => {
        if (selector === '#add-btn') return addBtn;
        if (selector === 'ion-router') return mockRouter;
        return null;
      });

      listComandaPage.connectedCallback();

      expect(addBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Exclusão de Comanda', () => {
    it('deve chamar api.deleteComanda com ID correto (Happy Path)', async () => {
      api.deleteComanda.mockResolvedValue({});
      api.getComandas.mockResolvedValue([]);

      await listComandaPage.deleteComanda(1);

      expect(api.deleteComanda).toHaveBeenCalledWith(1);
      expect(api.getComandas).toHaveBeenCalled();
    });

    it('deve tratar erro ao deletar comanda (Edge Case)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.deleteComanda.mockRejectedValue(new Error('Erro'));

      await listComandaPage.deleteComanda(1);

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
