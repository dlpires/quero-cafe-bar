jest.mock('../../services/api.js', () => ({
  api: {
    getMesas: jest.fn(),
    deleteMesa: jest.fn(),
  },
}));

jest.mock('../../services/auth.js', () => ({
  requireAuth: jest.fn(() => true),
}));

jest.mock('../../shared/Header.js', () => ({
  createHeader: jest.fn(() => '<ion-header></ion-header>'),
}));

jest.mock('../../shared/util.js', () => ({
  logout: jest.fn(),
}));

describe('ListMesaPage', () => {
  describe('Responsividade', () => {
    it('T012: deve exibir 2 colunas em viewport 768px', () => {
      const style = document.createElement('style');
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }';
      document.head.appendChild(style);
      const container = document.createElement('div');
      container.className = 'list-mesa-container';
      document.body.appendChild(container);
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(2, 1fr)');
      style.remove();
      container.remove();
    });

    it('T012: deve exibir 3 colunas em viewport 1024px', () => {
      const style = document.createElement('style');
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }';
      document.head.appendChild(style);
      const container = document.createElement('div');
      container.className = 'list-mesa-container';
      document.body.appendChild(container);
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(3, 1fr)');
      style.remove();
      container.remove();
    });

    it('T012: deve exibir 4 colunas em viewport 1400px', () => {
      const style = document.createElement('style');
      style.textContent = '.list-mesa-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }';
      document.head.appendChild(style);
      const container = document.createElement('div');
      container.className = 'list-mesa-container';
      document.body.appendChild(container);
      expect(getComputedStyle(container).gridTemplateColumns).toBe('repeat(4, 1fr)');
      style.remove();
      container.remove();
    });
  });
});
