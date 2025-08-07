document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const tabelaBody = document.querySelector('#tabela-obras tbody');
    const emptyState = document.getElementById('sem-obras');
    const tableContainer = document.querySelector('#page-obras .table-container');

    // Botões principais
    const btnNovaObra = document.getElementById('btn-nova-obra');
    const btnNovaObraEmpty = document.getElementById('btn-nova-obra-empty');
    const btnImportarObras = document.getElementById('btn-importar-obras');
    const inputArquivoObras = document.getElementById('input-arquivo-obras');

    // Formulário Individual
    const formContainer = document.getElementById('form-obra-container');
    const obraForm = document.getElementById('form-obra');
    const formTitle = document.getElementById('form-obra-title');
    const obraIdInput = document.getElementById('obra-id');
    const btnFecharForm = document.getElementById('btn-fechar-form-obra');
    const btnCancelar = document.getElementById('btn-cancelar-obra');
    const numeroObraInput = document.getElementById('numero-obra');
    const tituloInput = document.getElementById('titulo-obra');
    const statusInput = document.getElementById('status-obra');
    const baseObraInput = document.getElementById('base-obra');
    const baseSaqueInput = document.getElementById('base-saque');
    const dataInicioInput = document.getElementById('data-inicio');
    const dataFimInput = document.getElementById('data-fim');
    const latitudeInput = document.getElementById('latitude-obra');
    const longitudeInput = document.getElementById('longitude-obra');

    // Modal de Importação
    const importModal = document.getElementById('import-modal');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const importSucessoSpan = document.getElementById('import-sucesso');
    const importFalhasSpan = document.getElementById('import-falhas');
    const importErrosContainer = document.getElementById('import-erros-container');
    const importErrosLista = document.getElementById('import-erros-lista');

    let allObras = [];

    // --- FUNÇÕES DE UI ---
    const mostrarFormulario = (isEdit = false, obra = null) => {
        formTitle.textContent = isEdit ? 'Editar Obra' : 'Nova Obra';
        obraForm.reset();
        obraIdInput.value = '';
        if (isEdit && obra) {
            obraIdInput.value = obra.id;
            numeroObraInput.value = obra.numeroObra || '';
            tituloInput.value = obra.titulo || '';
            statusInput.value = obra.status?.id || '';
            baseObraInput.value = obra.baseObra?.id || '';
            baseSaqueInput.value = obra.baseSaque?.id || '';
            dataInicioInput.value = obra.dataInicio || '';
            dataFimInput.value = obra.dataFim || '';
            // Campos não suportados removidos: latitude, longitude
        }
        formContainer.style.display = 'block';
    };

    const esconderFormulario = () => { formContainer.style.display = 'none'; };

    // --- LÓGICA DE DADOS (CRUD) ---
    const carregarObras = async () => {
        try {
            const response = await fetchAutenticado('/api/v1/obras', { method: 'GET' });
            if (!response.ok) throw new Error('Falha ao carregar obras.');
            const obras = await response.json();
            allObras = obras;
            renderizarTabela(obras);
        } catch (error) {
            mostrarMensagem(error.message, 'erro');
        }
    };

    const renderizarTabela = (obras) => {
        tabelaBody.innerHTML = '';
        if (obras.length === 0) {
            tableContainer.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            tableContainer.style.display = 'block';
            emptyState.style.display = 'none';
            obras.forEach(obra => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${obra.numeroObra || 'N/A'}</td>
                    <td>${obra.titulo || 'N/A'}</td>
                    <td>${obra.status?.nomeStatus || 'N/A'}</td>
                    <td>${obra.baseObra?.nomeBase || 'N/A'}</td>
                    <td>${obra.baseSaque?.nomeBase || 'N/A'}</td>
                    <td>${obra.dataInicio ? new Date(obra.dataInicio).toLocaleDateString() : 'N/A'}</td>
                    <td>${obra.dataFim ? new Date(obra.dataFim).toLocaleDateString() : 'N/A'}</td>
                    <td class="acoes">
                        <button class="btn-icon btn-editar" data-id="${obra.id}" data-tooltip="Editar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg></button>
                        <button class="btn-icon btn-excluir" data-id="${obra.id}" data-tooltip="Excluir"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.12a.75.75 0 011.06 0l1.25 1.25 1.25-1.25a.75.75 0 111.06 1.06L11.56 11l1.25 1.25a.75.75 0 11-1.06 1.06L10.5 12.06l-1.25 1.25a.75.75 0 01-1.06-1.06L9.44 11l-1.25-1.25a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg></button>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const id = obraIdInput.value;
        const isEdit = !!id;

        // Validações de formulário
        if (!numeroObraInput.value.trim()) {
            mostrarMensagem('O número da obra é obrigatório', 'erro');
            numeroObraInput.focus();
            return;
        }

        if (!tituloInput.value.trim()) {
            mostrarMensagem('O título da obra é obrigatório', 'erro');
            tituloInput.focus();
            return;
        }

        if (!statusInput.value) {
            mostrarMensagem('O status da obra é obrigatório', 'erro');
            statusInput.focus();
            return;
        }

        const obraData = {
            numeroObra: numeroObraInput.value.trim(),
            titulo: tituloInput.value.trim(),
            statusObra: parseInt(statusInput.value),
            baseObra: baseObraInput.value ? parseInt(baseObraInput.value) : null,
            baseSaque: baseSaqueInput.value ? parseInt(baseSaqueInput.value) : null,
            dataInicio: dataInicioInput.value || null,
            dataFim: dataFimInput.value || null,
            ativo: true
        };

        const endpoint = isEdit ? `/api/v1/obras/${id}` : '/api/v1/obras';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetchAutenticado(endpoint, { 
                method, 
                body: JSON.stringify(obraData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                let errorMsg = `Falha ao ${isEdit ? 'atualizar' : 'criar'} obra.`;

                if (errorData && errorData.message) {
                    errorMsg = errorData.message;
                }

                throw new Error(errorMsg);
            }

            mostrarMensagem(`Obra ${isEdit ? 'atualizada' : 'criada'} com sucesso!`);
            esconderFormulario();
            carregarObras();
        } catch (error) {
            mostrarMensagem(error.message, 'erro');
            console.error('Erro ao processar formulário:', error);
        }
    };

    const handleTableActions = async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir esta obra?')) {
                try {
                    const response = await fetchAutenticado(`/api/v1/obras/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Falha ao excluir obra.');
                    mostrarMensagem('Obra excluída com sucesso!');
                    carregarObras();
                } catch (error) {
                    mostrarMensagem(error.message, 'erro');
                }
            }
        }
        if (target.classList.contains('btn-editar')) {
            const obraParaEditar = allObras.find(o => o.id == id);
            if (obraParaEditar) {
                await carregarDropdowns(); // Garante que os dropdowns estão preenchidos antes de abrir
                mostrarFormulario(true, obraParaEditar);
            }
        }
    };

    // --- LÓGICA DE IMPORTAÇÃO ---
    const handleImportarClick = () => { inputArquivoObras.click(); };
    const handleArquivoSelecionado = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchAutenticado('/api/v1/obras/import', {
                method: 'POST',
                body: formData,
                // Não defina o Content-Type aqui, o navegador vai configurar automaticamente para multipart/form-data
            });

            if (!response.ok) throw new Error('Falha ao importar as obras.');
            const resultado = await response.json();
            exibirResultadoImportacao(resultado);
        } catch (error) {
            mostrarMensagem(error.message, 'erro');
        }

        // Limpa o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
    };
    const exibirResultadoImportacao = (resultado) => {
        importModal.classList.add('visible');
        importSucessoSpan.textContent = resultado.sucessos || 0;
        importFalhasSpan.textContent = resultado.falhas || 0;

        // Exibe ou esconde a seção de erros
        if (resultado.erros && resultado.erros.length > 0) {
            importErrosContainer.style.display = 'block';
            importErrosLista.innerHTML = '';

            resultado.erros.forEach(erro => {
                const li = document.createElement('li');

                // Melhorar a formatação dos erros para destacar a causa
                const errorText = erro;

                // Extrai e formata a mensagem de erro para melhor legibilidade
                if (errorText.includes('Linha')) {
                    const linhaMatch = errorText.match(/Linha (\d+)/);
                    const restoDaMensagem = errorText.replace(/Linha (\d+):?\s*/, '');

                    if (linhaMatch) {
                        const strong = document.createElement('strong');
                        strong.textContent = `Linha ${linhaMatch[1]}: `;
                        li.appendChild(strong);
                        li.appendChild(document.createTextNode(restoDaMensagem));
                    } else {
                        li.textContent = errorText;
                    }
                } else {
                    li.textContent = errorText;
                }

                importErrosLista.appendChild(li);
            });
        } else {
            importErrosContainer.style.display = 'none';
        }
    };

    const fecharModal = () => { 
        importModal.classList.remove('visible'); 
        carregarObras(); 
    };

    // --- CARREGAR DROPDOWNS ---
    const carregarDropdowns = async () => {
        try {
            const [statusRes, basesRes] = await Promise.all([
                fetchAutenticado('/api/v1/status-obra', { method: 'GET' }),
                fetchAutenticado('/api/v1/bases-operacionais', { method: 'GET' })
            ]);
            if (!statusRes.ok || !basesRes.ok) throw new Error('Falha ao carregar dados de suporte.');
            const statusList = await statusRes.json();
            const basesList = await basesRes.json();

            [statusInput, baseObraInput, baseSaqueInput].forEach(select => select.innerHTML = '<option value="">Selecione...</option>');
            statusList.forEach(s => statusInput.innerHTML += `<option value="${s.id}">${s.nomeStatus}</option>`);
            basesList.forEach(b => {
                baseObraInput.innerHTML += `<option value="${b.id}">${b.nomeBase}</option>`;
                baseSaqueInput.innerHTML += `<option value="${b.id}">${b.nomeBase}</option>`;
            });
        } catch (error) {
            mostrarMensagem(error.message, 'erro');
        }
    };

    // --- EVENT LISTENERS ---
    btnNovaObra.addEventListener('click', async () => { await carregarDropdowns(); mostrarFormulario(); });
    btnNovaObraEmpty.addEventListener('click', async () => { await carregarDropdowns(); mostrarFormulario(); });
    btnFecharForm.addEventListener('click', esconderFormulario);
    btnCancelar.addEventListener('click', esconderFormulario);
    obraForm.addEventListener('submit', handleFormSubmit);
    tabelaBody.addEventListener('click', handleTableActions);
    btnImportarObras.addEventListener('click', handleImportarClick);
    inputArquivoObras.addEventListener('change', handleArquivoSelecionado);
    btnFecharModal.addEventListener('click', fecharModal);

    // Botão adicional para fechar o modal de importação
    const btnContinuarImportacao = document.getElementById('btn-continuar-importacao');
    if (btnContinuarImportacao) {
        btnContinuarImportacao.addEventListener('click', fecharModal);
    }

    importModal.addEventListener('click', (event) => { if (event.target === importModal) fecharModal(); });

    // --- INICIALIZAÇÃO ---
    carregarObras();
});


// Usando os componentes compartilhados do arquivo components.js
