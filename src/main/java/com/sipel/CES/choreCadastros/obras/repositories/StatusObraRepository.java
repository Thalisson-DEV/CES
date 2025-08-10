package com.sipel.CES.choreCadastros.obras.repositories;

import com.sipel.CES.choreCadastros.obras.entity.StatusObra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusObraRepository extends JpaRepository<StatusObra, Integer> {
    Optional<StatusObra> findByNomeStatus(String nomeStatus);
}
