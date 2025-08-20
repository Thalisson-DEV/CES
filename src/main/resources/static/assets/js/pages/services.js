import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer, showImportModal } from '../components.js';

// --- ESTADO DA PÁGINA ---
let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    contratoId: '',
    processoId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de gerenciamento de serviços.
 */
export function renderServicesPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-services');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadServices();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-novo-servico').addEventListener('click', () => showServiceForm());
    document.getElementById('btn-importar-servicos').addEventListener('click', () => document.getElementById('input-arquivo-servicos').click());
    document.getElementById('input-arquivo-servicos').addEventListener('change', handleFileImport);
    document.getElementById('busca-servico').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
    document.getElementById('filter-service-contrato').addEventListener('change', (e) => updateFilter('contratoId', e.target.value));
    document.getElementById('filter-service-processo').addEventListener('change', (e) => updateFilter('processoId', e.target.value));
    document.querySelector('#tabela-servicos tbody').addEventListener('click', handleTableActions);
}

/**
 * Carrega dados de suporte (contratos, processos) para os filtros.
 */
async function loadSupportData() {
    try {
        if (supportData.contratos) return;
        const [contratosRes, processosRes] = await Promise.all([
            fetchAutenticado('/api/v1/contratos?size=2000'),
            fetchAutenticado('/api/v1/processos')
        ]);
        if (!contratosRes.ok || !processosRes.ok) throw new Error('Falha ao carregar dados de suporte.');

        supportData.contratos = (await contratosRes.json()).content;
        supportData.processos = await processosRes.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateFilterDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        select.innerHTML = `<option value="">Todos</option>`;
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };
    populate('filter-service-contrato', supportData.contratos, 'numeroContrato');
    populate('filter-service-processo', supportData.processos, 'nomeProcesso');
}

function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadServices();
}

async function loadServices() {
    const params = new URLSearchParams({ page: currentPage, size: itemsPerPage, sort: 'codigo_servico,asc' });
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    try {
        const response = await fetchAutenticado(`/api/v1/servicos?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar serviços.');
        const pageData = await response.json();
        renderServicesTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function renderServicesTable(services) {
    const tableBody = document.querySelector('#tabela-servicos tbody');
    const emptyState = document.getElementById('empty-state-servicos');
    tableBody.innerHTML = '';
    if (services.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-wrench"></i><h3>Nenhum serviço encontrado</h3><p>Cadastre um novo serviço para começar.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        services.forEach(service => {
            const tr = tableBody.insertRow();
            const statusTag = service.ativo ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>` : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;
            tr.innerHTML = `
                <td>${service.codigoServico}</td>
                <td>${service.descricao}</td>
                <td>${service.contratoDTO?.numeroContrato || 'N/A'}</td>
                <td>${service.processo?.nomeProcesso || 'N/A'}</td>
                <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.valorReferencia)}</td>
                <td>${statusTag}</td>
                <td class="actions"><button class="btn-icon btn-edit" data-id="${service.id}" title="Editar Serviço"><i class="ph ph-pencil-simple"></i></button></td>
            `;
        });
    }
}

function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-servicos');
    if (!container) return;
    const { page, content } = pageData;
    if (page.totalElements === 0) {
        container.innerHTML = '';
        return;
    }
    const startItem = page.number * page.size + 1;
    const endItem = startItem + content.length - 1;
    container.innerHTML = `
        <div class="pagination-summary">Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${page.totalElements}</strong></div>
        <div class="pagination-size"><label for="items-per-page-services">Itens:</label><select id="items-per-page-services"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div>
        <div class="pagination-nav"><button class="btn-icon" id="prev-page-services" ${page.number === 0 ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button><span class="page-info">Página ${page.number + 1} de ${page.totalPages}</span><button class="btn-icon" id="next-page-services" ${page.number === page.totalPages - 1 ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button></div>
    `;
    const select = document.getElementById('items-per-page-services');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadServices(); });
    document.getElementById('prev-page-services').addEventListener('click', () => { if (page.number > 0) { currentPage--; loadServices(); } });
    document.getElementById('next-page-services').addEventListener('click', () => { if (page.number < page.totalPages - 1) { currentPage++; loadServices(); } });
}

