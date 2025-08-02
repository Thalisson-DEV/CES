package com.sipel.CES.DTOs;

import com.sipel.CES.models.Obra;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Date;

public record ObraResponseDTO(
        int id,
        String numeroObra,
        String titulo,
        Integer baseObra,
        Integer baseSaque,
        LocalDate dataInicio,
        LocalDate dataFim,
        Integer statusObra,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
    public ObraResponseDTO(Obra obra) {
        this(
                obra.getId(),
                obra.getNumeroObra(),
                obra.getTitulo(),
                obra.getBaseObra().getId(),
                obra.getBaseSaque().getId(),
                obra.getDataInicio(),
                obra.getDataFim(),
                obra.getStatusObra().getId(),
                obra.isAtivo(),
                obra.getDataCriacao());
    }
}
