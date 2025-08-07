import { setupMainAppLayout } from '../app.js';
import { showNotification } from '../components.js';

const API_BASE_URL = 'http://localhost:8080'; // URL base da sua API

/**
 * Renderiza a página de login e configura seus eventos.
 */
export function renderLoginPage() {
    const appDiv = document.getElementById('app');
    const loginTemplate = document.getElementById('template-login');

    // Limpa o conteúdo anterior e renderiza o template de login
    appDiv.innerHTML = '';
    appDiv.appendChild(loginTemplate.content.cloneNode(true));

    // Adiciona o event listener para o formulário de login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
}

/**
 * Lida com o evento de submit do formulário de login.
 * @param {Event} event - O evento de submit.
 */
async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('user');
    const senhaInput = document.getElementById('senhaHash');
    const loginButton = document.getElementById('loginButton');
    const feedbackDiv = document.getElementById('feedback');

    loginButton.disabled = true;
    loginButton.textContent = 'Autenticando...';
    feedbackDiv.style.display = 'none';

    const dadosLogin = {
        user: usernameInput.value,
        senhaHash: senhaInput.value,
    };

    try {
        // A chamada de login não usa `fetchAutenticado` porque ainda não temos token
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Usuário ou senha inválidos.' }));
            throw new Error(errorData.message);
        }

        const data = await response.json();

        // Salva o token e navega para o dashboard
        localStorage.setItem('jwt_token', data.token);

        // Configura o layout principal da aplicação
        setupMainAppLayout();

        // Redireciona para o dashboard
        window.location.hash = '/dashboard';

    } catch (error) {
        feedbackDiv.textContent = error.message;
        feedbackDiv.style.display = 'block';
        showNotification(error.message, 'error');

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    }
}