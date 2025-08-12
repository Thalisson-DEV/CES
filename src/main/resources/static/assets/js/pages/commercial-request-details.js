import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

let requestId;
let currentItems = []; // Armazena a lista de itens da solicitação
let supportData = {}; // Armazena dados de suporte como a lista de materiais
let selectedMaterialInModal = null;

// --- FUNÇÕES PRINCIPAIS DA PÁGINA ---

export function renderCommercialRequestDetailsPage(params) {
    requestId = params.id;
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-commercial-request-details');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    loadRequestDetails();
    setupEventListeners();
}

function setupEventListeners() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    pageContent.querySelector('#btn-edit-items').addEventListener('click', showEditItemsModal);
    // CORREÇÃO: Listeners atualizados para os novos botões
    pageContent.querySelector('#btn-atender-tudo').addEventListener('click', () => handleBatchAction('atender'));
    pageContent.querySelector('#btn-rejeitar-tudo').addEventListener('click', () => handleBatchAction('rejeitar'));
}

async function loadRequestDetails() {
    if (!requestId) return;
    const pageContent = document.getElementById('page-content');

    try {
        const [requestRes, itemsRes] = await Promise.all([
            fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}`),
            fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}/items`)
        ]);

        if (!requestRes || !itemsRes) throw new Error("Uma das respostas da API retornou indefinida.");
        if (!requestRes.ok) throw new Error('Falha ao carregar detalhes da solicitação.');
        if (!itemsRes.ok) throw new Error('Falha ao carregar itens da solicitação.');

        const requestData = await requestRes.json();
        currentItems = await itemsRes.json();

        renderHeader(requestData);
        renderItemsTable(currentItems);

    } catch (error) {
        showNotification(error.message, 'error');
        if (pageContent) pageContent.innerHTML = `<p class="text-red-500 p-8">${error.message}</p>`;
    }
}

// --- LÓGICA DO MODAL DE EDIÇÃO ---

