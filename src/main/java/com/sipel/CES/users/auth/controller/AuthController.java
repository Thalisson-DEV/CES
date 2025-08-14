package com.sipel.CES.users.auth.controller;

import com.sipel.CES.users.auth.DTOs.LoginRequestDTO;
import com.sipel.CES.users.auth.DTOs.LoginResponseDTO;
import com.sipel.CES.users.auth.DTOs.UsuarioCreateDTO;
import com.sipel.CES.infra.security.TokenService;
import com.sipel.CES.users.auth.service.RegisterService;
import com.sipel.CES.users.entity.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private RegisterService registerService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginRequestDTO data) {
        var usuarioPassword = new UsernamePasswordAuthenticationToken(data.user(), data.senhaHash());
        var auth = this.authenticationManager.authenticate(usuarioPassword);

        Usuario authUser = (Usuario) auth.getPrincipal();

        var token = tokenService.generateToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token, authUser.getUsername(), authUser.getNomeCompleto(), authUser.getEmail()));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid UsuarioCreateDTO data) {
        try {
            registerService.registrarNovoUsuario(data);
            return ResponseEntity.status(201).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
