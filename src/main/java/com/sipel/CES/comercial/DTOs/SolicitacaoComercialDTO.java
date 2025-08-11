package com.sipel.CES.comercial.DTOs;

import java.time.OffsetDateTime;

public record SolicitacaoComercialDTO(
        Integer solicitante,
        Integer status,
        Integer processo,
        Integer equipe,
        String observacoes,
        OffsetDateTime dataCriacao,
        OffsetDateTime dataModificacao
) {
}
