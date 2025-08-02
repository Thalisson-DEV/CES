package com.sipel.CES.DTOs;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Date;

public record ObraDTO(
        @NotBlank
        String numeroObra,
        @NotBlank
        String titulo,
        @NotNull
        Integer baseObra,
        @NotNull
        Integer baseSaque,
        @NotBlank
        LocalDate dataInicio,
        @NotBlank
        LocalDate dataFim,
        @NotNull
        Integer statusObra,
        @NotNull
        boolean ativo,
        @NotBlank
        OffsetDateTime dataCriacao
) {
}
