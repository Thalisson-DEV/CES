import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderMaterialsPage } from './pages/materiais.js';
import { renderWorksPage } from './pages/works.js';
import { renderTeamsPage } from './pages/teams.js';
import { renderUsersPage } from './pages/users.js';
import { renderCommercialTrackingPage } from './pages/commercial-tracking.js';
import { renderNewCommercialRequestPage } from './pages/new-commercial-request.js';
import { renderCommercialRequestDetailsPage } from './pages/commercial-request-details.js';
import { renderCommercialApprovalsPage } from './pages/commercial-approvals.js';
import { renderCommercialApprovalsDetailsPage } from './pages/commercial-approvals-details.js';
import { renderNewFieldNotePage } from './pages/field-note.js';
import { renderNoteTrackingPage } from './pages/note-tracking.js';
import { showUserProfileModal, closeAllModals } from './components.js';


// Mapeamento de rotas para as funções que renderizam cada página
const routes = {
    '/': renderLoginPage,
    '/login': renderLoginPage,
    '/dashboard': renderDashboardPage,
    '/materials': renderMaterialsPage,
    '/works': renderWorksPage,
    '/teams': renderTeamsPage,
    '/users': renderUsersPage,
    '/commercial/material-tracking': renderCommercialTrackingPage,
    '/commercial/new-request': renderNewCommercialRequestPage,
    '/commercial/request/:id': renderCommercialRequestDetailsPage,
    '/commercial/approvals': renderCommercialApprovalsPage,
    '/commercial/new-note': renderNewFieldNotePage,
    '/commercial/note-tracking': renderNoteTrackingPage,
    '/commercial/approvals/:id': renderCommercialApprovalsDetailsPage,
};

/**
 * Função principal do roteador.
 * Lê a hash da URL e renderiza a página correspondente.
 */
const router = () => {
    const appDiv = document.getElementById('app');
    const token = localStorage.getItem('jwt_token');
    const path = window.location.hash.slice(1) || '/';

    const mainLayoutExists = document.querySelector('.app-container');

    if (token) {
        if (!mainLayoutExists) {
            setupMainAppLayout();
        }

        if (path === '/login' || path === '/') {
            window.location.hash = '/dashboard';
            return;
        }

        // Lógica de roteamento atualizada para lidar com parâmetros
        let match = null;
        const potentialMatch = Object.keys(routes).find(route => {
            const routeParts = route.split('/');
            const pathParts = path.split('/');
            if (routeParts.length !== pathParts.length) return false;

            const params = {};
            const isMatch = routeParts.every((part, i) => {
                if (part.startsWith(':')) {
                    params[part.slice(1)] = pathParts[i];
                    return true;
                }
                return part === pathParts[i];
            });

            if (isMatch) {
                match = { route, params };
            }
            return isMatch;
        });

        if (match) {
            // Passa os parâmetros para a função de renderização
            routes[match.route](match.params);
        } else {
            // Rota não encontrada, redireciona para o dashboard
            window.location.hash = '/dashboard';
        }

    } else {
        if (mainLayoutExists) {
            appDiv.innerHTML = '';
        }
        renderLoginPage();
    }

    closeAllModals();
};

/**
 * Configura o layout principal da aplicação (sidebar, submenu, etc.)
 */
export function setupMainAppLayout() {
    const appDiv = document.getElementById('app');
    const mainAppTemplate = document.getElementById('template-main-app');
    appDiv.innerHTML = '';
    appDiv.appendChild(mainAppTemplate.content.cloneNode(true));

    const appContainer = document.querySelector('.app-container');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-menu]');
    const submenuContents = document.querySelectorAll('.submenu-content');

    // --- LÓGICA DE CLIQUE DO MENU LATERAL (SIDEBAR) ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const menuId = link.dataset.menu;
            if (!menuId) return;

            const targetSubmenu = document.getElementById(`submenu-${menuId}`);
            const isSameMenu = link.classList.contains('active');

            if (!targetSubmenu) {
                window.location.hash = link.getAttribute('href').substring(1);
                appContainer.classList.remove('submenu-open');
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                return;
            }
            if (isSameMenu && appContainer.classList.contains('submenu-open')) {
                appContainer.classList.remove('submenu-open');
            } else {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                submenuContents.forEach(s => s.classList.remove('active'));
                link.classList.add('active');
                targetSubmenu.classList.add('active');
                appContainer.classList.add('submenu-open');
            }
        });
    });

    // --- NOVA LÓGICA PARA O DROPDOWN DO SUBMENU ---
    const submenuPanel = document.querySelector('.submenu-panel');
    if (submenuPanel) {
        submenuPanel.addEventListener('click', (e) => {
            const toggleButton = e.target.closest('.submenu-dropdown-toggle');
            if (toggleButton) {
                e.preventDefault();
                // Fecha outros dropdowns abertos para funcionar como um accordion
                submenuPanel.querySelectorAll('.submenu-dropdown-toggle.open').forEach(openToggle => {
                    if (openToggle !== toggleButton) {
                        openToggle.classList.remove('open');
                    }
                });
                // Abre ou fecha o dropdown clicado
                toggleButton.classList.toggle('open');
            }
        });
    }

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

    updateMenuActiveState();
}

/**
 * Atualiza o estado visual (ativo/inativo) do menu e submenu
 * com base na rota atual.
 */
export function updateMenuActiveState() {
    const path = window.location.hash;
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;

    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-menu]');
    const pageLinks = document.querySelectorAll('.submenu-content a');
    const submenuContents = document.querySelectorAll('.submenu-content');

    let activeMenuId = null;

    sidebarLinks.forEach(l => l.classList.remove('active'));
    pageLinks.forEach(l => l.classList.remove('active'));
    submenuContents.forEach(s => s.classList.remove('active'));
    appContainer.classList.remove('submenu-open');

    const activePageLink = Array.from(pageLinks).find(link => link.getAttribute('href') === path);

    if (activePageLink) {
        activePageLink.classList.add('active');
        const parentSubmenu = activePageLink.closest('.submenu-content');
        if (parentSubmenu) {
            parentSubmenu.classList.add('active');
            activeMenuId = parentSubmenu.id.split('-')[1];

            // Abre o dropdown pai se houver um
            const parentDropdown = activePageLink.closest('.submenu-dropdown-content');
            if (parentDropdown) {
                const toggle = parentDropdown.previousElementSibling;
                if (toggle && toggle.classList.contains('submenu-dropdown-toggle')) {
                    toggle.classList.add('open');
                }
            }
        }
    } else if (path === '#/dashboard' || path === '#/' || path === '') {
        activeMenuId = 'dashboard';
    }

    if (activeMenuId) {
        const activeSidebarLink = document.querySelector(`.sidebar-link[data-menu="${activeMenuId}"]`);
        if (activeSidebarLink) {
            activeSidebarLink.classList.add('active');
            if (activeMenuId !== 'dashboard') {
                appContainer.classList.add('submenu-open');
            }
        }
    }
}

// Adiciona os event listeners para o roteador
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);