function showServiceForm(service = null) {
    const isEdit = service !== null;
    const title = isEdit ? 'Editar Serviço' : 'Novo Serviço';
    const activeSelectHTML = isEdit ? `<div class="form-group"><label for="ativo">Status</label><select id="ativo"><option value="true" ${service.ativo ? 'selected' : ''}>Ativo</option><option value="false" ${!service.ativo ? 'selected' : ''}>Inativo</option></select></div>` : '';
    const formBody = `
        <form id="form-service">
            <input type="hidden" id="service-id" value="${isEdit ? service.id : ''}">
            <div class="form-row"><div class="form-group"><label for="codigoServico">Código do Serviço*</label><input type="text" id="codigoServico" required value="${isEdit ? service.codigoServico : ''}"></div><div class="form-group"><label for="unidadeMedida">Unidade de Medida*</label><input type="text" id="unidadeMedida" required value="${isEdit ? service.unidadeMedida : ''}"></div></div>
            <div class="form-group"><label for="descricao">Descrição*</label><input type="text" id="descricao" required value="${isEdit ? service.descricao : ''}"></div>
            <div class="form-row"><div class="form-group"><label for="contrato">Contrato*</label><select id="contrato" required></select></div><div class="form-group"><label for="processo">Processo*</label><select id="processo" required></select></div></div>
            <div class="form-row"><div class="form-group"><label for="grupoMercadoria">Grupo da Mercadoria</label><input type="text" id="grupoMercadoria" value="${isEdit ? service.grupoMercadoria || '' : ''}"></div><div class="form-group"><label for="valorReferencia">Valor de Referência*</label><input type="number" id="valorReferencia" required min="0" step="0.01" value="${isEdit ? service.valorReferencia : ''}"></div></div>
            <div class="form-group"><label for="textoLongo">Texto Longo (Descrição Detalhada)</label><textarea id="textoLongo" rows="4">${isEdit ? service.textoLongo || '' : ''}</textarea></div>
            ${activeSelectHTML}
        </form>
    `;
    showDrawer({ title, body: formBody, onSave: handleFormSubmit });
    const populate = (id, data, nameProp, valueProp = 'id', selected) => {
        const select = document.getElementById(id);
        select.innerHTML = `<option value="">Selecione...</option>`;
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
        if (selected) select.value = selected;
    };
    populate('contrato', supportData.contratos, 'numeroContrato', 'id', isEdit ? service.contratoDTO?.id : null);
    populate('processo', supportData.processos, 'nomeProcesso', 'id', isEdit ? service.processo?.id : null);
}

async function handleFormSubmit() {
    const form = document.getElementById('form-service');
    const id = form.querySelector('#service-id').value;
    const isEdit = !!id;
    const serviceData = {
        codigoServico: form.querySelector('#codigoServico').value,
        descricao: form.querySelector('#descricao').value,
        unidadeMedida: form.querySelector('#unidadeMedida').value,
        grupoMercadoria: form.querySelector('#grupoMercadoria').value,
        processo: parseInt(form.querySelector('#processo').value) || null,
        contrato: parseInt(form.querySelector('#contrato').value) || null,
        valorReferencia: parseFloat(form.querySelector('#valorReferencia').value) || 0,
        textoLongo: form.querySelector('#textoLongo').value,
        ativo: isEdit ? form.querySelector('#ativo').value === 'true' : true,
    };
    if (!serviceData.codigoServico || !serviceData.descricao || !serviceData.unidadeMedida || !serviceData.contrato || !serviceData.processo) {
        showNotification('Todos os campos com * são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }
    const endpoint = isEdit ? `/api/v1/servicos/${id}` : '/api/v1/servicos';
    const method = isEdit ? 'PUT' : 'POST';
    try {
        const response = await fetchAutenticado(endpoint, { method, body: JSON.stringify(serviceData) });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao salvar serviço.`);
        }
        showNotification(`Serviço ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeDrawer();
        loadServices();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button || !button.classList.contains('btn-edit')) return;
    const id = button.dataset.id;
    try {
        const response = await fetchAutenticado(`/api/v1/servicos/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do serviço.');
        const serviceToEdit = await response.json();
        showServiceForm(serviceToEdit);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    showNotification('Importando arquivo...', 'info');
    try {
        const response = await fetchAutenticado('/api/v1/servicos/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');
        showImportModal(result, 'Serviços');
        loadServices();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}
