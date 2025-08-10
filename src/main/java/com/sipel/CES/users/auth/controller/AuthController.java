package com.sipel.CES.users.auth.controller;

import com.sipel.CES.users.auth.DTOs.LoginRequestDTO;
import com.sipel.CES.users.auth.DTOs.LoginResponseDTO;
import com.sipel.CES.users.auth.DTOs.UsuarioCreateDTO;
import com.sipel.CES.infra.security.TokenService;
import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.generic.entitys.Perfil;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.generic.repositories.PerfilRepository;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuarioRepository repository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private BaseOperacionalRepository baseOperacionalRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginRequestDTO data) {
        System.out.println("DADOS RECEBIDOS: " + data);
        var usuarioPassword = new UsernamePasswordAuthenticationToken(data.user(), data.senhaHash());
        var auth = this.authenticationManager.authenticate(usuarioPassword);

        var token = tokenService.generateToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid UsuarioCreateDTO data) {
        if (this.repository.findByUsername(data.user()) != null) {
            return ResponseEntity.badRequest().body("Nome de usuário já está em uso.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senhaHash());

        Integer perfilIdRecebido = data.perfilId();
        Integer baseIdRecebida = data.baseOperacionalId();

        Perfil perfil = perfilRepository.findById(perfilIdRecebido)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        BaseOperacional base = baseOperacionalRepository.findById(baseIdRecebida)
                .orElseThrow(() -> new RuntimeException("Base Operacional não encontrada"));

        Usuario newUser = new Usuario();

        newUser.setUsername(data.user());
        newUser.setNomeCompleto(data.nomeCompleto());
        newUser.setCpf(data.cpf());
        newUser.setEmail(data.email());
        newUser.setSenhaHash(encryptedPassword);
        newUser.setAtivo(true);
        newUser.setPerfil(perfil);
        newUser.setBaseOperacional(base);
        newUser.setDataCriacao(OffsetDateTime.now());
        newUser.setDataAtualizacao(OffsetDateTime.now());

        // 5. Salva o objeto completo e montado.
        repository.save(newUser);

        return ResponseEntity.ok().build();
    }
}
