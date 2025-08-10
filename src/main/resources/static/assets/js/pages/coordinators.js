import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer } from '../components.js';

// Estado da página
let supportData = {}; // Para armazenar a lista de usuários
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    searchTerm: ''
};

/**
 * Renderiza a página de coordenadores.
 */
export function renderCoordinatorsPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-coordinators');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(loadCoordinators);
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-novo-coordenador').addEventListener('click', () => showCoordinatorForm());
    document.querySelector('#tabela-coordenadores tbody').addEventListener('click', handleTableActions);
    document.getElementById('busca-coordenador').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte (lista de usuários) para o formulário.
 */
async function loadSupportData() {
    try {
        if (supportData.usuarios) return;
        const response = await fetchAutenticado('/api/v1/usuarios'); // Assumindo que este endpoint existe
        if (!response.ok) throw new Error('Falha ao carregar lista de usuários.');
        supportData.usuarios = await response.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Atualiza um valor de filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadCoordinators();
}

/**
 * Carrega os coordenadores da API de forma paginada e com filtros.
 */
async function loadCoordinators() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,asc' // Ordenar pelo ID do coordenador
    });

    if (currentFilters.searchTerm) {
        params.append('searchTerm', currentFilters.searchTerm);
    }

    try {
        const response = await fetchAutenticado(`/api/v1/coordenadores?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar coordenadores.');

        const pageData = await response.json();
        renderCoordinatorsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de coordenadores.
 */
function renderCoordinatorsTable(coordinators) {
    const tableBody = document.querySelector('#tabela-coordenadores tbody');
    const emptyState = document.getElementById('empty-state-coordenadores');
    tableBody.innerHTML = '';

    if (coordinators.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-user-focus"></i><h3>Nenhum coordenador encontrado</h3><p>Cadastre um novo coordenador para começar.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        coordinators.forEach(coordinator => {
            const tr = document.createElement('tr');
            const statusTag = coordinator.ativo
                ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>`
                : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;

            const creationDate = new Date(coordinator.dataCriacao).toLocaleDateString('pt-BR');

            // CORREÇÃO: Adicionado optional chaining (?.) para evitar o erro.
            // Se coordinator.usuario for nulo, ele mostrará 'N/A' em vez de quebrar a aplicação.
            tr.innerHTML = `
                <td>${coordinator.usuario?.nomeCompleto || 'N/A'}</td>
                <td>${statusTag}</td>
                <td>${creationDate}</td>
                <td class="actions">
                    <button class="btn-icon btn-delete" data-id="${coordinator.id}"><i class="ph ph-trash"></i></button>
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
    const container = document.getElementById('pagination-coordenadores');
    if (!container) return;
    const { totalElements, totalPages, number: pageIndex, size, first, last } = pageData;
    if (totalElements === 0) {
        container.innerHTML = '';
        return;
    }
    const startItem = pageIndex * size + 1;
    const endItem = startItem + pageData.numberOfElements - 1;
    container.innerHTML = `
        <div class="pagination-summary">Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${totalElements}</strong></div>
        <div class="pagination-size">
            <label for="items-per-page-coord">Itens:</label>
            <select id="items-per-page-coord"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-coord" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-coord" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-coord');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadCoordinators(); });
    document.getElementById('prev-page-coord').addEventListener('click', () => { if (!first) { currentPage--; loadCoordinators(); } });
    document.getElementById('next-page-coord').addEventListener('click', () => { if (!last) { currentPage++; loadCoordinators(); } });
}

/**
 * Mostra o formulário de coordenador no painel lateral.
 */
function showCoordinatorForm() {
    const title = 'Novo Coordenador';
    const formBody = `
        <form id="form-coordinator">
            <div class="form-group">
                <label for="usuarioId">Usuário*</label>
                <select id="usuarioId" required></select>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    const userSelect = document.getElementById('usuarioId');
    userSelect.innerHTML = '<option value="">Selecione um usuário...</option>';
    supportData.usuarios?.forEach(user => userSelect.add(new Option(user.nomeCompleto, user.id)));
}

/**
 * Lida com o envio do formulário de coordenador.
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-coordinator');
    const coordinatorData = {
        usuarioId: parseInt(form.querySelector('#usuarioId').value) || null,
    };

    if (!coordinatorData.usuarioId) {
        showNotification('Você precisa selecionar um usuário.', 'error');
        throw new Error('Validation failed');
    }

    try {
        const response = await fetchAutenticado('/api/v1/coordenadores', { method: 'POST', body: JSON.stringify(coordinatorData) });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao criar coordenador.`);
        }
        showNotification(`Coordenador criado com sucesso!`, 'success');
        closeDrawer();
        loadCoordinators();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

/**
 * Lida com ações da tabela (excluir).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button || !button.classList.contains('btn-delete')) return;

    const id = button.dataset.id;
    if (confirm('Tem certeza que deseja remover este usuário do grupo de coordenadores?')) {
        try {
            const response = await fetchAutenticado(`/api/v1/coordenadores/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Falha ao remover coordenador.');
            }
            showNotification('Coordenador removido com sucesso!', 'success');
            loadCoordinators();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}
