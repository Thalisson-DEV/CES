package com.sipel.CES.users.controller;

import com.sipel.CES.users.DTOs.UsuarioResponseDTO;
import com.sipel.CES.users.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<Page<UsuarioResponseDTO>> getAllUsuarios(
            @RequestParam(required = false) Integer perfilId,
            @RequestParam(required = false) Integer baseId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<UsuarioResponseDTO> usuarios = usuarioService.getAllUsuarios(perfilId, baseId, searchTerm, pageable);
        return ResponseEntity.ok(usuarios);
    }
}
