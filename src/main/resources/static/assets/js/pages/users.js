import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification, showDrawer, closeDrawer } from '../components.js';

// Estado da página
let supportData = {}; // Para armazenar listas de perfis e bases
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    perfilId: '',
    baseId: '',
    searchTerm: ''
};

/**
 * Renderiza a página de usuários.
 */
export function renderUsersPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-users');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadUsers();
    });
}

/**
 * Configura os event listeners da página.
 */
function setupEventListeners() {
    document.getElementById('btn-novo-usuario').addEventListener('click', () => showUserForm());

    // Filtros
    document.getElementById('filter-user-perfil').addEventListener('change', (e) => updateFilter('perfilId', e.target.value));
    document.getElementById('filter-user-base').addEventListener('change', (e) => updateFilter('baseId', e.target.value));
    document.getElementById('busca-usuario').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

/**
 * Carrega dados de suporte (perfis, bases) para os filtros e formulários.
 */
async function loadSupportData() {
    try {
        if (supportData.perfis) return;

        const [perfisRes, basesRes] = await Promise.all([
            fetchAutenticado('/api/v1/perfis'), // Assumindo este endpoint
            fetchAutenticado('/api/v1/bases-operacionais')
        ]);

        if (!perfisRes.ok || !basesRes.ok) {
            throw new Error('Falha ao carregar dados de suporte para usuários.');
        }

        supportData.perfis = await perfisRes.json();
        supportData.bases = await basesRes.json();

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
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };

    populate('filter-user-perfil', supportData.perfis, 'nomePerfil');
    populate('filter-user-base', supportData.bases, 'nomeBase');
}

/**
 * Atualiza um valor de filtro e recarrega os dados.
 */
function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadUsers();
}

/**
 * Carrega os usuários da API de forma paginada e com filtros.
 */
async function loadUsers() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'nome_completo,asc'
    });

    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/usuarios?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar usuários.');

        const pageData = await response.json();
        renderUsersTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Renderiza os dados na tabela de usuários.
 */
function renderUsersTable(users) {
    const tableBody = document.querySelector('#tabela-usuarios tbody');
    const emptyState = document.getElementById('empty-state-usuarios');
    tableBody.innerHTML = '';

    if (users.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-users"></i><h3>Nenhum usuário encontrado</h3><p>Tente ajustar seus filtros ou cadastre um novo usuário.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        users.forEach(user => {
            const tr = document.createElement('tr');
            const statusTag = user.ativo
                ? `<span class="tag" style="background-color: var(--accent-success); color: white;">Ativo</span>`
                : `<span class="tag" style="background-color: var(--text-secondary); color: white;">Inativo</span>`;

            // CORREÇÃO: Alterado user.login para user.username para corresponder ao novo DTO.
            tr.innerHTML = `
                <td>${user.nomeCompleto}</td>
                <td>${user.username}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.perfil?.nomePerfil || 'N/A'}</td>
                <td>${user.baseOperacional?.nomeBase || 'N/A'}</td>
                <td>${statusTag}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

/**
 * Renderiza os controles de paginação.
 */
function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-usuarios');
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
        <div class="pagination-size">
            <label for="items-per-page-users">Itens:</label>
            <select id="items-per-page-users"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-users" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-users" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;
    const select = document.getElementById('items-per-page-users');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadUsers(); });
    document.getElementById('prev-page-users').addEventListener('click', () => { if (!first) { currentPage--; loadUsers(); } });
    document.getElementById('next-page-users').addEventListener('click', () => { if (!last) { currentPage++; loadUsers(); } });
}

/**
 * Mostra o formulário de usuário no painel lateral.
 */
function showUserForm() {
    const title = 'Novo Usuário';

    const formBody = `
        <form id="form-user">
            <div class="form-group">
                <label for="nomeCompleto">Nome Completo*</label>
                <input type="text" id="nomeCompleto" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="user">Login (Usuário)*</label>
                    <input type="text" id="user" required>
                </div>
                <div class="form-group">
                    <label for="cpf">CPF*</label>
                    <input type="text" id="cpf" required>
                </div>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email">
            </div>
            <div class="form-group">
                <label for="senhaHash">Senha*</label>
                <input type="password" id="senhaHash" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="perfilId">Perfil*</label>
                    <select id="perfilId" required></select>
                </div>
                <div class="form-group">
                    <label for="baseOperacionalId">Base Operacional*</label>
                    <select id="baseOperacionalId" required></select>
                </div>
            </div>
        </form>
    `;

    showDrawer({ title, body: formBody, onSave: handleFormSubmit });

    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Selecione...</option>';
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };

    populate('perfilId', supportData.perfis, 'nomePerfil');
    populate('baseOperacionalId', supportData.bases, 'nomeBase');
}

/**
 * Lida com o envio do formulário de criação de usuário.
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-user');

    const userData = {
        user: form.querySelector('#user').value,
        cpf: form.querySelector('#cpf').value,
        nomeCompleto: form.querySelector('#nomeCompleto').value,
        senhaHash: form.querySelector('#senhaHash').value,
        email: form.querySelector('#email').value,
        perfilId: parseInt(form.querySelector('#perfilId').value) || null,
        baseOperacionalId: parseInt(form.querySelector('#baseOperacionalId').value) || null,
    };

    if (!userData.nomeCompleto || !userData.user || !userData.senhaHash || !userData.perfilId || !userData.baseOperacionalId || !userData.cpf) {
        showNotification('Todos os campos com * são obrigatórios.', 'error');
        throw new Error('Validation failed');
    }

    try {
        const response = await fetchAutenticado('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Falha ao criar usuário.`);
        }
        showNotification(`Usuário criado com sucesso!`, 'success');
        closeDrawer();
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}
