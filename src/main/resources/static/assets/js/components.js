/**
 * Componentes reutilizáveis para a aplicação
 */

// Função para mostrar mensagens de feedback
const mostrarMensagem = (texto, tipo = 'sucesso') => {
    // Remove qualquer mensagem existente
    const mensagensExistentes = document.querySelectorAll('.mensagem');
    mensagensExistentes.forEach(m => m.remove());

    // Cria a nova mensagem
    const el = document.createElement('div');
    el.className = `mensagem ${tipo}`;
    el.textContent = texto;

    // Adiciona ícone
    const icone = document.createElement('span');
    icone.className = 'mensagem-icone';
    if (tipo === 'sucesso') {
        icone.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>';
    } else {
        icone.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>';
    }
    el.prepend(icone);

    // Adiciona a mensagem ao body
    document.body.appendChild(el);

    // Adiciona a classe para mostrar com animação
    setTimeout(() => el.classList.add('visivel'), 10);

    // Remove após o tempo definido
    setTimeout(() => {
        el.classList.remove('visivel');
        setTimeout(() => el.remove(), 300);
    }, 4000);
};

// Fetch autenticado com token JWT
const fetchAutenticado = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return null;
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    // Se estamos enviando um FormData, não definimos o Content-Type
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);

        // Se a resposta for 401 ou 403, redireciona para login
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return null;
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarMensagem('Erro na comunicação com o servidor. Tente novamente.', 'erro');
        throw error;
    }
};

// Formatar data para dd/mm/yyyy
const formatarData = (dataString) => {
    if (!dataString) return 'N/A';

    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data inválida';

    return data.toLocaleDateString('pt-BR');
};

// Adicionar CSS para as mensagens
const adicionarEstilosMensagem = () => {
    // Verifica se o estilo já existe
    if (document.getElementById('mensagem-estilos')) return;

    const estilos = document.createElement('style');
    estilos.id = 'mensagem-estilos';
    estilos.innerHTML = `
        .mensagem {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            background-color: #10b981; /* Verde para sucesso */
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            max-width: 350px;
            z-index: 1100;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
        }

        .mensagem.visivel {
            opacity: 1;
            transform: translateY(0);
        }

        .mensagem.erro {
            background-color: #ef4444; /* Vermelho para erro */
        }

        .mensagem-icone {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .mensagem-icone svg {
            width: 100%;
            height: 100%;
        }
    `;

    document.head.appendChild(estilos);
};

// Inicializa os estilos de mensagens quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', adicionarEstilosMensagem);

// Exporta as funções para uso global
window.mostrarMensagem = mostrarMensagem;
window.fetchAutenticado = fetchAutenticado;
window.formatarData = formatarData;
