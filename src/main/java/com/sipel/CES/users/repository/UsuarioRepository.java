package com.sipel.CES.users.repository;

import com.sipel.CES.users.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    UserDetails findByUsername(String user);

    Optional<Usuario> findByNomeCompleto(String nomeCompleto);
}
