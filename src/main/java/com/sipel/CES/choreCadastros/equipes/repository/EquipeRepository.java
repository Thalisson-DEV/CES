package com.sipel.CES.choreCadastros.equipes.repository;

import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EquipeRepository extends JpaRepository<Equipe, Integer> {


    Optional<Equipe> findByNomeEquipe(String nomeEquipe);

    @Query(
            nativeQuery = true,
            value = "SELECT e.* FROM equipes e " +
                    "LEFT JOIN bases_operacionais b ON b.id = e.base_operacional_id " +
                    "LEFT JOIN processos p ON p.id = e.processo_id " +
                    "LEFT JOIN coordenadores c ON c.id = e.coordenador_id " +
                    "LEFT JOIN supervisores s ON s.id = e.supervisor_id " +
                    "WHERE (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:processoId IS NULL OR p.id = :processoId) " +
                    "AND (:coordenadorId IS NULL OR c.id = :coordenadorId) " +
                    "AND (:supervisorId IS NULL OR s.id = :supervisorId) " +
                    "AND (:searchTerm IS NULL OR LOWER(CAST(e.nome_equipe AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(CAST(e.vulgo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Equipe> findWithFilters(
            @Param("baseId") Integer baseId,
            @Param("processoId") Integer processoId,
            @Param("coordenadorId") Integer coordenadorId,
            @Param("supervisorId") Integer supervisorId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}

