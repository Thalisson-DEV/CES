package com.sipel.CES.choreCadastros.servicos.DTOs;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ServicosDTO(
        String codigoServico,
        String descricao,
        String unidadeMedida,
        String grupoMercadoria,
        Integer processo,
        Integer contrato,
        BigDecimal valorReferencia,
        String textoLongo,
        Boolean ativo,
        OffsetDateTime dataCriacao
) {
}
