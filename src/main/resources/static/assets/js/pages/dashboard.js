import { updateMenuActiveState } from '../app.js';

/**
 * Renderiza a página de dashboard.
 */
export function renderDashboardPage() {
    const pageContent = document.getElementById('page-content');
    const dashboardTemplate = document.getElementById('template-dashboard');

    if (!pageContent || !dashboardTemplate) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(dashboardTemplate.content.cloneNode(true));

    updateMenuActiveState();
    loadDashboardData();
}

/**
 * Carrega os dados para os KPIs do dashboard.
 * (Atualmente com dados de exemplo)
 */
async function loadDashboardData() {
    try {
        // Exemplo de como seria com a API:
        // const response = await fetchAutenticado('/api/v1/dashboard/stats');
        // if (!response.ok) throw new Error('Falha ao carregar dados do dashboard');
        // const data = await response.json();

        // Usando dados de exemplo:
        const kpiCards = document.querySelectorAll('.kpi-card span');
        if (kpiCards.length > 0) {
            // kpiCards[0].textContent = data.solicitacoesPendentes;
            // kpiCards[1].textContent = data.obrasAtivas;
            // kpiCards[2].textContent = data.itensEstoqueBaixo;
            // kpiCards[3].textContent = data.atendimentosMes;
        }

    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
    }
}