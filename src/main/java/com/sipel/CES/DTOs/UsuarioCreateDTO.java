package com.sipel.CES.DTOs;

import com.sipel.CES.models.BaseOperacional;
import com.sipel.CES.models.Perfil;

public record UsuarioCreateDTO(String user, String cpf, String nomeCompleto, String senhaHash, String email, Integer perfilId, Integer baseOperacionalId) {
}
