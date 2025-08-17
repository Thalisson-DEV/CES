package com.sipel.CES.comercial.notas.repository;

import com.sipel.CES.comercial.notas.entity.Nota;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotasRepository extends JpaRepository<Nota, Integer> {

    @Query(
            nativeQuery = true,
            value = "SELECT n.* FROM notas n " +
                    "LEFT JOIN tipos_nota tn ON tn.id = n.tipo_nota_id " +
                    "LEFT JOIN equipes e ON e.id = n.equipe_id " +
                    "LEFT JOIN usuarios u ON u.id = n.usuario_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = n.base_operacional_id " +
                    "WHERE (:tipoNotaId IS NULL OR tn.id = :tipoNotaId) " +
                    "AND (:equipeId IS NULL OR e.id = :equipeId) " +
                    "AND (:usuarioId IS NULL OR u.id = :usuarioId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(n.numero_nota AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(n.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
            countQuery = "SELECT count(n.id) FROM notas n " +
                    "LEFT JOIN tipos_nota tn ON tn.id = n.tipo_nota_id " +
                    "LEFT JOIN equipes e ON e.id = n.equipe_id " +
                    "LEFT JOIN usuarios u ON u.id = n.usuario_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = n.base_operacional_id " +
                    "WHERE (:tipoNotaId IS NULL OR tn.id = :tipoNotaId) " +
                    "AND (:equipeId IS NULL OR e.id = :equipeId) " +
                    "AND (:usuarioId IS NULL OR u.id = :usuarioId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(n.numero_nota AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(n.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Nota> findWithFilters(
            @Param("tipoNotaId") Integer tipoNotaId,
            @Param("equipeId") Integer equipeId,
            @Param("usuarioId") Long usuarioId,
            @Param("baseId") Integer baseId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
