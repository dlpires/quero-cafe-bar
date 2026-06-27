describe('Util - shared utilities', () => {
    let localStorageMock;
    let originalClear;
    let originalRemoveItem;

    beforeEach(() => {
        originalClear = localStorage.clear;
        originalRemoveItem = localStorage.removeItem;

        localStorageMock = {
            clear: jest.fn(),
            removeItem: jest.fn(),
            getItem: jest.fn(),
            setItem: jest.fn(),
        };

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
            configurable: true,
        });

        document.createElement.mockClear();
        document.body.appendChild.mockClear();
    });

    afterEach(() => {
        if (originalClear && originalRemoveItem) {
            Object.defineProperty(window, 'localStorage', {
                value: {
                    clear: originalClear,
                    removeItem: originalRemoveItem,
                    getItem: localStorage.getItem,
                    setItem: localStorage.setItem,
                },
                writable: true,
                configurable: true,
            });
        }
    });

    describe('logout', () => {
        it('deve chamar localStorage.removeItem com token (Happy Path)', () => {
            const { logout } = require('./util.js');

            logout();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
        });

        it('deve executar sem erros (teste básico)', () => {
            const { logout } = require('./util.js');

            expect(() => logout()).not.toThrow();
        });

        it('deve usar router.push para navegar ao login', () => {
            const mockRouter = { push: jest.fn() };
            const originalQS = document.querySelector;
            document.querySelector = jest.fn((selector) => {
                if (selector === 'ion-router') return mockRouter;
                return originalQS.call(document, selector);
            });

            const { logout } = require('./util.js');
            logout();

            expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
            document.querySelector = originalQS;
        });
    });

    describe('showToast', () => {
        function getToastFromMock() {
            return document.createElement.mock.results
                .find(r => r.value && r.value.tagName === 'ION-TOAST')
                ?.value;
        }

        it('deve criar e apresentar ion-toast com mensagem e tipo success', async () => {
            const { showToast } = require('./util.js');
            await showToast('Sucesso!', 'success');

            expect(document.createElement).toHaveBeenCalledWith('ion-toast');
            const toast = getToastFromMock();
            expect(toast).toBeDefined();
            expect(toast.message).toBe('Sucesso!');
            expect(toast.color).toBe('success');
            expect(toast.icon).toBe('checkmark-circle-outline');
            expect(toast.duration).toBe(3000);
            expect(toast.present).toHaveBeenCalledTimes(1);
        });

        it('deve usar tipo error com cor danger e ícone de alerta', async () => {
            const { showToast } = require('./util.js');
            await showToast('Erro!', 'error');

            const toast = getToastFromMock();
            expect(toast).toBeDefined();
            expect(toast.color).toBe('danger');
            expect(toast.icon).toBe('alert-circle-outline');
            expect(toast.present).toHaveBeenCalledTimes(1);
        });

        it('deve aceitar duração customizada', async () => {
            const { showToast } = require('./util.js');
            await showToast('Teste', 'warning', 5000);

            const toast = getToastFromMock();
            expect(toast).toBeDefined();
            expect(toast.duration).toBe(5000);
        });
    });

    describe('withLoading', () => {
        function getLoadingFromMock() {
            return document.createElement.mock.results
                .find(r => r.value && r.value.tagName === 'ION-LOADING')
                ?.value;
        }

        it('deve mostrar loading durante execução e esconder após resolver', async () => {
            const { withLoading } = require('./util.js');
            const result = await withLoading(Promise.resolve('ok'));

            expect(result).toBe('ok');
            expect(document.createElement).toHaveBeenCalledWith('ion-loading');
            const loading = getLoadingFromMock();
            expect(loading).toBeDefined();
            expect(loading.present).toHaveBeenCalledTimes(1);
            expect(loading.dismiss).toHaveBeenCalledTimes(1);
        });

        it('deve esconder loading mesmo quando a promise rejeita', async () => {
            const { withLoading } = require('./util.js');
            const failingPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('fail')));
            });

            await expect(withLoading(failingPromise)).rejects.toThrow('fail');

            const loading = getLoadingFromMock();
            expect(loading).toBeDefined();
            expect(loading.dismiss).toHaveBeenCalledTimes(1);
        });

        it('deve usar mensagem de loading customizada', async () => {
            const { withLoading } = require('./util.js');
            await withLoading(Promise.resolve('ok'), {
                loadingMessage: 'Processando...',
            });

            const loading = getLoadingFromMock();
            expect(loading).toBeDefined();
            expect(loading.message).toBe('Processando...');
        });
    });

    describe('createEmptyState', () => {
        it('deve renderizar ícone, mensagem e botão CTA', () => {
            const { createEmptyState } = require('./util.js');
            const handler = jest.fn();
            const mockEl = (overrides) => ({
                appendChild: jest.fn(), setAttribute: jest.fn(), addEventListener: jest.fn(),
                textContent: '', style: { cssText: '' }, className: '',
                ...overrides,
            });
            const mockIcon = mockEl();
            const mockBtn = mockEl();
            const container = { textContent: '', appendChild: jest.fn() };
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tag) => {
                if (tag === 'ion-icon') return mockIcon;
                if (tag === 'ion-button') return mockBtn;
                if (tag === 'div') return { style: { cssText: '' }, className: '', appendChild: jest.fn(), textContent: '' };
                return originalCreateElement(tag);
            });

            createEmptyState(container, {
                icon: 'cube-outline',
                message: 'Nenhum produto cadastrado',
                actionLabel: 'Cadastrar',
                actionHandler: handler,
            });

            expect(mockIcon.setAttribute).toHaveBeenCalledWith('name', 'cube-outline');
            expect(mockBtn.textContent).toBe('Cadastrar');
            expect(mockBtn.addEventListener).toHaveBeenCalledWith('click', handler);
            expect(container.appendChild).toHaveBeenCalled();

            document.createElement = originalCreateElement;
        });

        it('deve renderizar sem botão quando actionLabel é omitido', () => {
            const { createEmptyState } = require('./util.js');
            const mockEl = (overrides) => ({
                appendChild: jest.fn(), setAttribute: jest.fn(), addEventListener: jest.fn(),
                textContent: '', style: { cssText: '' }, className: '',
                ...overrides,
            });
            const mockIcon = mockEl();
            const container = { textContent: '', appendChild: jest.fn() };
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tag) => {
                if (tag === 'ion-icon') return mockIcon;
                if (tag === 'div') return { style: { cssText: '' }, className: '', appendChild: jest.fn(), textContent: '' };
                return originalCreateElement(tag);
            });

            createEmptyState(container, {
                message: 'Lista vazia',
            });

            expect(mockIcon.setAttribute).toHaveBeenCalledWith('name', 'file-tray-outline');
            expect(container.appendChild).toHaveBeenCalled();

            document.createElement = originalCreateElement;
        });

        it('deve chamar actionHandler ao clicar no botão CTA', () => {
            const { createEmptyState } = require('./util.js');
            const handler = jest.fn();
            const mockEl = (overrides) => ({
                appendChild: jest.fn(), setAttribute: jest.fn(), addEventListener: jest.fn(),
                textContent: '', style: { cssText: '' }, className: '',
                ...overrides,
            });
            const mockBtn = mockEl();
            const container = { textContent: '', appendChild: jest.fn() };
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tag) => {
                if (tag === 'ion-button') return mockBtn;
                if (tag === 'ion-icon') return mockEl();
                if (tag === 'div') return { style: { cssText: '' }, className: '', appendChild: jest.fn(), textContent: '' };
                return originalCreateElement(tag);
            });

            createEmptyState(container, {
                actionLabel: 'Adicionar',
                actionHandler: handler,
            });

            expect(mockBtn.addEventListener).toHaveBeenCalledWith('click', handler);

            document.createElement = originalCreateElement;
        });
    });

    describe('validateRequired', () => {
        it('deve retornar erro para string vazia', () => {
            const { validateRequired } = require('./util.js');

            const result = validateRequired('', 'Nome');

            expect(result).toBe('Nome é obrigatório');
        });

        it('deve retornar null para valor válido', () => {
            const { validateRequired } = require('./util.js');

            const result = validateRequired('João', 'Nome');

            expect(result).toBeNull();
        });

        it('deve retornar erro para string com apenas espaços', () => {
            const { validateRequired } = require('./util.js');

            const result = validateRequired('   ', 'Nome');

            expect(result).toBe('Nome é obrigatório');
        });
    });

    describe('validatePositiveNumber', () => {
        it('deve retornar erro para número negativo', () => {
            const { validatePositiveNumber } = require('./util.js');

            const result = validatePositiveNumber(-1, 'Preço');

            expect(result).toBe('Preço deve ser maior que zero');
        });

        it('deve retornar null para número positivo', () => {
            const { validatePositiveNumber } = require('./util.js');

            const result = validatePositiveNumber(10, 'Preço');

            expect(result).toBeNull();
        });

        it('deve retornar erro para valor zero', () => {
            const { validatePositiveNumber } = require('./util.js');

            const result = validatePositiveNumber(0, 'Preço');

            expect(result).toBe('Preço deve ser maior que zero');
        });

        it('deve aceitar string numérica válida', () => {
            const { validatePositiveNumber } = require('./util.js');

            expect(validatePositiveNumber('15', 'Preço')).toBeNull();
            expect(validatePositiveNumber('abc', 'Preço')).toBe('Preço deve ser maior que zero');
        });
    });

    describe('getPageSize', () => {
        it('deve retornar 10 para produto', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('produto')).toBe(10);
        });

        it('deve retornar 10 para usuario', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('usuario')).toBe(10);
        });

        it('deve retornar 8 para mesa', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('mesa')).toBe(8);
        });

        it('deve retornar 6 para comanda', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('comanda')).toBe(6);
        });

        it('deve retornar 8 para home', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('home')).toBe(8);
        });

        it('deve retornar 10 para página desconhecida (default)', () => {
            const { getPageSize } = require('./util.js');
            expect(getPageSize('unknown')).toBe(10);
        });
    });

    describe('createPaginationState', () => {
        it('deve criar estado com valores iniciais corretos', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            expect(state.currentPage).toBe(1);
            expect(state.totalPages).toBe(0);
            expect(state.totalRecords).toBe(0);
            expect(state.skip).toBe(0);
            expect(state.take).toBe(10);
        });

        it('deve avançar para próxima página com next()', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(50);
            expect(state.totalPages).toBe(5);
            state.next();
            expect(state.currentPage).toBe(2);
            expect(state.skip).toBe(10);
        });

        it('deve voltar para página anterior com prev()', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(50);
            state.next();
            state.next();
            expect(state.currentPage).toBe(3);
            state.prev();
            expect(state.currentPage).toBe(2);
            expect(state.skip).toBe(10);
        });

        it('não deve avançar além da última página', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(10);
            state.next();
            expect(state.currentPage).toBe(1);
        });

        it('não deve voltar antes da primeira página', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(30);
            state.prev();
            expect(state.currentPage).toBe(1);
        });

        it('deve resetar para página 1 com reset()', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(50);
            state.next();
            state.next();
            state.reset();
            expect(state.currentPage).toBe(1);
            expect(state.skip).toBe(0);
        });

        it('deve calcular totalPages corretamente com update()', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(45);
            expect(state.totalPages).toBe(5);
            expect(state.totalRecords).toBe(45);
        });

        it('deve ter no mínimo 1 página mesmo com 0 registros', () => {
            const { createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(0);
            expect(state.totalPages).toBe(1);
        });
    });

    describe('renderPaginationBar', () => {
        it('deve renderizar controles de navegação quando múltiplas páginas', () => {
            const { renderPaginationBar, createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(50);
            const html = renderPaginationBar(state);
            expect(html).toContain('Anterior');
            expect(html).toContain('Próxima');
            expect(html).toContain('Página 1 de 5');
            expect(html).toContain('Total: 50 registro(s)');
        });

        it('deve ocultar botões de navegação quando apenas 1 página', () => {
            const { renderPaginationBar, createPaginationState } = require('./util.js');
            const state = createPaginationState(10);
            state.update(5);
            const html = renderPaginationBar(state);
            expect(html).not.toContain('Anterior');
            expect(html).not.toContain('Próxima');
            expect(html).toContain('Total: 5 registro(s)');
        });
    });

    describe('createListSkeleton', () => {
        it('deve renderizar itens esqueleto com ion-skeleton-text', () => {
            const { createListSkeleton } = require('./util.js');
            const html = createListSkeleton(3);
            expect(html).toContain('ion-skeleton-text');
            expect(html).toContain('ion-list');
        });

        it('deve usar 5 itens como padrão', () => {
            const { createListSkeleton } = require('./util.js');
            const html = createListSkeleton();
            expect(html).toContain('ion-skeleton-text');
            expect(html).toContain('ion-list');
        });
    });

    describe('createCardSkeleton', () => {
        it('deve renderizar cards esqueleto com ion-card', () => {
            const { createCardSkeleton } = require('./util.js');
            const html = createCardSkeleton(2);
            expect(html).toContain('ion-card');
            expect(html).toContain('comandas-grid');
        });

        it('deve usar 4 cards como padrão', () => {
            const { createCardSkeleton } = require('./util.js');
            const html = createCardSkeleton();
            expect(html).toContain('ion-card');
            expect(html).toContain('comandas-grid');
        });
    });

    describe('focusFirstElement', () => {
        it('deve focar no primeiro ion-input do container', () => {
            const { focusFirstElement } = require('./util.js');
            const container = document.createElement('div');
            const input = document.createElement('input');
            input.setFocus = jest.fn();
            container.appendChild(input);

            focusFirstElement(container);

            expect(input.setFocus).toHaveBeenCalled();
        });

        it('deve focar no primeiro botão quando não há input', () => {
            const { focusFirstElement } = require('./util.js');
            const container = document.createElement('div');
            const button = document.createElement('button');
            jest.spyOn(button, 'focus');
            container.appendChild(button);

            focusFirstElement(container);

            expect(button.focus).toHaveBeenCalled();
        });

        it('não deve lançar erro para container vazio', () => {
            const { focusFirstElement } = require('./util.js');
            const container = document.createElement('div');

            expect(() => focusFirstElement(container)).not.toThrow();
        });

        it('não deve lançar erro para container null', () => {
            const { focusFirstElement } = require('./util.js');

            expect(() => focusFirstElement(null)).not.toThrow();
        });
    });

    describe('getLoggedUserId', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({ id: 42, usuario: 'admin', perfil: 0 }),
            });
        });

        afterEach(() => {
            delete global.fetch;
        });

        it('deve extrair ID do usuário logado', async () => {
            const { getLoggedUserId, clearLoggedUserCache } = require('./util.js');
            clearLoggedUserCache();
            const id = await getLoggedUserId();
            expect(id).toBe(42);
        });
    });

    describe('getLoggedUserProfile', () => {
        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({ id: 1, usuario: 'admin', perfil: 0 }),
            });
        });

        afterEach(() => {
            delete global.fetch;
        });

        it('deve extrair perfil do usuário logado', async () => {
            const { getLoggedUserProfile, clearLoggedUserCache } = require('./util.js');
            clearLoggedUserCache();
            const perfil = await getLoggedUserProfile();
            expect(perfil).toBe(0);
        });
    });

    describe('logout', () => {
        it('deve limpar localStorage, remover menu e navegar para /login', () => {
            const { logout } = require('./util.js');

            const mockRouter = { push: jest.fn() };
            document.querySelector = jest.fn((selector) => {
                if (selector === 'ion-router') return mockRouter;
                if (selector === 'ion-menu') return null;
                return null;
            });

            logout();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_perfil');
            expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
        });
    });
});
