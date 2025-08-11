package com.sipel.CES.comercial.DTOs;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.DTOs.StatusSolicitacaoDTO;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeDTO;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.processos.DTOs.ProcessoDTO;
import com.sipel.CES.comercial.entity.SolicitacaoComercial;
import com.sipel.CES.users.entity.Usuario;

import java.time.OffsetDateTime;

public record SolicitacaoComercialResponseDTO(
    int id,
    UsuarioDTO solicitante,
    StatusSolicitacaoDTO status,
    ProcessoDTO processo,
    EquipeDTO equipe,
    String observacoes,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataModificacao
) {

    public SolicitacaoComercialResponseDTO(SolicitacaoComercial solicitacaoComercial) {
        this(
                solicitacaoComercial.getId(),
                solicitacaoComercial.getSolicitante() != null ? new UsuarioDTO(solicitacaoComercial.getSolicitante()) : null,
                solicitacaoComercial.getStatus() != null ? new StatusSolicitacaoDTO(solicitacaoComercial.getStatus()) : null,
                solicitacaoComercial.getProcesso() != null ? new ProcessoDTO(solicitacaoComercial.getProcesso()) : null,
                solicitacaoComercial.getEquipe() != null ? new EquipeDTO(solicitacaoComercial.getEquipe()) : null,
                solicitacaoComercial.getObservacoes(),
                solicitacaoComercial.getDataCriacao(),
                solicitacaoComercial.getDataModificacao());
    }

    public record UsuarioDTO(Long id, String user) {
        public UsuarioDTO(Usuario usuario) {
            this(usuario.getId(), usuario.getNomeCompleto());
        }
    }

    public record EquipeDTO(Integer id, String nomeEquipe) {
        public EquipeDTO(Equipe equipe) {
            this(equipe.getId(), equipe.getNomeEquipe());
        }
    }
}
