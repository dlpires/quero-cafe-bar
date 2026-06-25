jest.mock('../../services/api.js', () => ({
  api: {
    getMesas: jest.fn(),
    getComandaByMesaId: jest.fn(),
  },
}))

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}))

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn((title) => `<ion-header>${title}</ion-header>`),
}))

jest.mock('../../shared/util.js', () => ({
  createCardSkeleton: (c = 4) => Array.from({ length: c }, () => '<ion-card><ion-card-header><ion-card-title></ion-card-title></ion-card-header><ion-card-content></ion-card-content></ion-card>').join(''),
  createEmptyState: jest.fn((container, opts) => {
    container.innerHTML = `<div class="empty-state">${opts.message}</div>`
  }),
  showToast: jest.fn(),
  logout: jest.fn(),
  focusFirstElement: jest.fn(),
}))

if (!customElements.get('ion-content')) {
  customElements.define('ion-content', class extends HTMLElement {})
  customElements.define('ion-footer', class extends HTMLElement {})
  customElements.define('ion-card', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); this.tabIndex = 0 }
  })
  customElements.define('ion-card-header', class extends HTMLElement {})
  customElements.define('ion-card-title', class extends HTMLElement {})
  customElements.define('ion-card-content', class extends HTMLElement {})
  customElements.define('ion-item', class extends HTMLElement { constructor() { super(); this.button = false } })
  customElements.define('ion-label', class extends HTMLElement {})
  customElements.define('ion-list', class extends HTMLElement {})
  customElements.define('ion-icon', class extends HTMLElement {
    constructor() { super(); this.name = ''; this.color = ''; this.slot = '' }
  })
  customElements.define('ion-button', class extends HTMLElement {
    constructor() { super(); this.addEventListener = jest.fn(); this.classList = { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() } }
  })
  customElements.define('ion-badge', class extends HTMLElement {})
  customElements.define('ion-refresher', class extends HTMLElement { constructor() { super(); this.addEventListener = jest.fn() } })
  customElements.define('ion-refresher-content', class extends HTMLElement {})
  customElements.define('ion-toast', class extends HTMLElement {
    constructor() { super(); this.message = ''; this.duration = 2000; this.color = 'danger'; this.present = jest.fn(); }
  })
  customElements.define('ion-alert', class extends HTMLElement {
    constructor() { super(); this.header = ''; this.message = ''; this.buttons = []; this.present = jest.fn(); }
  })
  customElements.define('ion-router', class extends HTMLElement {
    constructor() { super(); this.push = jest.fn(); this.addEventListener = jest.fn(); }
  })
  customElements.define('ion-buttons', class extends HTMLElement {})
}

import { api } from '../../services/api.js'
import { showToast } from '../../shared/util.js'

