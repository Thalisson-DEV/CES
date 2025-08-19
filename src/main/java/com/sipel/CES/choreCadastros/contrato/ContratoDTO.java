package com.sipel.CES.choreCadastros.contrato;

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
}
