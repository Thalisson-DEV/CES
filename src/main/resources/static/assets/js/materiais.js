// Aguarda o DOM (a estrutura da página) ser completamente carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    // Mapeia todos os elementos HTML com os quais vamos interagir para variáveis.
    const formContainer = document.getElementById('form-material-container');
    const materialForm = document.getElementById('form-material');
    const formTitle = document.getElementById('form-material-title');
    const materialIdInput = document.getElementById('material-id');
    const tabelaBody = document.querySelector('#tabela-materiais tbody');
    const emptyState = document.getElementById('sem-materiais');

    // Botões
    const btnNovoMaterial = document.getElementById('btn-novo-material');
    const btnNovoMaterialEmpty = document.getElementById('btn-novo-material-empty');
    const btnFecharForm = document.getElementById('btn-fechar-form');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Campos do formulário
    const codigoInput = document.getElementById('codigo-material');
    const nomeInput = document.getElementById('nome-material');
    const descricaoInput = document.getElementById('descricao-material');
    const unidadeInput = document.getElementById('unidade-medida');
    // NOVOS CAMPOS ADICIONADOS
    const suprMatrInput = document.getElementById('supr-matr');
    const avaliacaoInput = document.getElementById('avaliacao');
    const centroInput = document.getElementById('centro');

    // Busca
    const buscaInput = document.getElementById('busca-material');

    let allMaterials = []; // Armazena a lista completa de materiais para a busca

    // --- FUNÇÕES DE UI (Interface do Usuário) ---

    // Mostra o formulário, ajustando o título para "Novo" ou "Editar"
    const mostrarFormulario = (isEdit = false, material = null) => {
        formTitle.textContent = isEdit ? 'Editar Material' : 'Novo Material';
        materialForm.reset(); // Limpa o formulário
        materialIdInput.value = ''; // Limpa o ID oculto

        if (isEdit && material) {
            // Preenche o formulário com os dados do material para edição
            materialIdInput.value = material.id;
            codigoInput.value = material.codigoMaterial;
            nomeInput.value = material.nomeMaterial;
            descricaoInput.value = material.descricao || '';
            unidadeInput.value = material.unidadeMedida;
            // PREENCHE OS NOVOS CAMPOS
            suprMatrInput.value = material.suprMatr;
            avaliacaoInput.value = material.avaliacao;
            centroInput.value = material.centro;
        }

        formContainer.style.display = 'block';
    };

    // Esconde o formulário
    const esconderFormulario = () => {
        formContainer.style.display = 'none';
    };

    // Mostra uma mensagem de feedback (sucesso ou erro)
    const mostrarMensagem = (texto, tipo = 'sucesso') => {
        const mensagemDiv = document.createElement('div');
        mensagemDiv.className = `mensagem ${tipo}`;
        mensagemDiv.textContent = texto;
        document.body.appendChild(mensagemDiv);

        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            mensagemDiv.remove();
        }, 3000);
    };

    // --- FUNÇÕES DE DADOS (Comunicação com a API) ---

    // Busca todos os materiais no backend e atualiza a tabela
    const carregarMateriais = async () => {
        try {
            const response = await fetchAutenticado('/api/v1/material', { method: 'GET' });
            if (!response.ok) throw new Error('Falha ao carregar materiais.');

            const materiais = await response.json();
            allMaterials = materiais; // Guarda a lista completa
            renderizarTabela(materiais);

        } catch (error) {
            mostrarMensagem(error.message, 'erro');
        }
    };

    // Renderiza a tabela com os dados dos materiais
    const renderizarTabela = (materiais) => {
        tabelaBody.innerHTML = ''; // Limpa a tabela antes de preencher

        if (materiais.length === 0) {
            emptyState.style.display = 'flex';
            document.querySelector('.table-container').style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            document.querySelector('.table-container').style.display = 'block';

            materiais.forEach(material => {
                const tr = document.createElement('tr');
                // ATUALIZADO PARA MOSTRAR AS NOVAS COLUNAS
                tr.innerHTML = `
                    <td>${material.codigoMaterial}</td>
                    <td>${material.nomeMaterial}</td>
                    <td>${material.unidadeMedida}</td>
                    <td>${material.suprMatr}</td>
                    <td>${material.centro}</td>
                    <td class="acoes">
                        <button class="btn-icon btn-editar" data-id="${material.id}" data-tooltip="Editar"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-icon btn-excluir" data-id="${material.id}" data-tooltip="Excluir"><i class="ph ph-trash"></i></button>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });
        }
    };

    // Lida com o envio do formulário (criação ou atualização)
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const id = materialIdInput.value;
        const isEdit = !!id;

        // Monta o objeto DTO para enviar ao backend
        // ATUALIZADO PARA INCLUIR OS NOVOS CAMPOS
        const materialData = {
            codigoMaterial: codigoInput.value,
            nomeMaterial: nomeInput.value,
            descricao: descricaoInput.value,
            unidadeMedida: unidadeInput.value,
            suprMatr: suprMatrInput.value,
            avaliacao: avaliacaoInput.value,
            centro: centroInput.value
        };

        const endpoint = isEdit ? `/api/v1/material/${id}` : '/api/v1/material';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetchAutenticado(endpoint, {
                method: method,
                body: JSON.stringify(materialData)
            });

            if (!response.ok) {
                throw new Error(`Falha ao ${isEdit ? 'atualizar' : 'criar'} material.`);
            }

            mostrarMensagem(`Material ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
            esconderFormulario();
            carregarMateriais(); // Recarrega a lista

        } catch (error) {
            mostrarMensagem(error.message, 'erro');
        }
    };

    // Lida com cliques nos botões de editar e excluir na tabela
    const handleTableActions = async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const id = target.dataset.id;

        // Ação de Excluir
        if (target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir este material?')) {
                try {
                    const response = await fetchAutenticado(`/api/v1/material/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Falha ao excluir material.');

                    mostrarMensagem('Material excluído com sucesso!');
                    carregarMateriais(); // Recarrega a lista
                } catch (error) {
                    mostrarMensagem(error.message, 'erro');
                }
            }
        }

        // Ação de Editar
        if (target.classList.contains('btn-editar')) {
            // Encontra o material completo na lista que já carregamos
            const materialParaEditar = allMaterials.find(m => m.id == id);
            if (materialParaEditar) {
                mostrarFormulario(true, materialParaEditar);
            }
        }
    };

    // Filtra a tabela de materiais com base no texto da busca
    const handleBusca = (event) => {
        const termoBusca = event.target.value.toLowerCase();
        const materiaisFiltrados = allMaterials.filter(material =>
            material.nomeMaterial.toLowerCase().includes(termoBusca) ||
            material.codigoMaterial.toLowerCase().includes(termoBusca)
        );
        renderizarTabela(materiaisFiltrados);
    };

    // --- EVENT LISTENERS (Conectando as ações aos elementos) ---
    btnNovoMaterial.addEventListener('click', () => mostrarFormulario());
    btnNovoMaterialEmpty.addEventListener('click', () => mostrarFormulario());
    btnFecharForm.addEventListener('click', esconderFormulario);
    btnCancelar.addEventListener('click', esconderFormulario);
    materialForm.addEventListener('submit', handleFormSubmit);
    tabelaBody.addEventListener('click', handleTableActions);
    buscaInput.addEventListener('input', handleBusca);

    // --- INICIALIZAÇÃO ---
    // Carrega a lista de materiais assim que a página é carregada.
    carregarMateriais();
});