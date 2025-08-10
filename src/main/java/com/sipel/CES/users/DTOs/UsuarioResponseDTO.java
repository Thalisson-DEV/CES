package com.sipel.CES.users.DTOs; // Verifique se o pacote está correto

import com.sipel.CES.users.entity.Usuario;

// Este DTO expõe apenas os dados seguros da entidade Usuario.
public record UsuarioResponseDTO(
        Long id,
        String nomeCompleto,
        String username
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getUsername()
        );
    }
}
