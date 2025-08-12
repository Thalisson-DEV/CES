package com.sipel.CES.comercial.solicitacoesItems.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SolicitacaoComercialItemsDTO(
        @NotNull
        Integer solicitacaoId,
        Integer materialId,
        Integer statusId,
        @NotNull
        @Positive
        BigDecimal quantidadeSolicitada,
        BigDecimal quantidadeAtendida,
        OffsetDateTime dataModificacao
) {
}
