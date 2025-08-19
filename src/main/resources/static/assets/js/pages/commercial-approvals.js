import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

// Estado da página
let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    equipeId: '',
    solicitanteId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de aprovação de solicitações.
 */
export function renderCommercialApprovalsPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-commercial-approvals');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadApprovalRequests();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    // Filtros
    document.getElementById('filter-approval-equipe').addEventListener('change', (e) => updateFilter('equipeId', e.target.value));
    document.getElementById('filter-approval-solicitante').addEventListener('change', (e) => updateFilter('solicitanteId', e.target.value));
    document.getElementById('busca-approval').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte para os filtros.
 */
async function loadSupportData() {
    try {
        if (supportData.equipes) return;
        const [equipesRes, usuariosRes] = await Promise.all([
            fetchAutenticado('/api/v1/equipes?size=2000'),
            fetchAutenticado('/api/v1/usuarios?size=2000'),
        ]);
        if (!equipesRes.ok || !usuariosRes.ok) throw new Error('Falha ao carregar dados de suporte.');

        supportData.equipes = (await equipesRes.json()).content;
        supportData.usuarios = (await usuariosRes.json()).content;
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
    populate('filter-approval-equipe', supportData.equipes, 'nomeEquipe');
    populate('filter-approval-solicitante', supportData.usuarios, 'nomeCompleto', 'id');
}

/**
 * Atualiza um filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadApprovalRequests();
}

/**
 * Carrega as solicitações que precisam de aprovação.
 */
async function loadApprovalRequests() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,asc'
    });
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        // ATENÇÃO: Este endpoint precisa ser criado no seu backend.
        // Ele deve retornar apenas as solicitações com o status "Solicitado".
        const response = await fetchAutenticado(`/api/v1/solicitacoes-comercial/requested?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar solicitações para aprovação.');

        const pageData = await response.json();
        renderApprovalsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de aprovações.
 */
function renderApprovalsTable(requests) {
    const tableBody = document.querySelector('#tabela-aprovacoes tbody');
    const emptyState = document.getElementById('empty-state-aprovacoes');
    tableBody.innerHTML = '';

    if (requests.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-check-square-offset"></i><h3>Nenhuma solicitação aguardando aprovação</h3><p>Todas as novas solicitações já foram processadas.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        requests.forEach(req => {
            const tr = document.createElement('tr');
            const creationDate = new Date(req.dataCriacao).toLocaleString('pt-BR');
            const detailsUrl = `#/commercial/approvals/${req.id}`;

            tr.innerHTML = `
                <td><a href="${detailsUrl}" class="text-blue-600 hover:underline font-semibold">#${req.id}</a></td>
                <td>${req.equipe?.nomeEquipe || 'N/A'}</td>
                <td>${req.solicitante?.user || 'N/A'}</td>
                <td>${req.processo?.nomeProcesso || 'N/A'}</td>
                <td>${creationDate}</td>
                <td class="actions">
                    <a href="${detailsUrl}" class="btn-icon" title="Analisar Solicitação" style="color: var(--accent-primary);">
                        <i class="ph ph-magnifying-glass"></i>
                    </a>
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
    const container = document.getElementById('pagination-aprovacoes');
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
            <label for="items-per-page-appr">Itens:</label>
            <select id="items-per-page-appr"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-appr" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-appr" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-appr');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadApprovalRequests(); });
    document.getElementById('prev-page-appr').addEventListener('click', () => { if (!first) { currentPage--; loadApprovalRequests(); } });
    document.getElementById('next-page-appr').addEventListener('click', () => { if (!last) { currentPage++; loadApprovalRequests(); } });
}
