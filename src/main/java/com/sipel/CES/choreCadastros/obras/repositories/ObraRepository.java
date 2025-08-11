package com.sipel.CES.choreCadastros.obras.repositories;

import com.sipel.CES.choreCadastros.obras.entity.Obra;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ObraRepository extends JpaRepository<Obra, Integer> {
    Optional<Obra> findByNumeroObra(String numeroObra);

    Optional<Obra> findById(int id);

    @Query("SELECT o FROM obras o JOIN FETCH o.statusObra JOIN FETCH o.baseObra JOIN FETCH o.baseSaque")
    List<Obra> findAllWithDetails();

    // Query para buscar obras com filtros e paginação
    @Query(
            nativeQuery = true,
            value = "SELECT o.* FROM obras o " +
                    "LEFT JOIN status_obras s ON s.id = o.status_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = o.base_obra_id " +
                    "LEFT JOIN coordenadores c ON c.id = o.coordenador_id " +
                    "LEFT JOIN supervisores sup ON sup.id = o.supervisor_id " +
                    "WHERE (:statusId IS NULL OR s.id = :statusId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:coordenadorId IS NULL OR c.id = :coordenadorId) " +
                    "AND (:supervisorId IS NULL OR sup.id = :supervisorId) " +
                    "AND (:searchTerm IS NULL OR LOWER(CAST(o.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(CAST(o.numero_obra AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Obra> findWithFilters(
            @Param("statusId") Integer statusId,
            @Param("baseId") Integer baseId,
            @Param("coordenadorId") Integer coordenadorId,
            @Param("supervisorId") Integer supervisorId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );


    List<Obra> supervisorId(int supervisorId);
}
