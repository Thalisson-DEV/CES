import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer, showImportModal } from '../components.js';

// Estado da página
let allMaterials = [];
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    suprMatr: '',
    avaliacao: '',
    centro: '',
    searchTerm: ''
};

/**
 * Renderiza a página de materiais.
 */
export function renderMaterialsPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-materials');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupMaterialsEventListeners();
    loadMaterials(); // Carrega os dados iniciais
}

/**
 * Configura os event listeners da página.
 */
function setupMaterialsEventListeners() {
    // Ações principais
    document.getElementById('btn-novo-material').addEventListener('click', () => showMaterialForm());
    document.getElementById('btn-importar-materiais').addEventListener('click', () => document.getElementById('input-arquivo-materiais').click());
    document.getElementById('input-arquivo-materiais').addEventListener('change', handleFileImport);
    document.querySelector('#tabela-materiais tbody').addEventListener('click', handleTableActions);

    // Filtros
    document.getElementById('filter-material-tipo').addEventListener('change', (e) => updateFilter('suprMatr', e.target.value));
    document.getElementById('filter-material-avaliacao').addEventListener('change', (e) => updateFilter('avaliacao', e.target.value));
    document.getElementById('filter-material-centro').addEventListener('change', (e) => updateFilter('centro', e.target.value));
    document.getElementById('busca-material').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Atualiza um valor de filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0; // Reseta para a primeira página ao aplicar um filtro
    currentFilters[key] = value;
    loadMaterials();
}

/**
 * Carrega os materiais da API de forma paginada e com filtros.
 */
