package com.sipel.CES.users.auth.DTOs;

public record LoginResponseDTO(String token, String user, String nomeCompleto, String email) {
}
