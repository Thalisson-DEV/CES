package com.sipel.CES.comercial.aplicacoes.aplicacoesItems.DTOs;

import java.math.BigDecimal;

public record AplicacoesDTO(
        Integer materialId,
        Integer tipoAplicacaoId,
        BigDecimal quantidadeAplicada
) {
}
