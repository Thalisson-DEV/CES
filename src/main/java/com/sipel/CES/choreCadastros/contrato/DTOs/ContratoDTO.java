package com.sipel.CES.choreCadastros.contrato.DTOs;

import com.sipel.CES.choreCadastros.contrato.entity.Contrato;

import java.time.OffsetDateTime;
import java.util.Date;

public record ContratoDTO(
        String numeroContrato,
        String descricao,
        Date dataInicio,
        Date dataFim,
        Boolean ativo,
        OffsetDateTime dataCriacao
) {
    public ContratoDTO(Contrato contrato) {
        this(contrato.getNumeroContrato(), contrato.getDescricao(), contrato.getDataInicio(), contrato.getDataFim(), contrato.isAtivo(), contrato.getDataCriacao());
    }
}
