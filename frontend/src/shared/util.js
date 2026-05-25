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
    await toast.onWillDismiss();
    toast.remove();
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
        loading.remove();
    }
}

export function createEmptyState(container, options) {
    const icon = options.icon || 'file-tray-outline';
    const message = options.message || 'Nenhum registro encontrado';

    container.innerHTML = `
        <div class="empty-state" style="
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 48px 16px; text-align: center;
        ">
            <ion-icon name="${icon}" style="
                font-size: 64px; color: var(--ion-color-medium); margin-bottom: 16px;
            "></ion-icon>
            <p style="
                font-size: 16px; color: var(--ion-color-medium);
                margin: 0 0 16px 0; max-width: 280px;
            ">${message}</p>
            ${options.actionLabel && options.actionHandler ? `
                <ion-button fill="solid" color="primary">
                    ${options.actionLabel}
                </ion-button>
            ` : ''}
        </div>
    `;

    if (options.actionLabel && options.actionHandler) {
        const button = container.querySelector('ion-button');
        if (button) {
            button.addEventListener('click', options.actionHandler);
        }
    }
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

export function getLoggedUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || null;
    } catch {
        return null;
    }
}

export function getLoggedUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.perfil ?? null;
    } catch {
        return null;
    }
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

export function logout() {
    localStorage.removeItem('token');

    const router = document.querySelector('ion-router');
    if (router) {
        router.push('/login', 'root');
    } else {
        window.location.href = '#/login';
    }
}
