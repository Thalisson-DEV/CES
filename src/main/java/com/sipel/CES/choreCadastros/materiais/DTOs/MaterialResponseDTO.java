package com.sipel.CES.choreCadastros.materiais.DTOs;

import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.generic.entitys.SuprMatrEnum;

public record MaterialResponseDTO(
        int id,
        String codigoMaterial,
        String nomeMaterial,
        String descricao,
        String unidadeMedida,
        SuprMatrEnum suprMatr,
        String avaliacao,
        String centro
) {
        public MaterialResponseDTO(Material material) {
        this(
                material.getId(),
                material.getCodigoMaterial(),
                material.getNomeMaterial(),
                material.getDescricao(),
                material.getUnidadeMedida(),
                material.getSuprMatrEnum(),
                material.getAvaliacao(),
                material.getCentro());
    }
}