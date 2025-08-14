import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

// --- ESTADO DA PÁGINA ---
let supportData = {
    equipes: [],
    processos: [],
    materiais: []
};
let addedItems = [];
let selectedMaterial = null;

/**
 * Renderiza a página de nova solicitação de materiais.
 */
export function renderNewCommercialRequestPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-new-material-request'); // O ID do template no seu HTML
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    resetFormState();
    setupEventListeners();
    loadSupportData();
    updateMenuActiveState();
}

/**
 * Carrega dados de suporte (equipes, processos, materiais) da API.
 */
async function loadSupportData() {
    try {
        const [equipesRes, processosRes, materiaisRes] = await Promise.all([
            fetchAutenticado('/api/v1/equipes?size=2000&sort=nome_equipe,asc'),
            fetchAutenticado('/api/v1/processos?sort=nome_processo,asc'),
            fetchAutenticado('/api/v1/material?size=2000&sort=nome_material,asc')
        ]);

        if (!equipesRes.ok || !processosRes.ok || !materiaisRes.ok) {
            throw new Error('Falha ao carregar dados de suporte.');
        }

        const equipesData = await equipesRes.json();
        supportData.equipes = equipesData.content || [];
        supportData.processos = await processosRes.json();
        const materiaisData = await materiaisRes.json();
        supportData.materiais = materiaisData.content || [];

        populateHeaderDropdowns();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Configura todos os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-proceed-to-items').addEventListener('click', handleProceedToItems);
    document.getElementById('btn-cancel-header').addEventListener('click', resetFormState);
    document.getElementById('section-request-items').addEventListener('click', handleItemsSectionActions);
    document.getElementById('form-add-item').addEventListener('submit', handleAddItem);

    const searchInput = document.getElementById('search-material-input');
    const resultsDropdown = document.getElementById('material-results-dropdown');
    searchInput.addEventListener('input', handleMaterialSearch);
    searchInput.addEventListener('blur', () => setTimeout(() => resultsDropdown.style.display = 'none', 150));
    resultsDropdown.addEventListener('mousedown', handleMaterialSelect);
}

/**
 * Lida com cliques na seção de itens usando delegação de eventos.
 */
function handleItemsSectionActions(e) {
    const target = e.target;
    if (target.closest('#btn-back-to-header')) {
        handleBackToHeader();
    } else if (target.closest('#btn-save-request')) {
        handleSaveRequest();
    } else if (target.closest('.btn-delete-item')) {
        const materialId = parseInt(target.closest('.btn-delete-item').dataset.id);
        handleRemoveItem(materialId);
    }
}

function handleProceedToItems() {
    const equipeEl = document.getElementById('request-equipe');
    const processoEl = document.getElementById('request-processo');

    if (!equipeEl.value || !processoEl.value) {
        showNotification('Equipe e Processo são obrigatórios para prosseguir.', 'error');
        return;
    }
    document.getElementById('section-request-items').classList.remove('hidden');
    document.getElementById('page-subtitle').textContent = 'Passo 2 de 2: Adicione os materiais necessários.';
    equipeEl.disabled = true;
    processoEl.disabled = true;
    document.getElementById('request-observacoes').disabled = true;
    document.getElementById('btn-proceed-to-items').classList.add('hidden');
    document.getElementById('btn-cancel-header').classList.add('hidden');
}

function handleBackToHeader() {
    document.getElementById('section-request-items').classList.add('hidden');
    document.getElementById('page-subtitle').textContent = 'Passo 1 de 2: Preencha os detalhes da solicitação.';
    document.getElementById('request-equipe').disabled = false;
    document.getElementById('request-processo').disabled = false;
    document.getElementById('request-observacoes').disabled = false;
    document.getElementById('btn-proceed-to-items').classList.remove('hidden');
    document.getElementById('btn-cancel-header').classList.remove('hidden');
}

function handleMaterialSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const resultsDropdown = document.getElementById('material-results-dropdown');
    if (searchTerm.length < 2) {
        resultsDropdown.style.display = 'none';
        return;
    }
    const filtered = supportData.materiais.filter(m =>
        m.nomeMaterial.toLowerCase().includes(searchTerm) ||
        m.codigoMaterial.toLowerCase().includes(searchTerm)
    );
    if (filtered.length > 0) {
        resultsDropdown.innerHTML = filtered.map(item => `
            <div class="result-item" data-id="${item.id}">
                ${item.nomeMaterial}
                <small>Código: ${item.codigoMaterial}</small>
            </div>
        `).join('');
        resultsDropdown.style.display = 'block';
    } else {
        resultsDropdown.style.display = 'none';
    }
}

