import { environment } from '@environment';
/**
 * Classe para centralizar e gerenciar as chamadas à API do backend.
 */
const ERROR_MESSAGES = {
    400: 'Dados inválidos. Verifique as informações e tente novamente.',
    401: 'Sua sessão expirou. Faça login novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Registro não encontrado.',
    409: 'Este registro já existe. Verifique os dados e tente novamente.',
    500: 'Erro interno. Tente novamente em alguns instantes.',
};

function getErrorMessage(status, fallback) {
    return ERROR_MESSAGES[status] || fallback || `HTTP error! status: ${status}`;
}

class Api {
    constructor() {
        this.apiUrl = environment.apiUrl;
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
            ...(!environment.production ? { 'ngrok-skip-browser-warning': 'true' } : {}),
            ...options.headers,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const fetchOptions = {
                ...options,
                headers,
                credentials: 'include',
                signal: controller.signal,
            };
            const response = await fetch(`${this.apiUrl}${endpoint}`, fetchOptions);

            clearTimeout(timeoutId);

            if (response.status === 401) {
                localStorage.removeItem('logged_in');
                const router = document.querySelector('ion-router');
                if (router) {
                    router.push('/login', 'root');
                } else {
                    window.location.href = '#/login';
                }
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || getErrorMessage(response.status));
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

    async login(username, password) {
        const headers = {
            'Content-Type': 'application/json',
            ...(!environment.production ? { 'ngrok-skip-browser-warning': 'true' } : {}),
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${this.apiUrl}/usuario/login`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ username, password }),
                credentials: 'include',
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

            localStorage.setItem('logged_in', 'true');
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('A requisição excedeu o tempo limite. Verifique sua conexão.');
            }
            throw error;
        }
    }

    async getMe() {
        return this.request('/usuario/me');
    }

    async logout() {
        return this.request('/usuario/logout', { method: 'POST' });
    }

    // --- Métodos de Produtos ---
    async getProdutos(skip = 0, take = 20) {
        return this.request(`/produto?skip=${skip}&take=${take}`);
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

    async getUsuarios(skip = 0, take = 20) {
        return this.request(`/usuario?skip=${skip}&take=${take}`);
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
    async getMesas(skip = 0, take = 20) {
        return this.request(`/mesa?skip=${skip}&take=${take}`);
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
    async getComandas(skip = 0, take = 20) {
        return this.request(`/comanda?skip=${skip}&take=${take}`);
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

    async getActiveComandaByMesaId(id_mesa) {
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
