package com.sipel.CES.comercial.solicitacoes.repository;

import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitacaoComercialRepository extends JpaRepository<SolicitacaoComercial, Integer> {

    /**
     * Query para a tela de ACOMPANHAMENTO.
     * Busca todas as solicitações, EXCETO as que estão com o status "Solicitado".
     */
    @Query(
            nativeQuery = true,
            value = "SELECT sc.* FROM solicitacoes_comerciais sc " +
                    "LEFT JOIN equipes e ON e.id = sc.equipe_id " +
                    "LEFT JOIN usuarios u ON u.id = sc.solicitante_id " +
                    "LEFT JOIN status_solicitacao ss ON ss.id = sc.status_id " +
                    "LEFT JOIN processos p ON p.id = sc.processo_id " +
                    "WHERE (:equipeId IS NULL OR e.id = :equipeId) " +
                    "AND (:solicitanteId IS NULL OR u.id = :solicitanteId) " +
                    "AND (:statusId IS NULL OR ss.id = :statusId) " +
                    "AND (:processoId IS NULL OR p.id = :processoId) " +
                    "AND ss.id != 7 " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(sc.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
            countQuery = "SELECT count(sc.id) FROM solicitacoes_comerciais sc " +
                    "LEFT JOIN status_solicitacao ss ON ss.id = sc.status_id " +
                    "WHERE (:equipeId IS NULL OR sc.equipe_id = :equipeId) " +
                    "AND (:solicitanteId IS NULL OR sc.solicitante_id = :solicitanteId) " +
                    "AND (:statusId IS NULL OR ss.id = :statusId) " +
                    "AND (:processoId IS NULL OR sc.processo_id = :processoId) " +
                    "AND ss.id != 7 " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(sc.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<SolicitacaoComercial> findWithFilters(
            @Param("equipeId") Integer equipeId,
            @Param("solicitanteId") Long solicitanteId,
            @Param("statusId") Integer statusId,
            @Param("processoId") Integer processoId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    /**
     * NOVA QUERY para a tela de APROVAÇÃO do backoffice.
     * Busca APENAS as solicitações que estão com o status "Solicitado".
     */
    @Query(
            nativeQuery = true,
            value = "SELECT sc.* FROM solicitacoes_comerciais sc " +
                    "LEFT JOIN equipes e ON e.id = sc.equipe_id " +
                    "LEFT JOIN usuarios u ON u.id = sc.solicitante_id " +
                    "LEFT JOIN status_solicitacao ss ON ss.id = sc.status_id " +
                    "LEFT JOIN processos p ON p.id = sc.processo_id " +
                    "WHERE (:equipeId IS NULL OR e.id = :equipeId) " +
                    "AND (:solicitanteId IS NULL OR u.id = :solicitanteId) " +
                    "AND (:statusId IS NULL OR ss.id = :statusId) " +
                    "AND (:processoId IS NULL OR p.id = :processoId) " +
                    "AND ss.id = 7 " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(sc.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
            countQuery = "SELECT count(sc.id) FROM solicitacoes_comerciais sc " +
                    "LEFT JOIN status_solicitacao ss ON ss.id = sc.status_id " +
                    "WHERE (:equipeId IS NULL OR sc.equipe_id = :equipeId) " +
                    "AND (:solicitanteId IS NULL OR sc.solicitante_id = :solicitanteId) " +
                    "AND (:statusId IS NULL OR ss.id = :statusId) " +
                    "AND (:processoId IS NULL OR sc.processo_id = :processoId) " +
                    "AND ss.id = 7 " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(sc.observacoes AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<SolicitacaoComercial> findRequestedWithFilters(
            @Param("equipeId") Integer equipeId,
            @Param("solicitanteId") Long solicitanteId,
            @Param("statusId") Integer statusId,
            @Param("processoId") Integer processoId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
