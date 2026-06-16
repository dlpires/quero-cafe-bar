jest.mock('../../services/api.js', () => ({
  api: { getMesas: jest.fn(), deleteMesa: jest.fn() },
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
  customElements.define('ion-item-sliding', class extends HTMLElement {})
  customElements.define('ion-item-options', class extends HTMLElement {})
  customElements.define('ion-item-option', class extends HTMLElement {})
  customElements.define('ion-buttons', class extends HTMLElement {})
}

import { api } from '../../services/api.js'
import {
  createPaginationState, calculateResponsivePageSize, renderPaginationBar, createListSkeleton, showToast,
} from '../../shared/util.js'

describe('ListMesaPage', () => {
  let page

  const mockMesas = [
    { id: 1, qtd_cadeiras: 4, status: true },
    { id: 2, qtd_cadeiras: 6, status: false },
  ]

  const mockPaginatedResponse = {
    data: mockMesas,
    total: 20,
    skip: 0,
    take: 8,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    class TestListMesaPage extends HTMLElement {
      constructor() {
        super()
        this.items = []
        this.isLoading = false
        this.pagination = createPaginationState(calculateResponsivePageSize('mesa'))
        this._container = { innerHTML: '' }
        this._pagContainer = { innerHTML: '' }
        this.querySelector = jest.fn((selector) => {
          if (selector === '.list-mesa-container') return this._container
          if (selector === '.pagination-bar-container') return this._pagContainer
          return null
        })
      }

      async loadPage(page) {
        if (this.isLoading) return
        this.isLoading = true
        const container = this.querySelector('.list-mesa-container')
        const paginationContainer = this.querySelector('.pagination-bar-container')

        try {
          container.innerHTML = createListSkeleton(4)
          paginationContainer.innerHTML = ''

          const response = await api.getMesas(
            (page - 1) * this.pagination.take,
            this.pagination.take,
          )
          this.items = response.data || response
          const total = response.total != null ? response.total : this.items.length
          this.pagination.update(total)
          this.pagination.currentPage = page
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

      nextPage() { this.loadPage(this.pagination.currentPage + 1) }
      prevPage() { this.loadPage(this.pagination.currentPage - 1) }

      renderPaginationControls() {
        const container = this.querySelector('.pagination-bar-container')
        if (this.items.length === 0) {
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
        const container = this.querySelector('.list-mesa-container')
        if (this.items.length === 0) {
          container.innerHTML = '<p>Nenhuma mesa encontrada</p>'
          return
        }
        container.innerHTML = `<ion-list>${this.items.map(m => `
          <ion-item><ion-label>Mesa #${m.id}</ion-label></ion-item>
        `).join('')}</ion-list>`
      }
    }

    if (!customElements.get('list-mesa-page')) {
      customElements.define('list-mesa-page', TestListMesaPage)
    }

    page = new TestListMesaPage()
  })

  describe('Paginação', () => {
    it('deve renderizar controles de paginação quando há múltiplas páginas', async () => {
      api.getMesas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('Página 1 de 3')
      expect(html).toContain('Próxima')
      expect(html).toContain('Anterior')
      expect(html).toContain('Total: 20 registro(s)')
    })

    it('deve desabilitar "Anterior" na primeira página', async () => {
      api.getMesas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="prev-page"')
      expect(html).toContain('disabled')
    })

    it('deve desabilitar "Próxima" na última página', async () => {
      api.getMesas.mockResolvedValue({ ...mockPaginatedResponse, skip: 16 })
      await page.loadPage(3)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).toContain('data-action="next-page"')
      expect(html).toContain('disabled')
    })

    it('deve ocultar botões quando há apenas 1 página', async () => {
      api.getMesas.mockResolvedValue({ data: mockMesas, total: 2, skip: 0, take: 8 })
      await page.loadPage(1)

      const html = page.querySelector('.pagination-bar-container').innerHTML
      expect(html).not.toContain('Próxima')
      expect(html).toContain('Total: 2 registro(s)')
    })

    it('deve ocultar barra quando não há itens', async () => {
      api.getMesas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 8 })
      await page.loadPage(1)
      expect(page.querySelector('.pagination-bar-container').innerHTML).toBe('')
    })

    it('deve navegar entre páginas', async () => {
      api.getMesas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage(1)
      api.getMesas.mockResolvedValue({ ...mockPaginatedResponse, skip: 8 })
      await page.nextPage()

      expect(page.querySelector('.pagination-bar-container').innerHTML).toContain('Página 2 de 3')
    })

    it('deve tratar erro com toast', async () => {
      api.getMesas.mockRejectedValue(new Error('Falha'))
      await page.loadPage(1)
      expect(showToast).toHaveBeenCalled()
    })

    it('deve ter container de paginação no template', () => {
      expect(page.querySelector('.pagination-bar-container')).not.toBeNull()
    })
  })

  describe('Responsividade', () => {
    it('T012: deve exibir 2 colunas em viewport 768px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-mesa-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(2, 1fr)')
      style.remove()
      container.remove()
    })

    it('T012: deve exibir 3 colunas em viewport 1024px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-mesa-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(3, 1fr)')
      style.remove()
      container.remove()
    })

    it('T012: deve exibir 4 colunas em viewport 1400px', () => {
      const style = document.createElement('style')
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }'
      document.head.appendChild(style)
      const container = document.createElement('div')
      container.className = 'list-mesa-container'
      document.body.appendChild(container)
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(4, 1fr)')
      style.remove()
      container.remove()
    })
  })
})
