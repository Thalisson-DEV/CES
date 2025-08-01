const API_BASE_URL = 'http://localhost:8080'; // Centraliza a URL base da sua API

/**
 * Uma função que "empacota" a API fetch para automaticamente:
 * 1. Adicionar o token JWT no cabeçalho de autorização.
 * 2. Tratar erros de autenticação (401/403) e redirecionar para o login.
 * @param {string} endpoint O endpoint da API para chamar (ex: '/api/v1/materiais').
 * @param {object} options As opções do fetch (method, body, etc.).
 * @returns {Promise<Response>} A promessa da resposta do fetch.
 */
async function fetchAutenticado(endpoint, options = {}) {
    // Pega o token que guardamos no localStorage durante o login
    const token = localStorage.getItem('jwt_token');

    // Se não houver token, o usuário não está logado. Redireciona imediatamente.
    if (!token) {
        console.log('Nenhum token encontrado, redirecionando para o login.');
        window.location.href = '/login.html';
        // Lança um erro para interromper a execução do código que chamou esta função
        throw new Error('Usuário não autenticado.');
    }

    // Prepara os cabeçalhos (headers)
    const headers = {
        'Content-Type': 'application/json',
        // Adiciona o cabeçalho de autorização com o token
        'Authorization': 'Bearer ' + token,
        ...options.headers // Permite adicionar outros headers se necessário
    };

    // Monta a requisição completa
    const requestOptions = {
        ...options,
        headers: headers
    };

    // Faz a chamada fetch para o backend
    const response = await fetch(API_BASE_URL + endpoint, requestOptions);

    // **AQUI ESTÁ A LÓGICA DE REDIRECIONAMENTO**
    // Verifica se a resposta foi um erro de "Não Autorizado" ou "Proibido"
    if (response.status === 401 || response.status === 403) {
        console.log('Token inválido ou expirado, redirecionando para o login.');
        // Limpa o token antigo/inválido do armazenamento
        localStorage.removeItem('jwt_token');
        // Redireciona para a página de login
        window.location.href = '/login.html';
        throw new Error('Acesso não autorizado.');
    }

    // Se a resposta foi bem-sucedida, retorna a resposta para ser processada
    return response;
}