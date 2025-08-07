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
    const tableContainer = document.querySelector('#template-materials .table-container');

    tableBody.innerHTML = '';

    if (materials.length === 0 && document.getElementById('busca-material').value === '') {
        emptyState.style.display = 'flex';
        tableContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        materials.forEach(material => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${material.codigoMaterial}</td>
                <td>${material.nomeMaterial}</td>
                <td>${material.unidadeMedida}</td>
                <td><span class="tag">${material.suprMatr || 'N/A'}</span></td>
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
                    <input type="text" id="supr-matr" required value="${isEdit ? material.suprMatr || '' : ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="centro">Centro*</label>
                <input type="text" id="centro" required value="${isEdit ? material.centro || '' : ''}">
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    // Preenche o select de unidades após o drawer ser renderizado
    const selectUnidade = document.getElementById('unidade-medida');
    const unidades = ['UN', 'KG', 'M', 'M2', 'M3', 'L', 'CX', 'PC'];
    unidades.forEach(un => {
        const option = new Option(un, un);
        selectUnidade.add(option);
    });
    if (isEdit) {
        selectUnidade.value = material.unidadeMedida;
    }
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
        centro: form.querySelector('#centro').value,
    };

    // Validação simples
    if (!materialData.codigoMaterial || !materialData.nomeMaterial) {
        showNotification('Código e Nome são obrigatórios.', 'error');
        throw new Error('Validation failed'); // Impede o fechamento do drawer
    }

    const endpoint = isEdit ? `/api/v1/material/${id}` : '/api/v1/material';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, {
            method,
            body: JSON.stringify(materialData)
        });
        if (!response.ok) throw new Error(`Falha ao ${isEdit ? 'atualizar' : 'criar'} material.`);

        showNotification(`Material ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeDrawer();
        loadMaterials();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error; // Re-lança o erro para o `onSave` saber que falhou
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
