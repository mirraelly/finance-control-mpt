package com.mpt.financecontrol.contafinanceira.repository;

import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
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
public interface ContaFinanceiraRepository extends JpaRepository<ContaFinanceira, UUID> {

    @Query(value = """
        SELECT count(*) > 0 FROM conta_financeira c
            WHERE c.tenant_id = :tenantId
                AND unaccent(lower(c.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    boolean existsByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query(value = """
        SELECT * FROM conta_financeira c
            WHERE c.tenant_id = :tenantId
                AND unaccent(lower(c.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    Optional<ContaFinanceira> findByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query(value = """
        SELECT * FROM conta_financeira c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    countQuery = """
        SELECT count(*) FROM conta_financeira c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    nativeQuery = true)
    Page<ContaFinanceira> findAllWithFilters(Pageable pageable, @Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query("SELECT c FROM ContaFinanceira c "
    +      "    WHERE c.tenant.id = :tenantId AND c.ativo = true "
    +      "ORDER BY c.nome")
    List<ContaFinanceira> findForSelect(@Param("tenantId") UUID tenantId);
}
