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
});
