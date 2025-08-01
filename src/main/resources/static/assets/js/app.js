document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const appContainer = document.querySelector('.app-container');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const submenuContents = document.querySelectorAll('.submenu-content');
    const pageLinks = document.querySelectorAll('.page-link');
    const pages = document.querySelectorAll('.page');
    const logoutButton = document.getElementById('logoutButton');

    // --- LÓGICA DO MENU LATERAL ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const submenuId = link.dataset.submenu;

            // Se o link não for de submenu (como o de logout), não faz nada aqui
            if (!submenuId) return;

            // Se o submenu clicado já está ativo, fecha o menu
            if (link.classList.contains('active') && appContainer.classList.contains('submenu-open')) {
                appContainer.classList.remove('submenu-open');
                link.classList.remove('active');
            } else {
                // Remove 'active' de todos os links e submenus
                sidebarLinks.forEach(l => l.classList.remove('active'));
                submenuContents.forEach(s => s.classList.remove('active'));

                // Ativa o link e o submenu corretos
                link.classList.add('active');
                document.getElementById(`submenu-${submenuId}`).classList.add('active');
                appContainer.classList.add('submenu-open');
            }
        });
    });

    // --- LÓGICA DE NAVEGAÇÃO (TROCA DE PÁGINAS) ---
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            showPage(pageId);
        });
    });

    // --- LÓGICA DE LOGOUT ---
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('jwt_token');
        window.location.href = '/login.html';
    });

    // --- LÓGICA DO DASHBOARD (CARREGAR DADOS INICIAIS) ---
    async function loadDashboardData() {
        try {
            // Exemplo: Buscaria os dados dos KPIs da sua API
            // const response = await fetchAutenticado('/api/v1/dashboard/stats', { method: 'GET' });
            // const data = await response.json();

            // Usando dados de exemplo por enquanto
            document.getElementById('kpi-solicitacoes-pendentes').textContent = '12';
            document.getElementById('kpi-obras-ativas').textContent = '4';
            document.getElementById('kpi-itens-estoque-baixo').textContent = '8';

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            // Poderia mostrar uma mensagem de erro na tela
        }
    }

    // Carrega a página inicial e os dados
    showPage('page-dashboard');
    loadDashboardData();

    // --- LÓGICA DE INICIALIZAÇÃO ---
    function initializeApp() {
        // Encontra o link do sidebar e o conteúdo do submenu do dashboard
        const dashboardSidebarLink = document.querySelector('.sidebar-link[data-submenu="dashboard"]');
        const dashboardSubmenuContent = document.getElementById('submenu-dashboard');

        // Define o estado inicial como se o usuário tivesse clicado no ícone do dashboard
        if (dashboardSidebarLink && dashboardSubmenuContent) {
            appContainer.classList.add('submenu-open'); // Expande o painel
            dashboardSidebarLink.classList.add('active'); // Ativa o ícone
            dashboardSubmenuContent.classList.add('active'); // Mostra o conteúdo do submenu
        }

        // Carrega a página inicial e os dados
        showPage('page-dashboard');
        loadDashboardData();
    }

    // Chama a função de inicialização
    initializeApp();
});