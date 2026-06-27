import './HomePage.css'
import { createHeader } from '../../shared/Header.js';
import { logout, createEmptyState, focusFirstElement, showToast, createCardSkeleton } from '../../shared/util.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';

const pageName = 'Home';

class HomePage extends HTMLElement {
  constructor() {
    super();
    this.mesas = [];
    this.isLoading = false;
    this.viewMode = localStorage.getItem('home-view-mode') || 'cards';
  }

  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = this.getTemplate();
    this.initEventListeners();
    focusFirstElement(this);
    await this.loadPage();

    this._routeListener = () => this.onRouteChange();
    document.querySelector('ion-router').addEventListener('urlChanged', this._routeListener);
  }

  disconnectedCallback() {
    if (this._routeListener) {
      document.querySelector('ion-router').removeEventListener('urlChanged', this._routeListener);
    }
  }

  getTemplate() {
    return `
      ${createHeader(pageName)}
      <ion-content>
        <ion-refresher slot="fixed" id="refresher">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <div class="home-container">
          <div class="summary-bar">
            <span id="summary-text">Carregando...</span>
          </div>
          <div class="view-toggle">
            <ion-buttons>
              <ion-button id="btn-view-cards" class="view-btn ${this.viewMode === 'cards' ? 'active' : ''}" data-mode="cards">
                <ion-icon name="grid-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button id="btn-view-list" class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" data-mode="list">
                <ion-icon name="list-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </div>
          <div class="mesas-grid-container"></div>
        </div>
      </ion-content>
    `;
  }

  initEventListeners() {
    const refresher = this.querySelector('#refresher');
    if (refresher) {
      refresher.addEventListener('ionRefresh', async (e) => {
        await this.loadPage();
        e.target.complete();
      });
    }

    this.querySelector('#logout-btn')?.addEventListener('click', logout);

    this.querySelector('#btn-view-cards')?.addEventListener('click', () => this.setViewMode('cards'));
    this.querySelector('#btn-view-list')?.addEventListener('click', () => this.setViewMode('list'));
  }

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('home-view-mode', mode);
    const cardsBtn = this.querySelector('#btn-view-cards');
    const listBtn = this.querySelector('#btn-view-list');
    if (cardsBtn) cardsBtn.classList.toggle('active', mode === 'cards');
    if (listBtn) listBtn.classList.toggle('active', mode === 'list');
    this.renderMesas();
  }

  async onRouteChange() {
    if (window.location.pathname === '/home') {
      await this.loadPage();
      focusFirstElement(this);
    }
  }

  async loadPage() {
    if (this.isLoading) return;
    this.isLoading = true;
    const gridContainer = this.querySelector('.mesas-grid-container');
    const summaryText = this.querySelector('#summary-text');

    try {
      gridContainer.innerHTML = createCardSkeleton(4);
      summaryText.textContent = 'Carregando...';

      const response = await api.getMesas(0, 100);
      this.mesas = (response.data || response).filter(m => m.status);
      const total = this.mesas.length;

      const activeCount = this.mesas.filter(m => m.hasActiveComanda).length;
      summaryText.textContent = `${total} mesas | ${total - activeCount} disponíveis`;

      this.renderMesas();
      gridContainer.scrollTop = 0;
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      gridContainer.innerHTML = '';
      summaryText.textContent = 'Erro ao carregar';
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar as mesas. Tente novamente.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  renderMesas() {
    const gridContainer = this.querySelector('.mesas-grid-container');

    if (this.mesas.length === 0) {
      createEmptyState(gridContainer, {
        icon: 'grid-outline',
        message: 'Nenhuma mesa ativa encontrada.',
        actionLabel: '',
        actionHandler: null
      });
      return;
    }

    if (this.viewMode === 'cards') {
      this.renderCardView(gridContainer);
    } else {
      this.renderListView(gridContainer);
    }
  }

  renderCardView(container) {
    const grid = document.createElement('div');
    grid.className = 'mesas-grid';
    container.textContent = '';
    container.appendChild(grid);

    this.mesas.forEach(mesa => {
      const isActive = mesa.hasActiveComanda;
      const card = document.createElement('ion-card');
      card.className = `mesa-card ${isActive ? 'mesa-ocupada' : 'mesa-disponivel'}`;
      card.dataset.mesaId = mesa.id;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Mesa ${mesa.id} — ${isActive ? 'Comanda ativa' : 'Disponível'}`);

      const header = document.createElement('ion-card-header');
      const title = document.createElement('ion-card-title');
      title.className = 'mesa-card-title';
      title.textContent = `Mesa ${mesa.id}`;
      header.appendChild(title);
      card.appendChild(header);

      const content = document.createElement('ion-card-content');
      content.className = 'mesa-card-content';

      const statusBadge = document.createElement('ion-badge');
      statusBadge.color = isActive ? 'warning' : 'success';
      statusBadge.textContent = isActive ? 'Comanda Ativa' : 'Disponível';
      content.appendChild(statusBadge);

      const chairsText = document.createElement('p');
      chairsText.className = 'mesa-chairs';
      chairsText.textContent = `${mesa.qtd_cadeiras} cadeira${mesa.qtd_cadeiras !== 1 ? 's' : ''}`;
      content.appendChild(chairsText);

      card.appendChild(content);

      card.addEventListener('click', () => this.onMesaClick(mesa, isActive));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.onMesaClick(mesa, isActive);
        }
      });

      grid.appendChild(card);
    });
  }

  renderListView(container) {
    const list = document.createElement('ion-list');
    list.className = 'mesas-list';
    container.textContent = '';
    container.appendChild(list);

    this.mesas.forEach(mesa => {
      const isActive = mesa.hasActiveComanda;
      const item = document.createElement('ion-item');
      item.className = `mesa-list-item ${isActive ? 'mesa-ocupada' : 'mesa-disponivel'}`;
      item.dataset.mesaId = mesa.id;
      item.button = true;
      item.tabIndex = 0;
      item.setAttribute('aria-label', `Mesa ${mesa.id} — ${isActive ? 'Comanda ativa' : 'Disponível'}`);

      const statusIcon = document.createElement('ion-icon');
      statusIcon.name = isActive ? 'calendar-outline' : 'checkmark-circle-outline';
      statusIcon.color = isActive ? 'warning' : 'success';
      statusIcon.slot = 'start';
      item.appendChild(statusIcon);

      const label = document.createElement('ion-label');
      const h2 = document.createElement('h2');
      h2.textContent = `Mesa ${mesa.id}`;
      label.appendChild(h2);
      const p = document.createElement('p');
      p.textContent = `${mesa.qtd_cadeiras} cadeira${mesa.qtd_cadeiras !== 1 ? 's' : ''} — ${isActive ? 'Comanda Ativa' : 'Disponível'}`;
      label.appendChild(p);
      item.appendChild(label);

      item.addEventListener('click', () => this.onMesaClick(mesa, isActive));

      list.appendChild(item);
    });
  }

  async onMesaClick(mesa, isActive) {
    const router = document.querySelector('ion-router');
    if (isActive) {
      try {
        const comanda = await api.getComandaByMesaId(mesa.id);
        router.push(`/comanda/edit?id=${comanda.id}`, 'root');
      } catch (error) {
        await showToast('Erro ao buscar comanda desta mesa.', 'error', 3000);
      }
    } else {
      router.push(`/comanda/register?id_mesa=${mesa.id}`, 'root');
    }
  }
}

customElements.define('home-page', HomePage);
