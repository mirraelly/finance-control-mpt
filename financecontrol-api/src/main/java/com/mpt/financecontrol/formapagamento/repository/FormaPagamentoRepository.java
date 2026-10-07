package com.mpt.financecontrol.formapagamento.repository;

import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;
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
public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, UUID> {

    @Query(value = """
        SELECT count(*) > 0 FROM forma_pagamento f
            WHERE f.tenant_id = :tenantId
                AND unaccent(lower(f.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    boolean existsByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query(value = """
        SELECT * FROM forma_pagamento f
            WHERE f.tenant_id = :tenantId
                AND unaccent(lower(f.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    Optional<FormaPagamento> findByTenantIdAndNomeNormalizado(@Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query(value = """
        SELECT * FROM forma_pagamento f
            WHERE f.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(f.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:ativo AS boolean) IS NULL OR f.ativo = CAST(:ativo AS boolean))
    """,
    countQuery = """
        SELECT count(*) FROM forma_pagamento f
            WHERE f.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(f.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:ativo AS boolean) IS NULL OR f.ativo = CAST(:ativo AS boolean))
    """,
    nativeQuery = true)
    Page<FormaPagamento> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID tenantId,
            @Param("nome") String nome,
            @Param("ativo") Boolean ativo
    );

    @Query("SELECT f FROM FormaPagamento f "
    +      "    WHERE f.tenant.id = :tenantId AND f.ativo = true "
    +      "ORDER BY f.nome")
    List<FormaPagamento> findForSelect(@Param("tenantId") UUID tenantId);
}
