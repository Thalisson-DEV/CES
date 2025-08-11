import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer, showImportModal } from '../components.js';

// Estado da página
let supportData = {}; // Para armazenar listas de bases, processos, etc.
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    baseId: '',
    processoId: '',
    coordenadorId: '',
    supervisorId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de equipes.
 */
export function renderTeamsPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-teams');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadTeams();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-nova-equipe').addEventListener('click', () => showTeamForm());
    document.getElementById('btn-importar-equipes').addEventListener('click', () => document.getElementById('input-arquivo-equipes').click());
    document.getElementById('input-arquivo-equipes').addEventListener('change', handleFileImport);
    document.querySelector('#tabela-equipes tbody').addEventListener('click', handleTableActions);

    // Filtros
    document.getElementById('filter-equipe-base').addEventListener('change', (e) => updateFilter('baseId', e.target.value));
    document.getElementById('filter-equipe-processo').addEventListener('change', (e) => updateFilter('processoId', e.target.value));
    document.getElementById('busca-equipe').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte (bases, processos, etc.) para os filtros e formulários.
 */
async function loadSupportData() {
    try {
        if (supportData.bases) return;

        // CORREÇÃO: A chamada para coordenadores agora espera uma lista simples.
        const [basesRes, processosRes, supervisoresRes, coordenadoresRes] = await Promise.all([
            fetchAutenticado('/api/v1/bases-operacionais'),
            fetchAutenticado('/api/v1/processos'),
            fetchAutenticado('/api/v1/supervisores'),
            fetchAutenticado('/api/v1/coordenadores') // Endpoint agora retorna uma lista
        ]);

        if (!basesRes.ok || !processosRes.ok || !supervisoresRes.ok || !coordenadoresRes.ok) {
            throw new Error('Falha ao carregar dados de suporte para equipes.');
        }

        supportData.bases = await basesRes.json();
        supportData.processos = await processosRes.json();
        supportData.supervisores = await supervisoresRes.json();

        // CORREÇÃO: Atribui diretamente a resposta da API, que agora é um array.
        supportData.coordenadores = await coordenadoresRes.json();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Preenche os dropdowns de filtro com os dados de suporte.
 */
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

    populate('filter-equipe-base', supportData.bases, 'nomeBase');
    populate('filter-equipe-processo', supportData.processos, 'nomeProcesso');
}

/**
 * Atualiza um valor de filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadTeams();
}

/**
 * Carrega as equipes da API de forma paginada e com filtros.
 */
async function loadTeams() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'nome_equipe,asc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/equipes?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar equipes.');

        const pageData = await response.json();
        renderTeamsTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de equipes.
 */
