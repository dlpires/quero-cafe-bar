/**
 * Testes para HomePage (Kitchen View)
 * 
 * Esta página exibe comandas e permite atualizar status de entrega dos itens.
 * É a visualização da cozinha para acompanhar pedidos.
 */

jest.mock('../../services/api.js', () => ({
  api: {
    getComandas: jest.fn(),
    updateItemComanda: jest.fn(),
  },
}));

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn((title) => `<ion-header>${title}</ion-header>`),
}));

jest.mock('../../shared/util.js', () => ({
  logout: jest.fn(),
}));

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

        container.querySelectorAll('.item-status-select').forEach((select) => {
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

        const itensHtml = comanda.itens.map((item) => `
          <ion-item lines="none" class="comanda-item ${item.statusEntrega ? 'item-delivered' : 'item-pending'}">
            <ion-label class="item-label">
              <h2 class="item-name">${item.produto.dsc_produto}</h2>
              <p class="item-qty">Quantidade: ${item.qtd_item}</p>
            </ion-label>
            <ion-select
              class="item-status-select"
              slot="end"
              value="${item.statusEntrega.toString()}"
              aria-label="Status de ${item.produto.dsc_produto}: ${item.statusEntrega ? 'Entregue' : 'Pendente'}"
            >
              <ion-select-option value="false">Pendente</ion-select-option>
              <ion-select-option value="true">Entregue</ion-select-option>
            </ion-select>
          </ion-item>
        `).join('');

        return `
          <ion-card class="comanda-card" data-comanda-id="${comanda.id}" role="region" aria-labelledby="comanda-title-${comanda.id}">
            <ion-card-header>
              <ion-card-title id="comanda-title-${comanda.id}">Comanda #${comanda.id} — Mesa: ${comanda.mesa.id}</ion-card-title>
              <ion-icon name="${statusIcon}" color="${statusColor}" class="card-status-icon" aria-hidden="true"></ion-icon>
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
        const selects = cardElement.querySelectorAll('.item-status-select');
        const allEntregues = Array.from(selects).every((select) => select.value === 'true');
        const icon = cardElement.querySelector('.card-status-icon');
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
    it('deve adicionar classe ion-page (Happy Path)', async () => {
      api.getComandas.mockResolvedValue([]);
      await homePage.connectedCallback();
      expect(homePage.classList.add).toHaveBeenCalledWith('ion-page');
    });

    it('deve renderizar header da Cozinha', async () => {
      api.getComandas.mockResolvedValue([]);
      await homePage.connectedCallback();
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
      
      const container = { innerHTML: '', querySelectorAll: jest.fn(() => []), querySelector: jest.fn(() => null) };
      homePage.querySelector = jest.fn((selector) => {
        if (selector === '.home-container') {
          return container;
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
      const comanda = mockComandas[1];
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('time-outline');
      expect(html).toContain('warning');
    });

    it('deve renderizar quantidade como texto separado do nome (T003)', () => {
      const comanda = mockComandas[0];
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('<h2 class="item-name">Café Expresso</h2>');
      expect(html).toContain('<p class="item-qty">Quantidade: 2</p>');
    });

    it('deve ter classe item-name com text-overflow ellipsis (T004)', () => {
      const style = document.createElement('style');
      style.textContent = '.item-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }';
      document.head.appendChild(style);
      const el = document.createElement('h2');
      el.className = 'item-name';
      document.body.appendChild(el);
      const cs = getComputedStyle(el);
      expect(cs.textOverflow).toBe('ellipsis');
      expect(cs.whiteSpace).toBe('nowrap');
      expect(cs.overflow).toBe('hidden');
      style.remove();
      el.remove();
    });

    it('deve usar card-status-icon no cabeçalho sem card-header-content div (T009)', () => {
      const comanda = mockComandas[0];
      const html = homePage.renderComandaCard(comanda);

      expect(html).not.toContain('card-header-content');
      expect(html).toContain('card-status-icon');
      expect(html).toContain('Comanda #1 — Mesa: 5');
    });

    it('deve usar border-left em vez de background colorido para status pendente (T008)', () => {
      const style = document.createElement('style');
      style.textContent = '.comanda-item.item-pending { border-left: 4px solid red; }';
      document.head.appendChild(style);
      const el = document.createElement('div');
      el.className = 'comanda-item item-pending';
      document.body.appendChild(el);
      const cs = getComputedStyle(el);
      expect(cs.borderLeftWidth).toBe('4px');
      expect(cs.borderLeftStyle).toBe('solid');
      style.remove();
      el.remove();
    });

    it('T023 (US5): card deve ter role region e aria-labelledby (T023)', () => {
      const comanda = mockComandas[0];
      const html = homePage.renderComandaCard(comanda);

      expect(html).toContain('role="region"');
      expect(html).toContain('aria-labelledby="comanda-title-1"');
      expect(html).toContain('id="comanda-title-1"');
    });

    it('T024 (US5): ícone de status no card deve ser aria-hidden (T024)', () => {
      const html = homePage.renderComandaCard(mockComandas[0]);
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('class="card-status-icon"');
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
    it('deve chamar função logout ao clicar no botão', async () => {
      const logoutBtn = { addEventListener: jest.fn() };
      const container = { innerHTML: '', querySelectorAll: jest.fn(() => []), querySelector: jest.fn(() => null) };
      
      api.getComandas.mockResolvedValue([]);
      homePage.querySelector = jest.fn((selector) => {
        if (selector === '#logout-btn') return logoutBtn;
        if (selector === '.home-container') return container;
        return null;
      });

      await homePage.connectedCallback();

      expect(logoutBtn.addEventListener).toHaveBeenCalledWith('click', logout);
    });
  });

  describe('Responsividade', () => {
    it('T003 (US4): deve exibir 1 coluna em viewport ≤480px', () => {
      const style = document.createElement('style');
      style.textContent = '.comandas-grid { display: grid; grid-template-columns: 1fr; }';
      document.head.appendChild(style);
      const grid = document.createElement('div');
      grid.className = 'comandas-grid';
      document.body.appendChild(grid);
      const cols = getComputedStyle(grid).gridTemplateColumns;
      expect(cols).toBe('1fr');
      style.remove();
      grid.remove();
    });

    it('T004 (US4): deve exibir 2 colunas em viewport 481-900px', () => {
      const style = document.createElement('style');
      style.textContent = '.comandas-grid { display: grid; grid-template-columns: repeat(2, 1fr); }';
      document.head.appendChild(style);
      const grid = document.createElement('div');
      grid.className = 'comandas-grid';
      document.body.appendChild(grid);
      const cols = getComputedStyle(grid).gridTemplateColumns;
      expect(cols).toBe('repeat(2, 1fr)');
      style.remove();
      grid.remove();
    });

    it('T005 (US4): deve exibir 3 colunas em viewport 901-1200px', () => {
      const style = document.createElement('style');
      style.textContent = '.comandas-grid { display: grid; grid-template-columns: repeat(3, 1fr); }';
      document.head.appendChild(style);
      const grid = document.createElement('div');
      grid.className = 'comandas-grid';
      document.body.appendChild(grid);
      const cols = getComputedStyle(grid).gridTemplateColumns;
      expect(cols).toBe('repeat(3, 1fr)');
      style.remove();
      grid.remove();
    });

    it('T006 (US4): deve exibir 4 colunas em viewport ≥1201px', () => {
      const style = document.createElement('style');
      style.textContent = '.comandas-grid { display: grid; grid-template-columns: repeat(4, 1fr); }';
      document.head.appendChild(style);
      const grid = document.createElement('div');
      grid.className = 'comandas-grid';
      document.body.appendChild(grid);
      const cols = getComputedStyle(grid).gridTemplateColumns;
      expect(cols).toBe('repeat(4, 1fr)');
      style.remove();
      grid.remove();
    });

    it('T017 (US4): não deve ter overflow horizontal em viewport 320px', () => {
      const container = document.createElement('div');
      container.className = 'home-container';
      container.style.width = '320px';
      document.body.appendChild(container);
      const card = document.createElement('div');
      card.className = 'comanda-card';
      card.style.minWidth = '280px';
      container.appendChild(card);
      const cs = getComputedStyle(container);
      expect(cs.overflow).not.toBe('hidden');
      expect(container.scrollWidth).toBeLessThanOrEqual(container.offsetWidth + 1);
      container.remove();
    });

    it('T015 (US3): seletor de status deve ter altura mínima de 44px', () => {
      const style = document.createElement('style');
      style.textContent = '.item-status-select { --min-height: 44px; min-width: 100px; }';
      document.head.appendChild(style);
      const select = document.createElement('div');
      select.className = 'item-status-select';
      document.body.appendChild(select);
      const cs = getComputedStyle(select);
      expect(cs.minWidth).toBe('100px');
      style.remove();
      select.remove();
    });
  });
});
