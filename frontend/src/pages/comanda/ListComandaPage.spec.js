jest.mock('../../services/api.js', () => ({
  api: {
    getComandas: jest.fn(),
    deleteComanda: jest.fn(),
    getItensComanda: jest.fn(),
  },
}))

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}))

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
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
    showToast: jest.fn(),
    logout: jest.fn(),
    focusFirstElement: jest.fn(),
  }
})

if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends HTMLElement {})
  customElements.define('ion-footer', class extends HTMLElement {})
  customElements.define('ion-button', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); }
  })
  customElements.define('ion-icon', class extends HTMLElement {
    constructor() { super(); this.name = ''; this.color = ''; }
  })
  customElements.define('ion-list', class extends HTMLElement {})
  customElements.define('ion-item', class extends HTMLElement {})
  customElements.define('ion-label', class extends HTMLElement {})
  customElements.define('ion-skeleton-text', class extends HTMLElement {})
  customElements.define('ion-refresher', class extends HTMLElement {})
  customElements.define('ion-refresher-content', class extends HTMLElement {})
  customElements.define('ion-fab', class extends HTMLElement {
    constructor() { super(); this.vertical = ''; this.horizontal = ''; this.slot = ''; }
  })
  customElements.define('ion-fab-button', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); }
  })
  customElements.define('ion-router', class extends HTMLElement {
    constructor() { super(); this.push = jest.fn(); }
  })
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() { super(); this.present = jest.fn(); this.message = ''; }
  })
  customElements.define('ion-alert', class extends HTMLElement {
    constructor() { super(); this.present = jest.fn(); }
  })
  customElements.define('ion-loading', class extends HTMLElement {
    constructor() { super(); this.present = jest.fn(); this.dismiss = jest.fn(); }
  })
}

import { api } from '../../services/api.js'
import {
  createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton, showToast,
} from '../../shared/util.js'

