package com.sipel.CES.choreCadastros.basesOperacionais.DTO;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;

public record BaseOperacionalDTO(
        Integer id,
        String nomeBase
) {

    public BaseOperacionalDTO(BaseOperacional baseOperacional) {
        this(baseOperacional.getId(), baseOperacional.getNomeBase());
    }
}
