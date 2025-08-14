import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

let requestId;

/**
 * Renderiza a página de detalhes da aprovação.
 */
export function renderCommercialApprovalsDetailsPage(params) {
    requestId = params.id;
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-commercial-approvals-details');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    loadApprovalDetails();
    setupEventListeners();
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    pageContent.querySelector('#btn-approve-all').addEventListener('click', () => handleApprovalAction('atender'));
    pageContent.querySelector('#btn-reject-all').addEventListener('click', () => handleApprovalAction('rejeitar'));
}

/**
 * Carrega os detalhes da solicitação e seus itens da API.
 */
async function loadApprovalDetails() {
    if (!requestId) return;
    try {
        const [requestRes, itemsRes] = await Promise.all([
            fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}`),
            fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}/items`)
        ]);

        if (!requestRes.ok || !itemsRes.ok) throw new Error('Falha ao carregar dados da solicitação para aprovação.');

        const requestData = await requestRes.json();
        const itemsData = await itemsRes.json();

        renderHeader(requestData);
        renderItemsTable(itemsData);

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Preenche o cabeçalho com os detalhes da solicitação.
 */
function renderHeader(data) {
    const pageContent = document.getElementById('page-content');
    pageContent.querySelector('#approval-page-title').textContent = `Análise da Solicitação #${data.id}`;
    const headerContent = pageContent.querySelector('#approval-header-content');

    const detailsHTML = `
        <div class="form-row">
            <div class="form-group"><label>Equipe</label><p>${data.equipe?.nomeEquipe || 'N/A'}</p></div>
            <div class="form-group"><label>Solicitante</label><p>${data.solicitante?.user || 'N/A'}</p></div>
            <div class="form-group"><label>Status</label><p><span class="tag tag-warning">${data.status?.nomeStatus || 'N/A'}</span></p></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Processo</label><p class="font-semibold text-gray-800">${data.processo?.nomeProcesso || 'N/A'}</p></div>
            <div class="form-group"><label>Data de Criação</label><p class="font-semibold text-gray-800">${new Date(data.dataCriacao).toLocaleString('pt-BR')}</p></div>
            <div class="form-group"><label>Última Modificação</label><p class="font-semibold text-gray-800">${data.dataModificacao ? new Date(data.dataModificacao).toLocaleString('pt-BR') : 'N/A'}</p></div>
        </div>
        <div class="form-group"><label>Observações</label><p class="p-2 bg-gray-50 border rounded-md">${data.observacoes || 'Nenhuma'}</p></div>
    `;
    headerContent.innerHTML = detailsHTML;
}

/**
 * Renderiza a tabela de itens.
 */
function renderItemsTable(items) {
    const tableBody = document.getElementById('approval-items-table-body');
    const emptyState = document.getElementById('empty-state-approval-items');
    tableBody.innerHTML = '';

    if (items.length === 0) {
        emptyState.innerHTML = `<h3>Esta solicitação não possui itens.</h3>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        items.forEach(item => {
            const tr = tableBody.insertRow();
            tr.innerHTML = `
                <td>${item.material?.nomeMaterial || 'N/A'}</td>
                <td>${item.material?.codigoMaterial || 'N/A'}</td>
                <td>${item.quantidadeSolicitada}</td>
            `;
        });
    }
}

/**
 * Lida com as ações de aprovar ou recusar a solicitação.
 */
async function handleApprovalAction(action) {
    const actionText = action === 'atender' ? 'Aprovar' : 'Recusar';
    const endpointAction = action === 'atender' ? 'aprovar' : 'rejeitar'; // Corresponde ao seu novo endpoint

    if (!confirm(`Tem certeza que deseja ${actionText} todos os itens desta solicitação?`)) return;

    try {
        const response = await fetchAutenticado(`/api/v1/solicitacoes-comercial/${requestId}/items/request/${endpointAction}`, {
            method: 'POST',
            body: JSON.stringify([]) // Envia um array vazio para agir sobre todos os itens
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao ${actionText} a solicitação.`);
        }

        showNotification(`Solicitação processada com sucesso!`, 'success');
        // Redireciona de volta para a lista de aprovações
        window.location.hash = '/commercial/approvals';

    } catch (error) {
        showNotification(error.message, 'error');
    }
}