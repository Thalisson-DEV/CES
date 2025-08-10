package com.sipel.CES.choreCadastros.coordenador.DTOs;

import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.users.entity.Usuario;

import java.time.OffsetDateTime;

public record CoordenadorResponseDTO(
        int id,
        UsuarioDTO usuarioId,
        boolean ativo,
        OffsetDateTime dataCriacao
) {

    public CoordenadorResponseDTO(Coordenador coordenador) {
        this(
                coordenador.getId(),
                coordenador.getUsuario() != null ? new UsuarioDTO(coordenador.getUsuario()) : null,
                coordenador.isAtivo(),
                coordenador.getDataCriacao());
    }

    public record UsuarioDTO(Long id, String user) {
        public UsuarioDTO(Usuario usuario) {
            this(usuario.getId(), usuario.getUsername());
        }
    }

}
