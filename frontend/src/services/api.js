import { environment } from '@environment';
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
            'ngrok-skip-browser-warning': 'true',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '#/login';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro na requisição' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('A requisição excedeu o tempo limite. Verifique sua conexão.');
            }
            throw error;
        }
    }

    // --- Métodos de Autenticação ---

    /**
     * Autentica um usuário e armazena o token.
     * @param {string} username - Nome de usuário.
     * @param {string} password - Senha.
     */
    async login(username, password) {
        const headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${this.apiUrl}/usuario/login`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ username, password }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                throw new Error('Usuário ou senha inválidos.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        `Erro no servidor (${response.status})`,
                );
            }

            const data = await response.json();

            if (!data || !data.token) {
                throw new Error(
                    'Resposta inválida do servidor. Token não recebido.',
                );
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('A requisição excedeu o tempo limite. Verifique sua conexão.');
            }
            throw error;
        }
    }

    // --- Métodos de Produtos ---
    async getProdutos() {
        return this.request('/produto');
    }

    async addProduto(produtoData) {
        return this.request('/produto', {
            method: 'POST',
            body: JSON.stringify(produtoData),
        });
    }

    async getProdutoById(id) {
        return this.request(`/produto/${id}`);
    }

    async updateProduto(id, produtoData) {
        return this.request(`/produto/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(produtoData),
        });
    }

    async deleteProduto(id) {
        return this.request(`/produto/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Métodos de Usuarios ---

    async getUsuarios() {
        return this.request('/usuario');
    }

    async addUsuario(usuarioData) {
        return this.request('/usuario', {
            method: 'POST',
            body: JSON.stringify(usuarioData),
        });
    }

    async getUsuarioById(id) {
        return this.request(`/usuario/${id}`);
    }

    async updateUsuario(id, usuarioData) {
        return this.request(`/usuario/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(usuarioData),
        });
    }

    async deleteUsuario(id) {
        return this.request(`/usuario/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Métodos de Mesas ---
    async getMesas() {
        return this.request('/mesa');
    }

    async addMesa(mesaData) {
        return this.request('/mesa', {
            method: 'POST',
            body: JSON.stringify(mesaData),
        });
    }

    async getMesaById(id) {
        return this.request(`/mesa/${id}`);
    }

    async updateMesa(id, mesaData) {
        return this.request(`/mesa/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(mesaData),
        });
    }

    async deleteMesa(id) {
        return this.request(`/mesa/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Métodos de Comandas ---
    async getComandas() {
        return this.request('/comanda');
    }

    async addComanda(comandaData) {
        return this.request('/comanda', {
            method: 'POST',
            body: JSON.stringify(comandaData),
        });
    }

    async getComandaById(id) {
        return this.request(`/comanda/${id}`);
    }

    async getComandaByMesaId(id_mesa) {
        return this.request(`/comanda/mesa/${id_mesa}`);
    }

    async updateComanda(id, comandaData) {
        return this.request(`/comanda/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(comandaData),
        });
    }

    async deleteComanda(id) {
        return this.request(`/comanda/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Métodos de Itens de Comanda ---
    async getItensComanda(id_comanda) {
        return this.request(`/comanda-item/${id_comanda}`);
    }

    async addItemComanda(itemData) {
        return this.request('/comanda-item', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    }

    async updateItemComanda(id_comanda, id_produto, itemData) {
        return this.request(`/comanda-item/${id_comanda}/${id_produto}`, {
            method: 'PATCH',
            body: JSON.stringify(itemData),
        });
    }

    async deleteItemComanda(id_comanda, id_produto) {
        return this.request(`/comanda-item/${id_comanda}/${id_produto}`, {
            method: 'DELETE',
        });
    }
}

// Exporta uma instância única (Singleton) da classe Api para ser usada em toda a aplicação.
export const api = new Api();
