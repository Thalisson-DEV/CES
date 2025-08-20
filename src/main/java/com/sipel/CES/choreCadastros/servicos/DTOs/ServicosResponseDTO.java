package com.sipel.CES.choreCadastros.servicos.DTOs;

import com.sipel.CES.choreCadastros.contrato.DTOs.ContratoDTO;
import com.sipel.CES.choreCadastros.processos.DTOs.ProcessoDTO;
import com.sipel.CES.choreCadastros.servicos.entity.Servicos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ServicosResponseDTO(
        Integer id,
        String codigoServico,
        String descricao,
        String unidadeMedida,
        String grupoMercadoria,
        ProcessoDTO processo,
        ContratoDTO contratoDTO,
        BigDecimal valorReferencia,
        String textoLongo,
        Boolean ativo,
        OffsetDateTime dataCriacao
) {

    public ServicosResponseDTO(Servicos servicos) {
        this(
                servicos.getId(),
                servicos.getCodigoServico(),
                servicos.getDescricao(),
                servicos.getUnidadeMedida(),
                servicos.getGrupoMercadoria(),
                servicos.getProcesso() != null ? new ProcessoDTO(servicos.getProcesso()) : null,
                servicos.getContrato() != null ? new ContratoDTO(servicos.getContrato()) : null,
                servicos.getValorReferencia(),
                servicos.getTextoLongo(),
                servicos.isAtivo(),
                servicos.getDataCriacao()
        );
    }
}
