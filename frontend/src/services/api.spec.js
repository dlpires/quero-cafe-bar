/**
 * Testes para o serviço de API (api.js)
 * 
 * Este arquivo testa a classe Api que gerencia todas as chamadas para o backend.
 * Utiliza mocks do fetch e localStorage para testar isoladamente.
 */

// Mock do environment
jest.mock('@environment', () => ({
  environment: {
    apiUrl: 'http://localhost:3001',
    production: false,
  },
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do fetch
global.fetch = jest.fn();

// Importa a classe após os mocks
import { api } from './api.js';

describe('Api Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    describe('Constructor', () => {
        it('deve inicializar com apiUrl do environment', () => {
            expect(api.apiUrl).toBe('http://localhost:3001');
        });

        it('não deve ler localStorage no constructor', () => {
            jest.resetModules();
            require('./api.js');
            expect(localStorageMock.getItem).not.toHaveBeenCalled();
        });
    });

  describe('request', () => {
    it('deve fazer requisição GET com sucesso (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ id: 1, nome: 'Teste' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.request('/produto');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/produto', {
        method: undefined,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        signal: expect.any(AbortSignal),
      });
      expect(result).toEqual({ id: 1, nome: 'Teste' });
    });

    it('deve fazer requisição POST com body (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      const data = { nome: 'Produto Teste', preco: 10.00 };
      await api.request('/produto', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/produto', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        signal: expect.any(AbortSignal),
      });
    });

    it('deve lançar erro quando resposta não é ok (Edge Case)', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Dados inválidos' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.request('/produto')).rejects.toThrow('Dados inválidos');
    });

    it('deve lançar erro genérico quando resposta não tem json (Edge Case)', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.request('/produto')).rejects.toThrow('Erro interno. Tente novamente em alguns instantes.');
    });

    it('deve retornar null para status 204 No Content (Edge Case)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.request('/produto/1', { method: 'DELETE' });

      expect(result).toBeNull();
    });

    it('deve mesclar headers customizados (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.request('/test', {
        headers: { 'Custom-Header': 'value' },
      });

      expect(fetch).toHaveBeenCalledWith(expect.any(String), {
        method: undefined,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Custom-Header': 'value',
        },
        credentials: 'include',
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('Métodos de Autenticação', () => {
    it('deve chamar login com credenciais corretas (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ token: 'jwt-token', user: { id: 1 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.login('admin', 'senha123');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/usuario/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'senha123' }),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        signal: expect.any(AbortSignal),
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('logged_in', 'true');
      expect(result).toEqual({ token: 'jwt-token', user: { id: 1 } });
    });

    it('deve lançar erro específico para status 401 (Edge Case)', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Usuário ou senha inválidos' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.login('admin', 'senha_errada')).rejects.toThrow(
        'Usuário ou senha inválidos.',
      );
    });

    it('deve lançar erro quando resposta não tem token (Edge Case)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.login('admin', 'senha123')).rejects.toThrow(
        'Resposta inválida do servidor. Token não recebido.',
      );
    });
  });

  describe('request - Error Handling', () => {
    it('deve limpar localStorage e redirecionar para login em 401', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({}),
      };
      const mockRouter = { push: jest.fn() };
      const originalQS = document.querySelector;
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-router') return mockRouter;
        return originalQS.call(document, selector);
      });
      fetch.mockResolvedValue(mockResponse);

      await expect(api.request('/produto')).rejects.toThrow(
        'Sessão expirada. Faça login novamente.',
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
      expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
      document.querySelector = originalQS;
    });

    it('deve lançar erro de timeout quando requisição é abortada (AbortError)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValue(abortError);

      await expect(api.request('/produto')).rejects.toThrow(
        'A requisição excedeu o tempo limite. Verifique sua conexão.',
      );
    });
  });

  describe('Métodos de Produtos', () => {
    it('deve buscar todos os produtos (getProdutos)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1, nome: 'Café' }]),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getProdutos();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/produto?skip=0&take=20',
        expect.any(Object)
      );
    });

    it('deve adicionar produto (addProduto)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.addProduto({ nome: 'Café', preco: 5.00 });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/produto',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('deve buscar produto por ID (getProdutoById)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getProdutoById(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/produto/1',
        expect.any(Object)
      );
    });

    it('deve atualizar produto (updateProduto)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.updateProduto(1, { nome: 'Café Atualizado' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/produto/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('deve deletar produto (deleteProduto)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      await api.deleteProduto(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/produto/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Métodos de Usuários', () => {
    it('deve buscar todos os usuários', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1, nome: 'Admin' }]),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getUsuarios();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario?skip=0&take=20',
        expect.any(Object)
      );
    });

    it('deve adicionar usuário (addUsuario)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.addUsuario({ nome: 'Novo', usuario: 'novo', senha: '123', perfil: 1 });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('deve buscar usuário por ID (getUsuarioById)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getUsuarioById(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/1',
        expect.any(Object)
      );
    });

    it('deve atualizar usuário (updateUsuario)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.updateUsuario(1, { nome: 'Atualizado' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('deve deletar usuário (deleteUsuario)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      await api.deleteUsuario(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Métodos de Mesas', () => {
    it('deve buscar todas as mesas', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1, status: true }]),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getMesas();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/mesa?skip=0&take=20',
        expect.any(Object)
      );
    });

    it('deve adicionar mesa (addMesa)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.addMesa({ numero: 5 });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/mesa',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('deve buscar mesa por ID (getMesaById)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getMesaById(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/mesa/1',
        expect.any(Object)
      );
    });

    it('deve atualizar mesa (updateMesa)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.updateMesa(1, { status: false });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/mesa/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('deve deletar mesa (deleteMesa)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      await api.deleteMesa(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/mesa/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Métodos de Comandas', () => {
    it('deve buscar todas as comandas', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1, mesa: { id: 1 } }]),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getComandas();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda?skip=0&take=20',
        expect.any(Object)
      );
    });

    it('deve buscar comanda por ID de mesa', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getComandaByMesaId(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda/mesa/1',
        expect.any(Object)
      );
    });

    it('deve adicionar comanda (addComanda)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.addComanda({ id_mesa: 1, obs_comanda: 'teste' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('deve buscar comanda por ID (getComandaById)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getComandaById(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda/1',
        expect.any(Object)
      );
    });

    it('deve atualizar comanda (updateComanda)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.updateComanda(1, { obs_comanda: 'atualizado' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('deve deletar comanda (deleteComanda)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      await api.deleteComanda(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Métodos de Itens de Comanda', () => {
    it('deve buscar itens da comanda', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1, produto: {} }]),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.getItensComanda(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda-item/1',
        expect.any(Object)
      );
    });

    it('deve atualizar status de entrega do item', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.updateItemComanda(1, 2, { statusEntrega: true });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda-item/1/2',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('deve adicionar item na comanda (addItemComanda)', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.addItemComanda({ id_comanda: 1, id_produto: 1, qtd: 2 });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda-item',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('deve deletar item da comanda (deleteItemComanda)', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };
      fetch.mockResolvedValue(mockResponse);

      await api.deleteItemComanda(1, 2);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/comanda-item/1/2',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Login - Error Handling', () => {
    it('deve lançar erro de timeout quando login é abortado (AbortError)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValue(abortError);

      await expect(api.login('admin', 'senha123')).rejects.toThrow(
        'A requisição excedeu o tempo limite. Verifique sua conexão.',
      );
    });

    it('deve lançar erro genérico do servidor para status 500 com mensagem no login', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Erro interno do servidor' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.login('admin', 'senha123')).rejects.toThrow(
        'Erro interno do servidor',
      );
    });

    it('deve lançar fallback "Erro no servidor (status)" quando login falha e json não retorna message', async () => {
      const mockResponse = {
        ok: false,
        status: 502,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.login('admin', 'senha123')).rejects.toThrow(
        'Erro no servidor (502)',
      );
    });

    it('deve lançar fallback "Erro no servidor (status)" quando login falha e json lança exceção', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.login('admin', 'senha123')).rejects.toThrow(
        'Erro no servidor (503)',
      );
    });
  });

  describe('getMe', () => {
    it('deve retornar dados do usuário autenticado (Happy Path)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ id: 1, usuario: 'admin', perfil: 0 }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.getMe();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/me',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      );
      expect(result).toEqual({ id: 1, usuario: 'admin', perfil: 0 });
    });

    it('deve lançar erro de sessão expirada quando retorna 401', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Não autorizado' }),
      };
      const mockRouter = { push: jest.fn() };
      const originalQS = document.querySelector;
      document.querySelector = jest.fn((selector) => {
        if (selector === 'ion-router') return mockRouter;
        return originalQS.call(document, selector);
      });
      fetch.mockResolvedValue(mockResponse);

      await expect(api.getMe()).rejects.toThrow(
        'Sessão expirada. Faça login novamente.',
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('logged_in');
      expect(mockRouter.push).toHaveBeenCalledWith('/login', 'root');
      document.querySelector = originalQS;
    });
  });

  describe('logout', () => {
    it('deve chamar rota de logout e retornar confirmação', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Logout realizado com sucesso' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.logout();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/usuario/logout',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });
});
