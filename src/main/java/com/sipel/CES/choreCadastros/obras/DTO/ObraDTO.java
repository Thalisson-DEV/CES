package com.sipel.CES.choreCadastros.obras.DTO;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
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
        Integer coordenador,
        Integer supervisor,
        BigDecimal latitude,
        BigDecimal longitude,
        @NotNull
        Integer statusObra,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
}
