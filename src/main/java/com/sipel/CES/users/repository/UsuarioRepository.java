package com.sipel.CES.users.repository;

import com.sipel.CES.users.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    UserDetails findByUsername(String user);

    Optional<Usuario> findByNomeCompleto(String nomeCompleto);

    @Query(
            nativeQuery = true,
            value = "SELECT u.* FROM usuarios u " +
                    "LEFT JOIN perfis p ON p.id = u.perfil_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = u.base_operacional_id " +
                    "WHERE (:perfilId IS NULL OR p.id = :perfilId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(u.nome_completo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(u.username AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(u.email AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
            countQuery = "SELECT count(u.id) FROM usuarios u " +
                    "LEFT JOIN perfis p ON p.id = u.perfil_id " +
                    "LEFT JOIN bases_operacionais b ON b.id = u.base_operacional_id " +
                    "WHERE (:perfilId IS NULL OR p.id = :perfilId) " +
                    "AND (:baseId IS NULL OR b.id = :baseId) " +
                    "AND (:searchTerm IS NULL OR " +
                    "     LOWER(CAST(u.nome_completo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(u.username AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "     LOWER(CAST(u.email AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Usuario> findWithFilters(
            @Param("perfilId") Integer perfilId,
            @Param("baseId") Integer baseId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
