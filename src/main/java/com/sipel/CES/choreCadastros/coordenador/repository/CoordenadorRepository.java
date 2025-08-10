package com.sipel.CES.choreCadastros.coordenador.repository;

import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.users.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CoordenadorRepository extends JpaRepository<Coordenador, Integer> {

    Optional<Coordenador> findByUsuario_nomeCompleto(String usuarioNomeCompleto);

    @Query(
            nativeQuery = true,
            value = "SELECT c.* FROM coordenadores c " +
                    "LEFT JOIN usuarios u ON u.id = c.usuario_id " +
                    "WHERE (:coordenadorId IS NULL OR c.id = :coordenadorId) " +
                    // CORREÇÃO: Adicionado CAST(u.nome_completo AS TEXT) para forçar a conversão para texto
                    "AND (:searchTerm IS NULL OR LOWER(CAST(u.nome_completo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Coordenador> findWithFilters(
            @Param("coordenadorId") Integer coordenadorId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );


}
