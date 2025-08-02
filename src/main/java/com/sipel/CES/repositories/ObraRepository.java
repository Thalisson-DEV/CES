package com.sipel.CES.repositories;

import com.sipel.CES.models.Obra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ObraRepository extends JpaRepository<Obra, Integer> {
    Optional<Obra> findByNumeroObra(String numeroObra);
}
