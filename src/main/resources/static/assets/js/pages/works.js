import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showImportModal, showDrawer, closeDrawer } from '../components.js';

let allWorks = []; // Cache da lista de obras
let supportData = {}; // Cache para dados de dropdowns (status, bases)

/**
 * Renderiza a página de obras.
 */
export function renderWorksPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-works');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupWorksEventListeners();
    loadSupportData().then(loadWorks);
}

/**
 * Configura os event listeners da página de obras.
 */
function setupWorksEventListeners() {
    document.getElementById('btn-nova-obra').addEventListener('click', () => showWorkForm());
    document.getElementById('btn-importar-obras').addEventListener('click', () => document.getElementById('input-arquivo-obras').click());
    document.getElementById('input-arquivo-obras').addEventListener('change', handleFileImport);
    document.querySelector('#tabela-obras tbody').addEventListener('click', handleTableActions);
    document.getElementById('busca-obra').addEventListener('input', handleSearch);
}

/**
 * Carrega dados de suporte para os formulários (status, bases).
 */
async function loadSupportData() {
    try {
        if (supportData.status && supportData.bases) return;
        // CORREÇÃO: Ajuste nos endpoints para corresponder à API.
        const [statusRes, basesRes] = await Promise.all([
            fetchAutenticado('/api/v1/status-obra'), // Assumindo que o endpoint para status é este
            fetchAutenticado('/api/v1/bases-operacionais') // Assumindo que o endpoint para bases é este
        ]);
        if (!statusRes.ok || !basesRes.ok) throw new Error('Falha ao carregar dados de suporte.');

        supportData.status = await statusRes.json();
        supportData.bases = await basesRes.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Carrega as obras da API e renderiza a tabela.
 */
async function loadWorks() {
    try {
        const response = await fetchAutenticado('/api/v1/obras');
        if (!response.ok) throw new Error('Falha ao carregar obras.');

        const works = await response.json();
        allWorks = works;
        renderWorksTable(works);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de obras.
 */
function renderWorksTable(works) {
    const tableBody = document.querySelector('#tabela-obras tbody');
    const emptyState = document.getElementById('empty-state-obras');
    const tableContainer = document.querySelector('#page-content .table-container');

    if (!tableBody || !emptyState || !tableContainer) {
        console.error('Elementos da tabela de obras não encontrados no DOM.');
        return;
    }

    tableBody.innerHTML = '';

    if (works.length === 0 && document.getElementById('busca-obra').value === '') {
        emptyState.style.display = 'flex';
        tableContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        works.forEach(work => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${work.numeroObra || 'N/A'}</td>
                <td>${work.titulo || 'N/A'}</td>
                <td><span class="tag">${work.status?.nomeStatus || 'N/A'}</span></td>
                <td>${work.baseObra?.nomeBase || 'N/A'}</td>
                <td>${work.dataInicio ? new Date(work.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${work.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon btn-delete" data-id="${work.id}"><i class="ph ph-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

/**
 * Mostra o formulário de obra no painel lateral.
 */
function showWorkForm(work = null) {
    const isEdit = work !== null;
    const title = isEdit ? 'Editar Obra' : 'Nova Obra';

    const formBody = `
        <form id="form-obra">
            <input type="hidden" id="obra-id" value="${isEdit ? work.id : ''}">
            <div class="form-group">
                <label for="numero-obra">Nº da Obra*</label>
                <input type="text" id="numero-obra" required value="${isEdit ? work.numeroObra : ''}">
            </div>
            <div class="form-group">
                <label for="titulo-obra">Título*</label>
                <input type="text" id="titulo-obra" required value="${isEdit ? work.titulo : ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="status-obra">Status*</label>
                    <select id="status-obra" required></select>
                </div>
                <div class="form-group">
                    <label for="base-obra">Base da Obra*</label>
                    <select id="base-obra" required></select>
                </div>
            </div>
            <div class="form-group">
                <label for="base-saque">Base de Saque*</label>
                <select id="base-saque" required></select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="data-inicio">Data de Início</label>
                    <input type="date" id="data-inicio" value="${isEdit && work.dataInicio ? work.dataInicio.split('T')[0] : ''}">
                </div>
                <div class="form-group">
                    <label for="data-fim">Data de Fim</label>
                    <input type="date" id="data-fim" value="${isEdit && work.dataFim ? work.dataFim.split('T')[0] : ''}">
                </div>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleWorkFormSubmit });

    const statusSelect = document.getElementById('status-obra');
    const baseObraSelect = document.getElementById('base-obra');
    const baseSaqueSelect = document.getElementById('base-saque');

    [statusSelect, baseObraSelect, baseSaqueSelect].forEach(s => s.innerHTML = '<option value="">Selecione...</option>');

    supportData.status?.forEach(s => statusSelect.add(new Option(s.nomeStatus, s.id)));
    supportData.bases?.forEach(b => {
        baseObraSelect.add(new Option(b.nomeBase, b.id));
        baseSaqueSelect.add(new Option(b.nomeBase, b.id));
    });

    if (isEdit) {
        statusSelect.value = work.status?.id;
        baseObraSelect.value = work.baseObra?.id;
        baseSaqueSelect.value = work.baseSaque?.id;
    }
}

/**
 * Lida com o envio do formulário de obra.
 */
async function handleWorkFormSubmit() {
    const form = document.getElementById('form-obra');
    const id = form.querySelector('#obra-id').value;
    const isEdit = !!id;

    const workData = {
        numeroObra: form.querySelector('#numero-obra').value,
        titulo: form.querySelector('#titulo-obra').value,
        statusObra: parseInt(form.querySelector('#status-obra').value),
        baseObra: parseInt(form.querySelector('#base-obra').value),
        baseSaque: parseInt(form.querySelector('#base-saque').value),
        dataInicio: form.querySelector('#data-inicio').value || null,
        dataFim: form.querySelector('#data-fim').value || null,
        ativo: true,
    };

    if (!workData.numeroObra || !workData.titulo || !workData.statusObra) {
        showNotification('Nº da Obra, Título e Status são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    const endpoint = isEdit ? `/api/v1/obras/${id}` : '/api/v1/obras';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetchAutenticado(endpoint, {
            method,
            body: JSON.stringify(workData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Falha ao ${isEdit ? 'atualizar' : 'criar'} obra.`);
        }

        showNotification(`Obra ${isEdit ? 'atualizada' : 'criada'} com sucesso!`, 'success');
        closeDrawer();
        loadWorks();
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
        const response = await fetchAutenticado('/api/v1/obras/import', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na importação.');

        showImportModal(result, 'Obras');
        loadWorks();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        e.target.value = '';
    }
}

/**
 * Lida com a busca na tabela.
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredWorks = allWorks.filter(work =>
        work.titulo?.toLowerCase().includes(searchTerm) ||
        work.numeroObra?.toLowerCase().includes(searchTerm)
    );
    renderWorksTable(filteredWorks);
}

/**
 * Lida com ações da tabela.
 */
async function handleTableActions(e) {
    const button = e.target.closest('button.btn-icon');
    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains('btn-edit')) {
        const workToEdit = allWorks.find(w => w.id == id);
        if (workToEdit) {
            showWorkForm(workToEdit);
        }
    }

    if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta obra?')) {
            try {
                // CORREÇÃO: O endpoint para deletar agora inclui o ID na URL.
                const response = await fetchAutenticado(`/api/v1/obras/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir obra.');
                showNotification('Obra excluída com sucesso!', 'success');
                loadWorks();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    }
}
