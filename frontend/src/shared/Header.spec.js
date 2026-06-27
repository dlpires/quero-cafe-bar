describe('Header', () => {
  let createHeader;
  let originalQS;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    createHeader = require('./Header.js').createHeader;
    originalQS = document.querySelector;
  });

  afterEach(() => {
    document.querySelector = originalQS;
  });

  describe('createHeader', () => {
    it('deve retornar HTML com botão de menu para página não-Login', () => {
      const html = createHeader('Home');
      expect(html).toContain('ion-menu-button');
      expect(html).toContain('ion-buttons slot="start"');
      expect(html).toContain('Quero Café Bar - Home');
    });

    it('deve retornar HTML sem botão de menu para Login', () => {
      const html = createHeader('Login');
      expect(html).not.toContain('ion-menu-button');
      expect(html).toContain('Quero Café Bar - Login');
    });

    it('deve incluir botão de logout para página não-Login', () => {
      const html = createHeader('Produtos');
      expect(html).toContain('logout-btn');
      expect(html).toContain('log-out-outline');
    });

    it('não deve incluir botão de logout na página de Login', () => {
      const html = createHeader('Login');
      expect(html).not.toContain('logout-btn');
    });

    it('deve incluir ícone cafe na página de Login', () => {
      const html = createHeader('Login');
      expect(html).toContain('name="cafe"');
    });
  });

  describe('createAndInjectMenu', () => {
    it('não deve adicionar menu se não encontrar ion-nav', () => {
      console.error = jest.fn();

      createHeader('Home');

      expect(console.error).toHaveBeenCalledWith(
        '[Header.js] Elemento <ion-nav> não encontrado. O menu lateral não pode ser inicializado.',
      );
    });

    it('deve injetar menu quando ion-nav está presente (T042)', () => {
      const mockNav = document.createElement('div');
      const prependFn = jest.fn();
      document.body.prepend = prependFn;
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-nav') return mockNav;
        if (selector === 'ion-menu') return null;
        return null;
      });

      createHeader('Home');

      expect(prependFn).toHaveBeenCalled();
    });

    it('não deve criar menu duplicado em múltiplas chamadas (T043)', () => {
      let menuCreated = false;
      const mockNav = document.createElement('div');
      const prependFn = jest.fn(() => { menuCreated = true; });
      document.body.prepend = prependFn;
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-nav') return mockNav;
        if (selector === 'ion-menu') return menuCreated ? {} : null;
        return null;
      });

      createHeader('Home');
      createHeader('Produtos');

      expect(prependFn).toHaveBeenCalledTimes(1);
    });

    it('deve usar DOM API (createElement) para renderizar itens do menu (T049)', () => {
      const mockNav = document.createElement('div');
      document.body.prepend = jest.fn();
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-nav') return mockNav;
        if (selector === 'ion-menu') return null;
        return null;
      });
      const originalCreateElement = document.createElement;
      const tags = [];
      document.createElement = jest.fn((tag) => {
        tags.push(tag);
        return originalCreateElement(tag);
      });

      createHeader('Home');

      expect(tags).toContain('ion-menu');
      expect(tags).toContain('ion-header');
      expect(tags).toContain('ion-list');
      expect(tags).toContain('ion-item');
      expect(tags).toContain('ion-label');
      expect(tags).toContain('ion-icon');

      document.createElement = originalCreateElement;
    });
  });

  describe('Filtragem de Menu por Perfil', () => {
    function setupMenuTest(perfilValue) {
      const mockNav = document.createElement('div');
      const prependFn = jest.fn();
      document.body.prepend = prependFn;
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-nav') return mockNav;
        if (selector === 'ion-menu') return null;
        return null;
      });

      if (perfilValue !== null) {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
          if (key === 'user_perfil') return perfilValue;
          return null;
        });
      }

      createHeader('Home');

      if (perfilValue !== null) {
        jest.restoreAllMocks();
      }

      return { prependFn };
    }

    it('deve chamar prepend para admin (perfil=0) (T046)', () => {
      const { prependFn } = setupMenuTest('0');
      expect(prependFn).toHaveBeenCalled();
    });

    it('deve chamar prepend para garçom (perfil=1) (T047)', () => {
      const { prependFn } = setupMenuTest('1');
      expect(prependFn).toHaveBeenCalled();
    });

    it('deve chamar prepend quando perfil é undefined (fallback) (T048)', () => {
      const { prependFn } = setupMenuTest(null);
      expect(prependFn).toHaveBeenCalled();
    });
  });
});
