package com.sipel.CES.choreCadastros.servicos.repository;

import com.sipel.CES.choreCadastros.servicos.entity.Servicos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ServicosRepository extends JpaRepository<Servicos, Integer> {

    Optional<Servicos> findByCodigoServico(String codigoServico);

    @Query(
            nativeQuery = true,
            value = "SELECT c.* FROM servicos c " +
                    "LEFT JOIN contratos con ON con.id = c.contrato_id " +
                    "LEFT JOIN processos p ON p.id = c.processo_id " +
                    "WHERE (:contratoId IS NULL OR con.id = :contratoId) " +
                    "AND(:processoId IS NULL OR p.id = :processoId) " +
                    "AND(:searchTerm IS NULL OR LOWER(CAST(c.codigo_servico AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
                    "OR LOWER(CAST(c.descricao AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
                    "OR LOWER(CAST(c.grupo_mercadoria AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Servicos> findWithFilters(
            @Param("contratoId") Integer contratoId,
            @Param("processoId") Integer processoId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
