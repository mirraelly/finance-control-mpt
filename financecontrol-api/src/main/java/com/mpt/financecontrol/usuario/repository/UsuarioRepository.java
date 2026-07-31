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

    @Query(value = """
        SELECT * FROM usuario u
                WHERE (CAST(:tenantId AS uuid) IS NULL OR u.tenant_id = CAST(:tenantId AS uuid))
                    AND   (CAST(:nome  AS text) IS NULL OR unaccent(lower(u.nome))  LIKE unaccent(lower('%' || CAST(:nome  AS text) || '%')))
                    AND   (CAST(:email AS text) IS NULL OR unaccent(lower(u.email)) LIKE unaccent(lower('%' || CAST(:email AS text) || '%')))
    """,
    countQuery = """
        SELECT count(*) FROM usuario u
                WHERE (CAST(:tenantId AS uuid) IS NULL OR u.tenant_id = CAST(:tenantId AS uuid))
                    AND   (CAST(:nome  AS text) IS NULL OR unaccent(lower(u.nome))  LIKE unaccent(lower('%' || CAST(:nome  AS text) || '%')))
                    AND   (CAST(:email AS text) IS NULL OR unaccent(lower(u.email)) LIKE unaccent(lower('%' || CAST(:email AS text) || '%')))
    """,
    nativeQuery = true)
    Page<Usuario> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID   tenantId,
            @Param("nome")      String nome,
            @Param("email")     String email
    );

    @Query(value = """
    SELECT * FROM usuario u
        WHERE u.ativo = true
            AND (CAST(:nome AS text) IS NULL OR unaccent(lower(u.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    ORDER BY u.nome
    """, nativeQuery = true)
    List<Usuario> findForSelect(
            @Param("nome") String nome
    );
}
