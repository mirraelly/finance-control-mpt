package com.mpt.financecontrol.lancamentofinanceiro.repository;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraSaldoDto;
import com.mpt.financecontrol.lancamentofinanceiro.entity.LancamentoFinanceiro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LancamentoFinanceiroRepository extends JpaRepository<LancamentoFinanceiro, UUID> {

    @Query(value = """
        SELECT * FROM lancamento_financeiro l
            WHERE l.tenant_id = :tenantId
                AND (CAST(:contaFinanceiraId AS uuid) IS NULL OR l.conta_financeira_id = CAST(:contaFinanceiraId AS uuid))
                AND (CAST(:tipo AS text) IS NULL OR l.tipo = CAST(:tipo AS text))
                AND (CAST(:origem AS text) IS NULL OR l.origem = CAST(:origem AS text))
                AND (CAST(:dataInicio AS date) IS NULL OR l.data >= CAST(:dataInicio AS date))
                AND (CAST(:dataFim AS date) IS NULL OR l.data <= CAST(:dataFim AS date))
    """,
    countQuery = """
        SELECT count(*) FROM lancamento_financeiro l
            WHERE l.tenant_id = :tenantId
                AND (CAST(:contaFinanceiraId AS uuid) IS NULL OR l.conta_financeira_id = CAST(:contaFinanceiraId AS uuid))
                AND (CAST(:tipo AS text) IS NULL OR l.tipo = CAST(:tipo AS text))
                AND (CAST(:origem AS text) IS NULL OR l.origem = CAST(:origem AS text))
                AND (CAST(:dataInicio AS date) IS NULL OR l.data >= CAST(:dataInicio AS date))
                AND (CAST(:dataFim AS date) IS NULL OR l.data <= CAST(:dataFim AS date))
    """,
    nativeQuery = true)
    Page<LancamentoFinanceiro> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId") UUID tenantId,
            @Param("contaFinanceiraId") UUID contaFinanceiraId,
            @Param("tipo") String tipo,
            @Param("origem") String origem,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim
    );

    @Query("SELECT new com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraSaldoDto("
    +      "    c.id, c.nome, c.tipo, "
    +      "    COALESCE(SUM(CASE WHEN l.tipo = com.mpt.financecontrol.financeiro.TipoLancamento.ENTRADA THEN l.valor ELSE -l.valor END), 0)) "
    +      "FROM ContaFinanceira c "
    +      "    LEFT JOIN LancamentoFinanceiro l ON l.contaFinanceira = c "
    +      "    WHERE c.tenant.id = :tenantId AND c.ativo = true "
    +      "GROUP BY c.id, c.nome, c.tipo "
    +      "ORDER BY c.nome")
    List<ContaFinanceiraSaldoDto> findSaldos(@Param("tenantId") UUID tenantId);
}
