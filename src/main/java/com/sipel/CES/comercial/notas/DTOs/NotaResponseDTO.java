package com.sipel.CES.comercial.notas.DTOs;

import com.sipel.CES.choreCadastros.basesOperacionais.DTO.BaseOperacionalDTO;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeDTO;
import com.sipel.CES.comercial.notas.entity.Nota;
import com.sipel.CES.comercial.notas.tipoNotas.DTO.TipoNotaDTO;
import com.sipel.CES.users.DTOs.UsuarioDTO;

import java.time.OffsetDateTime;

public record NotaResponseDTO(
        String numeroNota,
        TipoNotaDTO tipoNota,
        EquipeDTO equipe,
        UsuarioDTO usuario,
        BaseOperacionalDTO baseOperacional,
        OffsetDateTime dataNota,
        String Observacoes,
        OffsetDateTime dataCriacao
) {
    public NotaResponseDTO(Nota nota) {
        this(
                nota.getNumeroNota(),
                nota.getTipoNota() != null ? new TipoNotaDTO(nota.getTipoNota()) : null,
                nota.getEquipe() != null ? new EquipeDTO(nota.getEquipe()) : null,
                nota.getUsuario() != null ? new UsuarioDTO(nota.getUsuario()) : null,
                nota.getBaseOperacional() != null ? new BaseOperacionalDTO(nota.getBaseOperacional()) : null,
                nota.getDataNota(),
                nota.getObservacoes(),
                nota.getDataCriacao());
    }
}
