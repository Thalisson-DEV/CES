package com.sipel.CES.obras.repositories;

import com.sipel.CES.obras.entity.Obra;
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
            // Adicionamos nativeQuery = true
            nativeQuery = true,
            // A query foi reescrita para usar sintaxe SQL nativa
            value = "SELECT o.* FROM obras o " +
                    "LEFT JOIN status_obras s ON s.id = o.status_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = o.base_obra_id " +
                    "WHERE (:statusId IS NULL OR s.id = :statusId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR LOWER(CAST(o.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(CAST(o.numero_obra AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Obra> findWithFilters(
            @Param("statusId") Integer statusId,
            @Param("baseId") Integer baseId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );


}
