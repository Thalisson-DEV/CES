const API_BASE_URL = 'http://localhost:8080'; // Configure com a URL da sua API

/**
 * Wrapper para a API fetch que lida com autenticação JWT e tratamento de erros.
 * @param {string} endpoint - O endpoint da API (ex: '/api/v1/materiais').
 * @param {object} options - Opções do fetch (method, body, headers, etc.).
 * @returns {Promise<Response>} A promessa da resposta do fetch.
 */
export async function fetchAutenticado(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        console.error('Nenhum token encontrado, redirecionando para o login.');
        window.location.hash = '/login';
        throw new Error('Usuário não autenticado.');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const requestOptions = {
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(API_BASE_URL + endpoint, requestOptions);

        // --- LÓGICA DE TRATAMENTO DE ERRO ATUALIZADA ---

        // Caso 1: 401 Unauthorized (Token inválido ou sessão expirou)
        // Ação: Redirecionar para o login.
        if (response.status === 401) {
            console.error('Token inválido ou expirado (401). Redirecionando para o login...');
            localStorage.removeItem('jwt_token');
            window.location.hash = '/login';
            // Lança um erro para interromper a execução na função que chamou.
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
        }

        // Caso 2: 403 Forbidden (Usuário logado, mas sem permissão para a ação)
        // Ação: NÃO redirecionar. Apenas lançar um erro que será mostrado como notificação.
        if (response.status === 403) {
            console.error('Acesso negado (403 Forbidden). O usuário não tem a role necessária.');
            // Lança um erro com uma mensagem amigável.
            throw new Error('Você não tem permissão para executar esta ação.');
        }

        // Se não for nenhum dos erros acima, a função continua normalmente.
        return response;

    } catch (error) {
        // Re-lança o erro (seja o de rede, 401 ou 403) para que a função que chamou (ex: em materials.js)
        // possa capturá-lo em seu próprio bloco catch e mostrar a notificação.
        throw error;
    }
}