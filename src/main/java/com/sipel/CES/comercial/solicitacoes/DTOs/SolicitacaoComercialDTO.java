package com.sipel.CES.comercial.solicitacoes.DTOs;

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
