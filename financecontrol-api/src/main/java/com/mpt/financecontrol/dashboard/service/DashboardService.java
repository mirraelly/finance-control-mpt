package com.mpt.financecontrol.dashboard.service;

import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;

@Service
public class DashboardService {

    private final LancamentoFinanceiroRepository lancamentoRepository;
    private final UsuarioService usuarioService;

    public DashboardService(
            LancamentoFinanceiroRepository lancamentoRepository,
            UsuarioService usuarioService
    ) {
        this.lancamentoRepository = lancamentoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public DashboardResumoDto buscarResumo(YearMonth mes) {
        Tenant tenant = usuarioService.getTenantLogado();

        BigDecimal receitas = valorOuZero(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenant.getId(), TipoLancamento.ENTRADA, mes.atDay(1), mes.atEndOfMonth()));
        BigDecimal despesas = valorOuZero(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenant.getId(), TipoLancamento.SAIDA, mes.atDay(1), mes.atEndOfMonth()));
        BigDecimal saldoTotal = valorOuZero(
                lancamentoRepository.findSaldoTotalDasContasAtivas(tenant.getId()));

        return new DashboardResumoDto(
                mes,
                saldoTotal,
                receitas,
                despesas,
                receitas.subtract(despesas)
        );
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
