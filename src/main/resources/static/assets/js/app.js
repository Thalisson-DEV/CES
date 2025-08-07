// CAMINHOS DE IMPORT CORRIGIDOS
import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderMaterialsPage } from './pages/materiais.js';
import { renderWorksPage } from './pages/works.js';
import { showUserProfileModal, closeAllModals } from './components.js';

// Mapeamento de rotas para as funções que renderizam cada página
const routes = {
    '/': renderLoginPage,
    '/login': renderLoginPage,
    '/dashboard': renderDashboardPage,
    '/materials': renderMaterialsPage,
    '/works': renderWorksPage
};

/**
 * Função principal do roteador.
 * Lê a hash da URL e renderiza a página correspondente.
 */
const router = () => {
    // Pega a hash da URL (ex: #/dashboard) ou vai para a raiz se não houver
    const path = window.location.hash.slice(1) || '/';

    // Verifica se o usuário está tentando acessar uma página protegida sem token
    const token = localStorage.getItem('jwt_token');
    if (!token && path !== '/login' && path !== '/') {
        window.location.hash = '/login';
        return;
    }

    // Se o usuário tem token e está na página de login, redireciona para o dashboard
    if (token && (path === '/login' || path === '/')) {
        window.location.hash = '/dashboard';
        return;
    }

    // Encontra a função correspondente à rota
    const renderFunction = routes[path] || routes['/dashboard']; // Rota padrão

    // Limpa modais abertos ao navegar
    closeAllModals();

    // Renderiza a página
    renderFunction();
};

/**
 * Configura o layout principal da aplicação (sidebar, submenu, etc.)
 * Esta função é chamada apenas uma vez, após o login.
 */
export function setupMainAppLayout() {
    const appDiv = document.getElementById('app');
    const mainAppTemplate = document.getElementById('template-main-app');
    appDiv.innerHTML = ''; // Limpa o conteúdo (página de login)
    appDiv.appendChild(mainAppTemplate.content.cloneNode(true));

    // --- LÓGICA DO MENU E SUBMENU ---
    const appContainer = document.querySelector('.app-container');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const submenuContents = document.querySelectorAll('.submenu-content');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const menuId = link.dataset.menu;
            if (!menuId) return; // Ignora links sem data-menu (logout, profile)

            // Previne a navegação padrão apenas se for um link de menu
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
            }

            // Se o menu clicado já está ativo, fecha o submenu
            if (link.classList.contains('active') && appContainer.classList.contains('submenu-open')) {
                appContainer.classList.remove('submenu-open');
                link.classList.remove('active');
            } else {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                submenuContents.forEach(s => s.classList.remove('active'));

                link.classList.add('active');
                const submenu = document.getElementById(`submenu-${menuId}`);
                if (submenu) {
                    submenu.classList.add('active');
                    appContainer.classList.add('submenu-open');
                } else {
                    appContainer.classList.remove('submenu-open');
                }
            }
            // Navega para a URL do link
            const targetUrl = link.getAttribute('href');
            if (targetUrl && targetUrl.startsWith('#')) {
                window.location.hash = targetUrl.substring(1);
            }
        });
    });

    // --- LÓGICA DOS BOTÕES GLOBAIS ---
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('jwt_token');
        window.location.hash = '/login';
    });

    document.getElementById('btn-user-profile').addEventListener('click', (e) => {
        e.preventDefault();
        showUserProfileModal();
    });

    // Atualiza o estado do menu ao carregar a página
    updateMenuActiveState();
}

/**
 * Atualiza o estado visual (ativo/inativo) do menu e submenu
 * com base na rota atual.
 */
export function updateMenuActiveState() {
    const path = window.location.hash; // Pega a hash completa, ex: #/materials
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return; // Sai se o layout principal não estiver renderizado

    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-menu]');
    const pageLinks = document.querySelectorAll('.submenu-content a');

    let activeMenu = null;

    // Ativa o link do submenu
    pageLinks.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
            // Encontra o menu pai
            activeMenu = link.closest('.submenu-content').id.split('-')[1];
        } else {
            link.classList.remove('active');
        }
    });

    // Ativa o ícone da sidebar
    sidebarLinks.forEach(link => {
        if (link.dataset.menu === activeMenu) {
            link.classList.add('active');
            appContainer.classList.add('submenu-open');
        } else {
            link.classList.remove('active');
        }
    });

    // Caso especial: Dashboard
    if (path === '#/dashboard' || path === '#/') {
        const dashboardLink = document.querySelector('.sidebar-link[data-menu="dashboard"]');
        if(dashboardLink) dashboardLink.classList.add('active');
        appContainer.classList.remove('submenu-open');
    }
}


// Adiciona os event listeners para o roteador
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
