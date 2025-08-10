package com.sipel.CES.users.DTOs; // Verifique se o pacote está correto

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.perfis.entity.Perfis;
import com.sipel.CES.generic.entitys.Perfil;
import com.sipel.CES.users.entity.Usuario;

// Este DTO expõe apenas os dados seguros da entidade Usuario.
public record UsuarioResponseDTO(
        Long id,
        String nomeCompleto,
        String username,
        String email,
        PerfilDTO perfil,
        BaseDTO baseOperacional,
        boolean ativo
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getPerfil() != null ? new PerfilDTO(usuario.getPerfil()) : null,
                usuario.getBaseOperacional() != null ? new BaseDTO(usuario.getBaseOperacional()) : null,
                usuario.isAtivo()
        );
    }

    public record BaseDTO(int id, String nomeBase) {
        public BaseDTO(BaseOperacional base) {
            this(base.getId(), base.getNomeBase());
        }
    }

    public record PerfilDTO(int id, String nomePerfil) {
        public PerfilDTO(Perfil perfil) {
            this(perfil.getId(), perfil.getNomePerfil());
        }
    }
}
