package com.sipel.CES.choreCadastros.StatusSolicitacoes.DTOs;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;

public record StatusSolicitacaoDTO(Integer id, String nomeStatus) {
    public StatusSolicitacaoDTO(StatusSolicitacoes status) {
        this(status.getId(), status.getNomeStatus());
    }
}
