package com.sipel.CES.choreCadastros.contrato;

import java.time.OffsetDateTime;

public record ContratoDTO(
        String numeroContrato,
        String descricao,
        OffsetDateTime dataInicio,
        OffsetDateTime dataFim,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
}