async function loadMaterials() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,desc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
            params.append(key, value);
        }
    });

    try {
        const response = await fetchAutenticado(`/api/v1/material?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar materiais.');

        const pageData = await response.json();
        allMaterials = pageData.content; // Armazena apenas os materiais da página atual
        renderMaterialsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de materiais.
 */
function renderMaterialsTable(materials) {
    const tableBody = document.querySelector('#tabela-materiais tbody');
    const emptyState = document.getElementById('empty-state-materiais');
    tableBody.innerHTML = '';

    if (materials.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-magnifying-glass"></i><h3>Nenhum resultado encontrado</h3><p>Tente ajustar seus filtros ou cadastrar um novo material.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        materials.forEach(material => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${material.codigoMaterial}</td>
                <td>${material.nomeMaterial}</td>
                <td>${material.unidadeMedida}</td>
                <td><span class="tag">${material.suprMatr || 'N/A'}</span></td>
                <td>${material.avaliacao || 'N/A'}</td>
                <td>${material.centro}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${material.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon btn-delete" data-id="${material.id}"><i class="ph ph-trash"></i></button>
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
    const container = document.getElementById('pagination-materiais');
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
            <label for="items-per-page-mat">Itens por página:</label>
            <select id="items-per-page-mat">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="1000">1000</option>
            </select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-mat" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${currentPageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-mat" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;

    const itemsPerPageSelect = document.getElementById('items-per-page-mat');
    itemsPerPageSelect.value = itemsPerPage;

    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 0;
        loadMaterials();
    });

    document.getElementById('prev-page-mat').addEventListener('click', () => {
        if (!first) {
            currentPage--;
            loadMaterials();
        }
    });

    document.getElementById('next-page-mat').addEventListener('click', () => {
        if (!last) {
            currentPage++;
            loadMaterials();
        }
    });
}

// As funções abaixo (showMaterialForm, handleFormSubmit, handleFileImport, handleTableActions)
// permanecem as mesmas da versão anterior, pois já estão corretas.

function showMaterialForm(material = null) {
    const isEdit = material !== null;
    const title = isEdit ? 'Editar Material' : 'Novo Material';

    const formBody = `
        <form id="form-material" class="drawer-form">
            <input type="hidden" id="material-id" value="${isEdit ? material.id : ''}">
            <div class="form-group">
                <label for="codigo-material">Código*</label>
                <input type="text" id="codigo-material" required value="${isEdit ? material.codigoMaterial : ''}">
            </div>
            <div class="form-group">
                <label for="nome-material">Nome*</label>
                <input type="text" id="nome-material" required value="${isEdit ? material.nomeMaterial : ''}">
            </div>
            <div class="form-group">
                <label for="descricao-material">Descrição</label>
                <textarea id="descricao-material" rows="3">${isEdit ? material.descricao || '' : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="unidade-medida">Unidade*</label>
                    <select id="unidade-medida" required></select>
                </div>
                <div class="form-group">
                    <label for="supr-matr">Tipo (Supr/Matr)*</label>
                    <select id="supr-matr" required></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="avaliacao">Avaliação*</label>
                    <select id="avaliacao" required></select>
                </div>
                <div class="form-group">
                    <label for="centro">Centro*</label>
                    <select id="centro" required></select>
                </div>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    const populateSelect = (elementId, options, selectedValue) => {
        const select = document.getElementById(elementId);
        if (!select) return;
        select.innerHTML = '<option value="">Selecione...</option>';
        options.forEach(opt => {
            const option = new Option(opt, opt);
            select.add(option);
        });
        if (selectedValue) {
            select.value = selectedValue;
        }
    };

    populateSelect('unidade-medida', ['UN', 'KG', 'M', 'M2', 'M3', 'L', 'CX', 'PC'], isEdit ? material.unidadeMedida : null);
    populateSelect('supr-matr', ['SUPR', 'MATR'], isEdit ? material.suprMatr : null);
    populateSelect('avaliacao', ['INVEST', 'MANUT', 'SUCATA', 'RECUP'], isEdit ? material.avaliacao : null);
    populateSelect('centro', ['610', '670'], isEdit ? material.centro : null);
}

async function handleFormSubmit() {
    const form = document.getElementById('form-material');
    if(!form) return;

    const id = form.querySelector('#material-id').value;
    const isEdit = !!id;

    const materialData = {
        codigoMaterial: form.querySelector('#codigo-material').value,
        nomeMaterial: form.querySelector('#nome-material').value,
        descricao: form.querySelector('#descricao-material').value,
        unidadeMedida: form.querySelector('#unidade-medida').value,
        suprMatr: form.querySelector('#supr-matr').value,
        avaliacao: form.querySelector('#avaliacao').value,
        centro: form.querySelector('#centro').value,
    };

    if (!materialData.codigoMaterial || !materialData.nomeMaterial || !materialData.unidadeMedida || !materialData.suprMatr || !materialData.avaliacao || !materialData.centro) {
        showNotification('Todos os campos com * são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/material/${id}` : '/api/v1/material';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, {
            method,
            body: JSON.stringify(materialData)
        });

        if (!response.ok) {
            let errorMsg = `Falha ao ${isEdit ? 'atualizar' : 'criar'} material.`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMsg = errorData.message;
                }
            } catch (e) {
                console.warn('Não foi possível parsear a resposta de erro como JSON.');
            }
            throw new Error(errorMsg);
        }

        showNotification(`Material ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeDrawer();
        loadMaterials();
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

    showNotification('Importando arquivo, por favor aguarde...', 'info');

    try {
        const response = await fetchAutenticado('/api/v1/material/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');

        showImportModal(result, 'Materiais');
        loadMaterials();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}

async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        // Para editar, precisamos buscar o material completo da API,
        // pois a lista `allMaterials` só tem os itens da página atual.
        try {
            const response = await fetchAutenticado(`/api/v1/material/${id}`);
            if (!response.ok) throw new Error('Falha ao buscar dados do material para edição.');
            const materialToEdit = await response.json();
            showMaterialForm(materialToEdit);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir este material?')) {
            try {
                const response = await fetchAutenticado(`/api/v1/material/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir material.');
                showNotification('Material excluído com sucesso!', 'success');
                loadMaterials();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    }
}
