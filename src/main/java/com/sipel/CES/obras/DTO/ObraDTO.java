package com.sipel.CES.obras.DTO;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ObraDTO(
        @NotBlank
        String numeroObra,
        @NotBlank
        String titulo,
        // Bases podem ser nulas
        Integer baseObra,
        Integer baseSaque,
        // Datas podem ser nulas
        LocalDate dataInicio,
        LocalDate dataFim,
        @NotNull
        Integer statusObra,
        boolean ativo,
        // DataCriacao é gerenciada pelo sistema
        OffsetDateTime dataCriacao
) {
}
