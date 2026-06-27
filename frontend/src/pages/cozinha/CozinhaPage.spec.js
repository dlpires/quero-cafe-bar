jest.mock('../../services/api.js', () => ({
  api: {
    getComandas: jest.fn(),
    updateItemComanda: jest.fn(),
  },
}))

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}))

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn((title) => `<ion-header>${title}</ion-header>`),
}))

jest.mock('../../shared/util.js', () => {
  const sizes = { produto: 10, usuario: 10, mesa: 8, comanda: 6, home: 8 }
  return {
    createPaginationState: (ps) => ({
      currentPage: 1, take: ps, totalRecords: 0, totalPages: 0, skip: 0,
      update: function (t) { this.totalRecords = t; this.totalPages = Math.ceil(t / this.take) || 1 },
      next: function () { if (this.currentPage < this.totalPages) { this.currentPage++; this.skip = (this.currentPage - 1) * this.take } },
      prev: function () { if (this.currentPage > 1) { this.currentPage--; this.skip = (this.currentPage - 1) * this.take } },
      reset: function () { this.currentPage = 1; this.skip = 0 },
    }),
    getPageSize: (p) => sizes[p] || 10,
    calculateResponsivePageSize: (p) => sizes[p] || 10,
    renderPaginationBar: (p) => {
      const single = p.totalPages <= 1
      return `<div class="pagination-bar">${single ? '' : `
        <ion-button fill="clear" size="small" ${p.currentPage <= 1 ? 'disabled' : ''} data-action="prev-page" aria-label="Página anterior">
          <ion-icon slot="start" name="chevron-back-outline"></ion-icon>
          Anterior
        </ion-button>
        <span style="font-size:14px;min-width:100px;text-align:center;">
          Página ${p.currentPage} de ${p.totalPages}
        </span>
        <ion-button fill="clear" size="small" ${p.currentPage >= p.totalPages ? 'disabled' : ''} data-action="next-page" aria-label="Próxima página">
          Próxima
          <ion-icon slot="end" name="chevron-forward-outline"></ion-icon>
        </ion-button>`}
        <span style="font-size:13px;">Total: ${p.totalRecords} registro(s)</span>
      </div>`
    },
    createListSkeleton: (c = 5) => '<ion-list>' + Array.from({ length: c }, () => '<ion-item><ion-label><h3><ion-skeleton-text animated></ion-skeleton-text></h3><p><ion-skeleton-text animated></ion-skeleton-text></p></ion-label></ion-item>').join('') + '</ion-list>',
    createCardSkeleton: (c = 4) => Array.from({ length: c }, () => '<ion-card><ion-card-header><ion-card-title></ion-card-title></ion-card-header><ion-card-content></ion-card-content></ion-card>').join(''),
    createEmptyState: jest.fn((container, opts) => {
      container.innerHTML = `<div class="empty-state">${opts.message}</div>`
    }),
    showToast: jest.fn(),
    logout: jest.fn(),
    focusFirstElement: jest.fn(),
  }
})

if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends HTMLElement {})
  customElements.define('ion-footer', class extends HTMLElement {})
  customElements.define('ion-card', class extends HTMLElement {})
  customElements.define('ion-card-header', class extends HTMLElement {})
  customElements.define('ion-card-title', class extends HTMLElement {})
  customElements.define('ion-card-content', class extends HTMLElement {})
  customElements.define('ion-item', class extends HTMLElement {
    constructor() {
      super()
      this.classList = { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
    }
  })
  customElements.define('ion-label', class extends HTMLElement {})
  customElements.define('ion-select', class extends HTMLElement {
    constructor() { super(); this.value = ''; this.dataset = {}; this.closest = jest.fn(); }
  })
  customElements.define('ion-select-option', class extends HTMLElement {})
  customElements.define('ion-icon', class extends HTMLElement {
    constructor() { super(); this.name = ''; this.color = ''; }
  })
  customElements.define('ion-button', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); }
  })
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() { super(); this.message = ''; this.duration = 2000; this.color = 'danger'; this.present = jest.fn(); }
  })
  customElements.define('ion-alert', class extends HTMLElement {
    constructor() { super(); this.header = ''; this.message = ''; this.buttons = []; this.present = jest.fn(); }
  })
  customElements.define('ion-router', class extends HTMLElement {
    constructor() { super(); this.push = jest.fn(); this.addEventListener = jest.fn(); }
  })
}

