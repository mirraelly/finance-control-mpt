package com.mpt.financecontrol.contapagarparcela.repository;

import com.mpt.financecontrol.contapagarparcela.entity.ContaPagarParcela;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface ContaPagarParcelaRepository  extends JpaRepository<ContaPagarParcela, UUID> {

    @Query(value = """
            SELECT p.* FROM conta_pagar_parcela p
            JOIN conta_pagar c ON c.id = p.conta_pagar_id
            WHERE p.tenant_id = :tenantId
                AND c.ativo = true
                AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                AND ((CAST(:status AS text) IS NULL AND p.status <> 'CANCELADO') OR p.status = CAST(:status AS text))
                AND (CAST(:dataVencimentoInicio AS date) IS NULL OR p.data_vencimento >= CAST(:dataVencimentoInicio AS date))
                AND (CAST(:dataVencimentoFim AS date) IS NULL OR p.data_vencimento <= CAST(:dataVencimentoFim AS date))          
            """,
            countQuery = """
                    SELECT count(*) FROM conta_pagar_parcela p
                    JOIN conta_pagar c ON c.id = p.conta_pagar_id
                    WHERE p.tenant_id = :tenantId
                          AND c.ativo = true
                          AND (CAST(:pessoaId AS uuid) IS NULL OR c.pessoa_id = CAST(:pessoaId AS uuid))
                          AND ((CAST(:status AS text) IS NULL AND p.status <> 'CANCELADO') OR p.status = CAST(status AS text))
                          AND (CAST(:dataVencimentoInicio AS date) IS NULL OR p.data_vencimento >= CAST(:dataVencimentoInicio AS date))
                          AND (CAST(:dataVencimentoFim AS date) IS NULL OR p.data_vencimento <= CAST(:dataVencimentoFim AS date))
            """,
            nativeQuery = true)
            Page<ContaPagarParcela> findAllWithFilters(
                    Pageable pageable,
                @Param("tenantId") UUID tenantId,
                @Param("pessoaId") UUID pessoaId,
                @Param("status") String status,
                @Param("dataVencimentoInicio") LocalDate dataVencimentoInicio,
                @Param("dataVencimentoFim") LocalDate dataVencimentoFim
    );
}