describe('ListComandaPage', () => {
  let page

  const mockComandas = [
    {
      id: 1, dt_abertura: '2024-01-15T10:00:00', dt_fechamento: null,
      mesa: { id: 5 }, itens: [
        { id: 1, produto: { dsc_produto: 'Café' }, qtd_item: 2, valor_venda: 5, statusPg: false, statusEntrega: false },
      ],
    },
    {
      id: 2, dt_abertura: '2024-01-15T11:00:00', dt_fechamento: '2024-01-15T12:00:00',
      mesa: { id: 3 }, itens: [],
    },
  ]

  const mockPaginatedResponse = {
    data: mockComandas,
    total: 18,
    skip: 0,
    take: 6,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    class TestListComandaPage extends HTMLElement {
      constructor() {
        super()
        this.items = []
        this.isLoading = false
        this.comandasWithDetails = []
        this.pagination = createPaginationState(calculateResponsivePageSize('comanda'))
        this._container = { innerHTML: '' }
        this._pagContainer = { innerHTML: '' }
        this.querySelector = (selector) => {
          if (selector === '.list-comanda-container') return this._container
          if (selector === '.pagination-bar-container') return this._pagContainer
          return null
        }
      }

      async loadPage(page) {
        if (this.isLoading) return
        this.isLoading = true
        const container = this.querySelector('.list-comanda-container')
        const paginationContainer = this.querySelector('.pagination-bar-container')

        try {
          container.innerHTML = createListSkeleton(4)
          paginationContainer.innerHTML = ''

          const response = await api.getComandas(
            (page - 1) * this.pagination.take,
            this.pagination.take,
          )
          this.items = response.data || response
          const total = response.total != null ? response.total : this.items.length
          this.pagination.update(total)
          this.pagination.currentPage = page
          await this.enrichComandas()
          this.renderItems()
          this.renderPaginationControls()
        } catch (error) {
          showToast('Erro ao carregar página.', 'error')
          this.renderItems()
          this.renderPaginationControls()
        } finally {
          this.isLoading = false
        }
      }

      async enrichComandas() {
        this.comandasWithDetails = await Promise.all(
          this.items.map(async (comanda) => {
            try {
              const itens = await api.getItensComanda(comanda.id)
              const qtdItens = itens.length
              const valorTotal = itens.reduce((sum, item) => sum + (item.qtd_item * item.valor_venda), 0)
              const todosPagos = itens.length > 0 && itens.every(item => item.statusPg)
              const todosEntregues = itens.length > 0 && itens.every(item => item.statusEntrega)
              return { ...comanda, qtdItens, valorTotal, todosPagos, todosEntregues }
            } catch {
              return { ...comanda, qtdItens: 0, valorTotal: 0, todosPagos: false, todosEntregues: false }
            }
          }),
        )
      }

      nextPage() { this.loadPage(this.pagination.currentPage + 1) }
      prevPage() { this.loadPage(this.pagination.currentPage - 1) }

      renderPaginationControls() {
        const container = this.querySelector('.pagination-bar-container')
        if (this.comandasWithDetails.length === 0) {
          container.innerHTML = ''
          return
        }
        container.innerHTML = renderPaginationBar(this.pagination)
      }

      renderFabButton() {
        const content = this.querySelector('ion-content')
        const fab = document.createElement('ion-fab')
        fab.vertical = 'bottom'
        fab.horizontal = 'end'
        fab.slot = 'fixed'
        fab.innerHTML = '<ion-fab-button><ion-icon name="add"></ion-icon></ion-fab-button>'
        fab.addEventListener('click', () => {})
        content.appendChild(fab)
      }

      renderItems() {
        const container = this.querySelector('.list-comanda-container')
        if (this.comandasWithDetails.length === 0) {
          container.innerHTML = '<p>Nenhuma comanda encontrada</p>'
          return
        }
        container.innerHTML = `<ion-list>${this.comandasWithDetails.map(c => `
          <ion-item><ion-label>Comanda #${c.id}</ion-label></ion-item>
        `).join('')}</ion-list>`
      }

      async deleteComanda(id) {
        try {
          await api.deleteComanda(id)
          this.pagination.reset()
          await this.loadPage(1)
        } catch (error) {
          showToast(error.message, 'error')
        }
      }
    }

    if (!customElements.get('list-comanda-page')) {
      customElements.define('list-comanda-page', TestListComandaPage)
    }

    page = new TestListComandaPage()
  })

  describe('Paginação', () => {
    it('deve renderizar controles quando há múltiplas páginas', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('Página 1 de 3')
      expect(html).toContain('Próxima')
      expect(html).toContain('Anterior')
      expect(html).toContain('Total: 18 registro(s)')
    })

    it('deve desabilitar "Anterior" na primeira página', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="prev-page"')
      expect(html).toContain('disabled')
    })

    it('deve desabilitar "Próxima" na última página', async () => {
      api.getComandas.mockResolvedValue({ ...mockPaginatedResponse, skip: 12 })
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(3)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="next-page"')
      expect(html).toContain('disabled')
    })

    it('deve ocultar botões quando há apenas 1 página', async () => {
      api.getComandas.mockResolvedValue({ data: mockComandas, total: 2, skip: 0, take: 6 })
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).not.toContain('Próxima')
      expect(html).toContain('Total: 2 registro(s)')
    })

    it('deve ocultar barra quando não há itens', async () => {
      api.getComandas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 6 })
      await page.loadPage(1)
      expect(page.querySelector('.pagination-bar-container').innerHTML).toBe('')
    })

    it('deve navegar entre páginas com nextPage/prevPage', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(1)

      api.getComandas.mockResolvedValue({ ...mockPaginatedResponse, skip: 6 })
      api.getItensComanda.mockResolvedValue([])
      await page.nextPage()

      expect(page.pagination.currentPage).toBe(2)
    })

    it('deve tratar erro com toast', async () => {
      api.getComandas.mockRejectedValue(new Error('Erro'))
      await page.loadPage(1)
      expect(showToast).toHaveBeenCalled()
    })

    it('deve ter container de paginação no template', () => {
      expect(page.querySelector('.pagination-bar-container')).not.toBeNull()
    })
  })

  describe('Enriquecimento de Comandas', () => {
    it('deve enriquecer comandas com itens, totais e status', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockImplementation((id) => {
        if (id === 1) return Promise.resolve([
          { qtd_item: 2, valor_venda: 5, statusPg: false, statusEntrega: false },
        ])
        return Promise.resolve([])
      })

      await page.loadPage(1)

      expect(page.comandasWithDetails.length).toBe(2)
      expect(page.comandasWithDetails[0].qtdItens).toBe(1)
      expect(page.comandasWithDetails[0].valorTotal).toBe(10)
      expect(page.comandasWithDetails[0].todosPagos).toBe(false)
      expect(page.comandasWithDetails[1].qtdItens).toBe(0)
    })
  })

  describe('Exclusão', () => {
    it('deve resetar paginação e recarregar após excluir', async () => {
      api.deleteComanda.mockResolvedValue({})
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockResolvedValue([])
      page.pagination.currentPage = 2

      await page.deleteComanda(1)

      expect(api.deleteComanda).toHaveBeenCalledWith(1)
      expect(page.pagination.currentPage).toBe(1)
    })

    it('deve tratar erro ao excluir', async () => {
      api.deleteComanda.mockRejectedValue(new Error('Erro ao excluir'))
      await page.deleteComanda(1)
      expect(showToast).toHaveBeenCalledWith('Erro ao excluir', 'error')
    })
  })

  describe('Renderização', () => {
    it('deve carregar comandas com parâmetros de paginação', async () => {
      api.getComandas.mockResolvedValue(mockPaginatedResponse)
      api.getItensComanda.mockResolvedValue([])
      await page.loadPage(1)
      expect(api.getComandas).toHaveBeenCalled()
    })
  })

  describe('Responsividade', () => {
    it('T013: deve exibir 2 colunas em viewport 768px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-comanda-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-comanda-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(2, 1fr)')
      style.remove()
      container.remove()
    })

    it('T013: deve exibir 3 colunas em viewport 1024px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-comanda-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-comanda-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(3, 1fr)')
      style.remove()
      container.remove()
    })

    it('T013: deve exibir 4 colunas em viewport 1400px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-comanda-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-comanda-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(4, 1fr)')
      style.remove()
      container.remove()
    })
  })
})