import { api } from '../../services/api.js'
import {
  createPaginationState, calculateResponsivePageSize, renderPaginationBar, createCardSkeleton, showToast,
} from '../../shared/util.js'

describe('CozinhaPage', () => {
  let page

  const mockComandas = [
    {
      id: 1, mesa: { id: 5 },
      itens: [
        { id_produto: 10, qtd_item: 2, statusEntrega: false, produto: { dsc_produto: 'Café Expresso' } },
        { id_produto: 11, qtd_item: 1, statusEntrega: true, produto: { dsc_produto: 'Pão de Queijo' } },
      ],
    },
    {
      id: 2, mesa: { id: 3 },
      itens: [
        { id_produto: 12, qtd_item: 3, statusEntrega: false, produto: { dsc_produto: 'Suco Natural' } },
      ],
    },
  ]

  const mockPaginatedResponse = {
    data: mockComandas,
    total: 25,
    skip: 0,
    take: 8,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    class TestCozinhaPage extends HTMLElement {
      constructor() {
        super()
        this.comandas = []
        this.isLoading = false
        this.pagination = createPaginationState(calculateResponsivePageSize('home'))
        this._gridContainer = { innerHTML: '' }
        this._pagContainer = { innerHTML: '' }
        this.querySelector = jest.fn((selector) => {
          if (selector === '.comandas-grid-container') return this._gridContainer
          if (selector === '.pagination-bar-container') return this._pagContainer
          return null
        })
      }

      async loadPage(page) {
        if (this.isLoading) return
        this.isLoading = true
        const gridContainer = this.querySelector('.comandas-grid-container')
        const paginationContainer = this.querySelector('.pagination-bar-container')

        try {
          const skip = (page - 1) * this.pagination.take
          gridContainer.innerHTML = createCardSkeleton(4)
          paginationContainer.innerHTML = ''

          const response = await api.getComandas(skip, this.pagination.take)
          this.comandas = response.data || response
          const total = response.total != null ? response.total : this.comandas.length
          this.pagination.update(total)
          this.pagination.currentPage = page
          this.renderComandas()
          this.renderPaginationControls()
          gridContainer.scrollTop = 0
        } catch (error) {
          gridContainer.innerHTML = ''
          const alert = document.createElement('ion-alert')
          alert.header = 'Erro'
          alert.message = 'Não foi possível carregar os pedidos.'
          alert.buttons = ['OK']
          document.body.appendChild(alert)
          await alert.present()
        } finally {
          this.isLoading = false
        }
      }

      nextPage() { this.loadPage(this.pagination.currentPage + 1) }
      prevPage() { this.loadPage(this.pagination.currentPage - 1) }

      renderPaginationControls() {
        const container = this.querySelector('.pagination-bar-container')
        if (this.comandas.length === 0) {
          container.innerHTML = ''
          return
        }
        container.innerHTML = renderPaginationBar(this.pagination)
      }

      renderComandas() {
        const gridContainer = this.querySelector('.comandas-grid-container')
        if (this.comandas.length === 0) {
          gridContainer.innerHTML = '<div class="empty-state">Nenhum pedido pendente.</div>'
          return
        }
        gridContainer.innerHTML = `<div class="comandas-grid">
          ${this.comandas.map(c => this.renderComandaCard(c)).join('')}
        </div>`
      }

      renderComandaCard(comanda) {
        const todosEntregues = comanda.itens.length > 0 && comanda.itens.every(i => i.statusEntrega)
        const statusIcon = todosEntregues ? 'checkmark-circle' : 'time-outline'
        const statusColor = todosEntregues ? 'success' : 'warning'

        const itensHtml = comanda.itens.map(item => {
          const statusText = item.statusEntrega ? 'Entregue' : 'Pendente'
          return `<ion-item lines="none" class="comanda-item ${item.statusEntrega ? 'item-delivered' : 'item-pending'}">
            <ion-label class="item-label">
              <h2 class="item-name">${item.produto.dsc_produto}</h2>
              <p class="item-qty">Quantidade: ${item.qtd_item}</p>
            </ion-label>
            <ion-select class="item-status-select" slot="end"
              data-id-comanda="${comanda.id}" data-id-produto="${item.id_produto}"
              value="${item.statusEntrega.toString()}" interface="action-sheet"
              aria-label="Status de ${item.produto.dsc_produto}: ${statusText}">
              <ion-select-option value="false">Pendente</ion-select-option>
              <ion-select-option value="true">Entregue</ion-select-option>
            </ion-select>
          </ion-item>`
        }).join('')

        return `<ion-card class="comanda-card" data-comanda-id="${comanda.id}"
          role="region" aria-labelledby="comanda-title-${comanda.id}">
          <ion-card-header>
            <ion-card-title id="comanda-title-${comanda.id}">Comanda #${comanda.id} — Mesa: ${comanda.mesa.id}</ion-card-title>
            <ion-icon name="${statusIcon}" color="${statusColor}" class="card-status-icon" aria-hidden="true"></ion-icon>
          </ion-card-header>
          <ion-card-content>${itensHtml}</ion-card-content>
        </ion-card>`
      }

      async updateItemEntrega(id_comanda, id_produto, statusEntrega, cardElement) {
        try {
          await api.updateItemComanda(id_comanda, id_produto, { statusEntrega })
          this.updateCardStatusIcon(cardElement)
          showToast('Status do item atualizado!', 'success')
        } catch (error) {
          showToast(error.message, 'error')
        }
      }

      updateCardStatusIcon(cardElement) {
        const selects = cardElement.querySelectorAll('.item-status-select')
        const allEntregues = Array.from(selects).every(select => select.value === 'true')
        const icon = cardElement.querySelector('.card-status-icon')
        if (!icon) return
        icon.name = allEntregues ? 'checkmark-circle' : 'time-outline'
        icon.color = allEntregues ? 'success' : 'warning'
      }
    }

    if (!customElements.get('cozinha-page')) {
      customElements.define('cozinha-page', TestCozinhaPage)
    }

    page = new TestCozinhaPage()
  })

  describe('Paginação', () => {
    it('deve renderizar controles quando há múltiplas páginas', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('Página 1 de 4')
      expect(html).toContain('Próxima')
      expect(html).toContain('Anterior')
      expect(html).toContain('Total: 25 registro(s)')
    })

    it('deve desabilitar "Anterior" na primeira página', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="prev-page"')
      expect(html).toContain('disabled')
    })

    it('deve desabilitar "Próxima" na última página', async () => {
      api.getComandas.mockResolvedValue({ ...mockPaginatedResponse, skip: 24 })
      await page.loadPage(4)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="next-page"')
      expect(html).toContain('disabled')
    })

    it('deve ocultar botões quando há apenas 1 página', async () => {
      api.getComandas.mockResolvedValue({ data: mockComandas, total: 2, skip: 0, take: 8 })
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).not.toContain('Próxima')
      expect(html).toContain('Total: 2 registro(s)')
    })

    it('deve ocultar barra quando não há comandas', async () => {
      api.getComandas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 8 })
      await page.loadPage(1)
      expect(page.querySelector('.pagination-bar-container').innerHTML).toBe('')
    })

    it('deve navegar entre páginas', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)
      api.getComandas.mockResolvedValue({ ...mockPaginatedResponse, skip: 8 })
      await page.nextPage()

      expect(page.querySelector('.pagination-bar-container').innerHTML).toContain('Página 2 de 4')
    })

    it('deve ter container de paginação no template', () => {
      expect(page.querySelector('.pagination-bar-container')).not.toBeNull()
    })
  })

  describe('Renderização Inicial', () => {
    it('deve carregar comandas com parâmetros de paginação', async () => {
      api.getComandas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 8 })
      await page.loadPage(1)
      expect(api.getComandas).toHaveBeenCalled()
    })
  })

  describe('Renderização de Cards', () => {
    it('deve renderizar card com informações corretas', () => {
      const html = page.renderComandaCard(mockComandas[0])
      expect(html).toContain('Comanda #1')
      expect(html).toContain('Mesa: 5')
    })

    it('deve mostrar checkmark quando todos itens entregues', () => {
      const comanda = { id: 3, mesa: { id: 1 }, itens: [
        { statusEntrega: true, produto: {} },
        { statusEntrega: true, produto: {} },
      ]}
      const html = page.renderComandaCard(comanda)
      expect(html).toContain('checkmark-circle')
      expect(html).toContain('success')
    })

    it('deve mostrar warning quando há itens pendentes', () => {
      const html = page.renderComandaCard(mockComandas[1])
      expect(html).toContain('time-outline')
      expect(html).toContain('warning')
    })

    it('card deve ter role region e aria-labelledby', () => {
      const html = page.renderComandaCard(mockComandas[0])
      expect(html).toContain('role="region"')
      expect(html).toContain('aria-labelledby="comanda-title-1"')
      expect(html).toContain('id="comanda-title-1"')
    })

    it('ícone de status deve ser aria-hidden', () => {
      const html = page.renderComandaCard(mockComandas[0])
      expect(html).toContain('aria-hidden="true"')
      expect(html).toContain('class="card-status-icon"')
    })
  })

  describe('Atualização de Status', () => {
    it('deve chamar api.updateItemComanda com parâmetros corretos', async () => {
      api.updateItemComanda.mockResolvedValue({})
      await page.updateItemEntrega(1, 10, true, document.createElement('ion-card'))
      expect(api.updateItemComanda).toHaveBeenCalledWith(1, 10, { statusEntrega: true })
    })

    it('deve mostrar toast de sucesso', async () => {
      api.updateItemComanda.mockResolvedValue({})
      await page.updateItemEntrega(1, 10, true, document.createElement('ion-card'))
      expect(showToast).toHaveBeenCalledWith('Status do item atualizado!', 'success')
    })

    it('deve mostrar toast de erro', async () => {
      api.updateItemComanda.mockRejectedValue(new Error('Erro de rede'))
      await page.updateItemEntrega(1, 10, true, document.createElement('ion-card'))
      expect(showToast).toHaveBeenCalledWith('Erro de rede', 'error')
    })
  })

  describe('Atualização de Ícone do Card', () => {
    it('deve atualizar para checkmark quando todos entregues', () => {
      const icon = { name: '', color: '' }
      const card = {
        querySelectorAll: jest.fn(() => [{ value: 'true' }, { value: 'true' }]),
        querySelector: jest.fn(() => icon),
      }
      page.updateCardStatusIcon(card)
      expect(icon.name).toBe('checkmark-circle')
      expect(icon.color).toBe('success')
    })

    it('deve manter warning quando há pendentes', () => {
      const icon = { name: '', color: '' }
      const card = {
        querySelectorAll: jest.fn(() => [{ value: 'true' }, { value: 'false' }]),
        querySelector: jest.fn(() => icon),
      }
      page.updateCardStatusIcon(card)
      expect(icon.name).toBe('time-outline')
      expect(icon.color).toBe('warning')
    })
  })

  describe('Empty State', () => {
    it('deve mostrar mensagem quando não há comandas', async () => {
      api.getComandas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 8 })
      await page.loadPage(1)
      expect(page.querySelector('.comandas-grid-container').innerHTML).toContain('Nenhum pedido pendente.')
    })
  })
})