function renderTeamsTable(teams) {
    const tableBody = document.querySelector('#tabela-equipes tbody');
    const emptyState = document.getElementById('empty-state-equipes');
    tableBody.innerHTML = '';

    if (teams.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-users-three"></i><h3>Nenhuma equipe encontrada</h3><p>Tente ajustar seus filtros ou cadastre uma nova equipe.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        teams.forEach(team => {
            const tr = document.createElement('tr');
            const statusTag = team.ativo
                ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>`
                : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;

            tr.innerHTML = `
                <td>${team.nomeEquipe}</td>
                <td>${team.vulgo || 'N/A'}</td>
                <td>${team.baseOperacional?.nomeBase || 'N/A'}</td>
                <td>${team.processo?.nomeProcesso || 'N/A'}</td>
                <td>${team.coordenador?.username?.user || 'N/A'}</td>
                <td>${team.supervisor?.username?.user || 'N/A'}</td>
                <td>${statusTag}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${team.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon btn-delete" data-id="${team.id}"><i class="ph ph-trash"></i></button>
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
    const container = document.getElementById('pagination-equipes');
    if (!container) return;
    const { totalElements, totalPages, number: pageIndex, size, first, last } = pageData;
    if (totalElements === 0) {
        container.innerHTML = '';
        return;
    }
    const startItem = pageIndex * size + 1;
    const endItem = startItem + pageData.numberOfElements - 1;
    container.innerHTML = `
        <div class="pagination-summary">Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${totalElements}</strong></div>
        <div class="pagination-size">
            <label for="items-per-page-teams">Itens:</label>
            <select id="items-per-page-teams"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-teams" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-teams" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-teams');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadTeams(); });
    document.getElementById('prev-page-teams').addEventListener('click', () => { if (!first) { currentPage--; loadTeams(); } });
    document.getElementById('next-page-teams').addEventListener('click', () => { if (!last) { currentPage++; loadTeams(); } });
}

/**
 * Mostra o formulário de equipe no painel lateral.
 */
function showTeamForm(team = null) {
    const isEdit = team !== null;
    const title = isEdit ? 'Editar Equipe' : 'Nova Equipe';

    const formBody = `
        <form id="form-team">
            <input type="hidden" id="team-id" value="${isEdit ? team.id : ''}">
            <div class="form-group">
                <label for="nomeEquipe">Nome da Equipe*</label>
                <input type="text" id="nomeEquipe" required value="${isEdit ? team.nomeEquipe : ''}">
            </div>
            <div class="form-group">
                <label for="vulgo">Vulgo</label>
                <input type="text" id="vulgo" value="${isEdit ? team.vulgo || '' : ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="baseOperacional">Base Operacional*</label>
                    <select id="baseOperacional" required></select>
                </div>
                <div class="form-group">
                    <label for="processo">Processo*</label>
                    <select id="processo" required></select>
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
             <div class="form-group">
                <label for="emailCoordenador">Email da Coordenação</label>
                <input type="email" id="emailCoordenador" value="${isEdit ? team.emailCoordenador || '' : ''}">
            </div>
            <div class="form-group">
                <label for="emailAlmoxarifado">Email do Almoxarifado</label>
                <input type="email" id="emailAlmoxarifado" value="${isEdit ? team.emailAlmoxarifado || '' : ''}">
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    const populate = (id, data, nameProp, valueProp = 'id', selected) => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Selecione...</option>';
        data?.forEach(item => {
            // Permite que nameProp seja uma função para acessar dados aninhados
            const text = typeof nameProp === 'function' ? nameProp(item) : item[nameProp];
            select.add(new Option(text, item[valueProp]));
        });
        if (selected) select.value = selected;
    };

    populate('baseOperacional', supportData.bases, 'nomeBase', 'id', isEdit ? team.baseOperacional?.id : null);
    populate('processo', supportData.processos, 'nomeProcesso', 'id', isEdit ? team.processo?.id : null);
    // CORREÇÃO: Passa uma função para acessar o nome do usuário aninhado
    populate('coordenador', supportData.coordenadores, (item) => item.usuarioId?.user || 'Usuário Inválido', 'id', isEdit ? team.coordenador?.id : null);
    populate('supervisor', supportData.supervisores, (item) => item.usuarioId?.user || 'Usuário Inválido', 'id', isEdit ? team.supervisor?.id : null);
}

/**
 * Lida com o envio do formulário de equipe.
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-team');
    const id = form.querySelector('#team-id').value;
    const isEdit = !!id;

    const teamData = {
        nomeEquipe: form.querySelector('#nomeEquipe').value,
        vulgo: form.querySelector('#vulgo').value,
        baseOperacional: parseInt(form.querySelector('#baseOperacional').value) || null,
        processo: parseInt(form.querySelector('#processo').value) || null,
        coordenador: parseInt(form.querySelector('#coordenador').value) || null,
        supervisor: parseInt(form.querySelector('#supervisor').value) || null,
        emailCoordenador: form.querySelector('#emailCoordenador').value,
        emailAlmoxarifado: form.querySelector('#emailAlmoxarifado').value,
        ativo: true,
    };

    if (!teamData.nomeEquipe || !teamData.baseOperacional || !teamData.processo) {
        showNotification('Nome, Base e Processo são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/equipes/${id}` : '/api/v1/equipes';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, { method, body: JSON.stringify(teamData) });
        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao salvar equipe.`);
        }
        showNotification(`Equipe ${isEdit ? 'atualizada' : 'criada'} com sucesso!`, 'success');
        closeDrawer();
        loadTeams();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

/**
 * Lida com a importação de arquivo.
 */
async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    showNotification('Importando arquivo, por favor aguarde...', 'info');
    try {
        const response = await fetchAutenticado('/api/v1/equipes/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');
        showImportModal(result, 'Equipes');
        loadTeams();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}

/**
 * Lida com ações da tabela (editar/excluir).
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;
    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        try {
            const response = await fetchAutenticado(`/api/v1/equipes/${id}`);
            if (!response.ok) throw new Error('Falha ao buscar dados da equipe.');
            const teamToEdit = await response.json();
            showTeamForm(teamToEdit);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta equipe?')) {
            try {
                const response = await fetchAutenticado(`/api/v1/equipes/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || 'Falha ao excluir equipe.');
                }
                showNotification('Equipe excluída com sucesso!', 'success');
                loadTeams();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    }
}
