package com.sipel.CES.choreCadastros.coordenador.DTOs;

import java.time.OffsetDateTime;

public record CoordenadorDTO(
        Long usuarioId,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
}