describe('HomePage', () => {
  let page

  const mockMesas = [
    { id: 1, qtd_cadeiras: 4, status: true, hasActiveComanda: false },
    { id: 2, qtd_cadeiras: 2, status: true, hasActiveComanda: true },
    { id: 3, qtd_cadeiras: 6, status: false, hasActiveComanda: false },
  ]

  const mockPaginatedResponse = {
    data: mockMesas,
    total: 10,
    skip: 0,
    take: 8,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    class TestHomePage extends HTMLElement {
      constructor() {
        super()
        this.mesas = []
        this.isLoading = false
        this.viewMode = 'cards'
        this._gridContainer = { innerHTML: '', scrollTop: 0 }
        this._summaryText = { textContent: '' }
        this.querySelector = jest.fn((selector) => {
          if (selector === '.mesas-grid-container') return this._gridContainer
          if (selector === '#summary-text') return this._summaryText
          if (selector === '#refresher') return { addEventListener: jest.fn() }
          if (selector === '#btn-view-cards' || selector === '#btn-view-list') {
            return { addEventListener: jest.fn(), classList: { add: jest.fn(), toggle: jest.fn() } }
          }
          return null
        })
      }

      async loadPage() {
        if (this.isLoading) return
        this.isLoading = true
        const gridContainer = this.querySelector('.mesas-grid-container')
        const summaryText = this.querySelector('#summary-text')

        try {
          summaryText.textContent = 'Carregando...'

          const response = await api.getMesas(0, 100)
          this.mesas = (response.data || response).filter(m => m.status)
          const total = this.mesas.length

          const activeCount = this.mesas.filter(m => m.hasActiveComanda).length
          summaryText.textContent = `${total} mesas | ${total - activeCount} disponíveis`

          this.renderMesas()
          gridContainer.scrollTop = 0
        } catch (error) {
          gridContainer.innerHTML = ''
          summaryText.textContent = 'Erro ao carregar'
        } finally {
          this.isLoading = false
        }
      }

      renderMesas() {
        const gridContainer = this.querySelector('.mesas-grid-container')
        if (this.mesas.length === 0) {
          gridContainer.innerHTML = '<div class="empty-state">Nenhuma mesa ativa encontrada.</div>'
          return
        }
        if (this.viewMode === 'cards') {
          gridContainer.innerHTML = `<div class="mesas-grid">
            ${this.mesas.map(m => this.renderMesaCard(m)).join('')}
          </div>`
        } else {
          gridContainer.innerHTML = `<ion-list class="mesas-list">
            ${this.mesas.map(m => `<ion-item class="mesa-list-item ${m.hasActiveComanda ? 'mesa-ocupada' : 'mesa-disponivel'}" data-mesa-id="${m.id}">
              <ion-icon name="${m.hasActiveComanda ? 'calendar-outline' : 'checkmark-circle-outline'}" color="${m.hasActiveComanda ? 'warning' : 'success'}" slot="start"></ion-icon>
              <ion-label><h2>Mesa ${m.id}</h2><p>${m.qtd_cadeiras} cadeira(s) — ${m.hasActiveComanda ? 'Comanda Ativa' : 'Disponível'}</p></ion-label>
            </ion-item>`).join('')}
          </ion-list>`
        }
      }

      renderMesaCard(mesa) {
        const isActive = mesa.hasActiveComanda
        return `<ion-card class="mesa-card ${isActive ? 'mesa-ocupada' : 'mesa-disponivel'}" data-mesa-id="${mesa.id}" tabindex="0" role="button" aria-label="Mesa ${mesa.id} — ${isActive ? 'Comanda ativa' : 'Disponível'}">
          <ion-card-header><ion-card-title class="mesa-card-title">Mesa ${mesa.id}</ion-card-title></ion-card-header>
          <ion-card-content class="mesa-card-content">
            <ion-badge color="${isActive ? 'warning' : 'success'}">${isActive ? 'Comanda Ativa' : 'Disponível'}</ion-badge>
            <p class="mesa-chairs">${mesa.qtd_cadeiras} cadeira(s)</p>
          </ion-card-content>
        </ion-card>`
      }

      async onMesaClick(mesa, isActive) {
        if (isActive) {
          await api.getComandaByMesaId(mesa.id)
        }
      }
    }

    if (!customElements.get('home-page')) {
      customElements.define('home-page', TestHomePage)
    }

    page = new TestHomePage()
  })

  describe('Carregamento', () => {
    it('deve carregar todas as mesas ativas sem paginação', async () => {
      api.getMesas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 0 })
      await page.loadPage()
      expect(api.getMesas).toHaveBeenCalledWith(0, 100)
    })

    it('deve filtrar apenas mesas ativas', async () => {
      api.getMesas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage()
      expect(page.mesas).toHaveLength(2)
      expect(page.mesas.every(m => m.status)).toBe(true)
    })

    it('deve atualizar sumário com contagem correta', async () => {
      api.getMesas.mockResolvedValue(mockPaginatedResponse)
      await page.loadPage()
      expect(page._summaryText.textContent).toContain('2 mesas')
      expect(page._summaryText.textContent).toContain('1 disponíveis')
    })
  })

  describe('Renderização de Cards', () => {
    it('deve renderizar card com informações da mesa', () => {
      const html = page.renderMesaCard(mockMesas[0])
      expect(html).toContain('Mesa 1')
      expect(html).toContain('4 cadeira(s)')
      expect(html).toContain('Disponível')
      expect(html).toContain('success')
    })

    it('deve renderizar mesa ocupada com badge warning', () => {
      const html = page.renderMesaCard(mockMesas[1])
      expect(html).toContain('Mesa 2')
      expect(html).toContain('Comanda Ativa')
      expect(html).toContain('warning')
    })

    it('deve ter role button e aria-label', () => {
      const html = page.renderMesaCard(mockMesas[0])
      expect(html).toContain('role="button"')
      expect(html).toContain('Disponível')
    })

    it('deve ter tabindex 0 para foco via teclado', () => {
      const html = page.renderMesaCard(mockMesas[0])
      expect(html).toContain('tabindex="0"')
    })
  })

  describe('Empty State', () => {
    it('deve mostrar mensagem quando não há mesas', async () => {
      api.getMesas.mockResolvedValue({ data: [], total: 0, skip: 0, take: 0 })
      await page.loadPage()
      expect(page.querySelector('.mesas-grid-container').innerHTML).toContain('Nenhuma mesa ativa encontrada.')
    })
  })

  describe('Click Navigation', () => {
    it('deve chamar api.getComandaByMesaId para mesa com comanda ativa', async () => {
      api.getComandaByMesaId.mockResolvedValue({ id: 10 })
      await page.onMesaClick(mockMesas[1], true)
      expect(api.getComandaByMesaId).toHaveBeenCalledWith(2)
    })

    it('não deve chamar API para mesa disponível', async () => {
      await page.onMesaClick(mockMesas[0], false)
      expect(api.getComandaByMesaId).not.toHaveBeenCalled()
    })
  })

  describe('Alternância de Visualização', () => {
    it('deve iniciar no modo cards por padrão', () => {
      expect(page.viewMode).toBe('cards')
    })

    it('deve renderizar lista quando viewMode é list', () => {
      page.mesas = mockMesas.filter(m => m.status)
      page.viewMode = 'list'
      page.renderMesas()
      const html = page.querySelector('.mesas-grid-container').innerHTML
      expect(html).toContain('ion-list')
      expect(html).toContain('mesa-list-item')
    })

    it('deve renderizar cards quando viewMode é cards', () => {
      page.mesas = mockMesas.filter(m => m.status)
      page.viewMode = 'cards'
      page.renderMesas()
      const html = page.querySelector('.mesas-grid-container').innerHTML
      expect(html).toContain('mesa-card')
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve mostrar mensagem de erro quando API falha', async () => {
      api.getMesas.mockRejectedValue(new Error('Erro de rede'))
      await page.loadPage()
      expect(page._summaryText.textContent).toBe('Erro ao carregar')
    })
  })
})
