package com.sipel.CES.obras.repositories;

import com.sipel.CES.obras.entity.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ObraRepository extends JpaRepository<Obra, Integer> {
    Optional<Obra> findByNumeroObra(String numeroObra);

    @Query("SELECT o FROM obras o JOIN FETCH o.statusObra JOIN FETCH o.baseObra JOIN FETCH o.baseSaque")
    List<Obra> findAllWithDetails();
}
