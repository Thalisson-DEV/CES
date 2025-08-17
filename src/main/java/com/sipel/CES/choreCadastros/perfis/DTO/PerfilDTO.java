package com.sipel.CES.choreCadastros.perfis.DTO;

import com.sipel.CES.generic.entitys.Perfil;

public record PerfilDTO(
        Integer id,
        String nomePerfil,
        String descricao
) {

    public PerfilDTO(Perfil perfil) {
        this(perfil.getId(), perfil.getNomePerfil(), perfil.getAuthority());
    }
}
