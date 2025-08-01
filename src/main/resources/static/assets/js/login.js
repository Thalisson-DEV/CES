const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('user');
const senhaInput = document.getElementById('senhaHash');
const loginButton = document.getElementById('loginButton');
const feedbackDiv = document.getElementById('feedback');

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    loginButton.disabled = true;
    loginButton.textContent = 'Autenticando...';
    feedbackDiv.style.display = 'none';

    const dadosLogin = {
        user: usernameInput.value,
        senhaHash: senhaInput.value
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });

        if (!response.ok) {
            throw new Error('Usuário ou senha inválidos. Tente novamente.');
        }

        const data = await response.json();

        localStorage.setItem('jwt_token', data.token);
        window.location.href = '/dashboard.html';

    } catch (error) {
        feedbackDiv.textContent = error.message;
        feedbackDiv.className = 'feedback error';
        feedbackDiv.style.display = 'block';

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    }
});