/**
 * Testes para o Header (Header.js)
 * Testa a função createHeader e o menu lateral.
 */

describe('Header', () => {
  let createHeader;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    createHeader = require('./Header.js').createHeader;
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
    it('não deve criar menu duplicado se já existe ion-menu no DOM', () => {
      const existingMenu = document.createElement('ion-menu');
      document.body.appendChild(existingMenu);
      const appendChildSpy = jest.spyOn(document.body, 'prepend');

      createHeader('Home');

      expect(appendChildSpy).not.toHaveBeenCalled();
      appendChildSpy.mockRestore();
    });

    it('deve abortar se não encontrar ion-nav', () => {
      console.error = jest.fn();

      createHeader('Home');

      expect(console.error).toHaveBeenCalledWith(
        '[Header.js] Elemento <ion-nav> não encontrado. O menu lateral não pode ser inicializado.',
      );
    });
  });
});
