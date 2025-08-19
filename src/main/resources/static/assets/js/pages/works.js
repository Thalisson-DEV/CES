import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showImportModal, showDrawer, closeDrawer } from '../components.js';

// Estado da página
let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    statusId: '',
    baseId: '',
    coordenadorId: '',
    supervisorId: '',
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
    document.getElementById('filter-obra-coordenador').addEventListener('change', (e) => updateFilter('coordenadorId', e.target.value));
    document.getElementById('filter-obra-supervisor').addEventListener('change', (e) => updateFilter('supervisorId', e.target.value));
    document.getElementById('busca-obra').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

async function loadSupportData() {
    try {
        if (supportData.status) return; // Carrega apenas uma vez
        const [statusRes, basesRes, coordenadoresRes, supervisoresRes] = await Promise.all([
            fetchAutenticado('/api/v1/status-obra'),
            fetchAutenticado('/api/v1/bases-operacionais'),
            fetchAutenticado('/api/v1/coordenadores'),
            fetchAutenticado('/api/v1/supervisores')
        ]);

        if (!statusRes.ok || !basesRes.ok || !coordenadoresRes.ok || !supervisoresRes.ok) {
            throw new Error('Falha ao carregar dados de suporte para obras.');
        }

        supportData.status = await statusRes.json();
        supportData.bases = await basesRes.json();
        supportData.coordenadores = (await coordenadoresRes.json()).content; // Extrai da paginação
        supportData.supervisores = await supervisoresRes.json();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateFilterDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = `<option value="">Todos</option>`;
        data?.forEach(item => {
            const text = typeof nameProp === 'function' ? nameProp(item) : item[nameProp];
            select.add(new Option(text, item[valueProp]));
        });
    };

    populate('filter-obra-status', supportData.status, 'nomeStatus');
    populate('filter-obra-base', supportData.bases, 'nomeBase');
    populate('filter-obra-coordenador', supportData.coordenadores, item => item.usuarioId?.user || 'N/A', 'id');
    populate('filter-obra-supervisor', supportData.supervisores, item => item.usuario?.nomeCompleto || 'N/A', 'id');
}

function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadWorks();
}

async function loadWorks() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,desc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/obras?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar obras.');

        const pageData = await response.json();
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

            // CORREÇÃO: Lógica para criar o link do mapa DIRETAMENTE no frontend
            const hasLocation = work.latitude && work.longitude;
            const mapsUrl = `https://www.google.com/maps?q=${work.latitude},${work.longitude}`;
            const mapButton = hasLocation
                ? `<a href="${mapsUrl}" target="_blank" class="btn-icon" title="Ver no mapa"><i class="ph ph-map-pin"></i></a>`
                : `<button class="btn-icon" disabled title="Localização indisponível"><i class="ph ph-map-pin-line"></i></button>`;

            tr.innerHTML = `
                <td>${work.numeroObra || 'N/A'}</td>
                <td>${work.titulo || 'N/A'}</td>
                <td><span class="tag">${work.status?.nomeStatus || 'N/A'}</span></td>
                <td>${work.baseObra?.nomeBase || 'N/A'}</td>
                <td>${work.dataInicio ? new Date(work.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>${work.coordenador?.username?.user || 'N/A'}</td>
                <td>${work.supervisor?.username?.user || 'N/A'}</td>
                <td class="actions">
                    ${mapButton}
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
            <label for="items-per-page-works">Itens:</label>
            <select id="items-per-page-works"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-works" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-works" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-works');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadWorks(); });
    document.getElementById('prev-page-works').addEventListener('click', () => { if (!first) { currentPage--; loadWorks(); } });
    document.getElementById('next-page-works').addEventListener('click', () => { if (!last) { currentPage++; loadWorks(); } });
}

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
            <div class="form-row">
                <div class="form-group">
                    <label for="coordenador">Coordenador</label>
                    <select id="coordenador"></select>
                </div>
                <div class="form-group">
                    <label for="supervisor">Supervisor</label>
                    <select id="supervisor"></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="latitude">Latitude</label>
                    <input type="text" id="latitude" value="${isEdit ? work.latitude || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="longitude">Longitude</label>
                    <input type="text" id="longitude" value="${isEdit ? work.longitude || '' : ''}">
                </div>
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

    const populate = (id, data, nameProp, valueProp = 'id', selected) => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Selecione...</option>';
        data?.forEach(item => {
            const text = typeof nameProp === 'function' ? nameProp(item) : item[nameProp];
            select.add(new Option(text, item[valueProp]));
        });
        if (selected) select.value = selected;
    };

    populate('status-obra', supportData.status, 'nomeStatus', 'id', isEdit ? work.status?.id : null);
    populate('base-obra', supportData.bases, 'nomeBase', 'id', isEdit ? work.baseObra?.id : null);
    populate('coordenador', supportData.coordenadores, item => item.usuarioId?.user || 'N/A', 'id', isEdit ? work.coordenador?.id : null);
    populate('supervisor', supportData.supervisores, item => item.usuarioId?.user || 'N/A', 'id', isEdit ? work.supervisor?.id : null);
}

async function handleWorkFormSubmit() {
    const form = document.getElementById('form-obra');
    const id = form.querySelector('#obra-id').value;
    const isEdit = !!id;

    const workData = {
        numeroObra: form.querySelector('#numero-obra').value,
        titulo: form.querySelector('#titulo-obra').value,
        statusId: parseInt(form.querySelector('#status-obra').value) || null,
        baseObraId: parseInt(form.querySelector('#base-obra').value) || null,
        coordenadorId: parseInt(form.querySelector('#coordenador').value) || null,
        supervisorId: parseInt(form.querySelector('#supervisor').value) || null,
        latitude: form.querySelector('#latitude').value || null,
        longitude: form.querySelector('#longitude').value || null,
        dataInicio: form.querySelector('#data-inicio').value || null,
        dataFim: form.querySelector('#data-fim').value || null,
    };

    if (!workData.numeroObra || !workData.titulo || !workData.statusId) {
        showNotification('Nº da Obra, Título e Status são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/obras/${id}` : '/api/v1/obras';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, { method, body: JSON.stringify(workData) });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Falha ao salvar obra.`);
        }
        showNotification(`Obra ${isEdit ? 'atualizada' : 'criada'} com sucesso!`, 'success');
        closeDrawer();
        loadWorks();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    showNotification('Importando arquivo...', 'info');
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

async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    // Adiciona uma verificação para ignorar cliques em links de mapa
    if (!button && e.target.closest('a')) return;
    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        try {
            const response = await fetchAutenticado(`/api/v1/obras/${id}`);
            if (!response.ok) throw new Error('Falha ao buscar dados da obra.');
            const workToEdit = await response.json();
            showWorkForm(workToEdit);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta obra?')) {
            try {
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
