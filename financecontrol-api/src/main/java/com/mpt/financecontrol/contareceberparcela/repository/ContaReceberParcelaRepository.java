package com.mpt.financecontrol.contareceberparcela.repository;

import com.mpt.financecontrol.contareceberparcela.entity.ContaReceberParcela;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContaReceberParcelaRepository extends JpaRepository<ContaReceberParcela, UUID> {

    @Query("SELECT p.contaReceber.id FROM ContaReceberParcela p WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<UUID> findContaReceberIdById(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

    @Query(value = """
        SELECT p.* FROM conta_receber_parcela p
            JOIN conta_receber c ON c.id = p.conta_receber_id
            WHERE p.tenant_id = :tenantId
                AND c.ativo = true
                AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                AND ((CAST(:status AS text) IS NULL AND p.status <> 'CANCELADO') OR p.status = CAST(:status AS text))
                AND (CAST(:dataVencimentoInicio AS date) IS NULL OR p.data_vencimento >= CAST(:dataVencimentoInicio AS date))
                AND (CAST(:dataVencimentoFim AS date) IS NULL OR p.data_vencimento <= CAST(:dataVencimentoFim AS date))
    """,
    countQuery = """
        SELECT count(*) FROM conta_receber_parcela p
            JOIN conta_receber c ON c.id = p.conta_receber_id
            WHERE p.tenant_id = :tenantId
                AND c.ativo = true
                AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                AND ((CAST(:status AS text) IS NULL AND p.status <> 'CANCELADO') OR p.status = CAST(:status AS text))
                AND (CAST(:dataVencimentoInicio AS date) IS NULL OR p.data_vencimento >= CAST(:dataVencimentoInicio AS date))
                AND (CAST(:dataVencimentoFim AS date) IS NULL OR p.data_vencimento <= CAST(:dataVencimentoFim AS date))
    """,
    nativeQuery = true)
    Page<ContaReceberParcela> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID tenantId,
            @Param("pessoaId") UUID pessoaId,
            @Param("status") String status,
            @Param("dataVencimentoInicio") LocalDate dataVencimentoInicio,
            @Param("dataVencimentoFim") LocalDate dataVencimentoFim
    );
}
