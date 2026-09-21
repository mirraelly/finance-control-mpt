package com.mpt.financecontrol.categoria.repository;

import com.mpt.financecontrol.categoria.entity.Categoria;
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
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

    @Query(value = """
        SELECT * FROM categoria c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    countQuery = """
        SELECT count(*) FROM categoria c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    nativeQuery = true)
    Page<Categoria> findAllWithFilters(Pageable pageable, @Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query("SELECT c FROM Categoria c "
    +      "    WHERE c.tenant.id = :tenantId AND c.ativo = true "
    +      "ORDER BY c.nome")
    List<Categoria> findForSelect(@Param("tenantId") UUID tenantId);

    @Query(value = """
        SELECT count(*) > 0 FROM categoria c
            WHERE c.tenant_id = :tenantId
                AND unaccent(lower(c.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    boolean existsByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query(value = """
        SELECT * FROM categoria c
            WHERE c.tenant_id = :tenantId
                AND unaccent(lower(c.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    Optional<Categoria> findByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);
}
