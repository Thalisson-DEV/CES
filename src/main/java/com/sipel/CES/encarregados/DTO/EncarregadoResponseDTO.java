package com.sipel.CES.encarregados.DTO;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.encarregados.entity.Encarregado;

import java.time.OffsetDateTime;

public record EncarregadoResponseDTO(
    int id,
    String nomeCompleto,
    String vulgo,
    boolean ativo,
    BaseDTO baseOperacional,
    OffsetDateTime dataCriacao
) {

    public EncarregadoResponseDTO(Encarregado encarregado) {
        this(
                encarregado.getId(),
                encarregado.getNomeCompleto(),
                encarregado.getVulgo(),
                encarregado.isAtivo(),
                encarregado.getBaseOperacional() != null ? new EncarregadoResponseDTO.BaseDTO(encarregado.getBaseOperacional()) : null,
                encarregado.getDataCriacao());
    }

    public record BaseDTO(int id, String nomeBase) {
        public BaseDTO(BaseOperacional base) {
            this(base.getId(), base.getNomeBase());
        }
    }
}
