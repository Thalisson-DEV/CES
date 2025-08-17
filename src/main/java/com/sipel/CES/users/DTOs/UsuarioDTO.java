package com.sipel.CES.users.DTOs;

import com.sipel.CES.choreCadastros.basesOperacionais.DTO.BaseOperacionalDTO;
import com.sipel.CES.choreCadastros.perfis.DTO.PerfilDTO;
import com.sipel.CES.users.entity.Usuario;

public record UsuarioDTO(
        String nomeCompleto,
        String username,
        String email,
        PerfilDTO perfil,
        BaseOperacionalDTO baseOperacional
) {

    public UsuarioDTO(Usuario usuario) {
        this(
                usuario.getNomeCompleto(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getPerfil() != null ? new PerfilDTO(usuario.getPerfil()) : null,
                usuario.getBaseOperacional() != null ? new BaseOperacionalDTO(usuario.getBaseOperacional()) : null
        );
    }
}
