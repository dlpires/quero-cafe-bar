/**
 * Testes para função logout (util.js)
 * Versão simplificada que não tenta redefinir window.location
 */

describe('Util - logout (simplificado)', () => {
  let localStorageMock;
  let originalClear;

  beforeEach(() => {
    originalClear = localStorage.clear;

    localStorageMock = {
      clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalClear) {
      Object.defineProperty(window, 'localStorage', {
        value: {
          clear: originalClear,
          getItem: localStorage.getItem,
          setItem: localStorage.setItem,
          removeItem: localStorage.removeItem,
        },
        writable: true,
        configurable: true,
      });
    }
  });

  it('deve chamar localStorage.clear (Happy Path)', () => {
    const { logout } = require('./util.js');

    logout();

    expect(localStorageMock.clear).toHaveBeenCalled();
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
  });
});
