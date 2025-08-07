import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showImportModal, showDrawer, closeDrawer } from '../components.js';

// Estado da página
let allWorks = [];
let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    statusId: '',
    baseId: '',
    searchTerm: ''
};

export function renderWorksPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-works');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupWorksEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadWorks();
    });
}

function setupWorksEventListeners() {
    // Ações principais
    document.getElementById('btn-nova-obra').addEventListener('click', () => showWorkForm());
    document.getElementById('btn-importar-obras').addEventListener('click', () => document.getElementById('input-arquivo-obras').click());
    document.getElementById('input-arquivo-obras').addEventListener('change', handleFileImport);
    document.querySelector('#tabela-obras tbody').addEventListener('click', handleTableActions);

    // Filtros
    document.getElementById('filter-obra-status').addEventListener('change', (e) => updateFilter('statusId', e.target.value));
    document.getElementById('filter-obra-base').addEventListener('change', (e) => updateFilter('baseId', e.target.value));
    document.getElementById('busca-obra').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

async function loadSupportData() {
    try {
        if (supportData.status && supportData.bases) return;
        const [statusRes, basesRes] = await Promise.all([
            fetchAutenticado('/api/v1/status-obra'),
            fetchAutenticado('/api/v1/bases-operacionais')
        ]);
        if (!statusRes.ok || !basesRes.ok) throw new Error('Falha ao carregar dados de suporte.');

        supportData.status = await statusRes.json();
        supportData.bases = await basesRes.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateFilterDropdowns() {
    const statusSelect = document.getElementById('filter-obra-status');
    const baseSelect = document.getElementById('filter-obra-base');

    statusSelect.innerHTML = '<option value="">Todos os Status</option>';
    supportData.status?.forEach(s => statusSelect.add(new Option(s.nomeStatus, s.id)));

    baseSelect.innerHTML = '<option value="">Todas as Bases</option>';
    supportData.bases?.forEach(b => baseSelect.add(new Option(b.nomeBase, b.id)));
}

function updateFilter(key, value) {
    currentPage = 0; // Reseta para a primeira página ao aplicar um filtro
    currentFilters[key] = value;
    loadWorks();
}

async function loadWorks() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,desc' // Exemplo de ordenação
    });

    // Adiciona filtros à URL apenas se tiverem valor
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
            params.append(key, value);
        }
    });

    try {
        const response = await fetchAutenticado(`/api/v1/obras?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar obras.');

        const pageData = await response.json();
        allWorks = pageData.content;
        renderWorksTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function renderWorksTable(works) {
    const tableBody = document.querySelector('#tabela-obras tbody');
    const emptyState = document.getElementById('empty-state-obras');
    tableBody.innerHTML = '';

    if (works.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-magnifying-glass"></i><h3>Nenhum resultado encontrado</h3><p>Tente ajustar seus filtros ou cadastrar uma nova obra.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        works.forEach(work => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${work.numeroObra || 'N/A'}</td>
                <td>${work.titulo || 'N/A'}</td>
                <td><span class="tag">${work.status?.nomeStatus || 'N/A'}</span></td>
                <td>${work.baseObra?.nomeBase || 'N/A'}</td>
                <td>${work.dataInicio ? new Date(work.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${work.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon btn-delete" data-id="${work.id}"><i class="ph ph-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-obras');
    if (!container) return;

    const { totalElements, totalPages, number: currentPageIndex, size, first, last } = pageData;

    if (totalElements === 0) {
        container.innerHTML = '';
        return;
    }

    const startItem = currentPageIndex * size + 1;
    const endItem = startItem + pageData.numberOfElements - 1;

    container.innerHTML = `
        <div class="pagination-summary">
            Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${totalElements}</strong>
        </div>
        <div class="pagination-size">
            <label for="items-per-page">Itens por página:</label>
            <select id="items-per-page">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="1000">1000</option>
            </select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${currentPageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;

    const itemsPerPageSelect = document.getElementById('items-per-page');
    itemsPerPageSelect.value = itemsPerPage;

    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 0;
        loadWorks();
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (!first) {
            currentPage--;
            loadWorks();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (!last) {
            currentPage++;
            loadWorks();
        }
    });
}

/**
 * Mostra o formulário de obra no painel lateral.
 */
function showWorkForm(work = null) {
    const isEdit = work !== null;
    const title = isEdit ? 'Editar Obra' : 'Nova Obra';

    const formBody = `
        <form id="form-obra">
            <input type="hidden" id="obra-id" value="${isEdit ? work.id : ''}">
            <div class="form-group">
                <label for="numero-obra">Nº da Obra*</label>
                <input type="text" id="numero-obra" required value="${isEdit ? work.numeroObra : ''}">
            </div>
            <div class="form-group">
                <label for="titulo-obra">Título*</label>
                <input type="text" id="titulo-obra" required value="${isEdit ? work.titulo : ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="status-obra">Status*</label>
                    <select id="status-obra" required></select>
                </div>
                <div class="form-group">
                    <label for="base-obra">Base da Obra*</label>
                    <select id="base-obra" required></select>
                </div>
            </div>
            <div class="form-group">
                <label for="base-saque">Base de Saque*</label>
                <select id="base-saque" required></select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="data-inicio">Data de Início</label>
                    <input type="date" id="data-inicio" value="${isEdit && work.dataInicio ? work.dataInicio.split('T')[0] : ''}">
                </div>
                <div class="form-group">
                    <label for="data-fim">Data de Fim</label>
                    <input type="date" id="data-fim" value="${isEdit && work.dataFim ? work.dataFim.split('T')[0] : ''}">
                </div>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleWorkFormSubmit });

    const statusSelect = document.getElementById('status-obra');
    const baseObraSelect = document.getElementById('base-obra');
    const baseSaqueSelect = document.getElementById('base-saque');

    [statusSelect, baseObraSelect, baseSaqueSelect].forEach(s => s.innerHTML = '<option value="">Selecione...</option>');

    supportData.status?.forEach(s => statusSelect.add(new Option(s.nomeStatus, s.id)));
    supportData.bases?.forEach(b => {
        baseObraSelect.add(new Option(b.nomeBase, b.id));
        baseSaqueSelect.add(new Option(b.nomeBase, b.id));
    });

    if (isEdit) {
        statusSelect.value = work.status?.id;
        baseObraSelect.value = work.baseObra?.id;
        baseSaqueSelect.value = work.baseSaque?.id;
    }
}

/**
 * Lida com o envio do formulário de obra.
 */
async function handleWorkFormSubmit() {
    const form = document.getElementById('form-obra');
    const id = form.querySelector('#obra-id').value;
    const isEdit = !!id;

    const workData = {
        numeroObra: form.querySelector('#numero-obra').value,
        titulo: form.querySelector('#titulo-obra').value,
        statusObra: parseInt(form.querySelector('#status-obra').value),
        baseObra: parseInt(form.querySelector('#base-obra').value),
        baseSaque: parseInt(form.querySelector('#base-saque').value),
        dataInicio: form.querySelector('#data-inicio').value || null,
        dataFim: form.querySelector('#data-fim').value || null,
        ativo: true,
    };

    if (!workData.numeroObra || !workData.titulo || !workData.statusObra) {
        showNotification('Nº da Obra, Título e Status são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/obras/${id}` : '/api/v1/obras';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, {
            method,
            body: JSON.stringify(workData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Falha ao ${isEdit ? 'atualizar' : 'criar'} obra.`);
        }

        showNotification(`Obra ${isEdit ? 'atualizada' : 'criada'} com sucesso!`, 'success');
        closeDrawer();
        loadWorks();
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
        const response = await fetchAutenticado('/api/v1/obras/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');

        showImportModal(result, 'Obras');
        loadWorks();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}

/**
 * Lida com a busca na tabela.
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredWorks = allWorks.filter(work =>
        work.titulo?.toLowerCase().includes(searchTerm) ||
        work.numeroObra?.toLowerCase().includes(searchTerm)
    );
    renderWorksTable(filteredWorks);
}

/**
 * Lida com ações da tabela.
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        const workToEdit = allWorks.find(w => w.id == id);
        if (workToEdit) {
            showWorkForm(workToEdit);
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta obra?')) {
            try {
                // CORREÇÃO: O endpoint para deletar agora inclui o ID na URL.
                const response = await fetchAutenticado(`/api/v1/obras/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir obra.');
                showNotification('Obra excluída com sucesso!', 'success');
                loadWorks();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    }
}
