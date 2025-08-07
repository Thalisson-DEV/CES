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

    // Se o corpo da requisição é FormData, o navegador define o Content-Type.
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const requestOptions = {
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(API_BASE_URL + endpoint, requestOptions);

        // Se o token for inválido ou expirado, redireciona para o login.
        if (response.status === 401 || response.status === 403) {
            console.error('Token inválido ou expirado. Redirecionando...');
            localStorage.removeItem('jwt_token');
            window.location.hash = '/login';
            throw new Error('Acesso não autorizado.');
        }

        return response;

    } catch (error) {
        console.error('Erro na requisição para o endpoint:', endpoint, error);
        // Re-lança o erro para que a função que chamou possa tratá-lo.
        throw error;
    }
}
