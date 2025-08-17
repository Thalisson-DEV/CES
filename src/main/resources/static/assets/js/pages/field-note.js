import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

// --- ESTADO DA PÁGINA ---
let supportData = {};
let addedApplications = [];
let addedServices = [];
let selectedMaterial = null;
let selectedTeam = null;
let selectedService = null;

/**
 * Renderiza a página de lançamento de nota de campo.
 */
export function renderNewFieldNotePage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-new-field-note');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    resetFormState();
    setupEventListeners();
    loadSupportData();
    updateMenuActiveState();
}

/**
 * Carrega dados de suporte para os dropdowns.
 */
async function loadSupportData() {
    try {
        if (supportData.equipes && supportData.equipes.length > 0) return;

        console.log("Iniciando carregamento de dados de suporte...");

        const [equipesRes, basesRes, tiposNotaRes, tiposAppRes, materiaisRes] = await Promise.all([
            fetchAutenticado('/api/v1/equipes?size=2000'),
            fetchAutenticado('/api/v1/bases-operacionais'),
            fetchAutenticado('/api/v1/tipos-nota'),
            fetchAutenticado('/api/v1/tipos-aplicacoes'),
            fetchAutenticado('/api/v1/material?size=2000')
        ]);

        // Verificação individual para cada resposta para fornecer erros mais claros
        if (!equipesRes.ok) throw new Error(`Falha ao carregar equipes: ${equipesRes.statusText}`);
        if (!basesRes.ok) throw new Error(`Falha ao carregar bases: ${basesRes.statusText}`);
        if (!tiposNotaRes.ok) throw new Error(`Falha ao carregar tipos de nota: ${tiposNotaRes.statusText}`);
        if (!tiposAppRes.ok) throw new Error(`Falha ao carregar tipos de aplicação: ${tiposAppRes.statusText}`);
        if (!materiaisRes.ok) throw new Error(`Falha ao carregar materiais: ${materiaisRes.statusText}`);

        const equipesData = await equipesRes.json();
        const basesData = await basesRes.json();
        const tiposNotaData = await tiposNotaRes.json();
        const tiposAppData = await tiposAppRes.json();
        const materiaisData = await materiaisRes.json();

        // DEBUG: Imprime os dados recebidos no console para verificação
        console.log("Dados recebidos das APIs:", { equipesData, basesData, tiposNotaData, tiposAppData, materiaisData });

        supportData.equipes = equipesData.content || [];
        supportData.bases = basesData || [];
        supportData.tiposNota = tiposNotaData || [];
        supportData.tiposAplicacao = tiposAppData || [];
        supportData.materiais = materiaisData.content || [];

        console.log("Dados de suporte processados:", supportData);

        populateDropdowns();

    } catch (error) {
        console.error("Erro detalhado ao carregar dados de suporte:", error);
        showNotification(error.message, 'error');
    }
}

/**
 * Configura todos os event listeners da página.
 */
function setupEventListeners() {
    // Fluxo
    document.getElementById('btn-proceed-to-applications').addEventListener('click', handleProceed);
    document.getElementById('btn-back-to-note-header').addEventListener('click', handleGoBack);
    document.getElementById('btn-save-note').addEventListener('click', handleSaveNote);

    // Buscas no Cabeçalho
    const equipeSearch = document.getElementById('search-equipe-input');
    const equipeResults = document.getElementById('equipe-results-dropdown');
    equipeSearch.addEventListener('input', handleTeamSearch);
    equipeSearch.addEventListener('blur', () => setTimeout(() => equipeResults.style.display = 'none', 200));
    equipeResults.addEventListener('mousedown', handleTeamSelect);

    // Lançamentos de Materiais
    document.getElementById('form-add-application').addEventListener('submit', handleAddApplication);
    document.querySelector('#table-added-applications tbody').addEventListener('click', handleRemoveApplication);
    const materialSearch = document.getElementById('app-material-search');
    const materialResults = document.getElementById('app-material-results');
    materialSearch.addEventListener('input', handleMaterialSearch);
    materialSearch.addEventListener('blur', () => setTimeout(() => materialResults.style.display = 'none', 200));
    materialResults.addEventListener('mousedown', handleMaterialSelect);

    // Lançamentos de Serviços
    document.getElementById('form-add-service').addEventListener('submit', handleAddService);
    document.querySelector('#table-added-services tbody').addEventListener('click', handleRemoveService);
    const serviceSearch = document.getElementById('app-service-search');
    const serviceResults = document.getElementById('app-service-results');
    serviceSearch.addEventListener('input', handleServiceSearch);
    serviceSearch.addEventListener('blur', () => setTimeout(() => serviceResults.style.display = 'none', 200));
    serviceResults.addEventListener('mousedown', handleServiceSelect);
}

