import { updateMenuActiveState } from '../app.js';
import { fetchAutenticado } from '../api.js';
import { showNotification } from '../components.js';

let supportData = {};
let currentPage = 0;
let itemsPerPage = 10;
let currentFilters = {
    tipoNotaId: '',
    equipeId: '',
    baseId: '',
    searchTerm: ''
};

export function renderNoteTrackingPage() {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById('template-note-tracking');
    if (!pageContent || !template) return;

    pageContent.innerHTML = '';
    pageContent.appendChild(template.content.cloneNode(true));

    updateMenuActiveState();
    setupEventListeners();
    loadSupportData().then(() => {
        populateFilterDropdowns();
        loadNotes();
    });
}

function setupEventListeners() {
    document.getElementById('filter-note-type').addEventListener('change', (e) => updateFilter('tipoNotaId', e.target.value));
    document.getElementById('filter-note-equipe').addEventListener('change', (e) => updateFilter('equipeId', e.target.value));
    document.getElementById('filter-note-base').addEventListener('change', (e) => updateFilter('baseId', e.target.value));
    document.getElementById('busca-note').addEventListener('input', (e) => updateFilter('searchTerm', e.target.value));
}

async function loadSupportData() {
    try {
        if (supportData.tiposNota) return;
        const [tiposNotaRes, equipesRes, basesRes] = await Promise.all([
            fetchAutenticado('/api/v1/tipos-nota'),
            fetchAutenticado('/api/v1/equipes?size=2000'),
            fetchAutenticado('/api/v1/bases-operacionais')
        ]);

        if (!tiposNotaRes.ok || !equipesRes.ok || !basesRes.ok) throw new Error('Falha ao carregar dados de suporte.');

        supportData.tiposNota = await tiposNotaRes.json();
        supportData.equipes = (await equipesRes.json()).content;
        supportData.bases = await basesRes.json();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateFilterDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        select.innerHTML = `<option value="">Todos</option>`;
        data?.forEach(item => select.add(new Option(item[nameProp], item[valueProp])));
    };
    populate('filter-note-type', supportData.tiposNota, 'nomeTipoNota');
    populate('filter-note-equipe', supportData.equipes, 'nomeEquipe');
    populate('filter-note-base', supportData.bases, 'nomeBase');
}

function updateFilter(key, value) {
    currentPage = 0;
    currentFilters[key] = value;
    loadNotes();
}

async function loadNotes() {
    const params = new URLSearchParams({ page: currentPage, size: itemsPerPage, sort: 'data_nota,desc' });
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetchAutenticado(`/api/v1/notas?${params.toString()}`);
        if (!response.ok) throw new Error('Falha ao carregar as notas de campo.');

        const pageData = await response.json();
        renderNotesTable(pageData.content);
        renderPaginationControls(pageData);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function renderNotesTable(notes) {
    const tableBody = document.querySelector('#tabela-notas tbody');
    const emptyState = document.getElementById('empty-state-notas');
    tableBody.innerHTML = '';

    if (notes.length === 0) {
        emptyState.innerHTML = `<i class="ph ph-notebook"></i><h3>Nenhuma nota encontrada</h3><p>Lance uma nova nota de campo para começar.</p>`;
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        notes.forEach(note => {
            const tr = tableBody.insertRow();
            tr.innerHTML = `
                <td><a href="#" class="text-blue-600 hover:underline font-semibold">${note.numeroNota}</a></td>
                <td>${note.tipoNota?.nomeTipoNota || 'N/A'}</td>
                <td>${note.equipe?.nomeEquipe || 'N/A'}</td>
                <td>${note.baseOperacional?.nomeBase || 'N/A'}</td>
                <td>${note.usuario?.user || 'N/A'}</td>
                <td>${new Date(note.dataNota).toLocaleDateString('pt-BR')}</td>
                <td class="actions">
                    <button class="btn-icon" title="Ver Detalhes"><i class="ph ph-eye"></i></button>
                </td>
            `;
        });
    }
}

function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-notas');
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
        <div class="pagination-size"><label for="items-per-page-notes">Itens:</label><select id="items-per-page-notes"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div>
        <div class="pagination-nav"><button class="btn-icon" id="prev-page-notes" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button><span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span><button class="btn-icon" id="next-page-notes" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button></div>
    `;
    const select = document.getElementById('items-per-page-notes');
    select.value = itemsPerPage;
    select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 0; loadNotes(); });
    document.getElementById('prev-page-notes').addEventListener('click', () => { if (!first) { currentPage--; loadNotes(); } });
    document.getElementById('next-page-notes').addEventListener('click', () => { if (!last) { currentPage++; loadNotes(); } });
}