async function showEditItemsModal() {
    if (!supportData.materiais || supportData.materiais.length === 0) {
        try {
            const materiaisRes = await fetchAutenticado('/api/v1/material?size=2000&sort=nome_material,asc');
            if (!materiaisRes.ok) throw new Error('Falha ao carregar lista de materiais.');
            const materiaisData = await materiaisRes.json();
            supportData.materiais = materiaisData.content || [];
        } catch (error) {
            showNotification(error.message, 'error');
            return;
        }
    }

    const modalTemplate = document.getElementById('template-edit-items-modal');
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = modalTemplate.innerHTML.trim();
    const modal = tempContainer.firstChild;
    document.body.appendChild(modal);

    const itemsInModal = JSON.parse(JSON.stringify(currentItems));

    const searchInput = modal.querySelector('#modal-search-material-input');
    const resultsDropdown = modal.querySelector('#modal-material-results-dropdown');
    const formAddItem = modal.querySelector('#form-add-item-modal');

    if (!searchInput || !resultsDropdown || !formAddItem) {
        console.error("Elementos essenciais dentro do modal de edição não foram encontrados.");
        modal.remove();
        return;
    }

    const renderModalTable = () => {
        const tableBody = modal.querySelector('#modal-items-table-body');
        tableBody.innerHTML = '';
        if (itemsInModal.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-gray-500 py-4">Nenhum item na solicitação.</td></tr>`;
        } else {
            itemsInModal.forEach(item => {
                const tr = tableBody.insertRow();
                tr.innerHTML = `
                    <td>${item.material?.nomeMaterial || 'N/A'}</td>
                    <td><input type="number" class="item-quantity-input" value="${item.quantidadeSolicitada}" data-id="${item.id}" min="0.01" step="any"></td>
                    <td class="actions text-right"><button class="btn-icon btn-delete-item-modal" data-id="${item.id}"><i class="ph ph-trash"></i></button></td>
                `;
            });
        }
    };

    const handleMaterialSearchInModal = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 2) {
            resultsDropdown.style.display = 'none';
            return;
        }
        const filtered = supportData.materiais.filter(m =>
            !itemsInModal.some(i => i.material.id === m.id) &&
            (m.nomeMaterial.toLowerCase().includes(searchTerm) || m.codigoMaterial.toLowerCase().includes(searchTerm))
        );
        if (filtered.length > 0) {
            resultsDropdown.innerHTML = filtered.map(item => `
                <div class="result-item" data-id="${item.id}">
                    ${item.nomeMaterial} <small>Código: ${item.codigoMaterial}</small>
                </div>`).join('');
            resultsDropdown.style.display = 'block';
        } else {
            resultsDropdown.style.display = 'none';
        }
    };

    const handleMaterialSelectInModal = (e) => {
        const itemElement = e.target.closest('.result-item');
        if (!itemElement) return;
        const materialId = parseInt(itemElement.dataset.id);
        selectedMaterialInModal = supportData.materiais.find(m => m.id === materialId);
        if (selectedMaterialInModal) {
            searchInput.value = selectedMaterialInModal.nomeMaterial;
            resultsDropdown.style.display = 'none';
            modal.querySelector('#modal-item-quantity').focus();
        }
    };

    const handleAddItemInModal = (e) => {
        e.preventDefault();
        const quantityInput = modal.querySelector('#modal-item-quantity');
        const quantityValue = quantityInput.value.replace(',', '.');
        const quantidade = parseFloat(quantityValue);

        if (!selectedMaterialInModal) {
            showNotification('Selecione um material válido da lista.', 'error');
            return;
        }
        if (isNaN(quantidade) || quantidade <= 0) {
            showNotification('Informe uma quantidade numérica válida.', 'error');
            return;
        }
        itemsInModal.push({
            id: `new-${selectedMaterialInModal.id}`,
            material: selectedMaterialInModal,
            quantidadeSolicitada: quantidade,
            quantidadeAtendida: 0
        });
        renderModalTable();
        searchInput.value = '';
        quantityInput.value = '';
        selectedMaterialInModal = null;
    };

    const handleItemChangeInModal = (e) => {
        const target = e.target;
        if (target.classList.contains('item-quantity-input')) {
            const itemId = isNaN(target.dataset.id) ? target.dataset.id : parseInt(target.dataset.id);
            const item = itemsInModal.find(i => i.id == itemId);
            if (item) item.quantidadeSolicitada = parseFloat(target.value.replace(',', '.'));
        } else if (target.closest('.btn-delete-item-modal')) {
            const itemId = isNaN(target.dataset.id) ? target.dataset.id : parseInt(target.dataset.id);
            const itemIndex = itemsInModal.findIndex(i => i.id == itemId);
            if (itemIndex > -1) {
                itemsInModal.splice(itemIndex, 1);
                renderModalTable();
            }
        }
    };

    const handleSaveChanges = async () => {
        const payload = itemsInModal.map(item => ({
            materialId: item.material.id,
            quantidadeSolicitada: item.quantidadeSolicitada
        }));
        try {
            const response = await fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}/items`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Falha ao salvar as alterações.');
            showNotification('Itens atualizados com sucesso!', 'success');
            modal.remove();
            loadRequestDetails();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    formAddItem.addEventListener('submit', handleAddItemInModal);
    modal.querySelector('#modal-items-table-body').addEventListener('input', handleItemChangeInModal);
    modal.querySelector('#modal-items-table-body').addEventListener('click', handleItemChangeInModal);
    modal.querySelector('#btn-save-item-changes').addEventListener('click', handleSaveChanges);
    searchInput.addEventListener('input', handleMaterialSearchInModal);
    resultsDropdown.addEventListener('mousedown', handleMaterialSelectInModal);
    modal.querySelectorAll('.btn-close-modal').forEach(btn => btn.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    renderModalTable();
}


// --- FUNÇÕES DE RENDERIZAÇÃO DA PÁGINA PRINCIPAL ---
function renderHeader(data) {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    pageContent.querySelector('#details-page-title').textContent = `Detalhes da Solicitação #${data.id}`;
    const headerContent = pageContent.querySelector('#details-header-content');
    const statusTagClass = getStatusTagClass(data.status?.nomeStatus);
    const detailsHTML = `
        <div class="form-row">
            <div class="form-group"><label>Equipe</label><p class="font-semibold text-gray-800">${data.equipe?.nomeEquipe || 'N/A'}</p></div>
            <div class="form-group"><label>Solicitante</label><p class="font-semibold text-gray-800">${data.solicitante?.user || 'N/A'}</p></div>
            <div class="form-group"><label>Status</label><p><span class="tag ${statusTagClass}">${data.status?.nomeStatus || 'N/A'}</span></p></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Processo</label><p class="font-semibold text-gray-800">${data.processo?.nomeProcesso || 'N/A'}</p></div>
            <div class="form-group"><label>Data de Criação</label><p class="font-semibold text-gray-800">${new Date(data.dataCriacao).toLocaleString('pt-BR')}</p></div>
            <div class="form-group"><label>Última Modificação</label><p class="font-semibold text-gray-800">${data.dataModificacao ? new Date(data.dataModificacao).toLocaleString('pt-BR') : 'N/A'}</p></div>
        </div>
        <div class="form-group"><label>Observações</label><p class="p-3 bg-gray-50 border rounded-md min-h-[40px]">${data.observacoes || 'Nenhuma'}</p></div>`;
    headerContent.innerHTML = detailsHTML;
}