// --- LÓGICA DO FLUXO DE DUAS ETAPAS ---

function handleProceed() {
    const mainForm = document.getElementById('form-main-note');
    if (!mainForm.checkValidity()) {
        showNotification('Preencha todos os campos obrigatórios (*) do cabeçalho.', 'error');
        mainForm.reportValidity();
        return;
    }
    document.getElementById('note-header-section').classList.add('hidden');
    document.getElementById('note-items-section').classList.remove('hidden');
    document.getElementById('note-page-subtitle').textContent = 'Passo 2 de 2: Adicione os materiais e serviços.';
}

function handleGoBack() {
    document.getElementById('note-items-section').classList.add('hidden');
    document.getElementById('note-header-section').classList.remove('hidden');
    document.getElementById('note-page-subtitle').textContent = 'Passo 1 de 2: Preencha os detalhes da nota.';
}

// --- LÓGICA DE MANIPULAÇÃO DE ITENS ---

function handleMaterialSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const resultsDropdown = document.getElementById('app-material-results');
    if (searchTerm.length < 2) {
        resultsDropdown.style.display = 'none';
        return;
    }
    const filtered = supportData.materiais.filter(m =>
        m.nomeMaterial.toLowerCase().includes(searchTerm) ||
        m.codigoMaterial.toLowerCase().includes(searchTerm)
    );
    resultsDropdown.innerHTML = filtered.map(item => `
        <div class="result-item" data-id="${item.id}">
            ${item.nomeMaterial} <small>Código: ${item.codigoMaterial}</small>
        </div>`).join('');
    resultsDropdown.style.display = 'block';
}

function handleTeamSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const resultsDropdown = document.getElementById('equipe-results-dropdown');

    if (!supportData.equipes || supportData.equipes.length === 0) {
        resultsDropdown.style.display = 'none';
        return;
    }
    if (searchTerm.length < 2) {
        resultsDropdown.style.display = 'none';
        selectedTeam = null;
        document.getElementById('note-base').value = '';
        return;
    }
    const filtered = supportData.equipes.filter(t => t.nomeEquipe.toLowerCase().includes(searchTerm));
    resultsDropdown.innerHTML = filtered.map(item => `<div class="result-item" data-id="${item.id}">${item.nomeEquipe}</div>`).join('');
    resultsDropdown.style.display = 'block';
}

function handleTeamSelect(e) {
    const itemElement = e.target.closest('.result-item');
    if (!itemElement) return;
    const teamId = parseInt(itemElement.dataset.id);
    selectedTeam = supportData.equipes.find(t => t.id === teamId);
    if (selectedTeam) {
        document.getElementById('search-equipe-input').value = selectedTeam.nomeEquipe;
        document.getElementById('equipe-results-dropdown').style.display = 'none';
        if (selectedTeam.baseOperacional) {
            document.getElementById('note-base').value = selectedTeam.baseOperacional.id;
        }
    }
}

function handleMaterialSelect(e) {
    const itemElement = e.target.closest('.result-item');
    if (!itemElement) return;
    const materialId = parseInt(itemElement.dataset.id);
    selectedMaterial = supportData.materiais.find(m => m.id === materialId);
    if (selectedMaterial) {
        document.getElementById('app-material-search').value = selectedMaterial.nomeMaterial;
        document.getElementById('app-material-results').style.display = 'none';
        document.getElementById('app-quantity').focus();
    }
}

