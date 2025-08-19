import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer } from '../components.js';

// Estado da página
let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    equipeId: '',
    solicitanteId: '',
    statusId: '',
    processoId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de acompanhamento de solicitações.
 */
export function renderCommercialTrackingPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-commercial-tracking');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadRequests();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.querySelector('#tabela-solicitacoes tbody').addEventListener('click', handleTableActions);

    // Filtros
    document.getElementById('filter-request-status').addEventListener('change', (e) => updateFilter('statusId', e.target.value));
    document.getElementById('filter-request-equipe').addEventListener('change', (e) => updateFilter('equipeId', e.target.value));
    document.getElementById('filter-request-solicitante').addEventListener('change', (e) => updateFilter('solicitanteId', e.target.value));
    document.getElementById('busca-request').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte para os filtros e formulários.
 */
async function loadSupportData() {
    try {
        if (supportData.status) return;

        const [statusRes, equipesRes, usuariosRes, processosRes] = await Promise.all([
            fetchAutenticado('/api/v1/status-solicitacao'),
            fetchAutenticado('/api/v1/equipes?size=2000'),
            fetchAutenticado('/api/v1/usuarios?size=2000'),
            fetchAutenticado('/api/v1/processos')
        ]);

        if (!statusRes.ok || !equipesRes.ok || !usuariosRes.ok || !processosRes.ok) {
            throw new Error('Falha ao carregar dados de suporte para solicitações.');
        }

        supportData.status = await statusRes.json();
        supportData.equipes = (await equipesRes.json()).content;
        supportData.usuarios = (await usuariosRes.json()).content;
        supportData.processos = await processosRes.json();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Preenche os dropdowns de filtro.
 */
function populateFilterDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = `<option value="">Todos</option>`;
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };

    populate('filter-request-status', supportData.status, 'nomeStatus');
    populate('filter-request-equipe', supportData.equipes, 'nomeEquipe');
    populate('filter-request-solicitante', supportData.usuarios, 'nomeCompleto', 'id');
}

/**
 * Atualiza um filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadRequests();
}

/**
 * Retorna a classe CSS correspondente para uma tag de status.
 * @param {string} statusName - O nome do status.
 * @returns {string} A classe CSS.
 */
function getStatusTagClass(statusName) {
    if (!statusName) return 'tag-default';
    const statusLower = statusName.toLowerCase();

    if (statusLower.includes('pendente')) return 'tag-warning';
    if (statusLower.includes('aprovada') || statusLower.includes('totalmente')) return 'tag-success';
    if (statusLower.includes('parcialmente')) return 'tag-info';
    if (statusLower.includes('recusada') || statusLower.includes('cancelada')) return 'tag-danger';

    return 'tag-default';
}

/**
 * Carrega as solicitações da API.
 */
async function loadRequests() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,desc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/solicitacoes-comercial?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar solicitações.');

        const pageData = await response.json();
        renderRequestsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de solicitações.
 */
function renderRequestsTable(requests) {
    const tableBody = document.querySelector('#tabela-solicitacoes tbody');
    const emptyState = document.getElementById('empty-state-solicitacoes');
    tableBody.innerHTML = '';

    if (requests.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-file-text"></i><h3>Nenhuma solicitação encontrada</h3><p>Crie uma nova solicitação para começar.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        requests.forEach(req => {
            const tr = document.createElement('tr');
            const creationDate = new Date(req.dataCriacao).toLocaleString('pt-BR');
            // ATUALIZAÇÃO: O link agora aponta para a rota da SPA
            const reportUrl = `#/commercial/request/${req.id}`;
            const statusTagClass = getStatusTagClass(req.status?.nomeStatus);

            tr.innerHTML = `
                <td><a href="${reportUrl}" class="text-blue-600 hover:underline font-semibold">#${req.id}</a></td>
                <td>${req.equipe?.nomeEquipe || 'N/A'}</td>
                <td>${req.solicitante?.user || 'N/A'}</td>
                <td>${req.processo?.nomeProcesso || 'N/A'}</td>
                <td><span class="tag ${statusTagClass}">${req.status?.nomeStatus || 'N/A'}</span></td>
                <td>${creationDate}</td>
                <td class="actions">
                    <a href="${reportUrl}" class="btn-icon" title="Visualizar Detalhes" style="color: var(--accent-primary);">
                        <i class="ph ph-magnifying-glass"></i>
                    </a>
                    <button class="btn-icon btn-edit" data-id="${req.id}" title="Editar Solicitação">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

/**
 * Renderiza os controles de paginação.
 */
function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-solicitacoes');
    if (!container) return;

    const { number: pageIndex, size, totalElements, totalPages } = pageData.page;
    const numberOfElements = pageData.content.length;

    if (totalElements === 0) {
        container.innerHTML = '';
        return;
    }

    const first = (pageIndex === 0);
    const last = (pageIndex === totalPages - 1);
    const startItem = pageIndex * size + 1;
    const endItem = startItem + numberOfElements - 1;

    container.innerHTML = `
        <div class="pagination-summary">Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${totalElements}</strong></div>
        <div class="pagination-size">
            <label for="items-per-page-req">Itens:</label>
            <select id="items-per-page-req"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-req" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-req" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-req');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadRequests(); });
    document.getElementById('prev-page-req').addEventListener('click', () => { if (!first) { currentPage--; loadRequests(); } });
    document.getElementById('next-page-req').addEventListener('click', () => { if (!last) { currentPage++; loadRequests(); } });
}

/**
 * Lida com ações da tabela (editar).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button || !button.classList.contains('btn-edit')) return;

    const id = button.dataset.id;
    // Lógica para abrir a tela de edição/detalhes da solicitação
    // Por exemplo, redirecionar para uma nova página de detalhes:
    // window.location.hash = `/commercial/request/${id}`;
    showNotification(`Funcionalidade de edição para solicitação #${id} ainda não implementada.`, 'info');
}
