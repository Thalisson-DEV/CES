package com.sipel.CES.comercial.notas.DTOs;

import java.time.OffsetDateTime;

public record NotaDTO(
        String numeroNota,
        Integer tipoNota,
        Integer equipe,
        Integer usuario,
        Integer baseOperacional,
        OffsetDateTime dataNota,
        String observacoes,
        OffsetDateTime dataCriacao
) {
}