function handleAddApplication(e) {
    e.preventDefault();
    const quantityInput = document.getElementById('app-quantity');
    const typeSelect = document.getElementById('app-type');

    const quantidade = parseFloat(quantityInput.value.replace(',', '.'));
    const tipoAplicacaoId = parseInt(typeSelect.value);

    if (!selectedMaterial || !tipoAplicacaoId || !quantidade || quantidade <= 0) {
        showNotification('Selecione um material, um tipo e uma quantidade válida.', 'error');
        return;
    }

    const tipoAplicacao = supportData.tiposAplicacao.find(t => t.id === tipoAplicacaoId);

    addedApplications.push({
        materialId: selectedMaterial.id,
        materialNome: selectedMaterial.nomeMaterial,
        materialCodigo: selectedMaterial.codigoMaterial,
        tipoAplicacaoId: tipoAplicacaoId,
        tipoAplicacaoNome: tipoAplicacao.nomeTipoAplicacao,
        quantidadeAplicada: quantidade,
    });

    renderApplicationsTable();
    resetAddItemForm();
}

function handleRemoveApplication(e) {
    const button = e.target.closest('.btn-delete-item');
    if (button) {
        const indexToRemove = parseInt(button.dataset.index);
        addedApplications.splice(indexToRemove, 1);
        renderApplicationsTable();
    }
}

// --- LÓGICA DE MANIPULAÇÃO DE SERVIÇOS ---

function handleServiceSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const resultsDropdown = document.getElementById('app-service-results');
    if (searchTerm.length < 2) {
        resultsDropdown.style.display = 'none';
        return;
    }
    const filtered = supportData.servicos.filter(s =>
        s.nomeServico.toLowerCase().includes(searchTerm) || // Assumindo que o serviço tem 'nomeServico' e 'codigoServico'
        s.codigoServico.toLowerCase().includes(searchTerm)
    );
    resultsDropdown.innerHTML = filtered.map(item => `
        <div class="result-item" data-id="${item.id}">
            ${item.nomeServico} <small>Código: ${item.codigoServico}</small>
        </div>`).join('');
    resultsDropdown.style.display = 'block';
}

function handleServiceSelect(e) {
    const itemElement = e.target.closest('.result-item');
    if (!itemElement) return;
    const serviceId = parseInt(itemElement.dataset.id);
    selectedService = supportData.servicos.find(s => s.id === serviceId);
    if (selectedService) {
        document.getElementById('app-service-search').value = selectedService.nomeServico;
        document.getElementById('app-service-results').style.display = 'none';
    }
}

function handleAddService(e) {
    e.preventDefault();
    if (!selectedService) {
        showNotification('Selecione um serviço válido da lista.', 'error');
        return;
    }
    if (addedServices.some(s => s.servicoId === selectedService.id)) {
        showNotification('Este serviço já foi adicionado.', 'error');
        return;
    }
    addedServices.push({
        servicoId: selectedService.id,
        servicoNome: selectedService.nomeServico,
        servicoCodigo: selectedService.codigoServico
    });
    renderServicesTable();
    resetAddServiceForm();
}

function handleRemoveService(e) {
    const button = e.target.closest('.btn-delete-service');
    if (button) {
        const indexToRemove = parseInt(button.dataset.index);
        addedServices.splice(indexToRemove, 1);
        renderServicesTable();
    }
}

// --- LÓGICA DE RENDERIZAÇÃO E FORMULÁRIO ---

function populateDropdowns() {
    console.log('Dados de Bases:', supportData.bases);
    console.log('Dados de Tipos de Nota:', supportData.tiposNota);
    console.log('Dados de Tipos de Aplicação:', supportData.tiposAplicacao);

    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        if (!select || !data) return;
        select.innerHTML = `<option value="">Selecione...</option>`;
        data.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };
    populate('note-base', supportData.bases, 'nomeBase');
    populate('note-type', supportData.tiposNota, 'nomeTipoNota');
    populate('app-type', supportData.tiposAplicacao, 'nomeTipoAplicacao');
}

