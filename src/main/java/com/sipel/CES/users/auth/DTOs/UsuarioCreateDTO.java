package com.sipel.CES.users.auth.DTOs;

public record UsuarioCreateDTO(String user, String cpf, String nomeCompleto, String senhaHash, String email, Integer perfilId, Integer baseOperacionalId) {
}
