package com.sipel.CES.users.service;

import com.sipel.CES.users.DTOs.UsuarioResponseDTO;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Retorna uma lista de todos os usuários, mapeados para um DTO seguro.
     * Isso evita a exposição de senhas ou outros dados sensíveis.
     * @return Lista de UsuarioResponseDTO.
     */
    public List<UsuarioResponseDTO> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }
}
