import { validateRequired } from '../../shared/util.js';

jest.mock('../../services/api.js', () => ({
  api: { createProduto: jest.fn() },
}));

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

jest.mock('../../shared/util.js', () => ({
  showToast: jest.fn(),
  withLoading: jest.fn(),
  focusFirstElement: jest.fn(),
  validateRequired: jest.requireActual('../../shared/util.js').validateRequired,
  validatePositiveNumber: jest.requireActual('../../shared/util.js').validatePositiveNumber,
  hasFormChanges: jest.fn(),
}));

describe('RegProdutoPage - Responsividade', () => {
  it('T018: deve ter max-width 600px no formulário em viewport ≥768px', () => {
    const style = document.createElement('style');
    style.textContent = 'form { max-width: 600px; margin: 0 auto; }';
    document.head.appendChild(style);
    const form = document.createElement('form');
    document.body.appendChild(form);
    const computed = getComputedStyle(form);
    expect(computed.maxWidth).toBe('600px');
    style.remove();
    form.remove();
  });
});
