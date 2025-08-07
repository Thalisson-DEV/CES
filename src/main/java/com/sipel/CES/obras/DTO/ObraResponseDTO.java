package com.sipel.CES.obras.DTO;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.obras.entity.Obra;
import com.sipel.CES.obras.entity.StatusObra;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ObraResponseDTO(
        int id,
        String numeroObra,
        String titulo,
        BaseDTO baseObra,
        BaseDTO baseSaque,
        LocalDate dataInicio,
        LocalDate dataFim,
        StatusDTO status,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
    public ObraResponseDTO(Obra obra) {
        this(
                obra.getId(),
                obra.getNumeroObra(),
                obra.getTitulo(),
                obra.getBaseObra() != null ? new BaseDTO(obra.getBaseObra()) : null,
                obra.getBaseSaque() != null ? new BaseDTO(obra.getBaseSaque()) : null,
                obra.getDataInicio(),
                obra.getDataFim(),
                obra.getStatusObra() != null ? new StatusDTO(obra.getStatusObra()) : null,
                obra.isAtivo(),
                obra.getDataCriacao());
    }

    // DTOs internos para representar as entidades relacionadas
    public record BaseDTO(int id, String nomeBase) {
        public BaseDTO(BaseOperacional base) {
            this(base.getId(), base.getNomeBase());
        }
    }

    public record StatusDTO(int id, String nomeStatus) {
        public StatusDTO(StatusObra status) {
            this(status.getId(), status.getNomeStatus());
        }
    }
}
