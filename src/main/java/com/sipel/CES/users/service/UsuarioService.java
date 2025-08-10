package com.sipel.CES.users.service;

import com.sipel.CES.users.DTOs.UsuarioResponseDTO;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Page<UsuarioResponseDTO> getAllUsuarios (Integer perfilId, Integer baseId, String searchTerm, Pageable pageable) {
        Page<Usuario> usuariosPage = usuarioRepository.findWithFilters(perfilId, baseId, searchTerm, pageable);
        return usuariosPage.map(UsuarioResponseDTO::new);
    }
}
