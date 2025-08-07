import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer } from '../components.js';

let allMaterials = []; // Cache da lista de materiais

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
    loadMaterials();
}

/**
 * Configura os event listeners da página.
 */
function setupMaterialsEventListeners() {
    document.getElementById('btn-novo-material').addEventListener('click', () => showMaterialForm());
    document.getElementById('busca-material').addEventListener('input', handleSearch);
    document.querySelector('#tabela-materiais tbody').addEventListener('click', handleTableActions);
}

/**
 * Carrega os materiais da API e renderiza a tabela.
 */
async function loadMaterials() {
    try {
        const response = await fetchAutenticado('/api/v1/material');
        if (!response.ok) throw new Error('Falha ao carregar materiais.');

        const materials = await response.json();
        allMaterials = materials;
        renderMaterialsTable(materials);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de materiais.
 * @param {Array} materials - A lista de materiais a ser renderizada.
 */
function renderMaterialsTable(materials) {
    const tableBody = document.querySelector('#tabela-materiais tbody');
    const emptyState = document.getElementById('empty-state-materiais');
    const tableContainer = document.querySelector('#page-content .table-container');

    if (!tableBody || !emptyState || !tableContainer) {
        console.error('Elementos da tabela de materiais não encontrados no DOM.');
        return;
    }

    tableBody.innerHTML = '';

    if (materials.length === 0 && document.getElementById('busca-material').value === '') {
        emptyState.style.display = 'flex';
        tableContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        materials.forEach(material => {
            const tr = document.createElement('tr');
            // MELHORIA: Adicionada a coluna "Avaliação" na tabela.
            // Lembre-se de adicionar o <th>Avaliação</th> no seu template HTML.
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
 * Mostra o formulário de material dentro do painel lateral (drawer).
 * @param {object|null} material - O material para editar, ou null para criar um novo.
 */
function showMaterialForm(material = null) {
    const isEdit = material !== null;
    const title = isEdit ? 'Editar Material' : 'Novo Material';

    // MELHORIA: Inputs de texto foram trocados por selects.
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

    // Helper para popular os selects de forma mais limpa
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

    // Popula todos os campos de seleção
    populateSelect('unidade-medida', ['UN', 'KG', 'M', 'M2', 'M3', 'L', 'CX', 'PC'], isEdit ? material.unidadeMedida : null);
    populateSelect('supr-matr', ['SUPR', 'MATR'], isEdit ? material.suprMatr : null);
    populateSelect('avaliacao', ['INVEST', 'MANUT', 'SUCATA', 'RECUP'], isEdit ? material.avaliacao : null);
    populateSelect('centro', ['610', '670'], isEdit ? material.centro : null);
}

/**
 * Lida com o envio do formulário de material (criar/editar).
 */
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

    // MELHORIA: Validação mais completa
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

/**
 * Lida com a busca na tabela.
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMaterials = allMaterials.filter(material =>
        material.nomeMaterial?.toLowerCase().includes(searchTerm) ||
        material.codigoMaterial?.toLowerCase().includes(searchTerm) ||
        material.suprMatr?.toLowerCase().includes(searchTerm) ||
        material.avaliacao?.toLowerCase().includes(searchTerm) ||
        material.centro?.toLowerCase().includes(searchTerm)
    );
    renderMaterialsTable(filteredMaterials);
}

/**
 * Lida com cliques nos botões de ação da tabela (editar/excluir).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        const materialToEdit = allMaterials.find(m => m.id == id);
        if (materialToEdit) {
            showMaterialForm(materialToEdit);
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