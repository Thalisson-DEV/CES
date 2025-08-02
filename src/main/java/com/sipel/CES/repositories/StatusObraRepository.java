package com.sipel.CES.repositories;

import com.sipel.CES.models.StatusObra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusObraRepository extends JpaRepository<StatusObra, Integer> {
    Optional<StatusObra> findByNomeStatus(String nomeStatus);
}
