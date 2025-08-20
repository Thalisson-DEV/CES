package com.sipel.CES.choreCadastros.contrato.repository;

import com.sipel.CES.choreCadastros.contrato.entity.Contrato;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ContratoRepository extends JpaRepository<Contrato, Integer> {
    Optional<Contrato> findByNumeroContrato(String numeroContrato);

    @Query(
            nativeQuery = true,
            value = "SELECT c.* FROM contratos c " +
                    "WHERE (:searchTerm IS NULL OR LOWER(CAST(c.numero_contrato AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(CAST(c.descricao AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Contrato> findWithFilters(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

}