function renderApplicationsTable() {
    const tableBody = document.querySelector('#table-added-applications tbody');
    const emptyState = document.getElementById('empty-state-applications');
    tableBody.innerHTML = '';
    if (addedApplications.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-list-plus"></i><h3>Nenhum material lançado</h3><p>Use o formulário acima para incluir as aplicações.</p>`;
        emptyState.style.display = 'flex';
        tableBody.closest('.table-container').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableBody.closest('.table-container').style.display = 'table';
        addedApplications.forEach((item, index) => {
            const tr = tableBody.insertRow();
            tr.innerHTML = `
                <td>${item.materialNome}</td>
                <td>${item.materialCodigo}</td>
                <td>${item.tipoAplicacaoNome}</td>
                <td>${item.quantidadeAplicada}</td>
                <td class="actions text-right"><button class="btn-icon btn-delete-item" data-index="${index}" title="Remover"><i class="ph ph-trash"></i></button></td>
            `;
        });
    }
}

function renderServicesTable() {
    const tableBody = document.querySelector('#table-added-services tbody');
    const emptyState = document.getElementById('empty-state-services');
    tableBody.innerHTML = '';
    if (addedServices.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-wrench"></i><h3>Nenhum serviço executado</h3><p>Use o formulário acima para incluir os serviços.</p>`;
        emptyState.style.display = 'flex';
        tableBody.closest('.table-container').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableBody.closest('.table-container').style.display = 'table';
        addedServices.forEach((item, index) => {
            const tr = tableBody.insertRow();
            tr.innerHTML = `
                <td>${item.servicoNome}</td>
                <td>${item.servicoCodigo}</td>
                <td class="actions text-right"><button class="btn-icon btn-delete-service" data-index="${index}" title="Remover"><i class="ph ph-trash"></i></button></td>
            `;
        });
    }
}

function resetAddItemForm() {
    document.getElementById('form-add-application').reset();
    selectedMaterial = null;
    document.getElementById('app-material-search').focus();
}

function resetAddServiceForm() {
    document.getElementById('form-add-service').reset();
    selectedService = null;
    document.getElementById('app-service-search').focus();
}

function resetFormState() {
    document.getElementById('form-main-note').reset();
    addedApplications = [];
    addedServices = [];
    handleGoBack();
    renderApplicationsTable();
    renderServicesTable();
    resetAddItemForm();
    resetAddServiceForm();
}

// --- LÓGICA DE SALVAR ---

async function handleSaveNote() {
    const saveButton = document.getElementById('btn-save-note');
    const mainForm = document.getElementById('form-main-note');

    if (addedApplications.length === 0 && addedServices.length === 0) {
        showNotification('Adicione pelo menos um material ou serviço para salvar a nota.', 'error');
        return;
    }

    const notePayload = {
        nota: {
            numero_nota: mainForm.querySelector('#note-number').value,
            tipo_nota_id: parseInt(mainForm.querySelector('#note-type').value),
            equipe_id: parseInt(mainForm.querySelector('#note-equipe').value),
            base_operacional_id: parseInt(mainForm.querySelector('#note-base').value),
            observacoes: mainForm.querySelector('#note-observacoes').value,
        },
        itens: addedApplications.map(item => ({
            material_id: item.materialId,
            tipo_aplicacao_id: item.tipoAplicacaoId,
            quantidade_aplicada: item.quantidadeAplicada
        })),
        servicos: addedServices.map(item => ({ // Assumindo que o DTO de serviço terá 'servicoId'
            servicoId: item.servicoId
        }))
    };

    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Finalizando...';

    try {
        const response = await fetchAutenticado('/api/v1/notas', {
            method: 'POST',
            body: JSON.stringify(notePayload)
        });

        if (!response.ok) throw new Error('Falha ao criar a nota principal.');

        const newNote = await response.json();

        showNotification(`Nota #${newNote.id} e seus lançamentos foram salvos com sucesso!`, 'success');
        window.location.hash = '/dashboard'; // Ou para uma tela de acompanhamento de notas

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="ph ph-check-circle"></i> Finalizar Lançamento';
    }
}
