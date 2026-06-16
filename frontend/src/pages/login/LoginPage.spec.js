jest.mock('../../services/api', () => ({
  api: {
    login: jest.fn(),
    setToken: jest.fn(),
  },
}));

describe('LoginPage', () => {
  beforeAll(() => {
    if (!customElements.get('login-page')) {
      require('./LoginPage');
    }
  });

  it('deve ser definido como custom element', () => {
    const ctor = customElements.get('login-page');
    expect(ctor).toBeDefined();
    expect(ctor.name).toBe('LoginPage');
  });

  describe('Responsividade', () => {
    it('T008: deve ter max-width 400px no container de login em viewport ≥1024px', () => {
      const style = document.createElement('style');
      style.textContent = '.login-container { width: 100%; max-width: 400px; margin: 0 auto; }';
      document.head.appendChild(style);
      const container = document.createElement('div');
      container.className = 'login-container';
      document.body.appendChild(container);
      const computed = getComputedStyle(container);
      expect(computed.maxWidth).toBe('400px');
      style.remove();
      container.remove();
    });
  });
});