function renderItemsTable(items) {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    const tableBody = pageContent.querySelector('#items-table-body');
    const emptyState = pageContent.querySelector('#empty-state-details-items');
    if (!tableBody || !emptyState) return;
    tableBody.innerHTML = '';
    if (items.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-list-plus"></i><h3>Nenhum item nesta solicitação</h3>`;
        emptyState.style.display = 'flex';
        tableBody.closest('.table-container').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableBody.closest('.table-container').style.display = 'block';
        items.forEach(item => {
            const tr = tableBody.insertRow();
            const statusTagClass = getStatusTagClass(item.status?.nomeStatus);
            // CORREÇÃO: Removida a coluna de checkbox
            tr.innerHTML = `
                <td>${item.material?.nomeMaterial || 'N/A'}</td>
                <td>${item.material?.codigoMaterial || 'N/A'}</td>
                <td><span class="tag ${statusTagClass}">${item.status?.nomeStatus || 'N/A'}</span></td>
                <td>${item.quantidadeSolicitada}</td>
                <td>${item.quantidadeAtendida}</td>`;
        });
    }
}

// REMOVIDO: A função handleSelectAll não é mais necessária
// function handleSelectAll(e) { ... }

// ATUALIZADO: A função agora age sobre todos os itens
async function handleBatchAction(action) {
    const actionText = action === 'atender' ? 'atender' : 'rejeitar';

    if (!confirm(`Tem certeza que deseja ${actionText} TODOS os itens desta solicitação?`)) return;

    try {
        // Envia um corpo vazio, pois o backend sabe que isso significa "todos os itens"
        const response = await fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}/items/${action}`, {
            method: 'POST',
            body: JSON.stringify([]) // Envia um array vazio
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao ${actionText} itens.`);
        }

        showNotification(`Todos os itens foram processados com sucesso!`, 'success');
        loadRequestDetails();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function getStatusTagClass(statusName) {
    if (!statusName) return 'tag-default';
    const statusLower = statusName.toLowerCase();
    if (statusLower.includes('pendente')) return 'tag-warning';
    if (statusLower.includes('aprovada') || statusLower.includes('totalmente')) return 'tag-success';
    if (statusLower.includes('parcialmente')) return 'tag-info';
    if (statusLower.includes('recusada') || statusLower.includes('cancelada')) return 'tag-danger';
    return 'tag-default';
}
