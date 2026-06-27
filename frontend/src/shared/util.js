const TOAST_COLORS = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
};

const TOAST_ICONS = {
    success: 'checkmark-circle-outline',
    error: 'alert-circle-outline',
    warning: 'warning-outline',
};

export async function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = duration;
    toast.color = TOAST_COLORS[type] || 'primary';
    toast.icon = TOAST_ICONS[type] || 'information-outline';
    toast.position = 'bottom';
    document.body.appendChild(toast);
    await toast.present();
    toast.addEventListener('ionToastDidDismiss', () => toast.remove());
}

export async function withLoading(promise, options = {}) {
    const loading = document.createElement('ion-loading');
    loading.message = options.loadingMessage || 'Salvando...';
    if (options.duration) {
        loading.duration = options.duration;
    }
    document.body.appendChild(loading);
    await loading.present();
    try {
        const result = await promise;
        return result;
    } finally {
        await loading.dismiss();
        loading.addEventListener('ionLoadingDidDismiss', () => loading.remove());
    }
}

export function createEmptyState(container, options) {
    const icon = options.icon || 'file-tray-outline';
    const message = options.message || 'Nenhum registro encontrado';

    const wrapper = document.createElement('div');
    wrapper.className = 'empty-state';
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; text-align: center;';

    const iconEl = document.createElement('ion-icon');
    iconEl.style.cssText = 'font-size: 64px; color: var(--ion-color-medium); margin-bottom: 16px;';
    iconEl.setAttribute('name', icon);
    wrapper.appendChild(iconEl);

    const p = document.createElement('p');
    p.style.cssText = 'font-size: 16px; color: var(--ion-color-medium); margin: 0 0 16px 0; max-width: 280px;';
    p.textContent = message;
    wrapper.appendChild(p);

    if (options.actionLabel && options.actionHandler) {
        const btn = document.createElement('ion-button');
        btn.setAttribute('fill', 'solid');
        btn.setAttribute('color', 'primary');
        btn.textContent = options.actionLabel;
        btn.addEventListener('click', options.actionHandler);
        wrapper.appendChild(btn);
    }

    container.textContent = '';
    container.appendChild(wrapper);
}

