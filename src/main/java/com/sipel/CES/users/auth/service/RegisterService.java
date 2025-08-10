package com.sipel.CES.users.auth.service;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.coordenador.repository.CoordenadorRepository;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.choreCadastros.supervisor.repository.SupervisorRepository;
import com.sipel.CES.generic.entitys.Perfil;
import com.sipel.CES.generic.repositories.PerfilRepository;
import com.sipel.CES.users.auth.DTOs.UsuarioCreateDTO;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class RegisterService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private BaseOperacionalRepository baseOperacionalRepository;
    @Autowired
    private CoordenadorRepository coordenadorRepository;
    @Autowired
    private SupervisorRepository supervisorRepository;

    @Transactional
    public Usuario registrarNovoUsuario(UsuarioCreateDTO data) {
        if (this.usuarioRepository.findByUsername(data.user()) != null) {
            throw new RuntimeException("Nome de usuário já está em uso.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senhaHash());

        Perfil perfil = perfilRepository.findById(data.perfilId())
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        BaseOperacional base = baseOperacionalRepository.findById(data.baseOperacionalId())
                .orElseThrow(() -> new RuntimeException("Base Operacional não encontrada"));

        Usuario newUser = new Usuario();
        newUser.setUsername(data.user());
        newUser.setCpf(data.cpf());
        newUser.setNomeCompleto(data.nomeCompleto());
        newUser.setEmail(data.email());
        newUser.setSenhaHash(encryptedPassword);
        newUser.setAtivo(true);
        newUser.setPerfil(perfil);
        newUser.setBaseOperacional(base);
        newUser.setDataCriacao(OffsetDateTime.now());
        newUser.setDataAtualizacao(OffsetDateTime.now());

        Usuario usuarioSalvo = usuarioRepository.save(newUser);
        sincronizarPapeis(usuarioSalvo);

        return usuarioSalvo;
    }

    private void sincronizarPapeis(Usuario usuario) {
        String nomePerfil = usuario.getPerfil().getNomePerfil();

        if ("Coordenação".equalsIgnoreCase(nomePerfil)) {
            if (!coordenadorRepository.existsById(Math.toIntExact(usuario.getId()))) {
                Coordenador novoCoordenador = new Coordenador();
                novoCoordenador.setUsuario(usuario);
                novoCoordenador.setAtivo(true);
                novoCoordenador.setDataCriacao(OffsetDateTime.now());
                coordenadorRepository.save(novoCoordenador);
            }
        } else if ("Supervisor".equalsIgnoreCase(nomePerfil)) {
            if (!supervisorRepository.existsById(Math.toIntExact(usuario.getId()))) {
                Supervisor novoSupervisor = new Supervisor();
                novoSupervisor.setUsuario(usuario);
                novoSupervisor.setAtivo(true);
                novoSupervisor.setDataCriacao(OffsetDateTime.now());
                supervisorRepository.save(novoSupervisor);
            }
        }
    }
}
