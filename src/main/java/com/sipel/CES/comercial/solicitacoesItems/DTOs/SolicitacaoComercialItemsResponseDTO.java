package com.sipel.CES.comercial.solicitacoesItems.DTOs;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.DTOs.StatusSolicitacaoDTO;
import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.solicitacoesItems.entity.SolicitacaoComercialItems;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SolicitacaoComercialItemsResponseDTO(
        int id,
        SolicitacaoComercialDTO solicitacaoComercial,
        MaterialDTO material,
        StatusSolicitacaoDTO status,
        BigDecimal quantidadeSolicitada,
        BigDecimal quantidadeAtendida,
        OffsetDateTime dataModificacao
) {

    public SolicitacaoComercialItemsResponseDTO(SolicitacaoComercialItems items) {
        this(
                items.getId(),
                items.getSolicitacaoComercialId() != null ? new SolicitacaoComercialDTO(items.getId()) : null,
                items.getMaterialId() != null ? new MaterialDTO(items.getMaterialId()) : null,
                items.getStatusId() != null ? new StatusSolicitacaoDTO(items.getStatusId()) : null,
                items.getQuantidadeSolicitada(),
                items.getQuantidadeAtendida(),
                items.getDataModificacao());
    }

    public record SolicitacaoComercialDTO(int id) {
        public SolicitacaoComercialDTO(SolicitacaoComercial solicitacaoComercial) {
            this(solicitacaoComercial.getId());
        }
    }

    public record MaterialDTO(int id, String nomeMaterial, String codigoMaterial) {
        public MaterialDTO(Material material) {
            this(material.getId(), material.getNomeMaterial(), material.getCodigoMaterial());
        }
    }
}
