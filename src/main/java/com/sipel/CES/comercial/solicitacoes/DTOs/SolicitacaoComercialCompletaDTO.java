package com.sipel.CES.comercial.solicitacoes.DTOs;

import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsDTO;

import java.util.List;

public record SolicitacaoComercialCompletaDTO(
        SolicitacaoComercialDTO solicitacao,
        List<SolicitacaoComercialItemsDTO> itens
) {
}
