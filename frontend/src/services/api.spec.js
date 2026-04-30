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
    api.token = null;
  });

  describe('Constructor e Token', () => {
    it('deve inicializar com apiUrl do environment', () => {
      expect(api.apiUrl).toBe('http://localhost:3001');
    });

    it('deve carregar token do localStorage no constructor', () => {
      localStorageMock.getItem.mockReturnValue('token-salvo');

      jest.resetModules();
      const { api: newApi } = require('./api.js');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });
  });

  describe('setToken', () => {
    it('deve definir token e salvar no localStorage quando token fornecido (Happy Path)', () => {
      api.setToken('novo-token');
      
      expect(api.token).toBe('novo-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'novo-token');
    });

    it('deve remover token do localStorage quando token for null (Edge Case)', () => {
      api.setToken(null);
      
      expect(api.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('deve remover token do localStorage quando token for undefined (Edge Case)', () => {
      api.setToken(undefined);
      
      expect(api.token).toBeUndefined();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
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
      });
      expect(result).toEqual({ id: 1, nome: 'Teste' });
    });

    it('deve incluir token no header quando autenticado (Happy Path)', async () => {
      api.setToken('token-jwt');
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.request('/usuario');

      expect(fetch).toHaveBeenCalledWith(expect.any(String), {
        method: undefined,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': 'Bearer token-jwt',
        },
      });
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

      await expect(api.request('/produto')).rejects.toThrow('Erro na requisição');
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
      });
      expect(result).toEqual({ token: 'jwt-token', user: { id: 1 } });
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
        'http://localhost:3001/produto',
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
        'http://localhost:3001/usuario',
        expect.any(Object)
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
        'http://localhost:3001/mesa',
        expect.any(Object)
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
        'http://localhost:3001/comanda',
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
  });
});
