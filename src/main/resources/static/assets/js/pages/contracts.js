import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer } from '../components.js';

// --- ESTADO DA PÁGINA ---
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    searchTerm: ''
};

/**
 * Renderiza a página de gerenciamento de contratos.
 */
export function renderContractsPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-contracts');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadContracts();
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-novo-contrato').addEventListener('click', () => showContractForm());
    document.getElementById('busca-contrato').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
    document.querySelector('#tabela-contratos tbody').addEventListener('click', handleTableActions);
}

/**
 * Atualiza um filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadContracts();
}

/**
 * Carrega os contratos da API de forma paginada.
 */
async function loadContracts() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'numero_contrato,asc'
    });

    if (currentFilters.searchTerm) {
        params.append('searchTerm', currentFilters.searchTerm);
    }

    try {
        const response = await fetchAutenticado(`/api/v1/contratos?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar contratos.');

        const pageData = await response.json();
        renderContractsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de contratos.
 */
function renderContractsTable(contracts) {
    const tableBody = document.querySelector('#tabela-contratos tbody');
    const emptyState = document.getElementById('empty-state-contratos');
    tableBody.innerHTML = '';

    if (contracts.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-files"></i><h3>Nenhum contrato encontrado</h3><p>Cadastre um novo contrato para começar.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        contracts.forEach(contract => {
            const tr = tableBody.insertRow();
            const statusTag = contract.ativo
                ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>`
                : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;

            tr.innerHTML = `
                <td>${contract.numeroContrato}</td>
                <td>${contract.descricao || 'N/A'}</td>
                <td>${contract.dataInicio ? new Date(contract.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>${contract.dataFim ? new Date(contract.dataFim).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>${statusTag}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${contract.id}" title="Editar Contrato">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                </td>
            `;
        });
    }
}

/**
 * Renderiza os controles de paginação.
 */
function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-contratos');
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
        <div class="pagination-size"><label for="items-per-page-contracts">Itens:</label><select id="items-per-page-contracts"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div>
        <div class="pagination-nav"><button class="btn-icon" id="prev-page-contracts" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button><span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span><button class="btn-icon" id="next-page-contracts" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button></div>
    `;
    const select = document.getElementById('items-per-page-contracts');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadContracts(); });
    document.getElementById('prev-page-contracts').addEventListener('click', () => { if (!first) { currentPage--; loadContracts(); } });
    document.getElementById('next-page-contracts').addEventListener('click', () => { if (!last) { currentPage++; loadContracts(); } });
}

/**
 * Mostra o formulário de contrato no painel lateral.
 */
function showContractForm(contract = null) {
    const isEdit = contract !== null;
    const title = isEdit ? 'Editar Contrato' : 'Novo Contrato';

    const activeStatusSelectHTML = isEdit ? `
        <div class="form-group">
            <label for="ativo">Status do Contrato</label>
            <select id="ativo">
                <option value="true" ${contract.ativo ? 'selected' : ''}>Ativo</option>
                <option value="false" ${!contract.ativo ? 'selected' : ''}>Inativo</option>
            </select>
        </div>
    ` : '';

    const formBody = `
        <form id="form-contract">
            <input type="hidden" id="contract-id" value="${isEdit ? contract.id : ''}">
            <div class="form-group">
                <label for="numeroContrato">Número do Contrato*</label>
                <input type="text" id="numeroContrato" required value="${isEdit ? contract.numeroContrato : ''}">
            </div>
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea id="descricao" rows="4">${isEdit ? contract.descricao || '' : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="dataInicio">Data de Início</label>
                    <input type="date" id="dataInicio" value="${isEdit && contract.dataInicio ? contract.dataInicio.split('T')[0] : ''}">
                </div>
                <div class="form-group">
                    <label for="dataFim">Data de Fim</label>
                    <input type="date" id="dataFim" value="${isEdit && contract.dataFim ? contract.dataFim.split('T')[0] : ''}">
                </div>
            </div>
            ${activeStatusSelectHTML}
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });
}

/**
 * Lida com o envio do formulário de contrato.
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-contract');
    const id = form.querySelector('#contract-id').value;
    const isEdit = !!id;

    const contractData = {
        numeroContrato: form.querySelector('#numeroContrato').value,
        descricao: form.querySelector('#descricao').value,
        dataInicio: form.querySelector('#dataInicio').value || null,
        dataFim: form.querySelector('#dataFim').value || null,
    };

    if (isEdit) {
        contractData.ativo = form.querySelector('#ativo').value === 'true';
    }

    if (!contractData.numeroContrato) {
        showNotification('O número do contrato é obrigatório.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/contratos/${id}` : '/api/v1/contratos';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, { method, body: JSON.stringify(contractData) });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao salvar contrato.`);
        }
        showNotification(`Contrato ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeDrawer();
        loadContracts();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

/**
 * Lida com ações da tabela (editar).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button || !button.classList.contains('btn-edit')) return;

    const id = button.dataset.id;
    try {
        const response = await fetchAutenticado(`/api/v1/contratos/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do contrato.');
        const contractToEdit = await response.json();
        showContractForm(contractToEdit);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}
