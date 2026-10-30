package com.mpt.financecontrol.dashboard.service;

import com.mpt.financecontrol.dashboard.dtos.DashboardCategoriaValorDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardReceitasDespesasMensalDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardPatrimonioDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardPatrimonioMensalDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaAtualDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaDiarioDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaMensalDto;
import com.mpt.financecontrol.contafinanceira.repository.ContaFinanceiraRepository;
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
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.IntStream;

@Service
public class DashboardService {

    private static final long MAXIMO_MESES_CONSULTA = 24;

    private final LancamentoFinanceiroRepository lancamentoRepository;
    private final UsuarioService usuarioService;
    private final ContaFinanceiraRepository contaFinanceiraRepository;

    public DashboardService(
            LancamentoFinanceiroRepository lancamentoRepository,
            UsuarioService usuarioService,
            ContaFinanceiraRepository contaFinanceiraRepository
    ) {
        this.lancamentoRepository = lancamentoRepository;
        this.usuarioService = usuarioService;
        this.contaFinanceiraRepository = contaFinanceiraRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResumoDto buscarResumo(YearMonth mes) {
        Tenant tenant = usuarioService.getTenantLogado();

        BigDecimal receitas = valorOuZero(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenant.getId(), TipoLancamento.ENTRADA, mes.atDay(1), mes.atEndOfMonth()));
        BigDecimal despesas = valorOuZero(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenant.getId(), TipoLancamento.SAIDA, mes.atDay(1), mes.atEndOfMonth()));
        BigDecimal saldoTotal = valorOuZero(
                lancamentoRepository.findSaldoTotalDasContasAtivasAteData(tenant.getId(), LocalDate.now()));

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

        lancamentoRepository.findTotaisDiariosDasContasAtivasPorTipoNoPeriodo(tenant.getId(), dataInicio, dataFim)
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
    public List<DashboardCategoriaValorDto> buscarTotaisPorCategoria(
            TipoLancamento tipo,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        validarPeriodo(dataInicio, dataFim);
        Tenant tenant = usuarioService.getTenantLogado();

        return lancamentoRepository.findTotaisPorCategoriaDasContasAtivasNoPeriodo(
                tenant.getId(),
                tipo,
                dataInicio,
                dataFim
        );
    }

    @Transactional(readOnly = true)
    public List<DashboardSaldoContaMensalDto> buscarSaldosPorConta(
            LocalDate dataInicio, LocalDate dataFim
    ) {
        validarPeriodo(dataInicio, dataFim);
        Tenant tenant = usuarioService.getTenantLogado();
        var contas = contaFinanceiraRepository.findForSelect(tenant.getId());
        var movimentacoes = lancamentoRepository.findMovimentacoesDiariasPorContaNoPeriodo(
                tenant.getId(), dataInicio, dataFim);
        Map<YearMonth, Map<UUID, BigDecimal>> saldosPorMes = new LinkedHashMap<>();
        criarMesesDoPeriodo(dataInicio, dataFim).keySet()
                .forEach(mes -> saldosPorMes.put(mes, new LinkedHashMap<>()));
        movimentacoes.forEach(movimentacao -> saldosPorMes
                .get(YearMonth.from(movimentacao.data()))
                .merge(movimentacao.contaId(), valorOuZero(movimentacao.movimentacao()), BigDecimal::add));
        List<DashboardSaldoContaMensalDto> resultado = new java.util.ArrayList<>();

        for (YearMonth mes : saldosPorMes.keySet()) {
            contas.forEach(conta -> resultado.add(new DashboardSaldoContaMensalDto(
                    mes, conta.getId(), conta.getNome(),
                    saldosPorMes.get(mes).getOrDefault(conta.getId(), BigDecimal.ZERO))));
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public List<DashboardSaldoContaAtualDto> buscarSaldoAtualPorConta() {
        Tenant tenant = usuarioService.getTenantLogado();

        return lancamentoRepository.findSaldos(tenant.getId()).stream()
                .map(conta -> new DashboardSaldoContaAtualDto(
                        conta.id(), conta.nome(), valorOuZero(conta.saldo())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardPatrimonioDto buscarPatrimonio(int ano) {
        Tenant tenant = usuarioService.getTenantLogado();
        LocalDate primeiraData = lancamentoRepository
                .findPrimeiraDataDasContasAtivas(tenant.getId());
        int anoAtual = LocalDate.now().getYear();

        if (primeiraData == null) {
            return new DashboardPatrimonioDto(List.of(), List.of());
        }
        if (ano < primeiraData.getYear() || ano > anoAtual) {
            throw new BadRequestException("O ano deve estar entre o primeiro lancamento e o ano atual");
        }

        LocalDate dataFim = ano == anoAtual
                ? LocalDate.now()
                : LocalDate.of(ano, 12, 31);
        Map<YearMonth, BigDecimal[]> totaisPorMes = new LinkedHashMap<>();
        YearMonth mes = YearMonth.from(primeiraData);
        YearMonth ultimoMes = YearMonth.from(dataFim);
        while (!mes.isAfter(ultimoMes)) {
            totaisPorMes.put(mes, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            mes = mes.plusMonths(1);
        }

        lancamentoRepository.findTotaisDiariosDasContasAtivasPorTipoNoPeriodo(
                        tenant.getId(), primeiraData, dataFim)
                .forEach(totalDiario -> {
                    BigDecimal[] totais = totaisPorMes.get(YearMonth.from(totalDiario.data()));
                    int indice = totalDiario.tipo() == TipoLancamento.ENTRADA ? 0 : 1;
                    totais[indice] = totais[indice].add(valorOuZero(totalDiario.total()));
                });

        BigDecimal saldoDasContas = BigDecimal.ZERO;
        List<DashboardPatrimonioMensalDto> meses = new ArrayList<>();
        for (Map.Entry<YearMonth, BigDecimal[]> entry : totaisPorMes.entrySet()) {
            BigDecimal receitas = entry.getValue()[0];
            BigDecimal despesas = entry.getValue()[1];
            saldoDasContas = saldoDasContas.add(receitas).subtract(despesas);

            if (entry.getKey().getYear() == ano) {
                meses.add(new DashboardPatrimonioMensalDto(
                        entry.getKey(), saldoDasContas, receitas.subtract(despesas)));
            }
        }

        List<Integer> anosDisponiveis = IntStream.rangeClosed(primeiraData.getYear(), anoAtual)
                .boxed()
                .toList();
        return new DashboardPatrimonioDto(anosDisponiveis, meses);
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
