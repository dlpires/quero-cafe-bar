/**
 * Setup global para testes do frontend
 * Versão simplificada para evitar erros de redefinição
 */

// Mock do fetch global
global.fetch = jest.fn();

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock básico para customElements se não existir
if (!window.customElements) {
  window.customElements = {
    define: jest.fn(),
    get: jest.fn(),
    whenDefined: jest.fn().mockResolvedValue(undefined),
  };
}
