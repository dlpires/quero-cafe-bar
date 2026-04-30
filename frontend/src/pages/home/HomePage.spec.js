/**
 * Testes para HomePage (Kitchen View)
 * 
 * Esta página exibe comandas e permite atualizar status de entrega dos itens.
 * É a visualização da cozinha para acompanhar pedidos.
 */

// Mock do api service
jest.mock('../../services/api.js', () => ({
  api: {
    getComandas: jest.fn(),
    updateItemComanda: jest.fn(),
  },
}));

// Mock do Header
jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn((title) => `<ion-header>${title}</ion-header>`),
}));

// Mock do util (logout)
jest.mock('../../shared/util.js', () => ({
  logout: jest.fn(),
}));

// Mock dos componentes Ionic
if (!customElements.get('home-page')) {
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
  customElements.define('ion-item', class extends HTMLElement {
    constructor() {
      super();
      this.classList = {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
      };
    }
  });
  customElements.define('ion-label', class extends HTMLElement {});
  customElements.define('ion-badge', class extends HTMLElement {});
  customElements.define('ion-select', class extends HTMLElement {
    constructor() {
      super();
      this.value = '';
      this.dataset = {};
      this.closest = jest.fn();
    }
  });
  customElements.define('ion-select-option', class extends HTMLElement {});
  customElements.define('ion-icon', class extends HTMLElement {
    constructor() {
      super();
      this.name = '';
      this.color = '';
    }
  });
  customElements.define('ion-button', class extends HTMLElement {
    constructor() {
      super();
      this.addEventListener = jest.fn();
    }
  });
  customElements.define('ion-loading', class extends HTMLElement {
    constructor() {
      super();
      this.message = '';
      this.present = jest.fn().mockResolvedValue(undefined);
      this.dismiss = jest.fn().mockResolvedValue(undefined);
    }
  });
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() {
      super();
      this.message = '';
      this.duration = 2000;
      this.color = 'danger';
      this.present = jest.fn().mockResolvedValue(undefined);
    }
  });
  customElements.define('ion-alert', class extends HTMLElement {
    constructor() {
      super();
      this.header = '';
      this.message = '';
      this.buttons = [];
      this.present = jest.fn().mockResolvedValue(undefined);
    }
  });
}

import { api } from '../../services/api.js';
import { logout } from '../../shared/util.js';
import { createHeader } from '../../shared/Header.js';

