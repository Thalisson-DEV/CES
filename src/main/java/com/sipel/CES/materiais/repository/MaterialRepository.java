package com.sipel.CES.materiais.repository;

import com.sipel.CES.materiais.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Integer> {
    Optional<Material> findByCodigoMaterial(String codigoMaterial);

    @Query(
            nativeQuery = true,
            value = "SELECT m.* FROM materiais m " +
                    // CORREÇÃO: Adicionado CAST(m.supr_matr AS TEXT) para comparar o ENUM com a String
                    "WHERE (:suprMatr IS NULL OR CAST(m.supr_matr AS TEXT) = :suprMatr) " +
                    "AND (:avaliacao IS NULL OR m.avaliacao = :avaliacao) " +
                    "AND (:centro IS NULL OR m.centro = :centro) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(m.nome_material AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(m.codigo_material AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Material> findWithFilters(
            @Param("suprMatr") String suprMatr,
            @Param("avaliacao") String avaliacao,
            @Param("centro") String centro,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
