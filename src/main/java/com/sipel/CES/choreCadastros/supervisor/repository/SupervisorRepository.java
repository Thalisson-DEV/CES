package com.sipel.CES.choreCadastros.supervisor.repository;

import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupervisorRepository extends JpaRepository<Supervisor, Integer> {

    Optional<Supervisor> findByUsuario_nomeCompleto(String usuarioNomeCompleto);
}
