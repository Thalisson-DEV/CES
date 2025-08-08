import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer, showImportModal } from '../components.js';

// Estado da página
let allForemen = [];
let supportData = {}; // Para armazenar a lista de bases operacionais
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    baseId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de encarregados.
 */
export function renderForemenPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-foremen');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupForemenEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadForemen();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupForemenEventListeners() {
    document.getElementById('btn-novo-encarregado').addEventListener('click', () => showForemanForm());
    document.getElementById('btn-importar-encarregados').addEventListener('click', () => document.getElementById('input-arquivo-encarregados').click());
    document.getElementById('input-arquivo-encarregados').addEventListener('change', handleFileImport);
    document.querySelector('#tabela-encarregados tbody').addEventListener('click', handleTableActions);
    document.getElementById('filter-encarregado-base').addEventListener('change', (e) => updateFilter('baseId', e.target.value));
    document.getElementById('busca-encarregado').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte (bases operacionais) para os filtros e formulários.
 */
async function loadSupportData() {
    try {
        if (supportData.bases) return;
        const response = await fetchAutenticado('/api/v1/bases-operacionais');
        if (!response.ok) throw new Error('Falha ao carregar bases operacionais.');
        supportData.bases = await response.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Preenche os dropdowns de filtro com os dados de suporte.
 */
function populateFilterDropdowns() {
    const baseSelect = document.getElementById('filter-encarregado-base');
    baseSelect.innerHTML = '<option value="">Todas as Bases</option>';
    supportData.bases?.forEach(b => baseSelect.add(new Option(b.nomeBase, b.id)));
}

/**
 * Atualiza um valor de filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadForemen();
}

/**
 * Carrega os encarregados da API de forma paginada e com filtros.
 */
async function loadForemen() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        // CORREÇÃO: Usar o nome da coluna do banco de dados (snake_case) para a ordenação.
        sort: 'nome_completo,asc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/encarregados?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar encarregados.');

        const pageData = await response.json();
        allForemen = pageData.content;
        renderForemenTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de encarregados.
 */
function renderForemenTable(foremen) {
    const tableBody = document.querySelector('#tabela-encarregados tbody');
    const emptyState = document.getElementById('empty-state-encarregados');
    tableBody.innerHTML = '';

    if (foremen.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-user-list"></i><h3>Nenhum resultado encontrado</h3><p>Tente ajustar seus filtros ou cadastre um novo encarregado.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        foremen.forEach(foreman => {
            const tr = document.createElement('tr');
            const statusTag = foreman.ativo
                ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>`
                : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;

            tr.innerHTML = `
                <td>${foreman.nomeCompleto}</td>
                <td>${foreman.vulgo || 'N/A'}</td>
                <td>${foreman.baseOperacional?.nomeBase || 'N/A'}</td>
                <td>${statusTag}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${foreman.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon btn-delete" data-id="${foreman.id}"><i class="ph ph-trash"></i></button>
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
    const container = document.getElementById('pagination-encarregados');
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
            <label for="items-per-page-foremen">Itens por página:</label>
            <select id="items-per-page-foremen">
                <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-foremen" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-foremen" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;

    const select = document.getElementById('items-per-page-foremen');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 0;
        loadForemen();
    });

    document.getElementById('prev-page-foremen').addEventListener('click', () => { if (!first) { currentPage--; loadForemen(); } });
    document.getElementById('next-page-foremen').addEventListener('click', () => { if (!last) { currentPage++; loadForemen(); } });
}

/**
 * Mostra o formulário de encarregado no painel lateral.
 */
function showForemanForm(foreman = null) {
    const isEdit = foreman !== null;
    const title = isEdit ? 'Editar Encarregado' : 'Novo Encarregado';

    const formBody = `
        <form id="form-foreman">
            <input type="hidden" id="foreman-id" value="${isEdit ? foreman.id : ''}">
            <div class="form-group">
                <label for="nomeCompleto">Nome Completo*</label>
                <input type="text" id="nomeCompleto" required value="${isEdit ? foreman.nomeCompleto : ''}">
            </div>
            <div class="form-group">
                <label for="vulgo">Vulgo</label>
                <input type="text" id="vulgo" value="${isEdit ? foreman.vulgo || '' : ''}">
            </div>
            <div class="form-group">
                <label for="baseOperacional">Base Operacional*</label>
                <select id="baseOperacional" required></select>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    const baseSelect = document.getElementById('baseOperacional');
    baseSelect.innerHTML = '<option value="">Selecione...</option>';
    supportData.bases?.forEach(b => baseSelect.add(new Option(b.nomeBase, b.id)));
    if (isEdit) {
        baseSelect.value = foreman.baseOperacional?.id;
    }
}

/**
 * Lida com o envio do formulário de encarregado.
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-foreman');
    const id = form.querySelector('#foreman-id').value;
    const isEdit = !!id;

    const foremanData = {
        nomeCompleto: form.querySelector('#nomeCompleto').value,
        vulgo: form.querySelector('#vulgo').value,
        baseOperacional: parseInt(form.querySelector('#baseOperacional').value),
        ativo: true, // Sempre ativo ao criar/editar
    };

    if (!foremanData.nomeCompleto || !foremanData.baseOperacional) {
        showNotification('Nome e Base Operacional são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/encarregados/${id}` : '/api/v1/encarregados';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, { method, body: JSON.stringify(foremanData) });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao ${isEdit ? 'salvar' : 'criar'} encarregado.`);
        }

        showNotification(`Encarregado ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeDrawer();
        loadForemen();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

/**
 * Lida com a importação de arquivo.
 */
async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    showNotification('Importando arquivo, por favor aguarde...', 'info');
    try {
        const response = await fetchAutenticado('/api/v1/encarregados/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');
        showImportModal(result, 'Encarregados');
        loadForemen();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}

/**
 * Lida com ações da tabela (editar/excluir).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;
    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        try {
            // No modo paginado, sempre buscamos os dados mais recentes para edição
            const response = await fetchAutenticado(`/api/v1/encarregados/${id}`);
            if (!response.ok) throw new Error('Falha ao buscar dados do encarregado.');
            const foremanToEdit = await response.json();
            showForemanForm(foremanToEdit);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir este encarregado?')) {
            try {
                const response = await fetchAutenticado(`/api/v1/encarregados/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || 'Falha ao excluir encarregado.');
                }
                showNotification('Encarregado excluído com sucesso!', 'success');
                loadForemen();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    }
}