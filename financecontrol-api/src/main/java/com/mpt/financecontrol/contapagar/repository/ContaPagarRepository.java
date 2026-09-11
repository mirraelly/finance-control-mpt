package com.mpt.financecontrol.contapagar.repository;

import com.mpt.financecontrol.contapagar.entity.ContaPagar;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContaPagarRepository extends JpaRepository<ContaPagar, UUID> {

    @Query(value = """
        SELECT * FROM conta_pagar c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                AND (CAST(:categoriaId AS uuid) IS NULL OR c.categoria_id = CAST(:categoriaId AS uuid))
                AND (CAST(:status AS text) IS NULL OR c.status = CAST(:status AS text))
                AND (CAST(:ativo AS boolean) IS NULL OR c.ativo = CAST(:ativo AS boolean))
    """,
    countQuery = """
        SELECT count(*) FROM conta_pagar c
            WHERE c.tenant_id = :tenantId
                AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                AND (CAST(:categoriaId AS uuid) IS NULL OR c.categoria_id = CAST(:categoriaId AS uuid))
                AND (CAST(:status AS text) IS NULL OR c.status = CAST(:status AS text))
                AND (CAST(:ativo AS boolean) IS NULL OR c.ativo = CAST(:ativo AS boolean))
    """,
    nativeQuery = true)
    Page<ContaPagar> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID tenantId,
            @Param("pessoaId") UUID pessoaId,
            @Param("categoriaId") UUID categoriaId,
            @Param("status") String status,
            @Param("ativo") Boolean ativo
    );

    @Query(value = """
        SELECT * FROM conta_pagar c
            WHERE c.tenant_id = :tenantId
                AND c.ativo = true
            ORDER BY c.data_emissao DESC
    """, nativeQuery = true)
    List<ContaPagar> findForSelect(@Param("tenantId") UUID tenantId);
}