function handleMaterialSelect(e) {
    const itemElement = e.target.closest('.result-item');
    if (!itemElement) return;
    const materialId = parseInt(itemElement.dataset.id);
    selectedMaterial = supportData.materiais.find(m => m.id === materialId);
    if (selectedMaterial) {
        document.getElementById('search-material-input').value = selectedMaterial.nomeMaterial;
        document.getElementById('material-results-dropdown').style.display = 'none';
        document.getElementById('item-quantity').focus();
    }
}

function handleAddItem(e) {
    e.preventDefault();
    const quantityInput = document.getElementById('item-quantity');
    const quantityValue = quantityInput.value.replace(',', '.');
    const quantidade = parseFloat(quantityValue);

    if (!selectedMaterial) {
        showNotification('Selecione um material válido da lista.', 'error');
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        showNotification('Informe uma quantidade numérica válida e maior que zero.', 'error');
        return;
    }
    if (addedItems.some(item => item.materialId === selectedMaterial.id)) {
        showNotification('Este material já foi adicionado. Remova-o para alterar a quantidade.', 'error');
        return;
    }

    addedItems.push({
        materialId: selectedMaterial.id,
        nomeMaterial: selectedMaterial.nomeMaterial,
        codigoMaterial: selectedMaterial.codigoMaterial,
        quantidade: quantidade,
    });

    renderAddedItemsTable();
    resetAddItemForm();
}

function handleRemoveItem(materialId) {
    addedItems = addedItems.filter(item => item.materialId !== materialId);
    renderAddedItemsTable();
}

function populateHeaderDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        select.innerHTML = `<option value="">Selecione...</option>`;
        data.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };
    populate('request-equipe', supportData.equipes, 'nomeEquipe');
    populate('request-processo', supportData.processos, 'nomeProcesso');
}

function renderAddedItemsTable() {
    const tableBody = document.querySelector('#table-added-items tbody');
    const emptyState = document.getElementById('empty-state-items');
    tableBody.innerHTML = '';

    if (addedItems.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-list-plus"></i><h3>Nenhum item adicionado</h3><p>Use o formulário acima para incluir materiais na sua solicitação.</p>`;
        emptyState.style.display = 'flex';
        tableBody.parentElement.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableBody.parentElement.style.display = 'table';
        addedItems.forEach(item => {
            const tr = tableBody.insertRow();
            tr.innerHTML = `
                <td>${item.nomeMaterial}</td>
                <td>${item.codigoMaterial}</td>
                <td>${item.quantidade}</td>
                <td class="actions">
                    <button class="btn-icon btn-delete-item" data-id="${item.materialId}" title="Remover Item">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            `;
        });
    }
}

function resetAddItemForm() {
    document.getElementById('form-add-item').reset();
    selectedMaterial = null;
    document.getElementById('search-material-input').focus();
}

function resetFormState() {
    document.getElementById('form-request-header').reset();
    addedItems = [];
    handleBackToHeader();
    renderAddedItemsTable();
    resetAddItemForm();
}

async function handleSaveRequest() {
    const saveButton = document.getElementById('btn-save-request');
    const equipeId = parseInt(document.getElementById('request-equipe').value);
    const processoId = parseInt(document.getElementById('request-processo').value);

    if (!equipeId || !processoId) {
        showNotification('Erro de validação: Equipe e Processo devem ser selecionados corretamente.', 'error');
        return;
    }
    if (addedItems.length === 0) {
        showNotification('Adicione pelo menos um item à solicitação para salvar.', 'error');
        return;
    }

    // CORREÇÃO: Monta o payload completo com o objeto 'solicitacao' e a lista 'itens'.
    const requestPayload = {
        solicitacao: {
            equipe: equipeId,
            processo: processoId,
            observacoes: document.getElementById('request-observacoes').value,
        },
        itens: addedItems.map(item => ({
            materialId: item.materialId,
            quantidadeSolicitada: item.quantidade
        }))
    };
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Salvando...';

    try {
        const response = await fetchAutenticado('/api/v1/solicitacoes-comercial', {
            method: 'POST',
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            let errorMessage = 'Falha ao salvar a solicitação.';
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorText;
            } catch (e) {
                errorMessage = errorText || `Erro ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const newRequest = await response.json();
        showNotification(`Solicitação #${newRequest.id} criada com sucesso!`, 'success');
        window.location.hash = '/commercial/approvals';

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="ph ph-check-circle"></i> Salvar Solicitação';
    }
}
