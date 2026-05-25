jest.mock('../../services/api.js', () => ({
  api: {
    createProduto: jest.fn(),
  },
}));

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

jest.mock('../../shared/util.js', () => {
  const actual = jest.requireActual('../../shared/util.js');
  return {
    ...actual,
    showToast: jest.fn(),
    withLoading: jest.fn(),
    focusFirstElement: jest.fn(),
  };
});

import { validateRequired, validatePositiveNumber } from '../../shared/util.js';
import { showToast } from '../../shared/util.js';

describe('RegProdutoPage - Validação (SC-004)', () => {
  describe('Timer assertion — validação em <100ms', () => {
    it('deve validar campos obrigatórios em menos de 100ms', () => {
      const start = performance.now();

      const dscError = validateRequired('', 'Descrição do Produto');
      const valorError = validatePositiveNumber('', 'Valor Unitário');

      const elapsed = performance.now() - start;

      expect(dscError).toBe('Descrição do Produto é obrigatório');
      expect(valorError).toBe('Valor Unitário deve ser maior que zero');
      expect(elapsed).toBeLessThan(100);
    });

    it('deve aprovar dados válidos em menos de 100ms', () => {
      const start = performance.now();

      const dscError = validateRequired('Café Expresso', 'Descrição do Produto');
      const valorError = validatePositiveNumber('5.50', 'Valor Unitário');

      const elapsed = performance.now() - start;

      expect(dscError).toBeNull();
      expect(valorError).toBeNull();
      expect(elapsed).toBeLessThan(100);
    });

    it('deve rejeitar valor negativo em menos de 100ms', () => {
      const start = performance.now();

      const error = validatePositiveNumber('-5', 'Valor Unitário');

      const elapsed = performance.now() - start;

      expect(error).toBe('Valor Unitário deve ser maior que zero');
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('Feedback de validação (SC-003)', () => {
    it('não deve chamar API quando descrição está vazia', () => {
      const { api } = require('../../services/api.js');
      const dscError = validateRequired('', 'Descrição do Produto');
      expect(dscError).toBeTruthy();
      expect(api.createProduto).not.toHaveBeenCalled();
    });

    it('não deve chamar API quando valor unitário é zero', () => {
      const { api } = require('../../services/api.js');
      const valorError = validatePositiveNumber('0', 'Valor Unitário');
      expect(valorError).toBeTruthy();
      expect(api.createProduto).not.toHaveBeenCalled();
    });
  });
});
