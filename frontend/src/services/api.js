import { environment } from '../environments/environment.js';
/**
 * Classe para centralizar e gerenciar as chamadas à API do backend.
 */
class Api {
    constructor() {
        this.apiUrl = environment.apiUrl;
        this.token = localStorage.getItem('token');
    }

    /**
     * Define o token de autenticação para as requisições subsequentes.
     * @param {string} token - O token JWT recebido do backend.
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    /**
     * Realiza uma requisição genérica para a API.
     * @param {string} endpoint - O endpoint da API (ex: '/produtos').
     * @param {RequestInit} options - As opções da requisição (method, body, etc.).
     * @returns {Promise<any>} - A resposta da API em formato JSON.
     */
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Adiciona o token de autorização se ele existir
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Tenta extrair uma mensagem de erro do corpo da resposta
            const errorData = await response.json().catch(() => ({ message: 'Erro na requisição' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Retorna null para respostas sem conteúdo (ex: 204 No Content)
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    // --- Métodos de Autenticação ---

    /**
     * Autentica um usuário e armazena o token.
     * @param {string} username - Nome de usuário.
     * @param {string} password - Senha.
     */
    async login(username, password) {
        // O endpoint de login pode variar (ex: '/auth/login')
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    // --- Métodos de Produtos (Exemplo) ---
    async getProdutos() {
        return this.request('/produto');
    }
}

// Exporta uma instância única (Singleton) da classe Api para ser usada em toda a aplicação.
export const api = new Api();
