const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import {
  isAuthenticated,
  requireAuth,
  redirectToLogin,
  redirectToHome,
  setupSessionSync,
} from './auth.js';

describe('Auth Service', () => {
  let mockRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    mockRouter = { push: jest.fn() };
    document.querySelector = jest.fn((selector) => {
      if (selector === 'ion-router') return mockRouter;
      return null;
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando logged_in existe (Happy Path)', () => {
      localStorageMock.getItem.mockReturnValue('true');
      expect(isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando logged_in não existe (Edge Case)', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);
    });

    it('deve retornar false quando logged_in é string vazia (Edge Case)', () => {
      localStorageMock.getItem.mockReturnValue('');
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('deve retornar true quando autenticado (Happy Path)', () => {
      localStorageMock.getItem.mockReturnValue('token-valido');
      expect(requireAuth()).toBe(true);
    });

    it('deve chamar redirectToLogin e retornar false quando não autenticado (Edge Case)', () => {
      const redirectSpy = jest.spyOn(
        { redirectToLogin },
        'redirectToLogin'
      );
      localStorageMock.getItem.mockReturnValue(null);
      const result = requireAuth();
      expect(result).toBe(false);
    });
  });

  describe('redirectToLogin', () => {
    it('deve remover token e navegar para /login (Happy Path)', () => {
      localStorageMock.getItem.mockReturnValue('token');
      redirectToLogin();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
      expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
    });

    it('deve lidar com router ausente (Edge Case)', () => {
      document.querySelector = jest.fn(() => null);
      redirectToLogin();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
    });
  });

  describe('redirectToHome', () => {
    it('deve navegar para /home (Happy Path)', () => {
      redirectToHome();
      expect(mockRouter.push).toHaveBeenCalledWith('/home', 'root');
    });

    it('deve lidar com router ausente (Edge Case)', () => {
      document.querySelector = jest.fn(() => null);
      redirectToHome();
    });
  });

  describe('setupSessionSync', () => {
    it('deve adicionar event listener para storage (Happy Path)', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      setupSessionSync();
      expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    it('deve chamar redirectToLogin quando logged_in é removido em outra aba (Happy Path)', () => {
      setupSessionSync();
      const storageHandler = window.addEventListener.mock.calls.find(
        (call) => call[0] === 'storage'
      )[1];

      const mockEvent = { key: 'logged_in', newValue: null, oldValue: 'true' };
      const redirectSpy = jest.spyOn(
        { redirectToLogin },
        'redirectToLogin'
      );
      storageHandler(mockEvent);
    });

    it('deve ignorar eventos de outras chaves (Edge Case)', () => {
      setupSessionSync();
      const storageHandler = window.addEventListener.mock.calls.find(
        (call) => call[0] === 'storage'
      )[1];

      const mockEvent = { key: 'other-key', newValue: 'valor' };
      storageHandler(mockEvent);
    });
  });
});
