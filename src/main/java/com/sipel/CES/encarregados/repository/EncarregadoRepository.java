package com.sipel.CES.encarregados.repository;

import com.sipel.CES.encarregados.entity.Encarregado;
import com.sipel.CES.obras.entity.Obra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EncarregadoRepository extends JpaRepository<Encarregado, Integer> {
    Optional<Encarregado> findByNomeCompleto(String nomeCompleto);

    @Query("SELECT o FROM encarregados o JOIN FETCH o.baseOperacional")
    List<Encarregado> findAllWithDetails();

    @Query(
            nativeQuery = true,
            value = "SELECT o.* FROM encarregados o " +
                    "LEFT JOIN bases_operacionais b ON b.id = o.base_operacional_id " +
                    "WHERE (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(o.nome_completo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(o.vulgo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Encarregado> findWithFilters(
            @Param("baseId") Integer baseId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
