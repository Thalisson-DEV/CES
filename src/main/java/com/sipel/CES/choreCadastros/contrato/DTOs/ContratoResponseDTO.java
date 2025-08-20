package com.sipel.CES.choreCadastros.contrato.DTOs;

import com.sipel.CES.choreCadastros.contrato.entity.Contrato;

import java.time.OffsetDateTime;
import java.util.Date;

public record ContratoResponseDTO(
        int id,
        String numeroContrato,
        String descricao,
        Date dataInicio,
        Date dataFim,
        Boolean ativo,
        OffsetDateTime dataCriacao
) {

    public ContratoResponseDTO(Contrato contrato) {
        this(
                contrato.getId(),
                contrato.getNumeroContrato(),
                contrato.getDescricao(),
                contrato.getDataInicio(),
                contrato.getDataFim(),
                contrato.isAtivo(),
                contrato.getDataCriacao()
        );
    }
}
