package com.sipel.CES.encarregados.DTO;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record EncarregadoDTO(
        String nomeCompleto,
        String vulgo,
        boolean ativo,
        Integer baseOperacional,
        OffsetDateTime dataCriacao
) {}