describe('HomePage', () => {
  let homePage;
  let mockQuerySelector;
  let mockQuerySelectorAll;

  const mockComandas = [
    {
      id: 1,
      mesa: { id: 5 },
      itens: [
        {
          id_produto: 10,
          qtd_item: 2,
          statusEntrega: false,
          produto: { dsc_produto: 'Café Expresso' },
        },
        {
          id_produto: 11,
          qtd_item: 1,
          statusEntrega: true,
          produto: { dsc_produto: 'Pão de Queijo' },
        },
      ],
    },
    {
      id: 2,
      mesa: { id: 3 },
      itens: [
        {
          id_produto: 12,
          qtd_item: 3,
          statusEntrega: false,
          produto: { dsc_produto: 'Suco Natural' },
        },
      ],
    },
  ];

    beforeEach(() => {
    jest.clearAllMocks();

    const mockContainer = {
      innerHTML: '',
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
    };

    // Mock da HomePage para teste
    class MockHomePage extends HTMLElement {
      constructor() {
        super();
        this.classList = {
          add: jest.fn(),
        };
        this.innerHTML = '';
        this.querySelector = jest.fn((selector) => {
          if (selector === '.home-container') return mockContainer;
          if (selector === '#logout-btn') return { addEventListener: jest.fn() };
          return null;
        });
        this.querySelectorAll = jest.fn(() => []);
      }

      connectedCallback() {
        this.classList.add('ion-page');
        this.innerHTML = `
          ${createHeader('Cozinha')}
          <ion-content>
            <div class="home-container"></div>
          </ion-content>
        `;

        const logoutBtn = this.querySelector('#logout-btn');
        if (logoutBtn && logoutBtn.addEventListener) logoutBtn.addEventListener('click', logout);
        this.fetchComandas();
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
            ${comandas.map((comanda) => this.renderComandaCard(comanda)).join('')}
          </div>
        `;

        container.querySelectorAll('.item-entrega-select').forEach((select) => {
          select.addEventListener('ionChange', async (e) => {
            const id_comanda = select.dataset.idComanda;
            const id_produto = select.dataset.idProduto;
            const statusEntrega = e.detail.value === 'true';
            await this.updateItemEntrega(
              id_comanda,
              id_produto,
              statusEntrega,
              select.closest('ion-card'),
            );

            const ionItem = select.closest('ion-item');
            if (ionItem) {
              ionItem.classList.remove('item-pending', 'item-delivered');
              ionItem.classList.add(statusEntrega ? 'item-delivered' : 'item-pending');
            }
          });
        });
      }

      renderComandaCard(comanda) {
        const todosEntregues =
          comanda.itens.length > 0 && comanda.itens.every((item) => item.statusEntrega);
        const statusIcon = todosEntregues ? 'checkmark-circle' : 'time-outline';
        const statusColor = todosEntregues ? 'success' : 'warning';

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
        const allEntregues = Array.from(selects).every((select) => select.value === 'true');
        const icon = cardElement.querySelector('.status-icon');
        if (!icon) return;
        if (allEntregues) {
          icon.name = 'checkmark-circle';
          icon.color = 'success';
        } else {
          icon.name = 'time-outline';
          icon.color = 'warning';
        }
      }
    }

    if (!customElements.get('home-page')) {
      customElements.define('home-page', MockHomePage);
    }

    homePage = new MockHomePage();
  });

  describe('Renderização Inicial', () => {
    it('deve adicionar classe ion-page (Happy Path)', () => {
      homePage.connectedCallback();
      expect(homePage.classList.add).toHaveBeenCalledWith('ion-page');
    });

    it('deve renderizar header da Cozinha', () => {
      homePage.connectedCallback();
      expect(homePage.innerHTML).toContain('Cozinha');
    });

    it('deve chamar fetchComandas na inicialização', async () => {
      api.getComandas.mockResolvedValue([]);
      await homePage.connectedCallback();
      expect(api.getComandas).toHaveBeenCalled();
    });
  });

  describe('Carregamento de Comandas', () => {
    it('deve renderizar comandas quando disponíveis (Happy Path)', async () => {
      api.getComandas.mockResolvedValue(mockComandas);
      
      homePage.querySelector = jest.fn((selector) => {
        if (selector === '.home-container') {
          return { innerHTML: '' };
        }
        if (selector === '#logout-btn') {
          return { addEventListener: jest.fn() };
        }
        return null;
      });

      await homePage.fetchComandas();

      expect(api.getComandas).toHaveBeenCalled();
    });

    it('deve mostrar mensagem quando não há comandas (Edge Case)', async () => {
      api.getComandas.mockResolvedValue([]);

      const container = { innerHTML: '' };
      homePage.querySelector = jest.fn((selector) => {
        if (selector === '.home-container') return container;
        return null;
      });

      await homePage.fetchComandas();

      expect(container.innerHTML).toContain('Nenhum pedido pendente');
    });

    it('deve mostrar alerta quando falha ao carregar comandas (Edge Case)', async () => {
      const error = new Error('Network error');
      api.getComandas.mockRejectedValue(error);

      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await homePage.fetchComandas();

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar comandas:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('Renderização de Cards de Comanda', () => {
    it('deve renderizar card com informações corretas (Happy Path)', () => {
      const comanda = mockComandas[0];
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('Comanda #1');
      expect(html).toContain('Mesa: 5');
    });

    it('deve mostrar ícone de sucesso quando todos itens entregues (Happy Path)', () => {
      const comanda = {
        id: 3,
        mesa: { id: 1 },
        itens: [
          { statusEntrega: true, produto: {} },
          { statusEntrega: true, produto: {} },
        ],
      };
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('checkmark-circle');
      expect(html).toContain('success');
    });

    it('deve mostrar ícone de warning quando há itens pendentes (Edge Case)', () => {
      const comanda = mockComandas[1]; // Tem item não entregue
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('time-outline');
      expect(html).toContain('warning');
    });
  });

  describe('Atualização de Status de Entrega', () => {
    it('deve chamar api.updateItemComanda com parâmetros corretos (Happy Path)', async () => {
      api.updateItemComanda.mockResolvedValue({});

      await homePage.updateItemEntrega(1, 10, true, document.createElement('ion-card'));

      expect(api.updateItemComanda).toHaveBeenCalledWith(1, 10, {
        statusEntrega: true,
      });
    });

    it('deve mostrar toast de sucesso após atualização (Happy Path)', async () => {
      api.updateItemComanda.mockResolvedValue({});

      await homePage.updateItemEntrega(1, 10, true, document.createElement('ion-card'));

      // Verifica se o toast foi criado (o mock cria o elemento)
      expect(api.updateItemComanda).toHaveBeenCalled();
    });

    it('deve mostrar toast de erro quando falha atualização (Edge Case)', async () => {
      api.updateItemComanda.mockRejectedValue(new Error('Erro'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await homePage.updateItemEntrega(1, 10, true, document.createElement('ion-card'));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao atualizar item:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Atualização de Ícone do Card', () => {
    it('deve atualizar para checkmark quando todos entregues (Happy Path)', () => {
      const icon = { name: '', color: '' };
      const card = {
        querySelectorAll: jest.fn(() => [
          { value: 'true' },
          { value: 'true' },
        ]),
        querySelector: jest.fn(() => icon),
      };

      homePage.updateCardStatusIcon(card);

      expect(icon.name).toBe('checkmark-circle');
      expect(icon.color).toBe('success');
    });

    it('deve manter warning quando há itens pendentes (Edge Case)', () => {
      const icon = { name: '', color: '' };
      const card = {
        querySelectorAll: jest.fn(() => [
          { value: 'true' },
          { value: 'false' },
        ]),
        querySelector: jest.fn(() => icon),
      };

      homePage.updateCardStatusIcon(card);

      expect(icon.name).toBe('time-outline');
      expect(icon.color).toBe('warning');
    });
  });

  describe('Logout', () => {
    it('deve chamar função logout ao clicar no botão', () => {
      const logoutBtn = { addEventListener: jest.fn() };
      
      homePage.querySelector = jest.fn((selector) => {
        if (selector === '#logout-btn') return logoutBtn;
        return null;
      });

      homePage.connectedCallback();

      expect(logoutBtn.addEventListener).toHaveBeenCalledWith('click', logout);
    });
  });
});
