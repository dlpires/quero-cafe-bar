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

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        });

        it('deve executar sem erros (teste básico)', () => {
            const { logout } = require('./util.js');

            expect(() => logout()).not.toThrow();
        });

        it('deve usar rota sem hash quando useHash é false', () => {
            const mockRouter = { useHash: false };
            const originalQS = document.querySelector;
            document.querySelector = jest.fn((selector) => {
                if (selector === 'ion-router') return mockRouter;
                return originalQS.call(document, selector);
            });
            delete window.location;
            window.location = { href: 'http://localhost' };

            const { logout } = require('./util.js');
            logout();

            expect(window.location.href).toContain('/login');
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
            const container = document.createElement('div');
            const handler = jest.fn();

            createEmptyState(container, {
                icon: 'cube-outline',
                message: 'Nenhum produto cadastrado',
                actionLabel: 'Cadastrar',
                actionHandler: handler,
            });

            expect(container.innerHTML).toContain('cube-outline');
            expect(container.innerHTML).toContain('Nenhum produto cadastrado');
            expect(container.innerHTML).toContain('Cadastrar');
        });

        it('deve renderizar sem botão quando actionLabel é omitido', () => {
            const { createEmptyState } = require('./util.js');
            const container = document.createElement('div');

            createEmptyState(container, {
                message: 'Lista vazia',
            });

            expect(container.innerHTML).toContain('Lista vazia');
            expect(container.innerHTML).not.toContain('ion-button');
        });

        it('deve chamar actionHandler ao clicar no botão CTA', () => {
            const { createEmptyState } = require('./util.js');
            const container = document.createElement('div');
            const handler = jest.fn();

            createEmptyState(container, {
                actionLabel: 'Adicionar',
                actionHandler: handler,
            });

            const button = container.querySelector('ion-button');
            expect(button).not.toBeNull();
            button.click();
            expect(handler).toHaveBeenCalled();
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
});