export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} é obrigatório`;
    }
    return null;
}

export function validatePositiveNumber(value, fieldName) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
        return `${fieldName} deve ser maior que zero`;
    }
    return null;
}

let _cachedUser = null;
let _cachedUserTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getLoggedUser() {
    if (_cachedUser && _cachedUserTimestamp && Date.now() - _cachedUserTimestamp < CACHE_TTL) {
        return _cachedUser;
    }
    const { api } = await import('../services/api.js');
    try {
        _cachedUser = await api.getMe();
        _cachedUserTimestamp = Date.now();
        return _cachedUser;
    } catch {
        return null;
    }
}

export async function getLoggedUserId() {
    const user = await getLoggedUser();
    return user?.id ?? null;
}

export async function getLoggedUserProfile() {
    const user = await getLoggedUser();
    return user?.perfil ?? null;
}

export function clearLoggedUserCache() {
    _cachedUser = null;
    _cachedUserTimestamp = null;
}

export function hasFormChanges(container, initialData) {
    if (!container || !initialData) return false;
    const inputs = container.querySelectorAll('ion-input, ion-select, input, select, textarea');
    for (const input of inputs) {
        const name = input.getAttribute('name');
        if (!name || !(name in initialData)) continue;
        let currentValue;
        if (input.tagName === 'ION-INPUT') {
            currentValue = input.value;
        } else if (input.tagName === 'ION-SELECT') {
            currentValue = input.value;
        } else {
            currentValue = input.value;
        }
        if (String(currentValue) !== String(initialData[name])) {
            return true;
        }
    }
    return false;
}

export function focusFirstElement(container) {
    if (!container) return;
    const selectors = 'ion-input, ion-button, a, button, input, select, textarea';
    const first = container.querySelector(selectors);
    if (first) {
        if (typeof first.setFocus === 'function') {
            first.setFocus();
        } else if (typeof first.focus === 'function') {
            first.focus();
        }
    }
}

export function perfMark(name) {
  if (typeof performance === 'undefined') return;
  const key = `quero-cafe:${name}`;
  performance.mark(key);
  return key;
}

export async function perfMeasureAsync(name, fn) {
  const start = perfMark(`${name}:start`);
  try {
    return await fn();
  } finally {
    const end = perfMark(`${name}:end`);
    if (start && end && typeof performance.measure === 'function') {
      performance.measure(`quero-cafe:${name}`, start, end);
      try {
        const env = await import('@environment');
        if (!env.environment?.production) {
          const entries = performance.getEntriesByName(`quero-cafe:${name}`);
          const dur = entries.length > 0 ? entries[entries.length - 1].duration : 0;
          if (dur > 16) {
            console.warn(`[Performance] ${name} levou ${dur.toFixed(1)}ms (limite: 16ms)`);
          }
        }
      } catch {}
    }
  }
}

const PAGE_SIZES = {
  produto: 10,
  usuario: 10,
  mesa: 8,
  comanda: 6,
  home: 8,
};

export function getPageSize(pageName) {
  return PAGE_SIZES[pageName] || 10;
}

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 52;
const CONTAINER_PADDING = 32;

export const PAGE_LAYOUT = {
  produto:  { itemHeight: 80 },
  usuario:  { itemHeight: 80 },
  mesa:     { itemHeight: 80 },
  comanda:  { itemHeight: 120 },
  home:     { itemHeight: 200 },
};

export function calculateResponsivePageSize(pageName) {
  const layout = PAGE_LAYOUT[pageName] || PAGE_LAYOUT.produto;
  const viewportHeight = window.innerHeight;
  const contentHeight = viewportHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
  const availableHeight = contentHeight - CONTAINER_PADDING;
  const count = Math.floor(availableHeight / layout.itemHeight);
  return Math.max(3, Math.min(count, 50));
}

export function createPaginationState(take) {
  return {
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    skip: 0,
    take: take || 10,
    next() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.skip = (this.currentPage - 1) * this.take;
      }
    },
    prev() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.skip = (this.currentPage - 1) * this.take;
      }
    },
    reset() {
      this.currentPage = 1;
      this.skip = 0;
    },
    update(totalRecords) {
      this.totalRecords = totalRecords;
      this.totalPages = Math.ceil(totalRecords / this.take) || 1;
    },
  };
}

export function renderPaginationBar(pagination) {
  const singlePage = pagination.totalPages <= 1;
  return `
    <div class="pagination-bar" style="
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 8px 16px; background: var(--ion-background-color);
      border-top: 1px solid var(--ion-border-color, #e0e0e0);
    ">
      ${singlePage ? '' : `
        <ion-button fill="clear" size="small" ${pagination.currentPage <= 1 ? 'disabled' : ''}
          data-action="prev-page" aria-label="Página anterior">
          <ion-icon slot="start" name="chevron-back-outline"></ion-icon>
          Anterior
        </ion-button>
        <span style="font-size: 14px; color: var(--ion-color-medium); min-width: 100px; text-align: center;">
          Página ${pagination.currentPage} de ${pagination.totalPages}
        </span>
        <ion-button fill="clear" size="small" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}
          data-action="next-page" aria-label="Próxima página">
          Próxima
          <ion-icon slot="end" name="chevron-forward-outline"></ion-icon>
        </ion-button>
      `}
      <span style="font-size: 13px; color: var(--ion-color-medium);">
        Total: ${pagination.totalRecords} registro(s)
      </span>
    </div>
  `;
}

export function createListSkeleton(count = 5) {
  return `
    <ion-list>
      ${Array.from({ length: count }, () => `
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

export function createCardSkeleton(count = 4) {
  return `
    <div class="comandas-grid">
      ${Array.from({ length: count }, () => `
        <ion-card>
          <ion-card-header>
            <ion-card-title><ion-skeleton-text animated style="width: 70%"></ion-skeleton-text></ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label>
                <h3><ion-skeleton-text animated style="width: 60%"></ion-skeleton-text></h3>
              </ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label>
                <h3><ion-skeleton-text animated style="width: 40%"></ion-skeleton-text></h3>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>
      `).join('')}
    </div>
  `;
}

export function logout() {
    import('../services/api.js').then(({ api }) => {
        api.logout().catch(() => {});
    });
    localStorage.removeItem('logged_in');
    localStorage.removeItem('user_perfil');
    clearLoggedUserCache();

    const existingMenu = document.querySelector('ion-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const router = document.querySelector('ion-router');
    if (router) {
        router.push('/login', 'root');
    } else {
        window.location.href = '#/login';
    }
}
