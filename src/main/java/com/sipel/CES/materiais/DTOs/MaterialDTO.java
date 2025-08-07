package com.sipel.CES.materiais.DTOs;

import com.sipel.CES.generic.entitys.SuprMatrEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaterialDTO(
        @NotBlank String codigoMaterial,
        @NotBlank String nomeMaterial,
        String descricao,
        @NotBlank String unidadeMedida,
        @NotNull SuprMatrEnum suprMatr,
        @NotBlank String avaliacao,
        @NotBlank String centro
) {}