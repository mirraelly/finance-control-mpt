package com.mpt.financecontrol.dashboard.service;

import com.mpt.financecontrol.dashboard.dtos.DashboardDespesaCategoriaDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardReceitasDespesasMensalDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final long MAXIMO_MESES_CONSULTA = 24;

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

    @Transactional(readOnly = true)
    public List<DashboardReceitasDespesasMensalDto> buscarReceitasDespesas(
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        validarPeriodo(dataInicio, dataFim);
        Tenant tenant = usuarioService.getTenantLogado();

        Map<YearMonth, BigDecimal[]> totaisPorMes = criarMesesDoPeriodo(dataInicio, dataFim);

        lancamentoRepository.findTotaisDiariosPorTipoNoPeriodo(tenant.getId(), dataInicio, dataFim)
                .forEach(totalDiario -> {
                    BigDecimal[] totais = totaisPorMes.get(YearMonth.from(totalDiario.data()));
                    int indice = totalDiario.tipo() == TipoLancamento.ENTRADA ? 0 : 1;
                    totais[indice] = totais[indice].add(valorOuZero(totalDiario.total()));
                });

        return totaisPorMes.entrySet().stream()
                .map(entry -> new DashboardReceitasDespesasMensalDto(
                        entry.getKey(),
                        entry.getValue()[0],
                        entry.getValue()[1]
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DashboardDespesaCategoriaDto> buscarDespesasPorCategoria(
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        validarPeriodo(dataInicio, dataFim);
        Tenant tenant = usuarioService.getTenantLogado();

        return lancamentoRepository.findDespesasPorCategoriaNoPeriodo(
                tenant.getId(),
                dataInicio,
                dataFim
        );
    }

    private void validarPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio.isAfter(dataFim))
            throw new BadRequestException("A data inicial deve ser anterior ou igual a data final");

        long quantidadeMeses = ChronoUnit.MONTHS.between(
                YearMonth.from(dataInicio), YearMonth.from(dataFim)) + 1;
        if (quantidadeMeses > MAXIMO_MESES_CONSULTA)
            throw new BadRequestException("O periodo maximo para o grafico e de 24 meses");
    }

    private Map<YearMonth, BigDecimal[]> criarMesesDoPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        Map<YearMonth, BigDecimal[]> totaisPorMes = new LinkedHashMap<>();
        YearMonth mes = YearMonth.from(dataInicio);
        YearMonth ultimoMes = YearMonth.from(dataFim);

        while (!mes.isAfter(ultimoMes)) {
            totaisPorMes.put(mes, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            mes = mes.plusMonths(1);
        }
        return totaisPorMes;
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
