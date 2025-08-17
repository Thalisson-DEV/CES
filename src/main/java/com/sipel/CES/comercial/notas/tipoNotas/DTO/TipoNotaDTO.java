package com.sipel.CES.comercial.notas.tipoNotas.DTO;

import com.sipel.CES.comercial.notas.tipoNotas.entity.TipoNota;

public record TipoNotaDTO(Integer id, String nomeTipoNota, String grupoNota) {
    public TipoNotaDTO(TipoNota tipoNota) {
        this(tipoNota.getId(), tipoNota.getNomeTipoNota(), tipoNota.getGrupoNota());
    }
}
