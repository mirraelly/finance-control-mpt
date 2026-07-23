package com.mpt.financecontrol.usuario.repository;

import com.mpt.financecontrol.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);

    @Query("""
        SELECT u FROM Usuario u
                WHERE (:tenantId IS NULL OR u.tenant.id = :tenantId)
                    AND   (:nome  IS NULL OR LOWER(u.nome)  LIKE LOWER(CONCAT('%', CAST(:nome  AS string), '%')))
                    AND   (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:email AS string), '%')))
    """)
    Page<Usuario> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID   tenantId,
            @Param("nome")      String nome,
            @Param("email")     String email
    );

    @Query("""
    SELECT u FROM Usuario u
        WHERE u.ativo = true
            AND (:nome IS NULL OR LOWER(u.nome) LIKE LOWER(CONCAT('%', CAST(:nome AS string), '%')))
    ORDER BY u.nome
    """)
    List<Usuario> findForSelect(
            @Param("nome") String nome
    );
}
