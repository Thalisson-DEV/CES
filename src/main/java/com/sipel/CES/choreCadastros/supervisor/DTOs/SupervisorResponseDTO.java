package com.sipel.CES.choreCadastros.supervisor.DTOs;

import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.users.entity.Usuario;

import java.time.OffsetDateTime;

public record SupervisorResponseDTO(
        int id,
        UsuarioDTO usuarioId,
        boolean ativo,
        OffsetDateTime dataCriacao
) {

    public SupervisorResponseDTO(Supervisor supervisor) {
        this(
                supervisor.getId(),
                supervisor.getUsuario() != null ? new UsuarioDTO(supervisor.getUsuario()) : null,
                supervisor.isAtivo(),
                supervisor.getDataCriacao());
    }

    public record UsuarioDTO(Long id, String user) {
        public UsuarioDTO(Usuario usuario) {
            this(usuario.getId(), usuario.getNomeCompleto());
        }
    }

}
