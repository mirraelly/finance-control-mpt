package com.mpt.financecontrol.transferenciaentrecontas.repository;

import com.mpt.financecontrol.transferenciaentrecontas.entity.TransferenciaEntreContas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface TransferenciaEntreContasRepository extends JpaRepository<TransferenciaEntreContas, UUID> {

    @Query(value = """
        SELECT * FROM transferencia_entre_contas t
            WHERE t.tenant_id = :tenantId
                AND (CAST(:contaFinanceiraId AS uuid) IS NULL
                    OR t.conta_origem_id = CAST(:contaFinanceiraId AS uuid)
                    OR t.conta_destino_id = CAST(:contaFinanceiraId AS uuid))
                AND (CAST(:dataInicio AS date) IS NULL OR t.data >= CAST(:dataInicio AS date))
                AND (CAST(:dataFim AS date) IS NULL OR t.data <= CAST(:dataFim AS date))
    """,
    countQuery = """
        SELECT count(*) FROM transferencia_entre_contas t
            WHERE t.tenant_id = :tenantId
                AND (CAST(:contaFinanceiraId AS uuid) IS NULL
                    OR t.conta_origem_id = CAST(:contaFinanceiraId AS uuid)
                    OR t.conta_destino_id = CAST(:contaFinanceiraId AS uuid))
                AND (CAST(:dataInicio AS date) IS NULL OR t.data >= CAST(:dataInicio AS date))
                AND (CAST(:dataFim AS date) IS NULL OR t.data <= CAST(:dataFim AS date))
    """,
    nativeQuery = true)
    Page<TransferenciaEntreContas> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID tenantId,
            @Param("contaFinanceiraId") UUID contaFinanceiraId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim
    );
}
