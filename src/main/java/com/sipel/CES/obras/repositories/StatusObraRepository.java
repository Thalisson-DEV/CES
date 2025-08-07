package com.sipel.CES.obras.repositories;

import com.sipel.CES.obras.entity.StatusObra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusObraRepository extends JpaRepository<StatusObra, Integer> {
    Optional<StatusObra> findByNomeStatus(String nomeStatus);
}
