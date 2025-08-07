/**
 * Mostra uma notificação (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificação ('success', 'error', 'info').
 */
export function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconClass = {
        success: 'ph-check-circle',
        error: 'ph-x-circle',
        info: 'ph-info'
    }[type];

    toast.innerHTML = `
        <i class="toast-icon ph ${iconClass}"></i>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Fecha todos os modais visíveis.
 */
export function closeAllModals() {
    document.querySelectorAll('.modal-overlay.visible').forEach(modal => {
        modal.classList.remove('visible');
    });
}

function setupModalCloseListeners(modal) {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
        }
    });
    modal.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
    });
}

export function showUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;

    setupModalCloseListeners(modal);
    modal.classList.add('visible');

    const form = modal.querySelector('#profile-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        showNotification('Perfil atualizado com sucesso!', 'success');
        closeAllModals();
    };
}

export function showImportModal(result, entityName = 'Itens') {
    const modal = document.getElementById('import-modal');
    if (!modal) return;

    modal.querySelector('#import-modal-title').textContent = `Resultado da Importação de ${entityName}`;
    modal.querySelector('#import-sucesso').textContent = result.sucessos || 0;
    modal.querySelector('#import-falhas').textContent = result.falhas || 0;

    const errosContainer = modal.querySelector('#import-erros-container');
    const errosLista = modal.querySelector('#import-erros-lista');

    if (result.erros && result.erros.length > 0) {
        errosContainer.style.display = 'block';
        errosLista.innerHTML = '';
        result.erros.forEach(erro => {
            const li = document.createElement('li');
            li.textContent = erro;
            errosLista.appendChild(li);
        });
    } else {
        errosContainer.style.display = 'none';
    }

    setupModalCloseListeners(modal);
    modal.classList.add('visible');
}


/**
 * NOVO: Gerenciador do Painel Lateral (Drawer)
 */
export function showDrawer({ title, body, onSave }) {
    const container = document.getElementById('drawer-container');
    const template = document.getElementById('template-drawer');
    if (!container || !template) return;

    container.innerHTML = ''; // Limpa qualquer drawer anterior
    container.appendChild(template.content.cloneNode(true));

    const drawerPanel = container.querySelector('.drawer-panel');
    const drawerOverlay = container.querySelector('.drawer-overlay');
    const drawerTitle = container.querySelector('#drawer-title');
    const drawerBody = container.querySelector('#drawer-body');
    const btnSave = container.querySelector('#btn-save-drawer');
    const btnCancel = container.querySelector('#btn-cancel-drawer');
    const btnClose = container.querySelector('#btn-close-drawer');

    drawerTitle.textContent = title;
    drawerBody.innerHTML = body;

    const closeDrawer = () => {
        drawerPanel.classList.remove('visible');
        drawerOverlay.classList.remove('visible');
        // Remove o drawer do DOM após a animação para limpar os eventos
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    };

    // Adiciona os eventos
    btnSave.onclick = async () => {
        btnSave.disabled = true;
        btnSave.textContent = 'Salvando...';
        try {
            await onSave(); // Chama a função de salvar passada como parâmetro
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = 'Salvar';
        }
    };
    btnCancel.onclick = closeDrawer;
    btnClose.onclick = closeDrawer;
    drawerOverlay.onclick = closeDrawer;

    // Mostra o drawer
    setTimeout(() => {
        drawerPanel.classList.add('visible');
        drawerOverlay.classList.add('visible');
    }, 10); // Pequeno delay para garantir que a transição CSS funcione
}

export function closeDrawer() {
    const container = document.getElementById('drawer-container');
    const drawerPanel = container.querySelector('.drawer-panel');
    const drawerOverlay = container.querySelector('.drawer-overlay');
    if (drawerPanel && drawerOverlay) {
        drawerPanel.classList.remove('visible');
        drawerOverlay.classList.remove('visible');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
}
