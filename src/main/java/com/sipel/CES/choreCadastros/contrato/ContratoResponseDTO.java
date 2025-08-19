package com.sipel.CES.choreCadastros.contrato;

import java.time.OffsetDateTime;

public record ContratoResponseDTO(
        int id,
        String numeroContrato,
        String descricao,
        OffsetDateTime dataInicio,
        OffsetDateTime dataFim,
        boolean ativo,
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
